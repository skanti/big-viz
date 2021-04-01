import * as THREE from "three";
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';

import PCAObject from '@/components/objects/PCAObject.js';
import PointObject from '@/components/objects/PointObject.js';
import PlyObject from '@/components/objects/PlyObject.js';
import AnimationMotion from '@/components/AnimationMotion.js';
import MathHelpers from '@/components/MathHelpers.js';

function make_verts_and_faces_mesh(ctx, data) {
  let ply = new PlyObject();
  ply.make(data);
  return ply.mesh;
}

function make_points_mesh(ctx, data) {
  let points = new PointObject();
  points.make(data);
  return points.mesh;
}

function make_animation(ctx, data) {
  console.log("animation");
  let { objects } = data;
  let meshes = [];
  if (objects) {
    objects.forEach(obj => {
      let m = make_mesh_from_type(ctx, obj);
      meshes.push(m);
    });
  }
  let obj = new AnimationMotion(ctx);
  obj.make(data);
  ctx.event_bus.$emit("new_animation", data)
  return meshes;
}

function find_and_make_update(ctx, update) {
  let { id } = update;
  if (!id)
    throw Error("Id not defined");

  let mesh = ctx.renderer.scene.getObjectByName(id, true );
  if (!mesh) {
    console.log("No mesh found with id:" + id);
    return
  }

  let {trs} = update;
  if (trs) {
    let mat = MathHelpers.compose_mat4(trs);
    mesh.matrixAutoUpdate = false;
    mesh.matrix.copy(mat);
    mesh.updateMatrixWorld(true);
  }
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
  wireframe.name = data["id"];
  return wireframe;
}

function make_group_mesh(ctx, data) {
  const group = new THREE.Group();
  //let id = data["id"];
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
    return make_animation(ctx, data);
  else if (type === "group")
    return make_group_mesh(ctx, data);
}

export default {make_mesh_from_type, make_points_mesh, make_box_mesh, make_pca_grid_mesh,
  make_verts_and_faces_mesh, make_animation, find_and_make_update};
