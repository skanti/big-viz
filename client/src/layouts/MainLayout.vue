<template>
  <q-layout view="hHh lpr lFf">
    <q-header class="bg-dark">
      <Header/>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>

import Header from '@/components/Header.vue'

export default {
  name: 'MainLayout',
  components: { Header },
  data () {
    return {
    }
  }
}
</script>
