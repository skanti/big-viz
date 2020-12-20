import * as THREE from "three";
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';

import PCAObject from '@/components/objects/PCAObject.js';
import PointObject from '@/components/objects/PointObject.js';
import AnimationObject from '@/components/objects/AnimationObject.js';
import MathHelpers from '@/components/MathHelpers.js';

function make_points_mesh(ctx, data) {
  let points = new PointObject();
  points.make(data);
  return points.mesh;
}

function make_animation_mesh(ctx, data) {
  let obj = new AnimationObject(ctx);
  obj.make(data);
  return obj.group;
}

function make_pca_grid_mesh(ctx, data) {

  let pca = new PCAObject(this.ctx, this.renderer);
  pca.parse_from_json(data);
  pca.make();
}

function make_box_mesh(ctx, data) {

  let color = data["color"];
  if (color) {
    if (color.length != 3)
      throw Error("'color' element has to size=3");
    color = new THREE.Color(color[0], color[1], color[2]);
  }

  let width = data["width"];

  const path =  [ // root
    // back
    -1,  1, -1,
    -1, -1, -1,
    1, -1, -1,
    1,  1, -1,
    -1,  1, -1,
    // left
    -1,  1, 1,
    -1,  -1, 1,
    -1,  -1, -1,
    // bottom
    -1,  -1, 1,
    1,  -1, 1,
    1,  -1, -1,
    // right
    1,  1, -1,
    1,  1, 1,
    1,  -1, 1,
    // front
    -1,  -1, 1,
    -1,  1, 1,
    1,  1, 1,
    1,  1, -1,
  ];
  const geometry = new LineGeometry();
  geometry.setPositions(path);
  const material = new LineMaterial({ color: color, linewidth: width });
  const wireframe = new Line2( geometry, material );
  wireframe.computeLineDistances();
  wireframe.scale.set( 0.5, 0.5, 0.5 );

  let trs = data["trs"];
  let mat = MathHelpers.compose_mat4(trs);
  wireframe.applyMatrix4(mat);
  return wireframe;
}

function make_verts_and_faces_mesh(ctx, data) {
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

function make_group_mesh(ctx, data) {
  const group = new THREE.Group();
  let id = data["id"];
  let objs = data["data"];
  objs.forEach(obj => {
    let m = make_mesh_from_type(ctx, obj);
    group.add(m);
  });
  return group;
}


function make_mesh_from_type(ctx, data) {
  let type = data["type"];
  let accepted_types = new Set(["animation", "group", "ply", "points", "box", "pca_grid"]);
  if (!accepted_types.has(type)) {
    console.log("Warning: Received data has unknown type. Type: ", type);
    return
  }

  if (type === "ply")
    return make_verts_and_faces_mesh(ctx, data);
  else if (type === "points")
    return make_points_mesh(ctx, data);
  else if (type === "box")
    return make_box_mesh(ctx, data);
  else if (type === "pca_grid")
    return make_pca_grid_mesh(ctx, data);
  else if (type === "animation")
    return make_animation_mesh(ctx, data);
  else if (type === "group")
    return make_group_mesh(ctx, data);
}

export default {make_mesh_from_type, make_points_mesh, make_box_mesh, make_pca_grid_mesh,
  make_verts_and_faces_mesh, make_animation_mesh};
