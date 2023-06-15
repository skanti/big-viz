import { defineStore } from 'pinia';

export default defineStore('general', {
  state: () => ({
    scene: null,
    settings: {
      camera_up: 'z',
      theme: 'light'
    }
  }),
  getters: {
  },
  actions: {
  },
  persist: true
})
