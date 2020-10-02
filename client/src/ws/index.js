
import store from '@/store'

// index.js
import {
  SOCKET_ONOPEN,
  SOCKET_ONCLOSE,
  SOCKET_ONERROR,
  SOCKET_ONMESSAGE,
  SOCKET_RECONNECT,
  SOCKET_RECONNECT_ERROR
} from '@/ws/mutation-types.js'
 
const mutations = {
  SOCKET_ONOPEN,
  SOCKET_ONCLOSE,
  SOCKET_ONERROR,
  SOCKET_ONMESSAGE,
  SOCKET_RECONNECT,
  SOCKET_RECONNECT_ERROR
}


const ws = { 
  store: store,
  format: 'json',
  reconnection: false,
  reconnectionAttempts: 5,
  mutations: mutations
};

export default ws;
