import { useState } from "react";
import axios from "axios";
import { createClient } from '@supabase/supabase-js';

// 如果你希望前端也能直接写入 supabase（可选）
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// Web Speech API 简易 hook
function useSpeech(onResult) {
  const start = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("浏览器不支持语音识别");
    const rec = new SpeechRecognition();
    rec.lang = 'zh-CN';
    rec.onresult = e => {
      const text = Array.from(e.results).map(r=>r[0].transcript).join('');
      onResult(text);
    };
    rec.start();
  };
  return { start };
}

export default function App() {
  const [form, setForm] = useState({ destination: '', days: '3', budget: '', prefs: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { start } = useSpeech(text => setForm(f => ({ ...f, destination: text })));

  const generateAndSave = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:4000/api/generate-and-save', form);
      setResult(res.data);
      alert('已生成并保存（如果 Supabase 可用）。')
    } catch (e) {
      console.error(e);
      alert('生成失败，请查看控制台');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:20,fontFamily:'Arial'}}>
      <h1>AI 旅行规划师（MVP）</h1>
      <div>
        <label>目的地：</label>
        <input value={form.destination} onChange={e=>setForm({...form,destination:e.target.value})} />
        <button onClick={start}>🎤 语音输入</button>
      </div>
      <div>
        <label>天数：</label>
        <input value={form.days} onChange={e=>setForm({...form,days:e.target.value})} />
      </div>
      <div>
        <label>预算：</label>
        <input value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} />
      </div>
      <div>
        <label>偏好：</label>
        <input value={form.prefs} onChange={e=>setForm({...form,prefs:e.target.value})} />
      </div>
      <div style={{marginTop:10}}>
        <button onClick={generateAndSave} disabled={loading}>{loading? '生成中...' : '生成并保存行程'}</button>
      </div>

      {result && (
        <div style={{marginTop:20}}>
          <h2>生成结果（raw）</h2>
          <pre style={{whiteSpace:'pre-wrap', maxHeight:400, overflow:'auto'}}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
