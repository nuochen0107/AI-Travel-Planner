<template>
  <div ref="mapContainer" style="width: 100%; height: 350px; border-radius: 8px;"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- [图标修复] ---
// (这是解决“空白地图”的关键)
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
});
// --- [修复结束] ---

const props = defineProps({
  pois: {
    type: Array,
    default: () => [] 
  }
});

const mapContainer = ref(null);
const mapInstance = ref(null);
const markerLayer = ref(null); // [新增] 创建一个图层组来管理所有标记

// [重构] setupMap 只负责初始化
const setupMap = () => {
  if (!mapContainer.value) return;
  mapInstance.value = L.map(mapContainer.value).setView([35.65, 139.74], 12); // 默认看东京
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap 贡献者'
  }).addTo(mapInstance.value);
  markerLayer.value = L.layerGroup().addTo(mapInstance.value);
};

// [新增] updateMarkers 负责画点
const updateMarkers = (newPois) => {
  if (!mapInstance.value || !markerLayer.value) {
    setTimeout(() => updateMarkers(newPois), 100); // 地图未好，稍后重试
    return;
  }

  markerLayer.value.clearLayers(); // 清除旧标记

  if (!newPois || newPois.length === 0) {
    return; // 没有 POI，不用画
  }

  console.log("🗺️ MapLeaflet 正在更新标记点:", JSON.stringify(newPois, null, 2));

  newPois.forEach(poi => {

    L.marker([poi.lat, poi.lng])
     .addTo(markerLayer.value)
     .bindPopup(`
    <strong style="font-size: 1.1em; color: #000;">${poi.name}</strong>
    <br>
    <hr style="margin: 5px 0; border-color: #ccc;">
    <a 
      href="https://www.google.com/maps/search/?api=1&query=${poi.lat},${poi.lng}" 
      target="_blank" 
      style="color: #0056b3; text-decoration: none;"
    >
      [ 谷歌地图导航 ]
    </a>
    <br>
    <a 
      href="https://ditu.amap.com/search?query=${poi.name}&loc=${poi.lng},${poi.lat}" 
      target="_blank" 
      style="color: #0056b3; text-decoration: none;"
    >
      [ 高德地图搜索 ]
    </a>
 `);
  });

  // [修复核心] 重新聚焦地图到第一个点
  const newCenter = [newPois[0].lat, newPois[0].lng];
  mapInstance.value.setView(newCenter, 12);
};

onMounted(() => {
  setupMap();
  if (props.pois && props.pois.length > 0) {
    updateMarkers(props.pois);
  }
});

watch(() => props.pois, (newPois) => {
  updateMarkers(newPois);
}, { deep: true });

</script>