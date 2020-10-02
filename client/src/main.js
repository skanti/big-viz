import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import ws from '@/ws'
import VueNativeSock from 'vue-native-websocket'

import "./quasar"

Vue.config.productionTip = false


let url_ws = 'ws://localhost:' + process.env.VUE_APP_PORT_WEBSOCKET;
Vue.use(VueNativeSock, url_ws, ws);



new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')
