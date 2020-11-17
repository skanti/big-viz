import Vue from 'vue'
import Component from 'vue-class-component'
import axios from 'axios';
import path from 'path';
import * as THREE from "three";
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OBJLoader2 } from 'three/examples/jsm/loaders/OBJLoader2.js';

import { mapState } from 'vuex'


import Menu from '@/components/Menu.vue';
import Toolbox from '@/components/Toolbox.vue';
import Renderer from '@/components/Renderer.js';
import Context from '@/components/Context.js';

import PCAObject from '@/components/objects/PCAObject.js';

@Component({
  name: "Viewer",
  components: { Menu, Toolbox },
  computed: { 
    search_text: {
      get () {
        return this.$store.state.search_text;
      },
      set (v) {
        this.$store.commit("search_text", v);
      },
    }
  }
})
export default class Viewer extends Vue {


  data() {
    return {
      ctx: new Context(),
      mode: "loading",
      mode_msg: "Loading...",
      status: "OK",
      is_active: false,
      mesh_bbox: null,
      raycaster: new THREE.Raycaster(),
      id_raycast: -1,
      renderer: null,
      toolbox: null,
      toolbox_props: {},
    }
  }

  init() {
    // -> init renderer
    this.renderer = new Renderer(this.ctx, this.$refs.div_scene, "renderer");
    this.renderer.camera.position.set(3,2,1); 
    this.renderer.controls.target.set(0,0,0); 
    this.renderer.controls.update();
    this.$store.commit("scene", this.renderer.scene);
    // <-

    // -> set listeners
    this.ctx.event_bus.$on("onclick_mouse_renderer", this.onclick_mouse.bind(this));
    this.ctx.event_bus.$on("selected", this.onclick_selected.bind(this));
    // <-

    // -> trigger
    this.add_ground_plane_to_scene();
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
    //console.log("dummy", this.dummy);
    //this.$store.commit("dummy_increment", this.dummy)
    this.init();
  }

  onclick_clear_cache() {
    localStorage.clear();
  }

  onclick_clear_canvas() {
    const children = this.renderer.scene.children;
    if (children === undefined || children.length == 0)
      return;

    let survived = [];
    for (let [i,obj] of Object.entries(children)) {
      let type = obj.type;
      if (type.includes("Light"))
        survived.push(obj);
      if (type.includes("Grid"))
        survived.push(obj);
    }
    this.renderer.scene.children = survived;
  }

  onclick_save_screenshot() {
    let img = new Image();
    let src = this.renderer.renderer.domElement.toDataURL();
    let a = document.createElement("a");
    a.href = src.replace("image/png", "image/octet-stream");
    a.download = "canvas_" + (new Date()).toISOString() + ".png";
    a.click();
  }

  onclick_screenshot() {
    let img = new Image();
    img.src = this.renderer.renderer.domElement.toDataURL();
    document.body.appendChild(img);
    let r = document.createRange();
    r.setStartBefore(img);
    r.setEndAfter(img);
    r.selectNode(img);
    let sel = window.getSelection();
    sel.addRange(r);
    document.execCommand('Copy');
    document.body.removeChild(img);
  }

  add_box_to_scene(data) {

    let color = null;
    const color_buff = data["color"];
    if (color_buff) {
      if (color_buff.length != 3)
        throw Error("'color' element has to size=3");
      color = new THREE.Color(color_buff[0], color_buff[1], color_buff[2]);
    }

    const g = new THREE.BoxBufferGeometry(1, 1, 1);
    const geometry = new THREE.WireframeGeometry(g);
    const material = new THREE.LineBasicMaterial({ color: color, linewidth: 5 });
    const wireframe = new THREE.LineSegments( geometry, material );

    this.apply_trs(wireframe, data["trs"]);
    this.renderer.upsert_mesh(data["id"], wireframe);

    this.renderer.scene.add(wireframe);
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

  add_verts_and_faces_to_scene(data) {
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
    this.apply_trs(mesh, data["trs"]);
    this.renderer.upsert_mesh(data["id"], mesh);
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

    if (colors_buff) {
      if (colors_buff.length != positions_buff.length)
        throw Error("'positions' and 'colors' have to have same length");
    }

    let mat = this.compose_mat4(data["trs"]);

    const geometry = new THREE.BoxBufferGeometry(res, res, res);
    const material = new THREE.MeshLambertMaterial( { color: color });
    const n_positions = positions_buff.length;
    let mesh = new THREE.InstancedMesh( geometry, material, n_positions );
    for (let i = 0; i < n_positions; i++) {
      let t = new THREE.Vector4(positions_buff[i][0], positions_buff[i][1], positions_buff[i][2], 1);
      t = t.applyMatrix4(mat);

      let trs = (new THREE.Matrix4()).makeTranslation(t.x, t.y, t.z);
      mesh.setMatrixAt(i, trs);
      if (colors_buff) {
        const c = new THREE.Color(colors_buff[i][0], colors_buff[i][1], colors_buff[i][2]);
        mesh.setColorAt(i, c);
      }
    }

    this.renderer.upsert_mesh(data["id"], mesh);
  }

  add_pca_sdf_to_scene(data) {

    let pca = new PCAObject(this.ctx, this.renderer);
    pca.parse_from_json(data);
    pca.make();
  }

  add_ply_to_scene(id, buffer) {
    const loader = new PLYLoader();
    const geometry = loader.parse(buffer);
    geometry.computeVertexNormals();
    let color = new THREE.Color("rgb(250, 250, 150)")
    const material = new THREE.MeshLambertMaterial( { color: color, side: THREE.DoubleSide});
    const mesh = new THREE.Mesh( geometry, material );

    this.renderer.upsert_mesh(id, mesh);
  }

  add_obj_to_scene(id, buffer) {
    const loader = new OBJLoader2();
    const mesh = loader.parse(buffer);
    let color = new THREE.Color("rgb(250, 250, 150)");
    const material = new THREE.MeshLambertMaterial( { color: color, side: THREE.DoubleSide});
    //const mesh = new THREE.Mesh( geometry, material );
    mesh.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });

