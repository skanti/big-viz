import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    scene : {},
    dummy: 0,
  },
	mutations: {
    scene(state, scene) {
      state.scene = scene
    },
    dummy_increment(state) {
			state.dummy += 1
		},
	}
});

