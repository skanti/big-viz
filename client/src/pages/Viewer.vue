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
        <div ref='div_scene' style='position: relative; width:100%;height:75vh'>
          <div class='absolute q-pa-xs q-gutter-xs' style='top: 0px; z-index: 999'>
            <q-btn size='sm' label='3D World' color='primary' text-color='white' icon='fas fa-cube' square dense unelevated />
            <q-btn-toggle size='sm' color='white' text-color='dark' toggle-color="blue-5"
            :model-value='settings.camera_up' unelevated dense no-wrap no-caps
            :options="[{label: 'Y-up', value: 'y'}, {label: 'Z-up', value: 'z'} ]"
            @update:model-value="v => onclick_up_axis(v)" />
            <q-btn-toggle size='sm' color='white' text-color='dark' toggle-color='blue-5'
            :model-value='settings.theme' unelevated dense no-wrap no-caps
            :options="[{value: 'light', icon: 'far fa-sun'}, {value: 'dark', icon: 'fas fa-moon' } ]"
            @update:model-value="v => onclick_theme(v)" />
          </div>
        </div>
      </div>
      <div class='col-3'>
        <MenuPanel ref='menu' class='full-width' style='height:75v'/>
        <component :is='toolbox' v-bind='toolbox_props' class='full-width'></component>
      </div>
    </div>
    <div class='row q-mt-lg q-gutter-sm q-pa-sm' style='max-width:800px'>
      <div v-for='(img,i) in images_src' :key='"img_div" + i'>
      <q-btn size="sm"
      :label="img.id" @click="e => click_copy_to_clipboard(e, img.id)"
      dense flat no-caps/>
        <img :src='img.src' :alt="img.id"/>
      </div>
      <div v-for='(vid,i) in videos_src' :key='"video_div" + i'>
        <video :src='vid.src' :alt="vid.id"  type="video/mp4" controls/>
      </div>
    </div>

  </q-page>
</template>

<script>

import Viewer  from '@/pages/Viewer.js';

export default Viewer;
</script>

<style scoped lang='scss'>

</style>
