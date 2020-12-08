<template>
  <q-card class="bg-primary text-white q-mt-sm">
    <q-card-section>
      <div class="text-h6">Toolbox</div>
      <div class="text-subtitle2">PCA Parameters</div>
    </q-card-section>

    <div v-for="(item,k) in n_components" :key="'params_' + k">
      <q-card-section >
        <q-badge class="text-bold" color="dark"> {{ k }} : -{{std[k].toFixed(1) }} ... {{ std[k].toFixed(1)}} </q-badge>
        <q-slider name="hoi" v-model="params[k]" :min="-std[k]" :max="std[k]"
          @change="on_change" :step="0.1" label label-always color="dark" />
      </q-card-section>
    </div>

  </q-card>

</template>

<script>

export default {
  name: 'Toolbox',
  components: { },
  props: [ 'ctx', 'variances' ],
  data() {
    return {
      n_components: 0,
      std: [],
      params: [],
    };
  }, created () {
    this.n_components = this.variances.length;
    this.std = this.variances.map(x => x);
    this.params = Array(this.n_components).fill(0);
  }, methods : {
    on_change: function() {
      this.ctx.event_bus.$emit("pca", { "params": this.params });
    }
  }
}
</script>

<style scoped lang="scss">

</style>
