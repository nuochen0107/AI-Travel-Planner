<template>
  <div>
    <h2>登录 / 注册</h2>
    <div style="display:flex;gap:12px;align-items:center">
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="signUp">注册</button>
      <button @click="signIn">登录</button>
      <button @click="signOut">登出</button>
      <div v-if="user">已登录：{{ user.email }}</div>
    </div>

    <hr style="margin:20px 0" />

    <travel-form v-if="user" :user="user" @saved="onSaved" />
    <div v-else style="margin-top:12px;color:#888">请先登录以保存行程</div>

    <div style="margin-top:20px">
      <button @click="$emit('goto')">查看已保存行程</button>
    </div>
  </div>
</template>

<script>
import { supabase } from '../lib/supabase';
import TravelForm from '../components/TravelForm.vue';

export default {
  components: { TravelForm },
  data() {
    return { email:'', password:'', user: null }
  },
  mounted() {
    this.user = supabase.auth.user();
    supabase.auth.onAuthStateChange((_event, session) => {
      this.user = session?.user ?? null;
    });
  },
  methods: {
    async signUp() {
      const { user, error } = await supabase.auth.signUp({ email:this.email, password:this.password });
      if (error) alert('注册失败：'+error.message); else alert('注册成功，请检查邮箱验证（如果有）');
    },
    async signIn() {
      const { user, error } = await supabase.auth.signIn({ email:this.email, password:this.password });
      if (error) alert('登录失败：'+error.message); else this.user = user;
    },
    async signOut() {
      await supabase.auth.signOut();
      this.user = null;
    },
    onSaved(saved) {
      alert('行程已保存到云端');
    }
  }
}
</script>
