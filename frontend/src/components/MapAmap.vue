<template>
  <div>
    <div ref="mapContainer" style="width:100%;height:400px;border:1px solid #ddd"></div>
  </div>
</template>

<script>
export default {
  props: ['places'],
  mounted() {
    this.loadMap();
  },
  watch: {
    places() { this.loadMap(); }
  },
  methods: {
    async loadMap() {
      const key = window.__MAP_KEY__ || import.meta.env.VITE_MAP_KEY;
      if (!key) { alert('未配置地图 Key，前往设置页填入或在 .env.local 设 VITE_MAP_KEY'); return; }

      // 动态插入高德脚本（如果已加载则跳过）
      if (!window.AMap) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Geocoder`;
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      // 初始化地图
      const map = new window.AMap.Map(this.$refs.mapContainer, {
        zoom: 11,
        center: [116.397428,39.90923]
      });

      // 对每个 place 用高德地理编码获取坐标并打点
      const geocoder = new window.AMap.Geocoder();
      for (const p of this.places) {
        try {
          const res = await geocoder.getLocation(p.name);
          const geos = res?.geocodes?.[0];
          if (geos && geos.location) {
            const [lng, lat] = geos.location.split(',');
            const marker = new window.AMap.Marker({ position: [parseFloat(lng), parseFloat(lat)] });
            marker.setMap(map);
          }
        } catch (err) {
          console.warn('geocode fail', p.name, err);
        }
      }
    }
  }
}
</script>
