import * as THREE from "three";
import ThreeHelper from '@/components/objects/ThreeHelper.js';

class AnimationMotion {
  ctx = null;

  type = "";

  frames = null;

  constructor(ctx) {
    this.ctx = ctx;
  }

  extract(data) {
    // -> check if keys present
    let keys_required = ["type", "frames"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }
    // <-

    this.type = data["type"];
    this.frames = frames;

    this.ctx.event_bus.$on("play_" + this.id, this.play.bind(this));
  }

  make(data) {
    this.extract(data);
  }

  async play(params) {
    let delay = params["delay"];

    let frames_num = this.frames.length;
    let meshes = params["children"];

    const timer = ms => new Promise(res => setTimeout(res, ms))

    for (let i = 0; i < frames_num; i++) {
      for (let update of this.frames[i]) {
        await timer(delay);
        console.log(update);
        //let mat = MathHelpers.compose_mat4(trs);
        //mesh.matrix.copy(mat);
        //mesh.updateMatrixWorld(true);
      }
    }


  }

}

export default AnimationMotion;
