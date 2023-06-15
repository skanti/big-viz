import * as THREE from "three";

class ArchitectureObject {
  ctx = null;

  id = "";
  type = "architecture";
  group = [];

  trs = null;

  mesh = null;

  constructor(ctx) {
    this.ctx = ctx;
  }

  extract(data) {
    // check if keys present
    let keys_required = ["id", "type", "language"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }

    this.id = data.id;
    this.language = data.language;

    if ("trs" in data) {
      this.trs = data.trs;
    }
  }

  make(data) {
    this.extract(data);
    this.create_mesh();
  }

  create_mesh() {
    const color_map = { 'make_wall': '#808080', 'make_door': '#C46200', 'make_window': '#00FFFF' };
    const group = new THREE.Group();
    const lookup = {};
    for (let entity of this.language) {
      let [cmd,params] = entity;
      for (let k in params) {
        const v = parseFloat(params[k]);
        if (!isNaN(v)) {
          params[k] = v;
        }
      }
      if (cmd == 'make_wall') {
        const id = params.id;
        const a = new THREE.Vector3(params.a_x, params.a_y, params.a_z);
        const b = new THREE.Vector3(params.b_x, params.b_y, params.b_z);
        const dist = a.distanceTo(b);
        const pos = (new THREE.Vector3()).addVectors(a,b).multiplyScalar(0.5);
        const dir = (new THREE.Vector3()).subVectors(b,a);
        const angle = Math.atan2(dir.y, dir.x);
        lookup[id] = { ...params, angle };
        const rot = (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3( 0, 0, 1 ), angle);
        const geo = new THREE.BoxGeometry(dist, params.thickness, params.height);
        const color = params.color || color_map[cmd];
        const material = new THREE.MeshLambertMaterial({ color: color });
        const cube = new THREE.Mesh(geo, material);
        cube.position.set(pos.x, pos.y, pos.z + params.height*0.5);
        cube.setRotationFromQuaternion(rot);
        group.add(cube);
      } else if (cmd == 'make_door' || cmd == 'make_window') {
        const wall = lookup[params.wall_id] || lookup[params.wall0_id] || lookup[params.wall1_id];
        if (!wall) {
          continue
        }
        const angle = wall.angle;
        const pos = new THREE.Vector3(params.position_x, params.position_y, params.position_z);
        const rot = (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3( 0, 0, 1 ), angle);
        const geo = new THREE.BoxGeometry(params.size_x, wall.thickness*2.0, params.size_y);
        const color = params.color || color_map[cmd];
        const material = new THREE.MeshLambertMaterial({ color: color });
        const cube = new THREE.Mesh(geo, material);
        cube.position.set(pos.x, pos.y, pos.z);
        cube.setRotationFromQuaternion(rot);
        group.add(cube);
      } else {
        console.log(`Command not known, cmd=${cmd}`);
      }
    }
    group.name = this.id;

    this.mesh = group;
    return group;
  }

}

export default ArchitectureObject;
