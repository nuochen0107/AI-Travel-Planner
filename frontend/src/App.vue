<template>
  <div style="max-width: 1400px; margin: 20px auto; padding: 20px;">
    
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
        :user="user" 
      />
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
import { supabase } from './lib/supabase';
import HomePage from './pages/HomePage.vue';
import ItinerariesPage from './pages/ItinerariesPage.vue';
import BudgetPage from './pages/BudgetPage.vue';
import AuthPage from './pages/AuthPage.vue';

const currentPage = ref('home'); 
const user = ref(null); 

onMounted(async () => {
  const { data } = await supabase.auth.getUser();
  user.value = data?.user || null;
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null;
    if (user.value && currentPage.value !== 'home') {
      currentPage.value = 'home';
    }
  });
});

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) alert('登出失败: ' + error.message);
};
</script>

<style>
/* 全局样式 (不变) */
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