import * as THREE from "three";

import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import MathHelpers from '@/components/MathHelpers.js';

class PointObject {
  ctx = null;
  renderer = null;

  id = "";
  type = "";
  positions = [];
  res = 0.0;

  trs = null;
  color = null;
  colors = [];
  badge = "";
  transparent = false;

  geometry = null;
  material = null;
  mesh = null;

  constructor(ctx) {
    this.ctx = ctx;
    //this.ctx.event_bus.$on("pca", this.on_change_parameters.bind(this));
  }

  extract(data) {
    // -> check if keys present
    let keys_required = ["id", "type", "positions", "res"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }
    // <-

    this.id = data.id;
    this.type = data.type;
    this.positions = data.positions;
    this.res = data.res;

    if ("trs" in data) {
      this.trs = data.trs;
    }

    if ("color" in data) {
      let c = data.color
      console.log(c);
      if (c.length != 3)
        throw Error("'color' field must have size=3");
      this.color = new THREE.Color(c[0], c[1], c[2]);
    } else if ("colors" in data) {
      this.colors = data.colors
    }

    this.transparent = data.transparent || this.transparent;

    this.badge = data.badge || this.badge;
  }

  make(data) {
    this.extract(data);
    this.create_mesh();
  }

  create_mesh() {
    const res = this.res;
    const color = this.color;

    const use_vertex_colors = this.colors.length > 0
    const mat = new THREE.PointsMaterial( { size: res, color: color, vertexColors: use_vertex_colors });
    const opacity = this.transparent ? 0.3 : 1.0;

    const positions = this.positions.flat();
    const colors = this.colors.flat();
    const positions_num = positions.length;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute( 'position', new THREE.Float32BufferAttribute(positions, 3));
    if (colors) {
      geo.setAttribute( 'color', new THREE.Float32BufferAttribute(colors, 3));
    }
    geo.computeBoundingSphere();
    this.mesh = new THREE.Points(geo, mat );


    // let mat = MathHelpers.compose_mat4(this.trs);
    // for (let i = 0; i < positions_num; i++) {
    //   let t = new THREE.Vector4(positions[i][0], positions[i][1], positions[i][2], 1);
    //   t = t.applyMatrix4(mat);
    //
    //   let trs = (new THREE.Matrix4()).makeTranslation(t.x, t.y, t.z);
    //   this.mesh.setMatrixAt(i, trs);
    //   if (colors) {
    //     const c = new THREE.Color(colors[i][0], colors[i][1], colors[i][2]);
    //     this.mesh.setColorAt(i, c);
    //   }
    // }
    // this.mesh = new THREE.InstancedMesh( this.geometry, this.material, positions_num );


    this.mesh.raw = this;
    this.mesh.name = this.id;

    let trs = MathHelpers.compose_mat4(this.trs);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.matrix.copy(trs);
    this.mesh.updateMatrixWorld(true);

    const badge = this.badge;
    if (badge) {
      let badge_div = document.createElement("div_label_" + this.id);
      badge_div.className = "q-badge text-bold";
      badge_div.style.fontSize = "16px";
      badge_div.textContent = badge;
      let css_obj = new CSS2DObject( badge_div );
      css_obj.position.set( t.x, t.y, t.z );
      this.mesh.add(css_obj);
    }

  }

}

export default PointObject;