    this.renderer.upsert_mesh(id, mesh);
  }

  compose_mat4(trs) {
    let trans = new THREE.Vector3(0, 0, 0);
    let rot = new THREE.Quaternion(0, 0, 0, 1);
    let scale = new THREE.Vector3(1, 1, 1);
    let mat = new THREE.Matrix4();
    mat.compose(trans, rot, scale);

    if (trs == null)
      return mat;

    if ("translation" in trs)
      trans = new THREE.Vector3(trs["translation"][0], trs["translation"][1], trs["translation"][2]);
    if ("rotation" in trs)
      rot = new THREE.Quaternion(trs["rotation"][1], trs["rotation"][2], trs["rotation"][3], trs["rotation"][0]);
    if ("scale" in trs)
      scale = new THREE.Vector3(trs["scale"][0], trs["scale"][1], trs["scale"][2]);

    mat.compose(trans, rot, scale);
    return mat

  }

  apply_trs(mesh, trs) {
    let mat = this.compose_mat4(trs);
    mesh.applyMatrix4(mat);
  }


  onclick_mouse(event) {
    this.onclick_instance(event);
  }

  onclick_selected(selected) {
    let id = selected["id"];
    if (!id) {
      this.toolbox = "";
      return;
    }

    let obj = null;
    for (let v of Object.values(this.renderer.scene.children)) {
      const is_match = v["name"] === id;
      if (is_match) {
        obj = v.raw;
        break;
      }
    }

    if (obj === null)
      return;

    if (obj.type == "pca_sdf") {
      this.toolbox = Toolbox;
      this.toolbox_props = {  variances: obj.variances };
    }
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

		let accepted_types = new Set(["ply", "points", "box", "pca_sdf"]);
    if (!accepted_types.has(type)) {
      console.log("Warning: Received data has unknown type. Type: ", type);
      return
    }

    try {
      if (type === "ply")
        this.add_verts_and_faces_to_scene(data);
      else if (type === "points")
        this.add_points_to_scene(data);
      else if (type === "box")
        this.add_box_to_scene(data);
      else if (type === "pca_sdf")
        this.add_pca_sdf_to_scene(data);

      this.ctx.event_bus.$emit("new_object");
    } catch (err){
      console.log(err);
    }
  }

  on_grab_data(filename, data) {
    try {
      let suffix = filename.split('.').pop();
      let id = path.basename(path.dirname(filename)) + path.basename(filename);
      const mesh_types = new Set(["ply", "obj"]);
      const vox_types = new Set(["vox", "svox", "svoxrgb"]);

      const accepted_types = new Set([...mesh_types, ...vox_types]);
      console.log(filename, accepted_types);
      if (!accepted_types.has(suffix)) {
        throw "Warning: Received data has unknown suffix: " + suffix;
      }

      if (suffix === "ply")
        this.add_ply_to_scene(id, data);
      else if (suffix === "obj")
        this.add_obj_to_scene(id, data);

      this.ctx.event_bus.$emit("new_object");
    } catch (err){
      console.log(err);
    }
  }


  onclick_grab() {
    const path_data = process.env.VUE_APP_URL_SERVER + "/data/" + this.search_text;
    axios.get(path_data, { responseType: 'arraybuffer' }).then(res => {
      this.on_grab_data(this.search_text, res.data);
    }).catch(err => {
      console.log("error", err);
    });
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

