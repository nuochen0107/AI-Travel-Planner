<template>
  <div>
    <h3>创建旅行请求</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <input v-model="form.destination" placeholder="目的地（例：日本 东京）" />
      <input v-model="form.days" placeholder="天数" />
      <input v-model="form.budget" placeholder="预算（CNY）" />
      <input v-model="form.prefs" placeholder="偏好（美食、动漫、亲子）" />
      <speech-button @result="onSpeech" />
    </div>

    <div style="margin-top:10px">
      <button @click="generate" :disabled="loading">{{ loading? '生成中...' : '生成并保存行程' }}</button>
      <button @click="preview">仅生成（不保存）</button>
    </div>

    <div v-if="itinerary" style="margin-top:20px">
      <itinerary-view :data="itinerary" />
      <map-amap v-if="showMap" :places="places" />
    </div>

    <div style="margin-top:20px">
      <label>设置（临时注入 API Key）：</label>
      <div>
        <input v-model="localMapKey" placeholder="VITE_MAP_KEY (临时)" />
        <button @click="applyMapKey">应用 Map Key</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { supabase } from '../lib/supabase';
import SpeechButton from './SpeechButton.vue';
import ItineraryView from './ItineraryView.vue';
import MapAmap from './MapAmap.vue';

export default {
  components: { SpeechButton, ItineraryView, MapAmap },
  props: ['user'],
  data() {
    return {
      form: { destination:'', days:3, budget:'', prefs:'' },
      loading:false,
      itinerary:null,
      showMap:false,
      places: [],
      localMapKey: ''
    };
  },
  methods: {
    onSpeech(text) {
      this.form.destination = text;
    },
    async generate(save=true) {
      if (!this.form.destination) return alert('请填写目的地');
      this.loading = true;
      try {
        const url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const body = { ...this.form, user_id: this.user?.id ?? null };
        const res = await axios.post(url + '/api/generate-and-save', body);
        this.itinerary = res.data.itinerary ?? res.data;
        // show map: try extract names and geocode later
        this.places = this.extractPlaces(this.itinerary);
        this.showMap = this.places.length>0;
      } catch (e) {
        console.error(e);
        alert('生成失败，请看控制台');
      } finally {
        this.loading = false;
      }
    },
    async preview() { await this.generate(false); },
    extractPlaces(it) {
      if (!it || !it.days) return [];
      const names = [];
      for (const d of it.days) {
        for (const item of d.items||[]) {
          if (item.name) names.push(item.name);
        }
      }
      // 转为对象数组： { name }
      return [...new Set(names)].map(n=>({ name: n }));
    },
    applyMapKey() {
      // 将输入设置到 window（仅本地临时使用）
      window.__MAP_KEY__ = this.localMapKey;
      alert('已应用 Map Key（仅本地临时）');
    }
  }
}
</script>
