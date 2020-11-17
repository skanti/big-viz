<template>

  <div >
    <q-table
      title="Objects"
      :data="rows"
      :columns="columns"
      row-key="id"
      selection="single"
      :pagination="pagination"
      @row-click="onclick_row"
      >
      <template v-slot:top-left>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:prepend>
            <q-icon name="fas fa-search" />
          </template>
        </q-input>
      </template>


      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th> Visible </q-th>
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr class="cursor-pointer"
              :class="props.row.id ==  id_selected ? 'bg-primary' : 'bg-grey-1'"
              :props="props" @click="onclick_row(props.row)">
          <q-td auto-width>
            <q-btn size="sm"
                   color="dark"
                   @click="e => toggle_visibility(e, props.row)"
                   :icon="props.row.visible ? 'fas fa-eye' : 'fas fa-eye-slash'" round />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name" :props="props" >
            <q-badge color="blue"> {{ col.value }}</q-badge>
          </q-td>

        </q-tr>
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
      id_selected: "",
      columns: [
        { name: 'id', label: 'ID', align: 'left', field: 'id', sortable: true, required: true },
        { name: 'type', label: 'Type', field: 'type', sortable: true },
      ],

      pagination: {
        page: 1,
        rowsPerPage: 20
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
        let item = { idx: i, id: name, type: obj.type, visible: obj.visible };
        rows.push(item);
      }
      return rows;
    },
  }, created () {
    this.ctx = this.$props.ctx;
    this.ctx.event_bus.$on("new_object", this.add_new_object);
  }, methods : {
    add_new_object: function () {
    },
    onclick_row:  function(row) {
      // eslint-disable-next-line
      const id = row.id;
      if (this.id_selected == id)
        this.id_selected = "";
      else 
        this.id_selected = id;
      this.ctx.event_bus.$emit("selected", { "id": this.id_selected });
    },
    toggle_visibility: function(e, row) {
      let idx = row.idx;
      row.visible = !row.visible;
      this.scene.children[idx].visible = !this.scene.children[idx].visible;
      e.stopPropagation();
    }
  }
}
</script>

<style scoped lang="scss">

</style>
