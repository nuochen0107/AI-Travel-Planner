<template>
  <div>
    <travel-form v-if="user" :user="user" @saved="onSaved" />
    <div v-else style="margin-top:12px;color:#888">
      正在加载用户信息...
    </div>

    <div style="margin-top:20px; display: flex; gap: 10px;">
      <button @click="$emit('goto')">查看已保存行程</button>
      <button @click="$emit('gotoBudget')" style="background-color: #3b8a5a;">
        费用管理
      </button>
    </div>
  </div>
</template>

<script setup>
import TravelForm from '../components/TravelForm.vue';

// [修改] 
// 1. 定义 props 来从 App.vue 接收 user 对象
const props = defineProps({
  user: {
    type: Object,
    required: false // 可能是 null
  }
});

// [修改] 2. 定义 emits (你之前已经有了)
defineEmits(['goto', 'gotoBudget']);

const onSaved = () => alert('✅ 行程已保存到云端');

// [已删除] 
// - email, password, user, loading 等 ref
// - onMounted, onAuthStateChange
// - signUp, signIn, signOut 函数
// (所有登录逻辑都移交给了 AuthPage.vue 和 App.vue)
</script>