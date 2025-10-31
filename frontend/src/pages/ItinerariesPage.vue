<template>
  <div>
    <button @click="$emit('back')" class="back-button" style="margin-bottom: 20px;">&lt; 返回创建页</button>

    <div v-if="selectedItinerary">
      <button @click="selectedItinerary = null" class="back-button-inner">&lt; 返回列表</button>
      
      <div class="detail-layout-wrapper">
        <div class="detail-layout">
          <div class="map-column">
            <!-- 传入 height='100%' 让 MapLeaflet 填满父容器高度 -->
            <MapLeaflet
              v-if="mapPois && mapPois.length > 0"
              :pois="mapPois"
              :height="'100%'" 
            />
            <!-- 如果没有 pois，给出提示 -->
            <div v-else class="map-empty">地图暂无坐标</div>
          </div>

          <div class="text-column">
            <ItineraryView :data="selectedItinerary" :itinerary-id="selectedItineraryId" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="main-container">
      <div class="list-header">
        <span class="list-title">🗂️ 我保存的行程</span>
        <span class="list-subtitle">在这里查看、修改或删除你的历史记录</span>
      </div>

      <div v-if="loading" style="margin-top: 20px;">加载中...</div>
      <div v-else-if="itineraries.length === 0" style="margin-top: 20px;">暂无行程，去创建你的第一个行程吧！</div>
      <div v-else class="itinerary-list">
        <div v-for="item in itineraries" :key="item.id" class="list-item">
          <div class="item-info">
            <h4 class="item-title">{{ item.title }}</h4>
            <small class="item-date">{{ new Date(item.created_at).toLocaleString() }}</small>
          </div>
          <div class="item-actions">
            <button @click="viewItinerary(item.id)" class="view-button">查看</button>
            <button @click="deleteItinerary(item.id)" class="delete-button">删除</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; 
import { supabase } from '../lib/supabase';
import ItineraryView from '../components/ItineraryView.vue';
import MapLeaflet from '../components/MapLeaflet.vue';

const emit = defineEmits(['back']);
const loading = ref(true);
const itineraries = ref([]); 
const selectedItinerary = ref(null); 
const selectedItineraryId = ref(null);

// 计算地图 pois（兼容多种字段名）
const mapPois = computed(() => {
  const itin = selectedItinerary.value;
  if (!itin || !itin.days || !Array.isArray(itin.days)) return null;
  const pois = [];
  for (const day of itin.days) {
    if (!day.items) continue;
    for (const item of day.items) {
      const name = item.name || item.title || item.place;
      // 兼容 lat/lng 或 latitude/longitude 字段
      const lat = item.lat ?? item.latitude ?? item.latValue ?? null;
      const lng = item.lng ?? item.longitude ?? item.lngValue ?? null;
      if (name && lat != null && lng != null && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))) {
        pois.push({
          name,
          lat: Number(lat),
          lng: Number(lng)
        });
      }
    }
  }
  return pois.length > 0 ? pois : null;
});

async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

async function fetchItineraries() {
  loading.value = true;
  selectedItinerary.value = null; 
  selectedItineraryId.value = null;
  const user = await getUser();
  if (!user) {
    alert('请先登录');
    loading.value = false;
    emit('back'); 
    return;
  }
  try {
    const { data, error } = await supabase
      .from('itineraries')
      .select('id, title, created_at') 
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    itineraries.value = data;
  } catch (error) {
    alert('获取行程失败: ' + error.message);
  } finally {
    loading.value = false;
  }
}

async function deleteItinerary(id) {
  if (!confirm('你确定要删除这个行程吗？')) return;
  try {
    const { error } = await supabase.from('itineraries').delete().eq('id', id);
    if (error) throw error;
    itineraries.value = itineraries.value.filter(item => item.id !== id);
  } catch (error) {
    alert('删除失败: ' + error.message);
  }
}

async function viewItinerary(id) {
  loading.value = true; 
  try {
    const { data, error } = await supabase
      .from('itineraries')
      .select('payload') 
      .eq('id', id)
      .single(); 
    if (error) throw error;
    if (data && data.payload) {
      selectedItinerary.value = data.payload; 
      selectedItineraryId.value = id;         
    } else {
      alert('未找到行程详情。');
    }
  } catch (error) {
    alert('查看失败: ' + error.message);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchItineraries();
});
</script>

<style scoped>
/* 按钮 */
.back-button {
  background-color: #444;
  margin-bottom: 20px;
}
.back-button:hover { background-color: #555; }
.back-button-inner {
  background-color: #4f4f4f;
  margin-bottom: 20px;
}
.back-button-inner:hover { background-color: #666; }

/* ========== 宽页面容器（让页面更宽） ========== */
/* 这里改成宽屏响应式，最大宽度 1600px，屏幕较小时也能自适应 */
.main-container {
  background-color: #2a2a2a;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  width: 95%;
  max-width: 1600px;   /* -> 放宽至 1600px */
  margin: 0 auto;
}

/* 列表头 */
.list-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #444;
  padding-bottom: 20px;
}
.list-title { font-size: 1.8em; font-weight: 600; color: #f0f0f0; display: block; }
.list-subtitle { font-size: 1.0em; color: #999; display: block; margin-top: 5px; }

/* 列表样式 */
.itinerary-list { display: flex; flex-direction: column; gap: 15px; }
.list-item { display: flex; justify-content: space-between; align-items: center;
  background-color: #3a3a3a; padding: 20px; border-radius: 8px; border: 1px solid #444; }
.item-info { text-align: left; }
.item-title { margin: 0 0 5px 0; font-size: 1.2em; }
.item-date { color: #aaa; font-size: 0.9em; }
.item-actions { display:flex; gap:10px; flex-shrink:0; }
.delete-button { background-color: #aa3939; }
.delete-button:hover { background-color: #c44; }

/* ========== 详情视图：左右并排（更宽、更清晰） ========== */
/* detail-layout-wrapper 用于居中并限制最大宽度 */
.detail-layout-wrapper {
  display:flex;
  justify-content:center;
  width:100%;
  margin-top: 12px;
}

/* detail-layout 为左右两栏，地图占更大面积 */
.detail-layout {
  display:flex;
  gap:20px;
  width: 95%;
  max-width: 1600px; /* 与 main-container 对齐 */
  height: 75vh; 
  align-items: stretch;
}

/* 地图列：更宽，确保高度填满 */
.map-column {
  flex: 2;            /* 地图占 2 份 */
  min-width: 640px;   /* 防止太窄 */
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #444;
}

/* 详情文本列 */
.text-column {
  flex: 1;            /* 文本占 1 份 */
  height: 100%;
  overflow-y: auto;
  padding: 12px;
  background: #1f1f1f;
  border-radius: 8px;
  scrollbar-width: thin;
  scrollbar-color: #555 #2a2a2a;
}
.text-column::-webkit-scrollbar { width:8px; }
.text-column::-webkit-scrollbar-track { background:#2a2a2a; }
.text-column::-webkit-scrollbar-thumb { background-color:#555; border-radius:4px; }

/* 如果地图不可用时的占位 */
.map-empty {
  height: 100%;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#bbb;
  font-size:1.05em;
}

/* 响应式：小屏幕下改为纵向堆叠 */
@media (max-width: 900px) {
  .detail-layout { flex-direction: column; height: auto; }
  .map-column { min-width: auto; height: 360px; }
  .text-column { max-height: none; }
  .main-container, .detail-layout { width: 95%; }
}
</style>
