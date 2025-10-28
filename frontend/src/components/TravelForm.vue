<template>
  <div> <h3>创建旅行请求</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <input v-model="form.destination" placeholder="目的地（例：日本 东京）" />
      <input v-model="form.days" placeholder="天数" />
      <input v-model="form.budget" placeholder="预算（CNY）" />
      <input v-model="form.prefs" placeholder="偏好（美食、动漫、亲子）" />
      <speech-button @result="onSpeech" />
    </div>

    <div style="margin-top:10px">
      <button @click="generate(true)" :disabled="loading">{{ loading? '生成中...' : '生成并保存行程' }}</button>
      <button @click="generate(false)" :disabled="loading">仅生成（不保存）</button>
    </div>

    <div v-if="itinerary" style="margin-top:20px; border-top: 1px solid #444; padding-top: 20px;">
      
      <itinerary-view :data="itinerary" />
      
      <MapLeaflet 
        v-if="mapPois && mapPois.length > 0" 
        :pois="mapPois" 
        style="margin-top: 20px;" 
      />
    </div>

    </div> </template>

<script>
import axios from 'axios';
// import { supabase } from '../lib/supabase'; // 假设 supabase 在父组件或 main.js 处理
import SpeechButton from './SpeechButton.vue';
import ItineraryView from './ItineraryView.vue';
// [已修复] 导入 MapLeaflet
import MapLeaflet from './MapLeaflet.vue';

export default {
  // [已修复] 注册 MapLeaflet
  components: { SpeechButton, ItineraryView, MapLeaflet }, 
  props: ['user'],
  data() {
    return {
      form: { destination:'', days:3, budget:'', prefs:'' },
      loading:false,
      itinerary:null, // AI 返回的完整行程
    };
  },
  
  // [新增] 计算属性，自动从行程(itinerary)中提取地图所需的数据
  computed: {
    /**
     * @returns {Array<{name: string, lat: number, lng: number}> | null}
     * 从 this.itinerary 中提取并扁平化所有 POI 点
     */
    mapPois() {
      if (!this.itinerary || !this.itinerary.days) {
        return null;
      }
      
      const pois = [];
      for (const day of this.itinerary.days) {
        if (day.items) {
          for (const item of day.items) {
            // 确保这个 item 是一个地点，并且有坐标 (lat/lng)
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
    }
  },

  methods: {
    onSpeech(text) {
      this.form.destination = text;
    },
    async generate(save = true) {
      if (!this.form.destination) return alert('请填写目的地');
      this.loading = true;
      this.itinerary = null; // 每次生成时先清空上次结果
      
      try {
        const url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        
        const body = { 
          ...this.form, 
          user_id: this.user?.id ?? null,
          save: save // 告诉后端是否保存
        };
        
        const res = await axios.post(url + '/api/generate-and-save', body);
        
        // 将 AI 结果赋值给 this.itinerary
        this.itinerary = res.data.itinerary ?? res.data; 

      } catch (e) {
        console.error(e);
        let errorMsg = e.message || '生成失败，请看控制台';
        if (e.response && e.response.data && e.response.data.error) {
          errorMsg = e.response.data.error;
        }
        alert(errorMsg);
      } finally {
        this.loading = false;
      }
    },
    
    // "仅生成"按钮调用 generate(false)
    async preview() { 
      await this.generate(false); 
    },
  }
}
</script>