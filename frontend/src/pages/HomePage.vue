<template>
  <div>
    <h2>登录 / 注册</h2>

    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="signUp">注册</button>
      <button @click="signIn">登录</button>
      <button @click="signOut">登出</button>

      <div v-if="user" style="color:green">已登录：{{ user.email }}</div>
    </div>

    <hr style="margin:20px 0" />

    <travel-form v-if="user" :user="user" @saved="onSaved" />
    <div v-else style="margin-top:12px;color:#888">请先登录以保存行程</div>

    <div style="margin-top:20px; display: flex; gap: 10px;">
      <button @click="$emit('goto')">查看已保存行程</button>
      
      <button @click="$emit('gotoBudget')" style="background-color: #3b8a5a;">
        费用管理
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import TravelForm from '../components/TravelForm.vue'

const email = ref('')
const password = ref('')
const user = ref(null)

const onSaved = () => alert('✅ 行程已保存到云端')

onMounted(async () => {
  // 初始检查登录状态
  const { data } = await supabase.auth.getUser()
  user.value = data?.user || null

  // 监听登录状态变化
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null
  })
})

// 注册
const signUp = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })
  if (error) alert('注册失败：' + error.message)
  else alert('注册成功！请查收邮箱进行验证')
}

// 登录
const signIn = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  if (error) alert('登录失败：' + error.message)
  else {
    user.value = data.user
    alert('✅ 登录成功！')
  }
}

// 登出
const signOut = async () => {
  await supabase.auth.signOut()
  user.value = null
  alert('已登出')
}
</script>
