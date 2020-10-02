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
    this.ctx.event_bus.$on("onclick_mouse_renderer", this.onclick_mouse.bind(this));
    // <-

    // -> trigger
    this.add_ground_plane_to_scene();
    this.$store.commit("scene", this.renderer.scene);
    // <-

    // -> add listener
    this.$socket.$subscribe('user', id_socket => console.log("id_socket", id_socket));
    this.$socket.$subscribe('data', this.on_ws_data.bind(this));
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
    let width = 100.0;
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

  add_ply_to_scene(data) {
    if (!("verts" in data))
      throw Error("No 'verts' in data");
    if (!("faces" in data))
      throw Error("No 'faces' in data");

    const verts_buff = data["verts"];
    const faces_buff = data["faces"];
    const colors_buff = data["colors"];

    let geometry = new THREE.Geometry();

    /*eslint no-unused-vars: "off"*/
    for (let [i,v] of Object.entries(verts_buff)) {
      geometry.vertices.push(new THREE.Vector3(v[0], v[1], v[2]));
    }
    for (let [i,f] of Object.entries(faces_buff)) {
      geometry.faces.push(new THREE.Face3(f[0], f[1], f[2]));
    }

    geometry.computeVertexNormals();

    if (colors_buff) {
      for (let [i,c] of Object.entries(colors_buff)) {
        geometry.colors.push(new THREE.Vector3(c[0], c[1], c[2]));
      }
    }

    let color = null;
    let color_buff =  data["color"];
    if (color_buff) {
      if (color_buff.length != 3)
        throw Error("'color' element has to size=3");
      color = new THREE.Color(color_buff[0], color_buff[1], color_buff[2]);
    }

    if (!colors_buff && !color_buff)
      color = new THREE.Color(Math.random(), Math.random(), Math.random());

    let material = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide });
    let mesh = new THREE.Mesh( geometry, material );
    this.upsert_mesh(data["id"], mesh);
  }


  add_points_to_scene(data) {
    if (!("positions" in data))
      throw Error("'points' not in data");
    if (!("res" in data))
      throw Error("'res' not in data");

    const positions_buff = data["positions"];
    const colors_buff = data["colors"];
    const res = data["res"];

    let color = null;
    let color_buff =  data["color"];
    if (color_buff) {
      if (color_buff.length != 3)
        throw Error("'color' element has to size=3");
      color = new THREE.Color(color_buff[0], color_buff[1], color_buff[2]);
    }

    if (!colors_buff && !color_buff)
      color = new THREE.Color(Math.random(), Math.random(), Math.random());

    const geometry = new THREE.BoxBufferGeometry(res, res, res);
    const material = new THREE.MeshLambertMaterial( { color: color });
    const n_positions = positions_buff.length;
    let mesh = new THREE.InstancedMesh( geometry, material, n_positions );
    for (let i = 0; i < n_positions; i++) {
      const trans = new THREE.Vector3(positions_buff[i][0], positions_buff[i][1], positions_buff[i][2]);
      const rot = new THREE.Quaternion();
      const scale = new THREE.Vector3(1, 1, 1);
      let trs = new THREE.Matrix4();
      trs = trs.compose(trans, rot, scale);
      mesh.setMatrixAt(i, trs);
      if (colors_buff) {
        const c = new THREE.Color(colors_buff[i][0], colors_buff[i][1], colors_buff[i][2]);
        mesh.setColorAt(i, c);
      }
    }


    this.upsert_mesh(data["id"], mesh);
  }

  upsert_mesh(id, mesh) {

    for (let [i,v] of Object.entries(this.renderer.scene.children)) {
      const is_match = v["name"] === id;
      console.log("name", v["name"]);
      if (is_match) {
        this.renderer.scene.remove(v);
        break;
      }
    }
    mesh.name = id;
    this.renderer.scene.add(mesh);

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

  on_ws_data(data) {
    data = JSON.parse(data);
    let type = data["type"];

		let accepted_types = new Set(["ply", "points"]);
    if (!accepted_types.has(type)) {
      console.log("Warning: Received data has unknown type. Type: ", type);
      return
    }

    try {
      if (type === "ply")
        this.add_ply_to_scene(data);
      else if (type === "points")
        this.add_points_to_scene(data);
    } catch (err){
      console.log(err);
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

