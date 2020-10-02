import Vue from 'vue'
import Vuex from 'vuex'

import {
  SOCKET_ONOPEN,
  SOCKET_ONCLOSE,
  SOCKET_ONERROR,
  SOCKET_ONMESSAGE,
  SOCKET_RECONNECT,
  SOCKET_RECONNECT_ERROR
} from '@/ws//mutation-types.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    scene : null,
    socket: {
      isConnected: false,
      message: '',
      reconnectError: false,
    }
  },
  mutations: {
    [SOCKET_ONOPEN](state, event)  {
      /*eslint no-unused-vars: 0*/
      state.socket.isConnected = true
    },
    [SOCKET_ONCLOSE](state, event)  {
      state.socket.isConnected = false
    },
    [SOCKET_ONERROR](state, event)  {
      console.error(state, event)
    },
    // default handler called for all methods
    [SOCKET_ONMESSAGE](state, message)  {
      state.socket.message = message
    },
    // mutations for reconnect methods
    [SOCKET_RECONNECT](state, count) {
      console.info(state, count)
    },
    [SOCKET_RECONNECT_ERROR](state) {
      state.socket.reconnectError = true;
    },
    scene(state, scene) {
      state.scene = scene
    },
  }
})

