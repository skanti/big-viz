<template>
  <q-page>

    <!-- search bar -->
    <div class='row q-pa-sm' id='div_menu_bar'>
      <div class='row items-center q-col-gutter-md' style='width:100%'>
        <div class='col-11'>
          <q-input class='q-pa-none' v-model='search_text' label='File Path' input-class='text-bold' standout='bg-primary text-white' rounded bottom-slots>
            <template v-slot:prepend> <q-icon name='fas fa-file' /> </template>
            <template v-slot:append> <q-icon name='fas fa-times' @click='search_text = ""' class='cursor-pointer' /> </template>
          </q-input>
        </div>
        <div class='col-1'>
          <q-btn @click='onclick_grab' label='Grab' class='text-bold fit' color='primary' icon='fas fa-arrow-circle-right' :disable='search_text == ""'>  </q-btn>
        </div>
      </div>
    </div>
    <!-- search bar -->

    <!-- status -->
    <div class='row q-pa-sm' id='div_status_bar'>
      <div class='flex items-center q-col-gutter-md' style='width:100%'>
        <div class='q-gutter-sm'>
          <q-btn :loading='loading' color='primary' >
            Status: <q-icon class='q-ml-sm' name='fas fa-check-circle'/>
            <template v-slot:loading> <q-spinner class='on-left' /> Loading...  </template>
          </q-btn>
          <q-btn @click='onclick_screenshot' label='Screenshot' class='text-bold' color='blue-5' icon='fas fa-camera' >  </q-btn>
          <q-btn @click='onclick_save_screenshot' label='Save Screenshot' class='text-bold' color='blue-5' icon='fas fa-download' >  </q-btn>
          <q-btn @click='onclick_clear_canvas' label='Clear Canvas' class='text-bold' color='red-5' icon='fas fa-times' >  </q-btn>
        </div>
      </div>
    </div>
    <!-- status -->

    <div class='row q-col-gutter-sm q-pa-sm'>
      <div class='col-9'>
        <q-chip class='q-ma-none q-my-sm' color='primary' text-color='white' icon='fas fa-cube' square> Canvas </q-chip>
        <div ref='div_scene' style='width:100%;height:70vh'> </div>
      </div>
      <div class='col-3'>
        <q-chip class='q-ma-none q-my-sm' color='primary' text-color='white' icon='fas fa-bars' square> Menu </q-chip>
        <Menu ref='menu' class='full-width' :ctx='ctx' />
        <component :is='toolbox' v-bind='toolbox_props' class='full-width' :ctx='ctx'></component>
      </div>
    </div>

  </q-page>
</template>

<script>

import Viewer  from '@/components/Viewer.js';

export default Viewer;
</script>

<style scoped lang='scss'>

</style>
