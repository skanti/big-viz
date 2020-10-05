<template>

  <div >
    <q-table
      title="Objects"
      :data="rows"
      :columns="columns"
      row-key="id"
      selection="multiple"
      :selected.sync="selected"
      @selection="toggle_visibility"
      >
      <template v-slot:top-left>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:prepend>
            <q-icon name="fas fa-search" />
          </template>
        </q-input>
      </template>


      <template v-slot:header-selection="scope">
        <q-toggle v-model="scope.selected" />
      </template>

      <template v-slot:body-selection="scope">
        <q-toggle v-model="scope.selected" />
      </template>

    </q-table>
  </div>
</template>

<script>

export default {
  name: 'Menu',
  components: { },
  props: [ 'ctx' ],
  data() {
    return {
      filter: "",
      selected: [],
      columns: [
        { name: 'id', label: 'ID', align: 'left', field: 'id', sortable: true, required: true },
        { name: 'type', label: 'Type', field: 'type', sortable: true },
      ],

      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10
      },
    }
  }, computed: {
    scene: function () {
      return this.$store.state.scene;
    },
    rows: function() {
      const children = this.scene.children;
      if (children === undefined || children.length == 0)
        return [];

      let rows = [];
      let name_mapping = {};
      for (let [i,obj] of Object.entries(children)) {
        let type = obj.type;
        if (type.includes("Light"))
          continue
        if (name_mapping[type] == undefined)
          name_mapping[type] = 0
        else
          name_mapping[type] = name_mapping[type] + 1;
        let name = obj.type + name_mapping[type];
        if (obj.name)
          name = obj.name;
        let item = { idx: i, id: name, type: obj.type };
        rows.push(item);
      }
      return rows;
    },
  }, created () {
    this.ctx = this.$props.ctx;
    this.ctx.event_bus.$on("new_object", this.add_new_object);
  }, methods : { 
    add_new_object: function () {
      console.log(this.scene);
    },
    toggle_visibility: function(r) {
      /*eslint no-unused-vars: "off"*/
      for (let [i,k] of Object.entries(r.rows)) {
        let idx = k.idx;
        this.scene.children[idx].visible = !this.scene.children[idx].visible;
      }
    }
  } 
}
</script>

<style scoped lang="scss">

</style>
