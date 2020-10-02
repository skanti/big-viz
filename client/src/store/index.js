import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		scene : null,
	},
	mutations: {
		scene(state, scene) {
			state.scene = scene
		},
	}
});

