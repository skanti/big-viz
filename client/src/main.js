import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import io from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';

import "./quasar"

Vue.config.productionTip = false

// -> websocket
let uri_ws = 'http://localhost:' + process.env.VUE_APP_PORT;
const ws = io(uri_ws);
Vue.use(VueSocketIOExt, ws);
// <-

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app')
