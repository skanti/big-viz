import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: "history",
  routes : [
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        { path: '', component: () => import('@/pages/Viewer.vue') }
      ]
    },
    {
      path: '*',
      component: () => import('@/pages/Error404.vue')
    }
  ]
})


export default router;

