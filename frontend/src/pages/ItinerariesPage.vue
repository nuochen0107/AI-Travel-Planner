<template>
  <div class="itineraries-page">
    <h1>行程列表</h1>

    <div v-if="loading">加载中...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else>
      <div v-if="itineraries.length === 0">暂无行程，请先生成。</div>
      <ul>
        <li v-for="item in itineraries" :key="item.id" class="itinerary-card">
          <h2>{{ item.payload.title }}</h2>
          <p>总预算：{{ item.payload.total_estimated_cost }} 元</p>
          <p>日期：{{ item.payload.days?.length || 0 }} 天</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

// 初始化 Supabase 客户端
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const itineraries = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const { data, error: err } = await supabase
      .from('itineraries')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) throw err
    itineraries.value = data || []
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.itineraries-page {
  padding: 2rem;
}
.itinerary-card {
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}
.error {
  color: red;
}
</style>
