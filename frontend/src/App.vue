<template>
  <div style="max-width: 800px; margin: 20px auto; padding: 20px;">
    
    <div v-if="user">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #444;">
        <span style="color: #999;">欢迎, {{ user.email }}</span>
        <button @click="signOut" style="background-color: #555; padding: 5px 10px;">
          登出
        </button>
      </div>

      <HomePage 
        v-if="currentPage === 'home'" 
        @goto="currentPage = 'list'"
        @gotoBudget="currentPage = 'budget'"
        :user="user" />
      <ItinerariesPage 
        v-if="currentPage === 'list'"
        @back="currentPage = 'home'"
      />
      <BudgetPage 
        v-if="currentPage === 'budget'"
        @back="currentPage = 'home'"
      />

    </div>
    
    <AuthPage v-else />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from './lib/supabase'; // [新增] 在 App.vue 导入 supabase

// 导入所有页面
import HomePage from './pages/HomePage.vue';
import ItinerariesPage from './pages/ItinerariesPage.vue';
import BudgetPage from './pages/BudgetPage.vue';
import AuthPage from './pages/AuthPage.vue'; // [新增] 导入 AuthPage

const currentPage = ref('home'); 
const user = ref(null); // [新增] user 状态提升到 App.vue

// [新增] 在 App.vue 监听全局认证状态
onMounted(async () => {
  // 1. 立即检查当前用户
  const { data } = await supabase.auth.getUser();
  user.value = data?.user || null;

  // 2. 监听后续变化 (登录, 登出)
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null;
    
    // [优化] 如果刚登录成功, 自动跳转到主页
    if (user.value && currentPage.value !== 'home') {
      currentPage.value = 'home';
    }
  });
});

// [新增] 登出函数
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) alert('登出失败: ' + error.message);
  // user.value 会通过 onAuthStateChange 自动变为 null
};
</script>

<style>
/* ... (你的全局样式保持不变) ... */
body {
  background-color: #1a1a1a;
  color: #f0f0f0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
input, button {
  font-size: 1em;
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #444;
  background-color: #2a2a2a;
  color: #f0f0f0;
  margin: 2px;
}
button {
  cursor: pointer;
  background-color: #3f88f2;
  border: none;
}
button:hover {
  background-color: #5a9dfc;
}
button:disabled {
  background-color: #444;
  cursor: not-allowed;
}
</style>