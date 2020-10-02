<template>
  <q-layout view="hHh lpr lFf">
    <q-header class="bg-dark">
      <Header/>
    </q-header>

    <q-page-container>

      <!-- keep alive mechanism only for alignment -->
      <keep-alive include="Retrieval">
        <router-view />
      </keep-alive>
      <!-- keep alive mechanism only for alignment -->

    </q-page-container>

  </q-layout>
</template>

<script>

import Header from '@/components/Header.vue'

export default {
  name: 'AlignmentLayout',
  components: { Header },
  data () {
    return {
    }
  }
}
</script>
