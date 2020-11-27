import * as THREE from "three";


class Badge {
  ctx = null;
  renderer = null;

  id = "";
  type = "";
  positions = [];
  colors = [];
  res = 0.0;

  color = null;
  badge = "";

  geometry = null;
  material = null;
  mesh = null;

  constructor(ctx, renderer) {
  }

}

export default Badge;
