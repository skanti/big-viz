import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    id_sequence: '',
    id_frame: '',
    id_selected_cad: '',
    id_selected_instance: '',
    duration_retrieval: 0,
    user: {},
    mesh_lidar: null,
    meshes_cad: [],
    annotations: [],
    camera: null,
    controls: null,
  },
  mutations: {
    user(state, user) {
      state.user = user
    },
    id_sequence(state, id_sequence) {
      state.id_sequence = id_sequence
    },
    id_frame(state, id_frame) {
      state.id_frame = id_frame
    },
    id_selected_cad(state, id_selected_cad) {
      state.id_selected_cad = id_selected_cad
    },
    id_selected_instance(state, id_selected_instance) {
      state.id_selected_instance = id_selected_instance
    },
    duration_retrieval(state, duration_retrieval) {
      state.duration_retrieval = duration_retrieval
    },
    mesh_lidar(state, mesh_lidar) {
      state.mesh_lidar = mesh_lidar
    },
    camera(state, camera) {
      state.camera = camera
    },
    controls(state, controls) {
      state.controls = controls
    },
    meshes_cad_push(state, mesh_cad) {
      state.meshes_cad.push(mesh_cad);
    },
    annotations_push(state, annotation) {
      state.annotations.push(annotation);
    },
    annotations(state, annotation) {
      state.annotations = annotation;
    },
  }

})
