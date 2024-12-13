import ThreeHelper from '@/components/objects/ThreeHelper.js';

class AnimationMotion {
  constructor(ctx) {
    this.ctx = ctx;
    this.id = '';
    this.type = '';
    this.frames = null;
    this.keep_first = true;
    this.delay = 20;
  }

  make(data) {
    // -> check if keys present
    let keys_required = ["id", "type", "frames"];
    for (let k of keys_required) {
      if (!(k in data))
        throw Error(k + " not in data json");
    }

    this.id = data.id;
    this.type = data.type;
    this.frames = data.frames;
    if ("keep_first" in data) {
      this.keep_first = data.keep_first;
    }
    if ("delay" in data) {
      this.delay = data.delay;
    }

    let evt = "play_" + this.id;
    this.ctx.off(evt, { delay: this.delay });
    this.ctx.on(evt, this.play.bind(this));
  }

  async play(params) {
    const scene = params.scene
    let delay = params["delay"];


    let frames_num = this.frames.length;
    const timer = ms => new Promise(res => setTimeout(res, ms))

    for (let i = 0; i < frames_num; i++) {
      for (let update of this.frames[i]) {
        ThreeHelper.find_and_make_update(scene, update);
      }
      await timer(delay);
    }

    for (let reset of this.frames[0]) {
      ThreeHelper.find_and_make_update(scene, reset);
    }


  }

}

export default AnimationMotion;
