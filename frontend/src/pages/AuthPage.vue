<template>
  <div style="max-width: 400px; margin: 50px auto; text-align: center;">
    <h2 style="margin-bottom: 30px;">欢迎使用 AI 旅行规划师</h2>
    
    <div style="display: flex; flex-direction: column; gap: 15px;">
      <input v-model="email" type="email" placeholder="邮箱 (Email)" />
      <input v-model="password" type="password" placeholder="密码 (Password)" />
      
      <div v-if="errorMsg" style="color: #ff6b6b; margin-top: 10px;">
        {{ errorMsg }}
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button @click="signIn" :disabled="loading" style="flex: 1;">
          {{ loading ? '...' : '登录' }}
        </button>
        <button @click="signUp" :disabled="loading" style="flex: 1; background-color: #444;">
          {{ loading ? '...' : '注册' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../lib/supabase';

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');

// 登录
const signIn = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    // 登录成功后, App.vue 中的 onAuthStateChange 会自动监听到
  } catch (error) {
    errorMsg.value = '登录失败: ' + error.message;
  } finally {
    loading.value = false;
  }
};

// 注册
const signUp = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    alert('注册成功！请检查你的邮箱以完成验证。');
  } catch (error) {
    errorMsg.value = '注册失败: ' + error.message;
  } finally {
    loading.value = false;
  }
};
</script>