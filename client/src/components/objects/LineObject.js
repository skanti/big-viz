import * as THREE from "three";
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';

import MathHelpers from '@/components/MathHelpers.js';

class LineObject {
  ctx = null;
  renderer = null;

  id = "";
  type = "";
  points = [];
  width = 0.01;

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
    let keys_required = ["id", "type", "points", "width"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }
    // <-

    this.id = data["id"];
    this.type = data["type"];
    this.points = data["points"].flat();

    if ("trs" in data) {
      this.trs = data["trs"];
    }

    if ("color" in data) {
      let c = data.color;
      if (c.length != 3)
        throw Error("'color' field must have size 3");
      this.color = new THREE.Color(c[0], c[1], c[2]);
    }

    if ("colors" in data) {
      this.colors = data.colors.flat();
    }
  }

  make(data) {
    this.extract(data);
    this.create_mesh();
  }

  create_mesh() {

    this.geometry = new LineGeometry();
    //this.geometry.setPositions(this.points);
    //const path =  new THREE.Float32BufferAttribute( this.points, 3 );
    const path = this.points;
    this.geometry.setPositions(path);
    if (this.colors) {
      this.geometry.setColors(this.colors);
    }
    const has_vertex_colors = this.colors ? true : false;
    this.material = new LineMaterial({ color: this.color, vertexColors: has_vertex_colors,
      linewidth: this.width });

    this.mesh = new Line2( this.geometry, this.material );
    this.mesh.computeLineDistances();

    this.mesh.raw = this;
    this.mesh.name = this.id;

    let mat = MathHelpers.compose_mat4(this.trs);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.matrix.copy(mat);
    this.mesh.updateMatrixWorld(true);
  }

}

export default LineObject;
