<template>
  <div class="itinerary-container">
    
    <h3 style="margin-bottom: 5px;">{{ editableData.title }}</h3>
    <p v-if="editableData.total_estimated_cost" style="color: #a0e9a0; margin-top: 0;">
      AI 估算总价: ¥ {{ editableData.total_estimated_cost }}
    </p>

    <div v-for="day in editableData.days" :key="day.date" class="day-card">
      <h4 class="day-title">{{ day.date }}</h4>
      
      <ul>
        <li v-for="(item, index) in day.items" :key="index" class="item-li">
          <span class="item-time">{{ item.time }}</span>
          <span class="item-type">【{{ item.type }}】</span>
          <strong class="item-name">{{ item.name }}</strong>
          
          <textarea 
            v-model="item.notes" 
            class="notes-textarea"
            placeholder="点击编辑备注..."
          ></textarea>
          <img 
        v-if="item.image_url" 
        :src="item.image_url" 
        class="item-image"
        alt="行程图片"
      />
          <span v-if="item.cost" class="item-cost">
            (约 ¥ {{ item.cost }})
          </span>
        </li>
      </ul>
    </div>

    <button @click="saveChanges" :disabled="loading" class="save-button">
      {{ loading ? '...正在保存' : '保存对行程的修改' }}
    </button>

  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'; // [修改] 导入 ref 和 watchEffect
import { supabase } from '../lib/supabase'; // [新增] 导入 supabase

// [修改] 1. 接收 data (payload) 和 itineraryId (数据库 ID)
const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  itineraryId: {
    type: String,
    required: true
  }
});

const loading = ref(false);
// [修改] 2. 创建一个可编辑的本地副本 (Props 是只读的)
const editableData = ref(null);

// [修改] 3. 使用 watchEffect 深度复制 prop 到本地 ref
// (当 props.data 变化时, 自动更新 editableData)
watchEffect(() => {
  editableData.value = JSON.parse(JSON.stringify(props.data));
});

// [新增] 4. 保存修改的函数
async function saveChanges() {
  if (!confirm('确定要保存对这个行程的修改吗？')) return;
  
  loading.value = true;
  try {
    const { error } = await supabase
      .from('itineraries')
      .update({ payload: editableData.value }) // [关键] 把修改后的本地 JSON 覆盖回数据库
      .eq('id', props.itineraryId); // 匹配我们传入的数据库 ID

    if (error) throw error;
    alert('✅ 修改已保存！');
  } catch (error) {
    alert('保存失败: ' + error.message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.itinerary-container {
  text-align: left;
  line-height: 1.6;
}
.item-image {
  width: 100%; /* 图片宽度撑满卡片 */
  max-height: 200px; /* 限制最大高度，防止图片过大 */
  object-fit: cover; /* 图片按比例裁剪，不变形 */
  border-radius: 6px;
  margin-top: 10px; /* 和上方的备注拉开距离 */
}
.day-card {
  background: #2a2a2a;
  padding: 10px 20px;
  border-radius: 8px;
  margin-bottom: 15px;
}
.day-title {
  color: #5a9dfc;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
}
ul {
  padding-left: 20px;
  list-style: none;
}
.item-li {
  padding-bottom: 15px;
  border-bottom: 1px dashed #333;
  margin-bottom: 15px;
}
.item-li:last-child {
  border-bottom: none;
  margin-bottom: 0;
}
.item-time {
  font-weight: bold;
  color: #f0f0f0;
  margin-right: 10px;
}
.item-type {
  font-size: 0.9em;
  color: #ccc;
  margin-right: 5px;
}
.item-name {
  color: #f5c562; /* 突出显示地点名称 */
}

/* [核心修改] 备注 <textarea> 的样式 */
.notes-textarea {
  font-size: 0.9em;
  color: #ddd; /* 让备注文字亮一点 */
  margin: 5px 0 0 0;
  padding-left: 10px;
  border-left: 2px solid #555;
  background-color: #333; /* 给一个轻微的背景色 */
  border: 1px solid #444;
  border-radius: 4px;
  width: 95%; /* 调整宽度 */
  min-height: 50px; /* 最小高度 */
  font-family: inherit; /* 继承字体 */
}

.item-cost {
  font-size: 0.9em;
  color: #a0e9a0;
  margin-left: 10px;
}

/* [新增] 保存按钮的样式 */
.save-button {
  width: 100%;
  margin-top: 20px;
  background-color: #3b8a5a;
}
.save-button:hover {
  background-color: #4fc07a;
}
</style>