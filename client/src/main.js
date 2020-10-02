import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import ws from '@/ws'
import VueSocketIOExt from 'vue-socket.io-extended';

import "./quasar"

Vue.config.productionTip = false

Vue.use(VueSocketIOExt, ws);

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')
