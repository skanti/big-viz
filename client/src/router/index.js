import { createRouter, createWebHistory } from 'vue-router'
import Viewer from '@/pages/Viewer.vue'
import Error404 from '@/pages/Error404.vue'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: Viewer }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router;
