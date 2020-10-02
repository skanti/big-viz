<template>
  <q-toolbar>
    <q-btn icon="fas fa-brain" class="q-mr-sm" color="primary" to="/" flat dense> </q-btn>
    <q-toolbar-title> <q-btn color="primary" label="Big Viz" size="lg" dense flat/>
    </q-toolbar-title>

    <q-space> </q-space>
    <div>
      <q-btn to="/Reset" class="text-bold q-pa-sm" size="lg" flat dense no-caps> Reset </q-btn>
    </div>
  </q-toolbar>
</template>

<script>

export default {
  name: 'Header',
  components: {
  },
  data: function () {
    return {
    }
  }
}
</script>

<style lang="scss">
</style>
