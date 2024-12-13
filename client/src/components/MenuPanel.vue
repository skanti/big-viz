<template>

  <q-table class="q-my-xs" title="Objects" :rows="rows" :columns="columns" row-key="id"
    selection="single" :pagination="pagination" @row-click="onclick_row" virtual-scroll
    :rows-per-page-options="[0]" style="max-height:600px">
    <template v-slot:top>
      <div style="width:100%">
        <q-input outlined dense debounce="300" v-model="filter" placeholder="Search" style="width:100%">
          <template v-slot:prepend>
            <q-icon name="fas fa-search" />
          </template>
        </q-input>
        <br/>

        <!-- tool bar -->
        <q-btn @click='click_hide_all_objects' label='Hide all' color='dark' icon-right='fas fa-eye'
          size="sm" no-caps dense outline />
        <!-- tool bar -->
      </div>
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
        :class="props.row.id ==  id_selected ? 'bg-primary' : 'bg-transparent'"
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
</template>

<script>

// store
import { mapWritableState } from 'pinia';
import useStore from '@/store/index.js';

var scene = null;

export default {
  name: 'MenuPanel',
  components: { },
  data() {
    return {
      rows: [],
      filter: "",
      id_selected: "",
      columns: [
        { name: 'id', label: 'ID', align: 'left', field: 'id', sortable: true, required: true },
        { name: 'type', label: 'Type', field: 'type', sortable: true },
      ],

      pagination: {
        rowsPerPage: 0
      },
    }
  },created () {
    this.ctx.on("new_object", this.add_new_object);
  }, methods : {
    add_new_object(scene_) {
      scene = scene_;
      if (scene === null) {
        return null;
      }

      // check if scene has children
      const children = scene.children;
      if (children === undefined || children.length == 0) {
        return [];
      }

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
      this.rows = rows;
    },
    onclick_row(row) {
      // eslint-disable-next-line
      const id = row.id;
      if (this.id_selected == id)
        this.id_selected = "";
      else
        this.id_selected = id;
      this.ctx.emit("selected", { "id": this.id_selected });
    },
    toggle_visibility(e, row) {
      if (scene === null) {
        return
      }
      let idx = row.idx;
      row.visible = !row.visible;
      scene.children[idx].visible = !scene.children[idx].visible;
    },
    click_hide_all_objects() {
      if (scene === null) {
        return
      }
      const children_special = ["Helper", "Child", "Light"];
      for (const child of scene.children) {
        const is_special = children_special.some(x => child.type.includes(x))
        if (is_special) {
          continue
        }
        child.visible = false;
      }
    }
  }
}
</script>

<style scoped lang="scss">

</style>
