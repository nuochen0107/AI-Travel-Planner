<template>
  <button @click="toggleListen" :style="{ backgroundColor: isListening ? '#aa3939' : '#3f88f2' }">
    {{ isListening ? '... 正在聆听 ...' : '🎤 语音输入' }}
  </button>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['result']);
const isListening = ref(false);

// 检查并获取浏览器语音识别 API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  alert('抱歉，你的浏览器不支持语音识别。请使用 Chrome 或 Edge。');
}
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.lang = 'zh-CN'; // 设置语言为中文
  recognition.interimResults = false; // 我们只关心最终结果

  // 语音识别结束后的回调
  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    emit('result', text); // [关键] 将识别的文本发送给父组件
    isListening.value = false;
  };

  // 识别结束
  recognition.onend = () => {
    isListening.value = false;
  };

  // 识别出错
  recognition.onerror = (event) => {
    alert('语音识别错误: ' + event.error);
    isListening.value = false;
  };
}

// 按钮点击事件
const toggleListen = () => {
  if (!recognition) return;
  
  if (isListening.value) {
    recognition.stop();
    isListening.value = false;
  } else {
    recognition.start();
    isListening.value = true;
  }
};
</script>