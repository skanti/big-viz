<template>
  <q-page>
    <!-- search bar -->
    <div class='row q-pa-sm' id='div_menu_bar'>
      <div class='row items-center q-col-gutter-md' style='width:100%'>
        <div class='col-11'>
          <q-input class='q-pa-none' v-model='search_text' label='File Path' input-class='text-bold' standout='bg-primary text-white' rounded bottom-slots dense>
            <template v-slot:prepend>
              <q-icon name='fas fa-file' />
            </template>
            <template v-slot:append>
              <q-icon name='fas fa-times' @click='search_text = ""' class='cursor-pointer' />
            </template>
          </q-input>
        </div>
        <div class='col-1'>
          <q-btn @click='onclick_grab' label='Grab' class='text-bold fit' color='primary' icon='fas fa-arrow-circle-right' :disable='search_text == ""' dense />
        </div>
      </div>
    </div>
    <!-- search bar -->

    <!-- status -->
    <div class='row q-pa-sm' id='div_status_bar'>
      <div class='flex items-center q-col-gutter-md' style='width:100%'>
        <div class='q-gutter-sm'>
          <q-btn class='text-bold' color='primary' dense>
            <div v-if='loading'>
              <div> Loading...  <q-spinner class='on-right' /> </div>
            </div>
            <div v-else>
              Status <q-icon class='on-right' name='fas fa-check-circle'/>
            </div>
          </q-btn>
          <q-btn @click='onclick_screenshot' label='Screenshot' class='text-bold' color='blue-5' icon-right='fas fa-camera' dense />
          <q-btn @click='onclick_save_screenshot' label='Save Screenshot' class='text-bold' color='blue-5' icon-right='fas fa-download' dense />
          <q-btn @click='onclick_copy_camera' label='Copy Camera' class='text-bold' color='blue-5' icon-right='fas fa-video' dense />
          <q-btn @click='onclick_clear_canvas' label='Clear Canvas' class='text-bold' color='red-5' icon-right='fas fa-times' dense />
        </div>
      </div>
    </div>
    <!-- status -->

    <div class='row q-col-gutter-sm q-pa-sm'>
      <div class='col-9'>
        <div ref='div_scene' style='width:100%;height:75vh'>
          <div class='absolute q-pa-xs q-gutter-xs'>
            <q-btn size='sm' label='3D World' color='primary' text-color='white' icon='fas fa-cube' square dense unelevated />
            <q-btn-toggle size='sm' class='absolute' color='white' text-color='dark' toggle-color="blue-5" :value='settings.camera_up' unelevated dense no-wrap no-caps
              :options="[{label: 'Y-up', value: 'y'}, {label: 'Z-up', value: 'z'} ]" @input="v => onclick_up_axis(v)" />
          </div>
        </div>
      </div>
      <div class='col-3'>
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
