'use strict';

export class Shader {
  constructor(gl, vertexPath, fragmentPath) {
    this.gl = gl;
    this.vertexPath = vertexPath;
    this.fragmentPath = fragmentPath;
    this.program = null;
  }

  async init() {
    let vertexShaderSource = await this.loadSource(this.vertexPath);
    let fragmentShaderSource = await this.loadSource(this.fragmentPath);

    const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Create the shader program
    const shaderProgram = this.gl.createProgram();
    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    this.program = shaderProgram;
  }

  async loadSource(path) {
    let response = await fetch(path);
    if (!response.ok) {
      throw new Error('Failed to load shader source: ' + path);
    }
    return await response.text();
  }

  loadShader(type, source) {
    const shader = this.gl.createShader(type);

    // Send the source to the shader object
    this.gl.shaderSource(shader, source);

    // Compile the shader program
    this.gl.compileShader(shader);

    // See if it compiled successfully
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  use() {
    this.gl.useProgram(this.program);
  }
}
