// ✅ backend/index.js (v26 - 稳定回滚版)
// 目标：不惜一切代价拿回 lat/lng，放弃复杂的“同行人数”计算

import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running properly 🚀" });
});

app.post("/api/generate-and-save", async (req, res) => {
  const { destination = "", days = "", budget = "", prefs = "", people = "1", user_id = null, save = true } = req.body;

  // [回滚 v26] 
  // 1. 移除 '同行人数' 的复杂计算要求 (我们妥协了)。
  // 2. 强制要求中文和坐标。
  const prompt = `
  [!! 绝对要求 !!] 你的回答 *必须* 使用简体中文。

  请为下面信息生成一个 JSON 格式的旅行规划：
  - 目的地: ${destination}
  - 天数: ${days}
  - 同行人数: ${people} (注：预算为总预算)
  - 预算: ${budget}元
  - 偏好: ${prefs}

  [!! 关键JSON结构 !!]
  返回一个 JSON 对象，必须包含:
  1. title (string)
  2. days (array): 
     - 每个 'day' 包含 'date' (string) 和 'items' (array)
  3. items (array):
     - 每个 'item' 必须包含: time, type (中文类型, e.g., "景点"), name, notes, cost (数字), lat (纬度), lng (经度)

  [!! 再次强调 !!] 
  为 'items' 数组中的 *每一个* 地点提供准确的 'lat' 和 'lng' 坐标 *至关重要*。
  `;

  try {
    let itineraryJson;
    const apiKey = process.env.LLM_API_KEY;

    // 1. [假数据分支] (这个不变)
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
      console.log("🚀 正在调用 LLM API (Aliyun DashScope)... [v26 尝试]");
      const resp = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "qwen-turbo",
          input: { messages: [{ role: "user", content: prompt }] },
          parameters: {
             temperature: 0.7
             // [回滚 v26] 移除了 'response_format'，
             // 靠 prompt 本身和我们的 regex 来保证 JSON。
          }
        }),
      });

      if (!resp.ok) {
        console.error(`LLM API Error: Status ${resp.status}`);
        const errorData = await resp.json().catch(() => ({})); 
        console.error("LLM Error Body:", errorData);
        return res.status(500).json({ error: "LLM API (Aliyun) 调用失败", detail: errorData });
      }

      const data = await resp.json();
      // [回滚 v26] 重新打开“黑匣子”日志
      console.log("✅ LLM API (Aliyun) 响应成功。黑匣子日志 (完整响应):");
      console.log(JSON.stringify(data, null, 2));

      // [回滚 v26] 
      // 我们现在 *必须* 依赖 output.text，因为我们没有强制 'json_object'
      let rawText = "{}";
      if (data.output && typeof data.output.text === 'string' && data.output.text.startsWith('{')) {
        rawText = data.output.text;
        console.log("ℹ️ [v26] 提取路径: data.output.text");
      } else {
         console.error("❌ [v26] AI 未能在 output.text 中返回 JSON。");
         // 尝试我们之前 v18 的备用路径 (以防万一)
         const messageContent = data.output?.choices?.[0]?.message?.content;
         if (typeof messageContent === 'string') rawText = messageContent;
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

    // 3. [保存分支] (这个不变)
    let savedData = null;
    if (save) {
      console.log(`💾 正在保存行程到 Supabase...`);
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