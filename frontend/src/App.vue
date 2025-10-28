<template>
  <div style="max-width:900px;margin:30px auto;font-family:Arial,Helvetica,sans-serif">
    <h1>🌍 AI 旅行规划师（前端）</h1>

    <div style="display:flex;gap:20px">
      <div style="flex:1">
        <home-page v-if="page==='home'" @goto='page="itins"'/>
        <itineraries-page v-if="page==='itins'" @back='page="home"'/>
      </div>
    </div>
  </div>
</template>

<script>
import HomePage from './pages/HomePage.vue';
import ItinerariesPage from './pages/ItinerariesPage.vue';

export default {
  components: { HomePage, ItinerariesPage },
  data() {
    return { page: 'home' }
  }
}
</script>
