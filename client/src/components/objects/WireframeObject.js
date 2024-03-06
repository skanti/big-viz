import * as THREE from "three";

import MathHelpers from '@/components/MathHelpers.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';


class WireframeObject {
  ctx = null;
  renderer = null;

  id = "";
  type = "";
  points = [];
  edges = [];
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
    let keys_required = ["id", "type", "points", "edges"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }
    // <-

    this.id = data.id;
    this.type = data.dtype;
    this.points = data.points;
    this.edges = data.edges;

    if ("trs" in data) {
      this.trs = data.trs;
    }

    if ("width" in data ) {
      this.width = data.width;
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

    const group = new THREE.Group();
    const mat = new LineMaterial({ color: this.color, linewidth: this.width });
    console.log(this.edges);
    for (const edge of this.edges) {
      const p0 = this.points[edge[0]];
      const p1 = this.points[edge[1]];
      const verts = [p0, p1].flat();
      console.log(verts);

      // const geo = new THREE.BufferGeometry();
      // geo.setAttribute( 'position', new THREE.Float32BufferAttribute( verts, 3 ) );
      // const line = new THREE.Line(geo, mat);
      const geo = new LineGeometry();
      geo.setPositions(verts)
      const line = new Line2(geo, mat);
      line.computeLineDistances();
      group.add(line);
    }

    group.name = this.id;
    this.mesh = group;
    this.mesh.raw = this;
    this.mesh.name = this.id;
    return this.mesh;

  }

}

export default WireframeObject;
