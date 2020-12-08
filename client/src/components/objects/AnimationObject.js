import * as THREE from "three";
import ThreeHelper from '@/components/objects/ThreeHelper.js';

class AnimationObject {
  ctx = null;

  id = "";
  type = "";

  data = null;

  group = null;

  constructor(ctx) {
    this.ctx = ctx;
  }

  extract(data) {
    // -> check if keys present
    let keys_required = ["id", "type", "data"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }
    // <-

    this.id = data["id"];
    this.type = data["type"];
    this.data = data;

    this.ctx.event_bus.$on("play_" + this.id, this.play.bind(this));
  }

  make(data) {
    this.extract(data);
    this.create_mesh();
  }

  create_mesh() {
    const frames = this.data["data"];
    this.group = new THREE.Group();
    for (let i in frames) {
      let frame = frames[i];
      let mesh = ThreeHelper.make_mesh_from_type(this.ctx, frame);
      if (i == 0)
        mesh.visible = true;
      else
        mesh.visible = false;
      this.group.add(mesh);
    }
    this.group.raw = this;
  }

  async play(params) {
    let delay = params["delay"];

    let n_frames_total = this.group.children.length;

    const timer = ms => new Promise(res => setTimeout(res, ms))

    for (let i = 0; i < n_frames_total; i++) {
      this.group.children[i].visible = false;
    }

    for (let i = 0; i < n_frames_total; i++) {
      this.group.children[i].visible = true;
      await timer(delay);
      this.group.children[i].visible = false;
    }

    this.group.children[0].visible = true;

  }

}

export default AnimationObject;
