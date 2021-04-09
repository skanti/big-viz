import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";

const dataState = createPersistedState({
  paths: ['search_text', 'settings']
})

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [dataState],
  state: {
    scene : {},
    search_text: '',
    settings: { camera_up: 'z' },
    dummy: 0,
  },
	mutations: {
    scene(state, scene) {
      state.scene = scene
    },
    settings(state, settings) {
      state.settings = Object.assign({}, state.settings, settings);
    },
    search_text(state, search_text) {
      state.search_text = search_text
    },
    dummy_increment(state) {
			state.dummy += 1
		},
	}
});

