import { defineStore } from 'pinia';

export default defineStore('general', {
  state: () => ({
    scene: null,
    settings: {
      camera_up: 'z'
    }
  }),
  getters: {
  },
  actions: {
  },
  persist: true
})
