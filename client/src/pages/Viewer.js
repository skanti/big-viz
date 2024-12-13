import Vue from 'vue'
import axios from 'axios';
//import { mapState } from 'vuex'
import * as THREE from "three";
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { useQuasar, copyToClipboard } from 'quasar'

import MenuPanel from '@/components/MenuPanel.vue';
import PCAToolbox from '@/components/toolboxes/PCAToolbox.vue';
import AnimationToolbox from '@/components/toolboxes/AnimationToolbox.vue';
import Renderer from '@/components/Renderer.js';
import Context from '@/components/Context.js';

import ThreeHelper from '@/components/objects/ThreeHelper.js';

// store
import { mapWritableState } from 'pinia';
import useStore from '@/store/index.js';

// global non-reactive variable
let renderer = null;

// methods
const methods = {
  init() {
    this.loading = true;

    // init renderer
    renderer = new Renderer(this.ctx, this.settings, this.$refs.div_scene, "renderer");
    renderer.camera.position.set(5,5,2);
    renderer.controls.target.set(0,0,0);
    renderer.controls.update();

    // set listeners
    this.ctx.on("onclick_mouse_renderer", this.onclick_mouse.bind(this));
    this.ctx.on("selected", this.onclick_selected.bind(this));
    this.ctx.on("new_animation", this.on_new_animation.bind(this));

    // ground plane
    this.add_ground_plane_to_scene();

    // add listener
    this.$socket.on('user', id_socket => console.log("id_socket", id_socket));
    this.$socket.on('upsert', this.on_ws_upsert.bind(this));
    this.$socket.on('update', this.on_ws_update.bind(this));

    this.is_active = true;

    this.onclick_up_axis(this.settings.camera_up);
    this.onclick_theme(this.settings.theme);

    // update listeners (e.g. MenuPanel)
    this.ctx.emit("new_object", renderer.scene);

    // run animation loop
    this.advance_ref = this.advance.bind(this);
    this.advance();

    setTimeout(() => {
      this.loading = false;
    }, 2000);

  },

  onclick_clear_cache() {
    localStorage.clear();
  },

  onclick_clear_canvas() {
    const children = renderer.scene.children;
    if (children === undefined || children.length == 0)
      return;

    let survived = [];
    for (let obj of Object.values(children)) {
      let type = obj.type;
      if (type.includes("Light"))
        survived.push(obj);
      if (type.includes("Grid"))
        survived.push(obj);
    }
    renderer.scene.children = survived;
  },

  onclick_save_screenshot() {
    let src = renderer.renderer.domElement.toDataURL();
    let a = document.createElement("a");
    a.href = src.replace("image/png", "image/octet-stream");
    a.download = "canvas_" + (new Date()).toISOString() + ".png";
    a.click();
  },

  onclick_screenshot() {
    let img = new Image();
    img.src = renderer.renderer.domElement.toDataURL();
    document.body.appendChild(img);
    let r = document.createRange();
    r.setStartBefore(img);
    r.setEndAfter(img);
    r.selectNode(img);
    let sel = window.getSelection();
    sel.addRange(r);
    document.execCommand('Copy');
    document.body.removeChild(img);
  },

  onclick_copy_camera() {
    let cam = renderer.camera;
    let t = cam.position.toArray();
    let q = cam.quaternion.toArray();
    q = [q[3], q[0], q[1], q[2]]; // xyzw to wxyz

    let d = JSON.stringify({ t: t, q: q  })
    copyToClipboard(d).then(() => {
      console.log("copied");
    }).catch(() => {
      console.log("copy failed");
    })
  },
  click_copy_to_clipboard(e, text) {
    copyToClipboard(text).then(() => {
      this.$q.notify({ message: 'Copied!', caption: text, icon: 'fas fa-check-circle', color: 'green-5', timeout: '200' });
    });
    e.stopPropagation();
  },
  add_ground_plane_to_scene() {
    let width = 100.0;

    let helper = new THREE.GridHelper( width, 100 );
    if (this.settings.camera_up == 'y')
      helper.rotateX(-Math.PI/2);
    helper.name = "GridHelper";
    helper.position.z = 0.001;
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    renderer.scene.add( helper );
  },

  parse_ply_and_add_to_scene(id, buffer) {
    const loader = new PLYLoader();
    const geometry = loader.parse(buffer);
    geometry.computeVertexNormals();
    let color = new THREE.Color("rgb(250, 250, 150)")
    const material = new THREE.MeshStandardMaterial( { color: color, side: THREE.DoubleSide});
    const mesh = new THREE.Mesh( geometry, material );

    renderer.upsert_mesh(mesh);
  },

  add_obj_to_scene(id, buffer) {
    const loader = new OBJLoader();
    const mesh = loader.parse(buffer);
    let color = new THREE.Color("rgb(250, 250, 150)");
    const material = new THREE.MeshStandardMaterial( { color: color, side: THREE.DoubleSide});
    //const mesh = new THREE.Mesh( geometry, material );
    mesh.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });

    renderer.upsert_mesh(mesh);
  },

  parse_json_and_add_to_scene(id, buffer) {
    let data = new TextDecoder().decode(buffer);
    this.on_ws_upsert(data);
  },

  onclick_mouse(event) {
    this.onclick_instance(event);
  },

  onclick_selected(selected) {
    let id = selected["id"];
    if (!id) {
      this.toolbox = "";
      return;
    }

    let obj = null;
    for (let v of Object.values(renderer.scene.children)) {
      const is_match = v["name"] === id;
      if (is_match) {
        obj = v.raw;
        break;
      }
    }

    if (obj === null)
      return;

    if (obj.type == "pca_grid") {
      this.toolbox = PCAToolbox;
      this.toolbox_props = {  variances: obj.variances };
    }
  },

  on_new_animation(params) {
    this.toolbox = AnimationToolbox;
    params["mitt"] = this.ctx;
    params["scene"] = renderer.scene;
    this.toolbox_props = params;
  },

  onclick_instance(event) {
    const is_instance = this.id_raycast != -1;
    const is_left_click = event.button == 0;
    //console.log("is_left_click", is_left_click);

    if (is_instance && is_left_click) {
      this.ctx.emit("instance_selected", this.id_raycast);
    }
  },

  on_ws_update(data) {
    data = JSON.parse(data);
    try {
      //this.toolbox = AnimationToolbox;
      //this.toolbox_props = { id: "abc" };
      renderer.update_mesh(data);
      this.ctx.emit("updated_object");
    } catch (err){
      console.log(err);
    }
  },

  on_ws_upsert(data) {
    this.toolbox = "";
    data = JSON.parse(data);
    // check if image
    if (data.type === 'image') {
      //document.getElementById('img_div').src = data["data"];
      this.images_src.push({ id: data.id, src: data.data });
      this.$q.notify({ message: 'Image upserted!', caption: ':)', color: 'green-5', timeout: '200' });
      return;
    } else if (data.type === 'video') {
      console.log(data);
      //document.getElementById('img_div').src = data["data"];
      this.videos_src.push({ id: data.id, src: data.data });
      this.$q.notify({ message: 'Image upserted!', caption: ':)', color: 'green-5', timeout: '200' });
      return;
    }
    // else check for 3D data
    try {
      let meshes = ThreeHelper.make_mesh_from_type(this.ctx, data);
      if (!Array.isArray(meshes))
        meshes = [meshes];

      meshes.forEach(mesh => renderer.upsert_mesh(mesh));
      this.ctx.emit("new_object", renderer.scene);
      this.$q.notify({ message: 'Object upserted!', caption: ':)', color: 'green-5', timeout: '200' });
    } catch (err){
      console.log(err);
    }
  },

  on_grab_data(filename, data) {
    let suffix = filename.split('.').pop();
    let id = path.basename(path.dirname(filename)) + path.basename(filename);
    const ply_types = new Set(["ply" ]);
    const obj_types = new Set(["obj"]);
    const vox_types = new Set(["vox", "svox", "svoxrgb"]);
    //const pkl_types = new Set(["pickle", "pkl"]);
    const json_types = new Set(["json"]);

    const accepted_types = new Set([...ply_types, ...obj_types, ...vox_types, ...json_types]);
    if (!accepted_types.has(suffix)) {
      throw "Warning: Received data has unknown suffix: " + suffix;
    }

    if (ply_types.has(suffix))
      this.parse_ply_and_add_to_scene(id, data);
    else if (obj_types.has(suffix))
      this.parse_obj_and_add_to_scene(id, data);
    else if (json_types.has(suffix))
      this.parse_json_and_add_to_scene(id, data);

    this.ctx.emit("new_object", renderer.scene);
  },

  onclick_grab() {
    this.loading = true;
    const path_data = process.env.VUE_APP_URL_SERVER + "/data/" + this.search_text;
    axios.get(path_data, { responseType: 'arraybuffer' }).then(res => {
      this.on_grab_data(this.search_text, res.data);
    }).catch(err => {
      console.log(err);
      this.$q.notify({ message: err.message, caption: "Error", color: "red-5" })
    }).finally( () => {
      this.loading = false;
    });
  },

  onclick_up_axis(axis) {
    this.settings =  { ...this.settings, camera_up: axis };

    let camera = renderer.camera;
    if (axis == 'z')
      camera.up.set(0,0,1);
    else if (axis == 'y')
      camera.up.set(0,1,0);


    renderer.controls.dispose();
    renderer.setup_controls();

    let scene = renderer.scene;
    let grid_helper = scene.getObjectByName('GridHelper', true );
    grid_helper.rotateX(-Math.PI/2);

    let light = scene.getObjectByName('Light', true );
    if (axis == 'z')
      light.position.set(0.1, 0.1, 1);
    else if (axis == 'y')
      light.position.set(0.1, 1.0, 0.1);
  },

  onclick_theme(theme) {
    this.settings =  { ...this.settings, theme: theme };
    renderer.set_background(theme);
  },

  raycast() {
    this.raycaster.setFromCamera( renderer.mouse.pos, renderer.camera );

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
  },

  advance() {
    requestAnimationFrame(this.advance_ref);
    if (!this.is_active)
      return;
    //this.raycast();
    renderer.advance()
  }
}


export default {
  name: "Viewer",
  components: { MenuPanel, PCAToolbox, AnimationToolbox },
  computed: {
    ...mapWritableState(useStore, ['settings'])
  },

  data() {
    return {
      images_src: [],
      videos_src: [],
      search_text: '',
      loading: false,
      is_active: false,
      mesh_bbox: null,
      raycaster: new THREE.Raycaster(),
      id_raycast: -1,
      toolbox: null,
      toolbox_props: {},
    }
  },
  setup() {
    const q = useQuasar();
    return { q$: q }
  },
  created() {
    this.q$.dark.set(true)
  },
  mounted() {
    this.init();
  },

  methods: methods
};


