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
    let keys_required = ["id", "type", "frames"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }
    // <-

    this.id = data["id"];
    this.type = data["type"];
    this.frames = data["frames"];

    let evt = "play_" + this.id;
    this.ctx.event_bus.$on(evt, this.play.bind(this));
  }

  make(data) {
    this.extract(data);
  }

  async play(params) {
    console.log("play");
    let delay = params["delay"];

    let frames_num = this.frames.length;
    const timer = ms => new Promise(res => setTimeout(res, ms))

    for (let i = 0; i < frames_num; i++) {
      for (let update of this.frames[i]) {
        ThreeHelper.find_and_make_update(this.ctx, update);
      }
      await timer(delay);
    }

    for (let reset of this.frames[0]) {
      ThreeHelper.find_and_make_update(this.ctx, reset);
    }


  }

}

export default AnimationMotion;
