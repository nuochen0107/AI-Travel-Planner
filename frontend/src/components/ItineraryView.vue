<template>
  <div class="itinerary-container">
    
    <h3 style="margin-bottom: 5px;">{{ data.title }}</h3>
    <p v-if="data.total_estimated_cost" style="color: #a0e9a0; margin-top: 0;">
      AI 估算总价: ¥ {{ data.total_estimated_cost }}
    </p>

    <div v-for="day in data.days" :key="day.date" class="day-card">
      <h4 class="day-title">{{ day.date }}</h4>
      
      <ul>
        <li v-for="(item, index) in day.items" :key="index" class="item-li">
          <span class="item-time">{{ item.time }}</span>
          <span class="item-type">【{{ item.type }}】</span>
          <strong class="item-name">{{ item.name }}</strong>
          <p class="item-notes">{{ item.notes }}</p>
          <span v-if="item.cost" class="item-cost">
            (约 ¥ {{ item.cost }})
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: ['data'],
  // [修复] 不再需要 computed.formatted
}
</script>

<style scoped>
.itinerary-container {
  text-align: left;
  line-height: 1.6;
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
.item-notes {
  font-size: 0.9em;
  color: #bbb;
  margin: 5px 0 0 0;
  padding-left: 10px;
  border-left: 2px solid #555;
}
.item-cost {
  font-size: 0.9em;
  color: #a0e9a0;
  margin-left: 10px;
}
</style>