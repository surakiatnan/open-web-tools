import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ToolView from '@/views/ToolView.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/:toolId', component: ToolView },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
