import Vue from 'vue'
import Component from 'vue-class-component'
//import axios from 'axios';
import * as THREE from "three";

import { mapState } from 'vuex'


import Menu  from '@/components/Menu.vue';
import Renderer from '@/components/Renderer.js';

@Component({
  name: "Viewer",
  components: { Menu },
  computed: mapState([ "scene" ])
})
export default class Viewer extends Vue {


  data() {
    return {
      ctx : { event_bus: new Vue() },
      mode : "loading",
      mode_msg : "Loading...",
      text: "",
      status : "OK",
      is_active : false,
      mesh_bbox : null,
      raycaster : new THREE.Raycaster(),
      id_raycast: -1,
      renderer : null,
    }
  }

  init() {
    this.renderer = new Renderer(this.ctx, this.$refs.div_scene, "renderer");
    this.renderer.camera.position.set(3,2,1); 
    this.renderer.controls.target.set(0,0,0); 
    this.renderer.controls.update();

    // -> set listeners
    this.ctx.event_bus.$on("onclick_mouse_renderer", this.onclick_mouse.bind(this));
    // <-

    // -> trigger
    this.add_ground_plane_to_scene();
    this.$store.commit("scene", this.renderer.scene);
    // <-

    this.mode = "ok";
    this.is_active = true;

    // -> run animation loop
    this.advance_ref = this.advance.bind(this);
    this.advance();
    // <-
  }

  mounted() {
    this.init();
  }

  add_bbox_to_scene() {
    const n_instances = 1;

    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ });
    let mesh = new THREE.InstancedMesh( geometry, material, n_instances );
    for (let i = 0; i < n_instances; i++) {
      const trs = new THREE.Matrix4();
      const color = new THREE.Color("rgb(200, 200, 0)");
      mesh.setMatrixAt(i, trs);
      mesh.setColorAt(i, color);

    }
    this.renderer.scene.add(mesh);
  }

  add_ground_plane_to_scene() {
    let width = 20.0;
    //let geometry = new THREE.PlaneBufferGeometry( width, width );
    //geometry.rotateX(-Math.PI/2);
    //let material = new THREE.ShadowMaterial( { opacity: 0.2 } );
    //let plane = new THREE.Mesh( geometry, material );
    //plane.receiveShadow = true;
    //this.renderer.scene.add( plane );

    let helper = new THREE.GridHelper( width, 100 );
    helper.rotateX(-Math.PI/2);
    helper.position.z = 0.001;
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    this.renderer.scene.add( helper );
  }

  onclick_mouse(event) {
    this.onclick_instance(event);
  }


  onclick_instance(event) {

    const is_instance = this.id_raycast != -1;
    const is_left_click = event.button == 0;
    console.log("is_left_click", is_left_click);

    if (is_instance && is_left_click) {
      this.ctx.event_bus.$emit("instance_selected", this.id_raycast);
    }
  }

  onclick_grab() {
    this.add_bbox_to_scene();
    this.ctx.event_bus.$emit("new_object");
  }

  raycast() {
    this.raycaster.setFromCamera( this.renderer.mouse.pos, this.renderer.camera );

    let intersection = this.raycaster.intersectObject( this.mesh_bbox );
    const color = new THREE.Color("rgb(200, 200, 0)");

    const instances = this.message_pb.instances;
    const n_instances = instances.length;
    for (let i = 0; i < n_instances; i++) {
      const color = instances[i]["color"];
      this.mesh_bbox.setColorAt(i, color);
    }

    this.id_raycast = -1;
    if ( intersection.length > 0 ) {
      let id_instance = intersection[ 0 ].instanceId;
      this.id_raycast = id_instance;
      this.mesh_bbox.setColorAt( id_instance, color );
    }
    this.mesh_bbox.instanceColor.needsUpdate = true;
  }

  advance() {
    requestAnimationFrame(this.advance_ref);
    if (!this.is_active)
      return;
    //this.raycast();
    this.renderer.advance()
  }
}

