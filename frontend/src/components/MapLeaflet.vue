<template>
  <!-- 给一个默认高度（可通过 style 覆盖），避免 100% 父容器无高度问题 -->
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修复 icon 路径（Vite 环境）
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

const props = defineProps({
  pois: {
    type: Array,
    default: () => []
  },
  // 可选：允许外部覆盖高度
  height: {
    type: [String, Number],
    default: 400
  }
});

const mapContainer = ref(null);
const mapInstance = ref(null);
const markerLayer = ref(null);

const setupMap = async () => {
  // 确保 DOM 已就位
  await nextTick();
  if (!mapContainer.value) return;

  // 初始化地图（若已初始化则跳过）
  if (!mapInstance.value) {
    mapInstance.value = L.map(mapContainer.value).setView([35.65, 139.74], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.value);
    markerLayer.value = L.layerGroup().addTo(mapInstance.value);
  }

  // 在初始化后确保 size 正确（必要）
  setTimeout(() => {
    mapInstance.value.invalidateSize && mapInstance.value.invalidateSize();
  }, 200);
};

const updateMarkers = async (newPois) => {
  if (!mapInstance.value || !markerLayer.value) {
    // 如果地图尚未准备好，稍后重试
    setTimeout(() => updateMarkers(newPois), 150);
    return;
  }

  markerLayer.value.clearLayers();

  if (!newPois || newPois.length === 0) {
    return;
  }

  const bounds = [];

  newPois.forEach(poi => {
    // 兼容字符串数字，强制转 number
    const lat = Number(poi.lat);
    const lng = Number(poi.lng);
    if (!isFinite(lat) || !isFinite(lng)) return;

    const marker = L.marker([lat, lng]);
    const name = poi.name || '目的地';
    const popupHtml = `
      <div style="min-width:120px">
        <strong style="font-size:1.05em">${escapeHtml(name)}</strong><br/>
        <div style="margin-top:6px;">
          <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank">谷歌地图</a>
          &nbsp;|&nbsp;
          <a href="https://ditu.amap.com/search?query=${encodeURIComponent(name)}&loc=${lng},${lat}" target="_blank">高德地图</a>
        </div>
      </div>
    `;
    marker.bindPopup(popupHtml);
    marker.addTo(markerLayer.value);
    bounds.push([lat, lng]);
  });

  // 视野自适应所有点
  if (bounds.length === 1) {
    mapInstance.value.setView(bounds[0], 12);
  } else if (bounds.length > 1) {
    const latlngs = L.latLngBounds(bounds);
    mapInstance.value.fitBounds(latlngs, { padding: [40, 40] });
  }
};

// 小工具：防 XSS（仅对显示文本）
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

onMounted(async () => {
  // 设置容器高度（支持数字或字符串）
  if (mapContainer.value) {
    const h = props.height;
    mapContainer.value.style.height = typeof h === 'number' ? `${h}px` : h;
  }
  await setupMap();
  if (props.pois && props.pois.length > 0) {
    updateMarkers(props.pois);
  }
});

// 监听 pois 变化
watch(() => props.pois, (newPois) => {
  updateMarkers(newPois);
}, { deep: true });
</script>

<style scoped>
.map-container {
  width: 100%;
  /* 默认高度 400px；若父组件通过 style 覆盖则以父覆盖为准 */
  height: 400px;
  border-radius: 8px;
}
</style>
