<template>
  <div>
    <button @click="$emit('back')">&lt; 返回创建页</button>

    <h2 style="margin-top: 20px;">费用预算与管理</h2>

    <div v-if="loadingItineraries">正在加载行程列表...</div>
    <div v-else>
      <label for="itinerary-select">选择要记账的行程：</label>
      <select v-model="selectedItineraryId" @change="fetchExpenses" id="itinerary-select" style="width: 100%; margin-top: 10px;">
        <option disabled value="">请选择一个行程</option>
        <option v-for="it in itineraries" :key="it.id" :value="it.id">
          {{ it.title }}
        </option>
      </select>
    </div>

    <div v-if="selectedItineraryId" style="margin-top: 30px; background: #2a2a2a; padding: 20px; border-radius: 8px;">
      <h4>添加一笔新开销</h4>

      <form @submit.prevent="addExpense">
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
          <input v-model="form.category" placeholder="类别 (e.g., 餐饮)" required style="flex: 1;" />
          <input v-model.number="form.amount" type="number" step="0.01" placeholder="金额 (e.g., 120.5)" required style="flex: 1;" />
        </div>
        <input v-model="form.note" placeholder="备注 (e.g., 秋叶原拉面)" style="width: 100%;" />
        <button type="submit" :disabled="adding" style="width: 100%; margin-top: 15px;">
          {{ adding ? '...正在保存' : '保存这笔开销' }}
        </button>
      </form>
    </div>

    <div v-if="selectedItineraryId" style="margin-top: 30px;">
      <h4>已记录开销</h4>
      <div v-if="loadingExpenses">正在加载开销...</div>
      <div v-else-if="expenses.length === 0">暂无开销记录</div>
      <ul v-else style="padding: 0; list-style: none;">
        <li v-for="ex in expenses" :key="ex.id" style="background: #222; padding: 10px; border-radius: 5px; margin-bottom: 10px; display: flex; justify-content: space-between;">
          <div>
            <strong style="color: #f5c562;">{{ ex.category }}</strong>: {{ ex.note }}
            <br>
            <small style="color: #999;">{{ new Date(ex.created_at).toLocaleString() }}</small>
          </div>
          <div style="color: #a0e9a0; font-size: 1.2em; font-weight: bold;">
            ¥ {{ ex.amount }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabase';
// [已移除] SpeechButton 的导入

const emit = defineEmits(['back']);
const loadingItineraries = ref(true);
const loadingExpenses = ref(false);
const adding = ref(false);

const itineraries = ref([]); // 存行程列表 {id, title}
const selectedItineraryId = ref(''); // 存当前选中的行程 ID
const expenses = ref([]); // 存开销列表
const form = ref({ category: '', amount: null, note: '' });
let userId = ''; // 存当前用户 ID

// [已移除] onSpeechResult 语音解析函数

// 获取行程列表 (用于下拉框)
async function fetchItineraries() {
  loadingItineraries.value = true;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  userId = user.id; // 保存用户 ID

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

// 获取选定行程的开销列表
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

// 添加一笔新开销
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
    form.value = { category: '', amount: null, note: '' }; // 清空表单

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