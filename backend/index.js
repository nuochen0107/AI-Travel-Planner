// ✅ backend/index.js - 纯 ESM 版本
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

// 初始化 Supabase 客户端
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running properly 🚀" });
});

// 生成行程并保存
app.post("/api/generate-and-save", async (req, res) => {
  const { destination = "", days = "", budget = "", prefs = "", user_id = null } = req.body;

  const prompt = `
你是旅行规划师。请为下面信息生成一个结构化 JSON 行程。
目的地: ${destination}
天数: ${days}
预算: ${budget}元
偏好: ${prefs}
返回 JSON，包含字段: title, days: [{date, items:[{time,type,name,notes,cost}]}], total_estimated_cost, cost_breakdown
  `;

  try {
    let itineraryJson;

    // 如果没有 LLM_KEY，用假数据（调试用）
    if (!process.env.LLM_API_KEY) {
      itineraryJson = {
        title: `${destination} 简易行程`,
        days: [
          { date: "Day 1", items: [{ time: "09:00", type: "景点", name: "示例景点", notes: "示例", cost: 0 }] }
        ],
        total_estimated_cost: 1000,
        cost_breakdown: { transport: 300, accommodation: 500, food: 200 }
      };
    } else {
      // 调用大语言模型 API（如 OpenAI）
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1200,
          temperature: 0.7,
        }),
      });

      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content || "{}";
      const m = text.match(/\{[\s\S]*\}/);
      itineraryJson = m ? JSON.parse(m[0]) : { raw_text: text };
    }

    // 保存到 Supabase
    const payload = {
      title: itineraryJson.title || `${destination} 行程`,
      user_id: user_id,
      payload: itineraryJson,
    };

    const { data, error } = await supabase
      .from("itineraries")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert err", error);
      return res.status(500).json({ error: "保存到数据库失败", detail: error });
    }

    res.json({ itinerary: itineraryJson, saved: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error", detail: err.message || err });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend listening on port ${PORT}`);
});


