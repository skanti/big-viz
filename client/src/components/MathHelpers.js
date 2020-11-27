import * as THREE from "three";

const compose_mat4 = function(trs) {
  let trans = new THREE.Vector3(0, 0, 0);
  let rot = new THREE.Quaternion(0, 0, 0, 1);
  let scale = new THREE.Vector3(1, 1, 1);
  let mat = new THREE.Matrix4();
  mat.compose(trans, rot, scale);

  if (trs == null)
    return mat;

  if ("translation" in trs)
    trans = new THREE.Vector3(trs["translation"][0], trs["translation"][1], trs["translation"][2]);
  if ("t" in trs)
    trans = new THREE.Vector3(trs["t"][0], trs["t"][1], trs["t"][2]);

  if ("rotation" in trs)
    rot = new THREE.Quaternion(trs["rotation"][1], trs["rotation"][2], trs["rotation"][3], trs["rotation"][0]);
  if ("q" in trs)
    rot = new THREE.Quaternion(trs["q"][1], trs["q"][2], trs["q"][3], trs["q"][0]);

  if ("scale" in trs)
    scale = new THREE.Vector3(trs["scale"][0], trs["scale"][1], trs["scale"][2]);

  if ("s" in trs)
    scale = new THREE.Vector3(trs["s"][0], trs["s"][1], trs["s"][2]);

  mat.compose(trans, rot, scale);
  return mat

}


export default { compose_mat4 };
