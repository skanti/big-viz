import * as THREE from "three";

function json2trs(trs) {

  let trs_parsed = {};

  // -> apply pose
  let translation = new THREE.Vector3(trs["translation"]["x"], trs["translation"]["y"], trs["translation"]["z"]);
  trs_parsed["translation"] = translation;

  let angle = trs["angle"];
  let rotation = new THREE.Quaternion();
  rotation.setFromAxisAngle(new THREE.Vector3( 0, 0, 1 ), angle);
  trs_parsed["angle"] = angle;
  trs_parsed["rotation"] = rotation;

  let scale = new THREE.Vector3();
  scale = new THREE.Vector3(trs["scale"]["x"], trs["scale"]["y"], trs["scale"]["z"]);
  trs_parsed["scale"] = scale;

  // <-

  return trs_parsed;
}


export default { json2trs };
