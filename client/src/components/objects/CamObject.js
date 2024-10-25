import * as THREE from "three";

import MathHelpers from '@/components/MathHelpers.js';

class CamObject {

  constructor(ctx) {
    this.ctx = ctx;

    this.id = "";
    this.type = "";
    this.size = 1;
    this.aspect_ratio = 4.0/3.0; // width/height

    this.trs = null;

    this.camera = null;
    this.mesh = null;
  }

  extract(data) {
    // -> check if keys present
    let keys_required = ["id", "type"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }
    // <-

    this.id = data.id;
    this.type = data.type;
    this.size = data.size;

    if ("size" in data) {
      this.size = data.size;
    }

    if ("aspect_ratio" in data) {
      this.aspect_ratio = data.aspect_ratio;
    }
    console.log(data);

    if ("trs" in data) {
      this.trs = data.trs;
    }

  }

  make(data) {
    this.extract(data);
    this.create_mesh();
  }

  create_mesh() {

    this.camera = new THREE.PerspectiveCamera( 75, this.aspect_ratio, this.size*0.5, this.size );
    this.mesh = new THREE.CameraHelper( this.camera );

    this.mesh.raw = this;
    this.mesh.name = this.id;

    let mat = MathHelpers.compose_mat4(this.trs);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.matrix.copy(mat);
    this.mesh.updateMatrixWorld(true);
  }

}

export default CamObject;
