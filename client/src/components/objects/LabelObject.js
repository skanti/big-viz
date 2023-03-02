import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import MathHelpers from '@/components/MathHelpers.js';

class LabelObject {
  ctx = null;
  renderer = null;

  id = "";
  type = "";
  label = "";

  trs = null;
  color = null;


  constructor(ctx) {
    this.ctx = ctx;
    //this.ctx.event_bus.$on("pca", this.on_change_parameters.bind(this));
  }

  extract(data) {
    // -> check if keys present
    let keys_required = ["id", "type", "label"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }
    // <-

    this.id = data.id;
    this.type = data.type;
    this.label = data.label;

    if ("trs" in data) {
      this.trs = data.trs;
    }

    if ("color" in data) {
      let c = data.color;
      if (c.length != 3)
        throw Error("'color' field must have size=3");
      this.color = new THREE.Color(c[0], c[1], c[2]);
    }
  }

  make(data) {
    this.extract(data);
    this.create_mesh();
  }

  create_mesh() {
    const mat = MathHelpers.compose_mat4(this.trs);

    const t = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    mat.decompose(t,q,s);

    const label = this.label;
    let label_div = document.createElement("div_label_" + this.id);
    label_div.className = "q-badge text-bold";
    label_div.style.marginTop = '-10px';
    label_div.style.fontSize = "12px";
    label_div.textContent = label;
    let css_obj = new CSS2DObject( label_div );
    css_obj.position.set( t.x, t.y, t.z );
    this.mesh = css_obj;
    console.log(label, t);
    //this.mesh.add(css_obj);

  }

}

export default LabelObject;
