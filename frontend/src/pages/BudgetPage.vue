<template>
  <div>
    <button @click="$emit('back')" class="back-button">&lt; 返回创建页</button>

    <div class="main-container" style="max-width: 1100px !important; margin: 0 auto !important;">

      <div class="list-header">
        <span class="list-title">💰 费用预算与管理</span>
        <span class="list-subtitle">在这里记录你的每一笔开销</span>
      </div>

      <div v-if="loadingItineraries">正在加载行程列表...</div>
      <div v-else class="selector-group">
        <label for="itinerary-select">选择要记账的行程：</label>
        <select v-model="selectedItineraryId" @change="fetchExpenses" id="itinerary-select">
          <option disabled value="">请选择一个行程</option>
          <option v-for="it in itineraries" :key="it.id" :value="it.id">
            {{ it.title }}
          </option>
        </select>
      </div>

      <div v-if="selectedItineraryId" class="form-section">
        <h4 class="section-title">添加一笔新开销</h4>

        <form @submit.prevent="addExpense">
          <div class="inputs-grid">
            <input v-model="form.category" placeholder="类别 (e.g., 餐饮)" required />
            <input v-model.number="form.amount" type="number" step="0.01" placeholder="金额 (e.g., 120.5)" required />
          </div>
          <input v-model="form.note" placeholder="备注 (e.g., 秋叶原拉面)" class="full-width-input" />
          <button type="submit" :disabled="adding" class="submit-button">
            {{ adding ? '...正在保存' : '保存这笔开销' }}
          </button>
        </form>
      </div>

      <div v-if="selectedItineraryId" class="list-section">
        <h4 class="section-title">已记录开销</h4>
        <div v-if="loadingExpenses">正在加载开销...</div>
        <div v-else-if="expenses.length === 0" class="empty-list">暂无开销记录</div>
        <ul v-else class="expense-list">
          <li v-for="ex in expenses" :key="ex.id" class="expense-item">
            <div class="item-info">
              <strong class="item-category">{{ ex.category }}</strong>: {{ ex.note }}
              <br>
              <small class="item-date">{{ new Date(ex.created_at).toLocaleString() }}</small>
            </div>
            <div class="item-amount">
              ¥ {{ ex.amount }}
            </div>
          </li>
        </ul>
      </div>

    </div> </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabase';

const emit = defineEmits(['back']);
const loadingItineraries = ref(true);
const loadingExpenses = ref(false);
const adding = ref(false);

const itineraries = ref([]);
const selectedItineraryId = ref('');
const expenses = ref([]);
const form = ref({ category: '', amount: null, note: '' });
let userId = '';

async function fetchItineraries() {
  loadingItineraries.value = true;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  userId = user.id;

  try {
    const { data, error } = await supabase
      .from('itineraries')
      .select('id, title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    itineraries.value = data;
  } catch (error) {
    alert('获取行程列表失败: ' + error.message);
  } finally {
    loadingItineraries.value = false;
  }
}

async function fetchExpenses() {
  if (!selectedItineraryId.value) {
    expenses.value = [];
    return;
  }
  loadingExpenses.value = true;
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('itinerary_id', selectedItineraryId.value)
      .order('created_at', { ascending: false });
    if (error) throw error;
    expenses.value = data;
  } catch (error) {
    alert('获取开销列表失败: ' + error.message);
  } finally {
    loadingExpenses.value = false;
  }
}

async function addExpense() {
  if (!selectedItineraryId.value) return alert('请先选择一个行程');
  adding.value = true;
  try {
    const newExpense = {
      user_id: userId,
      itinerary_id: selectedItineraryId.value,
      category: form.value.category,
      amount: form.value.amount,
      note: form.value.note,
    };
    
    const { data, error } = await supabase
      .from('expenses')
      .insert(newExpense)
      .select()
      .single(); 
      
    if (error) throw error;
    
    expenses.value.unshift(data); 
    form.value = { category: '', amount: null, note: '' };

  } catch (error) {
    alert('添加开销失败: ' + error.message);
  } finally {
    adding.value = false;
  }
}

onMounted(() => {
  fetchItineraries();
});
</script>
<style scoped>
/* 1. "返回创建页" 按钮 (次要) */
.back-button {
  background-color: #444;
  margin-bottom: 20px;
}
.back-button:hover {
  background-color: #555;
}

/* 2. 主卡片容器 */
.main-container {
  background-color: #2a2a2a;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  
  /* [核心修复] 限制“预算”视图的宽度为 1100px，使其居中 */
  max-width: 1100px;
  margin: 0 auto;
}

/* 3. 新的标题 */
.list-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #444;
  padding-bottom: 20px;
}
.list-title {
  font-size: 1.8em;
  font-weight: 600;
  color: #f0f0f0;
  display: block;
}
.list-subtitle {
  font-size: 1.0em;
  color: #999;
  display: block;
  margin-top: 5px;
}

/* 4. 行程选择器 */
.selector-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 1px solid #444;
  padding-bottom: 30px;
}
.selector-group label {
  color: #aaa;
  font-size: 1.1em;
  text-align: left;
}
.selector-group select {
  font-size: 1em;
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #444;
  background-color: #333;
  color: #f0f0f0;
  
  /* [核心修复] 强制下拉框撑满 100% 宽度 */
  width: 100%;
  box-sizing: border-box; 
}

/* 5. 表单和列表的通用标题 */
.section-title {
  font-size: 1.3em;
  color: #f0f0f0;
  margin-bottom: 20px;
  text-align: left;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
}

/* 6. 记账表单 */
.form-section { /* [新增] 为表单部分添加样式 */
  background-color: #3a3a3a;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #444;
}
.inputs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}
.full-width-input {
  width: 100%;
  box-sizing: border-box;
}
.submit-button {
  width: 100%;
  margin-top: 15px;
  font-size: 1.1em;
}

/* 7. 开销列表 */
.list-section {
  margin-top: 30px;
}
.empty-list {
  color: #888;
}
.expense-list {
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #3a3a3a;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #444;
}
.item-info {
  text-align: left;
}
.item-category {
  color: #f5c562;
  font-weight: 600;
  font-size: 1.1em;
}
.item-date {
  color: #aaa;
  font-size: 0.9em;
}
.item-amount {
  color: #a0e9a0;
  font-size: 1.3em;
  font-weight: bold;
  flex-shrink: 0;
  margin-left: 20px;
}
</style>