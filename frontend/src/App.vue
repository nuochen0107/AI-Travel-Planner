<template>
  <div style="max-width: 800px; margin: 20px auto; padding: 20px;">
    
    <HomePage 
      v-if="currentPage === 'home'" 
      @goto="currentPage = 'list'"
      @gotoBudget="currentPage = 'budget'" />

    <ItinerariesPage 
      v-if="currentPage === 'list'"
      @back="currentPage = 'home'"
    />

    <BudgetPage 
      v-if="currentPage === 'budget'"
      @back="currentPage = 'home'"
    />

  </div>
</template>

<script setup>
import { ref } from 'vue';

import HomePage from './pages/HomePage.vue';
import ItinerariesPage from './pages/ItinerariesPage.vue';
import BudgetPage from './pages/BudgetPage.vue'; // [新增] 导入记账页

const currentPage = ref('home'); 
</script>

<style>
/* ... (全局样式保持不变) ... */
</style>