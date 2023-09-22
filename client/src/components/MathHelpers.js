import * as THREE from "three";

const compose_mat4 = function(trs) {
    let trans = new THREE.Vector3(0, 0, 0);
  let rot = new THREE.Quaternion(0, 0, 0, 1);
  let scale = new THREE.Vector3(1, 1, 1);
  let mat = new THREE.Matrix4();
  mat.compose(trans, rot, scale);
  if (trs == null)
    return mat;

  if (trs.constructor === Object) {

    if ("t" in trs) {
      let t = trs["t"];
      if (t.length != 3)
        throw Error("Translation 't' in 'trs' has invalid size");
      trans = new THREE.Vector3(t[0], t[1], t[2]);
    }

    if ("q" in trs) {
      let q = trs["q"];
      if (q.length != 4)
        throw Error("Quaternion 'q' in 'trs' has invalid size");
      rot = new THREE.Quaternion(q[1], q[2], q[3], q[0]).normalize();
    }

    if ("r" in trs) {
      throw Error("Rotation 'r' in 'trs' not accepted.");
    }

    if ("s" in trs) {
      let s = trs["s"];
      if (s.length != 3)
        throw Error("Translation 's' in 'trs' has invalid size");
      scale = new THREE.Vector3(s[0], s[1], s[2]);
    }

    mat.compose(trans, rot, scale);
    return mat
  } else if (Array.isArray(trs)) {
    if (trs.length != 16)
      throw Error("Transformation 'trs' has invalid size");
    mat = new THREE.Matrix4().fromArray(trs);
    return mat;
  }

}


export default { compose_mat4 };
