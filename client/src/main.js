import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Quasar, useQuasar } from 'quasar';
import quasarUserOptions from './quasar-user-options'
import io from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';
import mitt from 'mitt';


// pinia
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)


// websocket
const url_ws = `http://localhost:${process.env.VUE_APP_PORT}`;
const socket = io(url_ws);

// app
const app = createApp(App)
app.use(Quasar, quasarUserOptions)
app.use(pinia);
app.use(router)

// global variables
//app.provide('socket', socket);
app.config.globalProperties.$socket = socket;
app.config.globalProperties.ctx = mitt();


app.mount('#app')

