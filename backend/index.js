// ✅ backend/index.js - (最终修复：带“黑匣子”日志)
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
// ... (app, port, cors, express.json, supabase init) ...
const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);


app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running properly 🚀" });
});

app.post("/api/generate-and-save", async (req, res) => {
  const { destination = "", days = "", budget = "", prefs = "", user_id = null, save = true } = req.body;

  const prompt = `
你是旅行规划师。请为下面信息生成一个结构化 JSON 行程。
目的地: ${destination}
天数: ${days}
预算: ${budget}元
偏好: ${prefs}
返回 JSON，包含字段: title, days: [{date, items:[{time,type,name,notes,cost,lat,lng}]}], total_estimated_cost, cost_breakdown
请确保为 'items' 数组中的每一个地点（如景点、餐厅、住宿）提供准确的 'lat' (纬度) 和 'lng' (经度) 坐标。
  `;

  try {
    let itineraryJson;
    const apiKey = process.env.LLM_API_KEY;

    // 1. [假数据分支]
    if (!apiKey) {
      console.log("⚠️ 未提供 LLM_API_KEY，使用假数据（调试模式）");
      itineraryJson = {
        title: `${destination} 简易行程 (假数据)`,
        days: [
          { 
            date: "Day 1", 
            items: [
              { time: "09:00", type: "景点", name: "东京塔 (假数据)", notes: "示例", cost: 1200, lat: 35.6586, lng: 139.7454 },
              { time: "12:00", type: "餐厅", name: "附近的拉面店 (假数据)", notes: "示例", cost: 1500, lat: 35.6588, lng: 139.7450 }
            ] 
          }
        ],
        total_estimated_cost: 2700,
        cost_breakdown: { transport: 0, accommodation: 0, food: 2700 }
      };
    } else {
      
      // 2. [阿里云分支]
      console.log("🚀 正在调用 LLM API (Aliyun DashScope)...");
      const resp = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "qwen-turbo",
          input: { messages: [{ role: "user", content: prompt }] },
          parameters: { temperature: 0.7, response_format: { "type": "json_object" } }
        }),
      });

      if (!resp.ok) {
        console.error(`LLM API Error: Status ${resp.status}`);
        const errorData = await resp.json().catch(() => ({})); 
        console.error("LLM Error Body:", errorData);
        return res.status(500).json({ error: "LLM API (Aliyun) 调用失败", detail: errorData });
      }

      const data = await resp.json();
      
      // --- [黑匣子日志] ---
      // 这是最关键的一步：打印出阿里返回的 *所有* 内容
      console.log("✅ LLM API 响应成功。黑匣子日志 (完整响应):");
      console.log(JSON.stringify(data, null, 2));
      // --- [黑匣子结束] ---

      // [修复尝试] 我们现在猜测两个路径：'output.text' 或者 'output.choices[0]...'
      let rawText = "{}";
      
      // 尝试 1: 直接的 output.text (如你所建议)
      if (data.output && typeof data.output.text === 'string' && data.output.text.startsWith('{')) {
        rawText = data.output.text;
        console.log("ℹ️ 提取路径 1: data.output.text");
      
      // 尝试 2: 复杂的 message.content (我们之前的尝试)
      } else if (data.output?.choices?.[0]?.message?.content) {
        const messageContent = data.output.choices[0].message.content;
        if (typeof messageContent === 'string') {
          rawText = messageContent;
          console.log("ℹ️ 提取路径 2a: data.output.choices...content (string)");
        } else if (Array.isArray(messageContent)) {
          rawText = messageContent
            .filter(part => part.type === 'text' && part.text)
            .map(part => part.text)
            .join('');
          console.log("ℹ️ 提取路径 2b: data.output.choices...content (array)");
        }
      }
      
      const m = rawText.match(/\{[\s\S]*\}/);
      
      if (m) {
        try {
          itineraryJson = JSON.parse(m[0]);
        } catch (parseError) {
          console.error("❌ JSON.parse 失败:", parseError.message);
          itineraryJson = { title: "JSON 解析失败", days: [] };
        }
      } else {
        console.error("❌ LLM 返回了非 JSON 格式:", rawText);
        itineraryJson = { title: "解析失败", days: [] };
      }
    }

    // 3. [保存分支] (此处逻辑不变)
    let savedData = null;
    if (save) {
      console.log(`💾 正在保存行程到 Supabase...`);
      // ... (省略 insert 代码, 它没问题) ...
      const { data, error } = await supabase.from("itineraries").insert([{ title: itineraryJson.title || `${destination} 行程`, user_id: user_id, payload: itineraryJson }]).select().single();
      if (error) { console.error("Supabase insert err", error); return res.status(500).json({ error: "保存到数据库失败", detail: error }); }
      savedData = data;
      console.log(`✅ 保存成功 (ID: ${savedData.id})`);
    } else {
      console.log("ℹ️ 仅生成，跳过保存。");
    }

    res.json({ itinerary: itineraryJson, saved: savedData });

  } catch (err) {
    console.error("❌ 捕获到服务器内部错误:", err);
    res.status(500).json({ error: "server error", detail: err.message || err });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend listening on port ${PORT}`);
});