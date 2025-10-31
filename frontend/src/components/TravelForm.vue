<template>
  <div class="form-container">
    <!-- 表单顶部（始终显示） -->
    <div class="form-inner">
      <div class="form-header">
        <span class="form-title">🌍 开启你的智能旅行</span>
        <span class="form-subtitle">第一步：告诉 AI 你的想法</span>
      </div>

      <div class="inputs-grid">
        <div class="input-group full-width">
          <label for="dest">目的地</label>
          <input id="dest" v-model="form.destination" placeholder="例：日本 东京" />
        </div>

        <div class="input-group">
          <label for="days">天数</label>
          <input id="days" v-model.number="form.days" type="number" placeholder="例: 3" />
        </div>
        <div class="input-group">
          <label for="people">同行人数</label>
          <input id="people" v-model.number="form.people" type="number" placeholder="例: 2" />
        </div>
        <div class="input-group">
          <label for="budget">预算 (CNY)</label>
          <input id="budget" v-model="form.budget" placeholder="例: 10000" />
        </div>

        <div class="input-group full-width">
          <label for="prefs">旅行偏好</label>
          <input id="prefs" v-model="form.prefs" placeholder="美食、动漫、亲子、购物..." />
        </div>

        <div class="input-group speech-group">
          <label>或 语音输入</label>
          <speech-button @result="onSpeech" />
        </div>
      </div>

      <div class="actions">
        <button @click="generate(true)" :disabled="loading" class="generate-button">
          {{ loading ? '生成中...' : '生成并保存行程' }}
        </button>
        <button @click="generate(false)" :disabled="loading" class="preview-button">
          仅生成（不保存）
        </button>
      </div>
    </div>

    <!-- 生成结果：始终在表单下面（同一页面） -->
    <div v-if="itinerary" class="result-area">
      <div class="map-column">
        <MapLeaflet
          v-if="mapPois && mapPois.length > 0"
          :pois="mapPois"
          :height="'100%'"
        />
        <div v-else class="map-empty">暂无可显示的地图坐标</div>
      </div>

      <div class="itinerary-column">
        <div class="result-actions">
          <button class="back-edit" @click="itinerary = null">← 返回修改</button>
        </div>

        <div class="itinerary-scroll">
          <itinerary-view :data="itinerary" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import SpeechButton from './SpeechButton.vue';
import ItineraryView from './ItineraryView.vue';
import MapLeaflet from './MapLeaflet.vue';

export default {
  components: { SpeechButton, ItineraryView, MapLeaflet },
  props: ['user'],
  data() {
    return {
      form: { destination:'', days:3, people:1, budget:'', prefs:'' },
      loading: false,
      itinerary: null,
    };
  },
  computed: {
    mapPois() {
      if (!this.itinerary || !this.itinerary.days || !Array.isArray(this.itinerary.days)) return null;
      const pois = [];
      for (const day of this.itinerary.days) {
        if (!day.items) continue;
        for (const item of day.items) {
          // 兼容 lat/lng 或 latitude/longitude
          const lat = item.lat ?? item.latitude ?? item.latValue ?? null;
          const lng = item.lng ?? item.longitude ?? item.lngValue ?? null;
          const name = item.name || item.title || item.place || null;
          if (name && lat != null && lng != null && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))) {
            pois.push({ name, lat: Number(lat), lng: Number(lng) });
          }
        }
      }
      return pois.length > 0 ? pois : null;
    }
  },
  methods: {
    onSpeech(text) { this.form.destination = text; },
    async generate(save = true) {
      if (!this.form.destination) return alert('请填写目的地');
      this.loading = true;
      this.itinerary = null;
      try {
        const url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const body = {
          ...this.form,
          user_id: this.user?.id ?? null,
          save: save
        };
        const res = await axios.post(url + '/api/generate-and-save', body);
        const result = res.data.itinerary;
        console.log('[TravelForm] itinerary (raw):', result);
        // 验证结构并设置
        if (result && typeof result === 'object' && Array.isArray(result.days)) {
          this.itinerary = result;
          // allow MapLeaflet to render; mapPois computed will update automatically
          this.$nextTick(() => {
            console.log('[TravelForm] mapPois:', this.mapPois);
          });
        } else {
          this.itinerary = null;
          console.error('AI 返回无效行程：', result);
          alert('AI 未能生成有效的行程（请检查控制台）');
        }
      } catch (e) {
        console.error(e);
        const msg = e.response?.data?.error || e.message || '生成失败';
        alert(msg);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* 容器：更宽、居中，避免“超级窄” */
.form-container {
  margin-top: 20px;
  width: 95%;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
  background-color: #2a2a2a;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
}

/* 表单部分 */
.form-header { text-align: center; margin-bottom: 18px; }
.form-title { font-size: 1.6rem; color: #f0f0f0; font-weight: 600; }
.form-subtitle { color: #999; font-size: 0.95rem; }

/* 输入网格 */
.inputs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
}
.input-group { display:flex; flex-direction:column; }
.full-width { grid-column: 1 / -1; }
.input-group label { color: #aaa; margin-bottom: 6px; }
.input-group input { padding: 10px; border-radius:8px; border:1px solid #444; background:#232323; color:#fff; }

/* 操作按钮 */
.actions { margin-top: 20px; text-align: center; }
.generate-button, .preview-button {
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
.generate-button { background: #3b8a5a; color: #fff; }
.preview-button { background: #4a4a4a; color: #fff; margin-left: 10px; }
.generate-button:disabled, .preview-button:disabled { opacity: 0.6; cursor: not-allowed; }

/* 结果区：左右两栏（左大右小） */
.result-area {
  display: flex;
  gap: 20px;
  margin-top: 26px;
  height: 60vh; /* 整体高度，可按需调整（60vh） */
  align-items: stretch;
}

/* 地图列：占比更大并填满高度 */
.map-column {
  flex: 3;
  min-width: 420px;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  background: #383838;
  display: flex;
  align-items: stretch;
}

/* 提示占位 */
.map-empty {
  width: 100%;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#bbb;
  font-size:1rem;
}

/* 行程列：右侧，垂直滚动 */
.itinerary-column {
  flex: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #222;
  border-radius: 10px;
  padding: 12px;
  overflow: hidden;
}

/* 返回修改按钮 */
.result-actions { display:flex; justify-content:flex-end; margin-bottom:8px; }
.back-edit {
  background:#4a4a4a;
  color:#fff;
  border:none;
  padding:8px 10px;
  border-radius:6px;
  cursor:pointer;
}
.back-edit:hover { background:#5b5b5b; }

/* 内部滚动容器，独立滚动不影响地图 */
.itinerary-scroll {
  overflow-y: auto;
  padding-right: 6px;
  flex: 1;
}
.itinerary-scroll::-webkit-scrollbar { width: 8px; }
.itinerary-scroll::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }

/* 响应式：窄屏下改为竖向堆叠 */
@media (max-width: 900px) {
  .result-area {
    flex-direction: column;
    height: auto;
  }
  .map-column { min-width: auto; height: 360px; }
  .itinerary-column { height: auto; max-height: none; }
}
</style>
