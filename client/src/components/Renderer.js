import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

class Renderer {
  constructor(ctx, div_root, tag) {
    // -> variable definition
    this.ctx = ctx;
    this.tag = tag;
    this.root_container = div_root;

    this.is_initialized = false;
    this.win = {width : 0, height : 0 };
    this.camera = null;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer_badge = new CSS2DRenderer();
    this.controls = null;
    this.mouse = { pos: new THREE.Vector2(), is_drag: false };
    this.stats_fps = new Stats();
    // <-

    // -> scene renderer
    this.setup_scene_renderer();
    this.setup_controls();
    // <-
    this.is_initialized = true;
  }


  setup_scene_renderer() {
    this.win.width = this.root_container.clientWidth;
    this.win.height = this.root_container.clientHeight;
    this.win.aspect_ratio = this.win.width/this.win.height;

    // -> setup renderer
    this.camera = new THREE.PerspectiveCamera( 70, this.win.aspect_ratio, 0.1, 500 );
    this.camera.up.set(0, 0, 1);
    this.camera.position.x = 0.0;
    this.camera.position.z = 1.0;

    this.scene.add( new THREE.AmbientLight( 0x555555 ) );
    let light = new THREE.DirectionalLight( 0xffffff, 0.5 );
    light.position.set(0.1,0.1,1);
    this.scene.add( light );
    this.scene.background = new THREE.Color("rgb(240, 230, 230)");

    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize(this.win.width, this.win.height);
    this.root_container.appendChild( this.renderer.domElement );
    this.root_container.appendChild( this.renderer_badge.domElement );

    const rect = this.root_container.getBoundingClientRect();
    this.renderer_badge.setSize(this.win.width, this.win.height);
    this.renderer_badge.domElement.style.position = 'absolute';
    this.renderer_badge.domElement.style.top = (rect.top - 50 ) + "px";

    this.root_container.addEventListener( 'pointermove', this.onmove_mouse.bind(this) );
    this.root_container.addEventListener( 'pointerdown', this.ondown_mouse.bind(this) );
    this.root_container.addEventListener( 'pointerup', this.onup_mouse.bind(this) );
    // <-
  }

  onmove_mouse(event) {
    this.update_mouse(event);
    this.mouse.is_drag = true;
    this.ctx.event_bus.$emit("onmove_mouse_" + this.tag, event);
  }

  update_mouse(event) {
    const rect = this.root_container.getBoundingClientRect();
    this.mouse.pos.x = ( ( event.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1;
    this.mouse.pos.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
  }


  ondown_mouse() {
    this.mouse.is_drag = false;
  }

  onup_mouse(event) {
    if (!this.mouse.is_drag) {
      this.ctx.event_bus.$emit("onclick_mouse_" + this.tag, event);
    }
  }

  set_view_from_camera(cam, contr) {
    //this.camera.up.set(cam.up);
    this.camera.position.copy(cam.position);
    this.camera.rotation.copy(cam.rotation);
    this.camera.up.copy(cam.up);
    this.controls.target.copy(contr.target);
    this.controls.update();
  }

  setup_controls() {
    this.controls = new OrbitControls( this.camera, this.renderer_badge.domElement );

    this.controls.enableDamping = false;
    this.controls.screenSpacePanning = false;
    this.controls.rotateSpeed = 0.5;
    this.controls.target.set(10,0,0);

    this.controls.maxPolarAngle = Math.PI;
    this.controls.update();

    this.stats_fps.domElement.style.cssText = 'position:relative;top:0px;left:0px;';
    this.root_container.appendChild( this.stats_fps.dom );

  }

  advance() {
    this.renderer.render(this.scene, this.camera);
    this.renderer_badge.render(this.scene, this.camera);
    this.stats_fps.update();
  }

  upsert_mesh(id, mesh) {

    for (let v of Object.values(this.scene.children)) {
      const is_match = v["name"] === id;
      if (is_match) {
        this.scene.remove(v);
        break;
      }
    }
    mesh.name = id;
    this.scene.add(mesh);
  }
}

export default Renderer;
