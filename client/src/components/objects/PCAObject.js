import * as THREE from "three";
import { create, all } from 'mathjs'

const config = { }
const math = create(all, config)

class PCAObject {
  ctx = null;
  renderer = null;

  id = "";
  type = "";
  grid = "";
  n_components = 0;
  mean = [];
  components = [];
  variances = [];
  dims = [];
  res = 0.0;

  parameters = [];
  points = [];
  color = new THREE.Color("rgb(100, 100, 100)")

  geometry = null;
  material = null;
  mesh = null;

  constructor(ctx, renderer) {
    this.ctx = ctx;
    this.renderer = renderer;

    this.ctx.event_bus.$on("pca", this.on_change_parameters.bind(this));
  }

  parse_from_json(data) {
    // -> check if keys present
    let keys_required = ["id", "type", "mean", "grid", "components", "variances", "dims", "res"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }
    // <-

    this.id = data["id"];
    this.type = data["type"];
    this.grid = data["grid"];
    this.mean = math.matrix(data["mean"]);
    this.components = math.matrix(data["components"]);
    this.variances = data["variances"];
    this.res = data["res"];
    this.dims = data["dims"];

    if ("color" in data) {
      let c = data["color"];
      this.color = new THREE.Color(c[0], c[1], c[2]);
    }

    this.n_components = this.variances.length;
    this.parameters = math.zeros(this.n_components);

  }

  make() {
    this.calc_points();
    this.make_mesh();
  }

  calc_points() {
    const c = math.multiply(this.parameters, this.components);
    let values = math.add(this.mean, c);
    values = math.abs(values);
    if (this.grid == "sdf"){
      values = math.smallerEq(values, this.res);
    } else if (this.grid == "occupancy") {
      values = math.largerEq(values, 0.5);
    } else {
      throw Error("Grid type not known.");
    }


    let dims = this.dims;
    let n_all = dims[0]*dims[1]*dims[2];

    if (values.size() != n_all)
        throw Error("Number of points does not match grid dimension");

    let points = [];
    values.forEach(function (value, index) {
      if (value === true) {
        let rem = index;
        const z = math.floor(rem/(dims[0]*dims[1]));
        rem = rem - z*dims[0]*dims[1];
        const y = math.floor(rem/dims[0]);
        rem = rem - y*dims[0];
        const x = rem;
        const p = [x/dims[0] - 0.5, y/dims[1] - 0.5, z/dims[2] - 0.5];
        points.push(p);
      }
    });

    this.points = points;

  }

  make_mesh() {
    const res = this.res;
    const color = this.color;
    this.geometry = new THREE.BoxBufferGeometry(res, res, res);
    this.material = new THREE.MeshStandardMaterial( { color: color });

    const n_positions = this.points.length;
    this.mesh = new THREE.InstancedMesh( this.geometry, this.material, n_positions );

    for (let i = 0; i < n_positions; i++) {
      let t = new THREE.Vector4(this.points[i][0], this.points[i][1], this.points[i][2], 1);
      //t = t.applyMatrix4(mat);
      let trs = (new THREE.Matrix4()).makeTranslation(t.x, t.y, t.z);
      this.mesh.setMatrixAt(i, trs);
    }
    this.mesh.raw = this;

    this.renderer.upsert_mesh(this.id, this.mesh);
  }

  on_change_parameters(data) {
    this.parameters = data["params"]
    this.make();
  }

}

export default PCAObject;
