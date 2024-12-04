'use strict';

import { mat4, vec3 } from 'gl-matrix';

export class Camera {
  constructor() {
    this.position = vec3.fromValues(0, 5, 10);
    this.target = vec3.fromValues(0, 0, 0);
    this.up = vec3.fromValues(0, 1, 0);
    this.viewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();

    this.updateViewMatrix();
    this.updateProjectionMatrix();

    // Event listeners for user input (e.g., mouse movement)
    this.initEventHandlers();
  }

  updateViewMatrix() {
    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
  }

  updateProjectionMatrix() {
    let aspect = window.innerWidth / window.innerHeight;
    mat4.perspective(this.projectionMatrix, 45 * Math.PI / 180, aspect, 0.1, 1000);
  }

  initEventHandlers() {
    // Handle user input for camera control
    // e.g., WASD keys for movement, mouse for rotation
  }
}
