import * as THREE from "three";

import PCAObject from '@/components/objects/PCAObject.js';
import PointObject from '@/components/objects/PointObject.js';
import AnimationObject from '@/components/objects/AnimationObject.js';

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

  let color = null;
  const color_buff = data["color"];
  if (color_buff) {
    if (color_buff.length != 3)
      throw Error("'color' element has to size=3");
    color = new THREE.Color(color_buff[0], color_buff[1], color_buff[2]);
  }

  const g = new THREE.BoxBufferGeometry(1, 1, 1);
  const geometry = new THREE.WireframeGeometry(g);
  const material = new THREE.LineBasicMaterial({ color: color, linewidth: 5 });
  const wireframe = new THREE.LineSegments( geometry, material );

  this.apply_trs(wireframe, data["trs"]);
  this.renderer.upsert_mesh(data["id"], wireframe);

  this.renderer.scene.add(wireframe);
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

function make_mesh_from_type(ctx, data) {
  let type = data["type"];
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
}

export default {make_mesh_from_type, make_points_mesh, make_box_mesh, make_pca_grid_mesh,
  make_verts_and_faces_mesh, make_animation_mesh};
