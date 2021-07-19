import * as THREE from "three";

import MathHelpers from '@/components/MathHelpers.js';

class ArrowObject {

  ctx = null;
  renderer = null;

  vertices = [
    -0.200000 ,-0.000000 ,-0.200000,
    0.200000 ,0.000000 ,0.400000,
    -0.200000 ,0.000000 ,0.400000,
    0.000000 ,-0.000000 ,-0.600000,
    0.400000 ,-0.000000 ,-0.200000,
    0.200000 ,-0.000000 ,-0.200000,
    0.200000 ,0.200000 ,0.400000,
    -0.200000 ,0.200000 ,-0.200000,
    -0.200000 ,0.200000 ,0.400000,
    0.200000 ,0.200000 ,-0.200000,
    0.400000 ,0.200000 ,-0.200000,
    0.000000 ,0.200000 ,-0.600000,
    -0.400000 ,0.200000 ,-0.200000,
    -0.400000 ,-0.000000 ,-0.200000,
  ];

  faces = [
    0 ,1 ,2,
    3 ,4 ,5,
    6 ,7 ,8,
    9 ,10 ,11,
    0 ,12 ,13,
    1 ,8 ,2,
    4 ,9 ,5,
    13 ,11 ,3,
    5 ,6 ,1,
    2 ,7 ,0,
    3 ,10 ,4,
    0 ,5 ,1,
    5 ,0 ,3,
    0 ,13 ,3,
    6 ,9 ,7,
    12 ,7 ,11,
    7 ,9 ,11,
    0 ,7 ,12,
    1 ,6 ,8,
    4 ,10 ,9,
    13 ,12 ,11,
    5 ,9 ,6,
    2 ,8 ,7,
    3 ,11 ,10
  ];

  id = "";
  type = "";
  color = new THREE.Color(1.0, 0.8, 0.2);

  trs = null;

  camera = null;
  mesh = null;

  constructor(ctx) {
    this.ctx = ctx;
    //this.ctx.event_bus.$on("pca", this.on_change_parameters.bind(this));
  }

  extract(data) {
    // -> check if keys present
    let keys_required = ["id", "type"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }
    // <-

    this.id = data["id"];
    this.type = data["type"];

    if ("trs" in data) {
      this.trs = data["trs"];
    }

    if ("color" in data) {
      let c = data["color"];
      this.color = new THREE.Color(c[0], c[1], c[2]);
    }

  }

  make(data) {
    this.extract(data);
    this.create_mesh();
  }

  create_mesh() {

    // create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setIndex( this.faces );
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.vertices, 3 ) );
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial( { color: this.color, side: THREE.DoubleSide,
      vertexColors: false });

    // make mesh
    this.mesh = new THREE.Mesh( geometry, material );


    this.mesh.raw = this;
    this.mesh.name = this.id;

    let mat = MathHelpers.compose_mat4(this.trs);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.matrix.copy(mat);
    this.mesh.updateMatrixWorld(true);
  }

}

export default ArrowObject;
