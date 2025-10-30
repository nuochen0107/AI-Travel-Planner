<template>
  <div>
    <div v-if="selectedItinerary">
      <button @click="selectedItinerary = null">&lt; 返回列表</button>
      
      <ItineraryView :data="selectedItinerary" 
      :itinerary-id="selectedItineraryId" style="margin-top: 20px;" />
      
      <MapLeaflet
        v-if="mapPois && mapPois.length > 0"
        :pois="mapPois"
        style="margin-top: 20px;"
      />
    </div>

    <div v-else>
      <button @click="$emit('back')">&lt; 返回创建页</button>
      
      <h2 style="margin-top: 20px;">我保存的行程</h2>

      <div v-if="loading" style="margin-top: 20px;">
        正在加载...
      </div>

      <div v-else-if="itineraries.length === 0" style="margin-top: 20px;">
        你还没有保存任何行程。
      </div>

      <div v-else style="margin-top: 20px;">
        <div 
          v-for="item in itineraries" 
          :key="item.id" 
          style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;"
        >
          <div>
            <h4 style="margin: 0 0 5px 0;">{{ item.title }}</h4>
            <small style="color: #999;">
              创建于: {{ new Date(item.created_at).toLocaleString() }}
            </small>
          </div>
          <div>
            <button @click="viewItinerary(item.id)" style="margin-right: 5px; background-color: #3b5b8a;">
              查看
            </button>
            <button @click="deleteItinerary(item.id)" style="background-color: #aa3939;">
              删除
            </button>
          </div>
        </div>
      </div> </div> </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // [新增] computed
import { supabase } from '../lib/supabase';
// [新增] 导入你已经写好的详情和地图组件
import ItineraryView from '../components/ItineraryView.vue';
import MapLeaflet from '../components/MapLeaflet.vue';

const emit = defineEmits(['back']);
const loading = ref(true);
const itineraries = ref([]); // 只存列表 (id, title)
const selectedItinerary = ref(null); // [新增] 存完整的行程 JSON {title, days...}
const selectedItineraryId = ref(null); // [新增] 存当前行程的数据库 ID

// --- [新增] 计算属性 (和 TravelForm.vue 里的一样) ---
const mapPois = computed(() => {
  if (!selectedItinerary.value || !selectedItinerary.value.days || !Array.isArray(selectedItinerary.value.days)) {
    return null;
  }
  const pois = [];
  for (const day of selectedItinerary.value.days) {
    if (day.items) {
      for (const item of day.items) {
        if (item.name && item.lat && item.lng) {
          pois.push({
            name: item.name,
            lat: item.lat,
            lng: item.lng
          });
        }
      }
    }
  }
  return pois.length > 0 ? pois : null;
});
// --- [新增结束] ---

async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// 获取列表 (这个不变)
async function fetchItineraries() {
  loading.value = true;
  selectedItinerary.value = null; // [新增] 确保回到列表时清空详情
  selectedItineraryId.value = null; // [新增] 清空 ID
  const user = await getUser();
  if (!user) {
    alert('请先登录');
    loading.value = false;
    emit('back'); 
    return;
  }
  try {
    // (不变) 只获取列表所需的最少数据
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

// 删除 (这个不变)
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

// --- [新增] “查看”按钮的逻辑 ---
async function viewItinerary(id) {
  loading.value = true; // 显示加载
  try {
    // [关键] 只查询被点击的这一项的 payload
    const { data, error } = await supabase
      .from('itineraries')
      .select('payload') // [关键] 只取 payload 字段
      .eq('id', id)
      .single(); // 我们知道只可能有一条

    if (error) throw error;

    if (data && data.payload) {
      // 把 payload (完整的行程 JSON) 存入 ref
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
