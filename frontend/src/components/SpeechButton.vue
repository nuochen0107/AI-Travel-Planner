<template>
  <button @click="start">🎤 语音输入</button>
</template>

<script>
export default {
  emits: ['result'],
  methods: {
    start() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return alert('浏览器不支持语音识别，请使用 Chrome 或 Edge');
      const rec = new SpeechRecognition();
      rec.lang = 'zh-CN';
      rec.onresult = (e) => {
        const text = Array.from(e.results).map(r=>r[0].transcript).join('');
        this.$emit('result', text);
      };
      rec.onerror = (e) => { console.error('speech error', e); alert('语音识别出错') };
      rec.start();
    }
  }
}
</script>
