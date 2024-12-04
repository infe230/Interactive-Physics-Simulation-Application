'use strict';

import { PhysicsWorld } from './physics.js';
import { GraphicsEngine } from './graphics.js';
import { GUI } from './gui.js';
import { loadModels } from './utils.js';

let canvas = document.getElementById('canvas');
let gl = canvas.getContext('webgl2');

if (!gl) {
  alert('WebGL2 not supported by your browser.');
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Initialize Physics World
let physicsWorld = new PhysicsWorld();

// Initialize Graphics Engine
let graphicsEngine = new GraphicsEngine(gl, physicsWorld);

// Load models and add them to the scene
(async function init() {
  await graphicsEngine.init();
  await physicsWorld.init();

  let models = await loadModels(gl, physicsWorld);
  models.forEach(model => graphicsEngine.addObject(model));

  // Initialize GUI
  let gui = new GUI(graphicsEngine, physicsWorld);

  // Start render loop
  function render() {
    physicsWorld.stepSimulation();
    graphicsEngine.render();
    gui.render();
    requestAnimationFrame(render);
  }

  render();
})();
