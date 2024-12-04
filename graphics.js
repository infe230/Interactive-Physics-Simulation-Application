'use strict';

import { Shader } from './shader.js';
import { mat4, vec3 } from 'gl-matrix';
import { Camera } from './camera.js';
import { Light } from './light.js';

export class GraphicsEngine {
  constructor(gl, physicsWorld) {
    this.gl = gl;
    this.physicsWorld = physicsWorld;
    this.objects = [];
    this.camera = new Camera();
    this.lights = [];

    // Shaders
    this.shaderProgram = null;
    this.shadowShaderProgram = null;

    // Framebuffers and textures for shadow mapping and deferred rendering
    this.shadowFramebuffer = null;
    this.shadowTexture = null;

    // Initialize GL state
    gl.enable(gl.DEPTH_TEST);
  }

  async init() {
    // Initialize shaders
    this.shaderProgram = new Shader(this.gl, 'shaders/vertex.glsl', 'shaders/fragment.glsl');
    await this.shaderProgram.init();

    this.shadowShaderProgram = new Shader(this.gl, 'shaders/shadow_vertex.glsl', 'shaders/shadow_fragment.glsl');
    await this.shadowShaderProgram.init();

    // Initialize lights
    this.initLights();

    // Initialize shadow mapping
    this.initShadowMapping();

    // Initialize deferred rendering
    this.initDeferredRendering();
  }

  initLights() {
    // Directional light
    let dirLight = new Light('directional');
    dirLight.direction = vec3.fromValues(-0.2, -1.0, -0.3);
    dirLight.color = vec3.fromValues(1.0, 1.0, 1.0);
    this.lights.push(dirLight);

    // Additional lights can be added here
  }

  initShadowMapping() {
    let gl = this.gl;

    // Create framebuffer
    this.shadowFramebuffer = gl.createFramebuffer();

    // Create depth texture
    this.shadowTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.shadowTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, 1024, 1024, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Attach texture to framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.shadowTexture, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  initDeferredRendering() {
    // For simplicity, we'll focus on forward rendering in this example.
    // Deferred rendering setup can be added here if required.
  }

  addObject(object) {
    this.objects.push(object);
  }

  render() {
    // Shadow Pass
    this.renderShadowMap();

    // Main Render Pass
    this.renderScene();
  }

  renderShadowMap() {
    let gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.shadowFramebuffer);
    gl.viewport(0, 0, 1024, 1024);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    gl.useProgram(this.shadowShaderProgram.program);

    // Set up light's view and projection matrices
    let light = this.lights[0];
    let lightProjection = mat4.ortho(mat4.create(), -10, 10, -10, 10, 1, 100);
    let lightView = mat4.lookAt(mat4.create(), vec3.scale(vec3.create(), light.direction, -10), [0, 0, 0], [0, 1, 0]);
    let lightSpaceMatrix = mat4.multiply(mat4.create(), lightProjection, lightView);

    gl.uniformMatrix4fv(gl.getUniformLocation(this.shadowShaderProgram.program, 'u_lightSpaceMatrix'), false, lightSpaceMatrix);

    // Render each object
    this.objects.forEach(obj => {
      gl.uniformMatrix4fv(gl.getUniformLocation(this.shadowShaderProgram.program, 'u_model'), false, obj.modelMatrix);

      // Bind VAO and draw
      gl.bindVertexArray(obj.vao);
      gl.drawElements(gl.TRIANGLES, obj.indexCount, gl.UNSIGNED_SHORT, 0);
      gl.bindVertexArray(null);
    });

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  renderScene() {
    let gl = this.gl;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(this.shaderProgram.program);

    // Set camera matrices
    gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram.program, 'u_view'), false, this.camera.viewMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram.program, 'u_projection'), false, this.camera.projectionMatrix);

    // Set light uniforms
    let light = this.lights[0];
    gl.uniform3fv(gl.getUniformLocation(this.shaderProgram.program, 'u_light.direction'), light.direction);
    gl.uniform3fv(gl.getUniformLocation(this.shaderProgram.program, 'u_light.color'), light.color);

    // Set view position
    gl.uniform3fv(gl.getUniformLocation(this.shaderProgram.program, 'u_viewPos'), this.camera.position);

    // Set shadow map
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.shadowTexture);
    gl.uniform1i(gl.getUniformLocation(this.shaderProgram.program, 'u_shadowMap'), 1);

    // Set light space matrix
    let lightProjection = mat4.ortho(mat4.create(), -10, 10, -10, 10, 1, 100);
    let lightView = mat4.lookAt(mat4.create(), vec3.scale(vec3.create(), light.direction, -10), [0, 0, 0], [0, 1, 0]);
    let lightSpaceMatrix = mat4.multiply(mat4.create(), lightProjection, lightView);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram.program, 'u_lightSpaceMatrix'), false, lightSpaceMatrix);

    // Render each object
    this.objects.forEach(obj => {
      gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram.program, 'u_model'), false, obj.modelMatrix);

      // Bind texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, obj.texture);
      gl.uniform1i(gl.getUniformLocation(this.shaderProgram.program, 'u_texture'), 0);

      // Bind VAO and draw
      gl.bindVertexArray(obj.vao);
      gl.drawElements(gl.TRIANGLES, obj.indexCount, gl.UNSIGNED_SHORT, 0);
      gl.bindVertexArray(null);
    });
  }
}
