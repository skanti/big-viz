import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";

const dataState = createPersistedState({
  paths: ['search_text']
})

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [dataState],
  state: {
    scene : {},
    search_text: "",
    dummy: 0,
  },
	mutations: {
    scene(state, scene) {
      state.scene = scene
    },
    search_text(state, search_text) {
      state.search_text = search_text
    },
    dummy_increment(state) {
			state.dummy += 1
		},
	}
});

