'use strict';

import { vec3 } from 'gl-matrix';

export class Light {
  constructor(type) {
    this.type = type; // 'directional', 'point', 'spot'
    this.color = vec3.fromValues(1.0, 1.0, 1.0);
    this.position = vec3.create();
    this.direction = vec3.create();
    this.intensity = 1.0;
    // Additional properties depending on light type
  }
}
