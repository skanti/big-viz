import * as THREE from "three";
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';

import PCAObject from '@/components/objects/PCAObject.js';
import PointObject from '@/components/objects/PointObject.js';
import LabelObject from '@/components/objects/LabelObject.js';
import ArchitectureObject from '@/components/objects/ArchitectureObject.js';
import PlyObject from '@/components/objects/PlyObject.js';
import WireframeObject from '@/components/objects/WireframeObject.js';
import CamObject from '@/components/objects/CamObject.js';
import ArrowObject from '@/components/objects/ArrowObject.js';
import LineObject from '@/components/objects/LineObject.js';
import AnimationMotion from '@/components/objects/AnimationMotion.js';
import AnimationVisibility from '@/components/objects/AnimationVisibility.js';
import MathHelpers from '@/components/MathHelpers.js';

function make_verts_and_faces_mesh(ctx, data) {
  let ply = new PlyObject();
  ply.make(data);
  return ply.mesh;
}

function make_points_mesh(ctx, data) {
  const obj = new PointObject(ctx);
  obj.make(data);
  return obj.mesh;
}

function make_wireframe_mesh(ctx, data) {
  const obj = new WireframeObject(ctx);
  obj.make(data);
  return obj.mesh;
}

function make_architecture_mesh(ctx, data) {
  const obj = new ArchitectureObject(ctx);
  obj.make(data);
  return obj.mesh;
}

function make_camera_mesh(ctx, data) {
  let cam = new CamObject(ctx);
  cam.make(data);
  return cam.mesh;
}

function make_arrow_mesh(ctx, data) {
  let obj = new ArrowObject(ctx);
  obj.make(data);
  return obj.mesh;
}

function make_line_mesh(ctx, data) {
  let obj = new LineObject(ctx);
  obj.make(data);
  return obj.mesh;
}

function make_label_mesh(ctx, data) {
  let obj = new LabelObject(ctx);
  obj.make(data);
  return obj.mesh;
}

function make_animation_motion(ctx, data) {
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

function make_animation_visibility(ctx, data) {
  let obj = new AnimationVisibility(ctx);
  obj.make(data);
  ctx.event_bus.$emit("new_animation", data)
  return [];
}

function find_and_make_update(ctx, update) {
  let { id } = update;
  if (!id)
    throw Error("Id not defined");

  let mesh = ctx.renderer.scene.getObjectByName(id, true );
  if (!mesh) {
    console.log("No mesh found with id: " + id);
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

  let color = data.color;
  if (color) {
    if (color.length != 3)
      throw Error("'color' element has to size=3");
    color = new THREE.Color(color[0], color[1], color[2]);
  }

  const width = data.width;

  let path =  [ // root
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
  path = path.map(x => 0.5*x);
  const geometry = new LineGeometry();
  geometry.setPositions(path);
  const material = new LineMaterial({ color: color, linewidth: width });
  const wireframe = new Line2( geometry, material );
  wireframe.computeLineDistances();

  const trs = data.trs;
  if (trs) {
    let mat = MathHelpers.compose_mat4(trs);
    wireframe.applyMatrix4(mat);
  }
  wireframe.name = data.id;
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
  group.name = data["id"];

  let visible = true;
  if ("visible" in data) {
      visible = data["visible"];
    }
  group.visible = visible;
  return group;
}

function make_mesh_from_type(ctx, data) {
  let type = data["type"];
  let accepted_types = new Set(["animation_motion", "animation_visibility",
    "architecture", "group", "ply", "points", "line", "wireframe", "label", "box", "pca_grid", "camera", "arrow"]);
  if (!accepted_types.has(type)) {
    console.log("Warning: Received data has unknown type. Type: ", type);
    return
  }

  if (type === "ply")
    return make_verts_and_faces_mesh(ctx, data);
  else if (type === "points")
    return make_points_mesh(ctx, data);
  else if (type === "line")
    return make_line_mesh(ctx, data);
  else if (type === "label")
    return make_label_mesh(ctx, data);
  else if (type === "wireframe")
    return make_wireframe_mesh(ctx, data);
  else if (type === "camera")
    return make_camera_mesh(ctx, data);
  else if (type === "arrow")
    return make_arrow_mesh(ctx, data);
  else if (type === "architecture")
    return make_architecture_mesh(ctx, data);
  else if (type === "box")
    return make_box_mesh(ctx, data);
  else if (type === "pca_grid")
    return make_pca_grid_mesh(ctx, data);
  else if (type === "animation_motion")
    return make_animation_motion(ctx, data);
  else if (type === "animation_visibility")
    return make_animation_visibility(ctx, data);
  else if (type === "group")
    return make_group_mesh(ctx, data);
}

export default {make_mesh_from_type, make_points_mesh, make_line_mesh, make_box_mesh, make_pca_grid_mesh,
  make_architecture_mesh, make_verts_and_faces_mesh, make_animation_motion, find_and_make_update};
