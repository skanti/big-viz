import * as THREE from "three";

import MathHelpers from '@/components/MathHelpers.js';

class PlyObject {
  ctx = null;
  renderer = null;

  id = "";
  type = "";
  vertices = [];
  edges = [];
  res = 0.0;

  trs = null;
  color = null;
  colors = null;

  geometry = null;
  material = null;
  mesh = null;

  constructor(ctx) {
    this.ctx = ctx;
    //this.ctx.event_bus.$on("pca", this.on_change_parameters.bind(this));
  }

  extract(data) {
    // -> check if keys present
    let keys_required = ["id", "type", "vertices", "edges"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }
    // <-

    this.id = data["id"];
    this.type = data["type"];
    this.vertices = data["vertices"].flat();
    this.edges = data["edges"].flat();

    if ("trs" in data) {
      this.trs = data["trs"];
    }

    if ("color" in data) {
      let c = data["color"];
      if (c.length != 3)
        throw Error("'color' field must have size=3");
      this.color = new THREE.Color(c[0], c[1], c[2]);
    } else if ("colors" in data) {
      this.colors = data["colors"].flat();
    }
    this.has_vertex_colors = this.colors ? true : false;
  }

  make(data) {
    this.extract(data);
    this.create_mesh();
  }

  create_mesh() {
    const color = this.color;
    this.geometry = new THREE.BufferGeometry();

    this.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.vertices, 3 ) );

    this.material = new THREE.MeshStandardMaterial(
      { color: color, wireframe: true }
    );

    this.mesh = new THREE.Mesh( this.geometry, this.material );

    this.mesh.raw = this;
    this.mesh.name = this.id;

    let mat = MathHelpers.compose_mat4(this.trs);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.matrix.copy(mat);
    this.mesh.updateMatrixWorld(true);
  }

}

export default PlyObject;
