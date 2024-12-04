'use strict';

import { OBJLoader } from './objloader.js';

export async function loadModels(gl, physicsWorld) {
  let models = [];

  // Load Aggie-themed models
  let aggieModel = await loadOBJModel(gl, 'models/aggie.obj', 'textures/aggie.png', physicsWorld);
  models.push(aggieModel);

  // Load more models as needed

  return models;
}

export async function loadOBJModel(gl, objPath, texturePath, physicsWorld) {
  return new Promise((resolve, reject) => {
    let objLoader = new OBJLoader();
    objLoader.load(
      objPath,
      objectData => {
        // Create buffers
        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        // Positions
        let positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectData.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // Normals
        let normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectData.normals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        // Texture Coordinates
        let texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectData.uvs), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

        // Indices
        let indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objectData.indices), gl.STATIC_DRAW);

        gl.bindVertexArray(null);

        // Load texture
        let texture = gl.createTexture();
        let image = new Image();
        image.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.bindTexture(gl.TEXTURE_2D, null);

          // Create physics body
          let physicsBody = createPhysicsBody(objectData, physicsWorld);

          let model = {
            name: objPath,
            vao: vao,
            indexCount: objectData.indices.length,
            texture: texture,
            modelMatrix: mat4.create(),
            position: [0, 0, 0],
            physicsBody: physicsBody
          };

          // Link the physics body to the graphical object
          physicsBody.threeObject = model;

          resolve(model);
        };
        image.src = texturePath;
      },
      xhr => {
        // Progress callback
      },
      error => {
        reject(error);
      }
    );
  });
}

function createPhysicsBody(objectData, physicsWorld) {
  // Create a collision shape based on the object's geometry
  let shape = new Ammo.btBoxShape(new Ammo.btVector3(1, 1, 1)); // Simplified; you may want to create a convex hull shape

  let mass = 1;
  let localInertia = new Ammo.btVector3(0, 0, 0);
  shape.calculateLocalInertia(mass, localInertia);

  let transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(0, 0, 0));
  let motionState = new Ammo.btDefaultMotionState(transform);

  let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
  let body = new Ammo.btRigidBody(rbInfo);

  physicsWorld.addRigidBody(body);

  return body;
}

function createCube(gl, physicsWorld) {
  // Define cube data
  let positions = [
    // Front face
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,
    1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
    1.0,  1.0, -1.0,
    1.0, -1.0, -1.0,
    // ... Other faces
  ];
  let normals = [
    // Normals for each face
  ];
  let indices = [
    // Indices for each face
  ];

  // Create buffers and VAO as in loadOBJModel

  // Create physics body
  let body = createPhysicsBody({ /* object data */ }, physicsWorld);

  let cube = {
    name: 'Cube',
    vao: /* VAO */,
    indexCount: indices.length,
    texture: /* Texture */,
    modelMatrix: mat4.create(),
    position: [0, 0, 0],
    physicsBody: body
  };

  body.threeObject = cube;

  return cube;
}

function createSphere(gl, physicsWorld) {
  // Similar to createCube, but for a sphere
}
