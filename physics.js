'use strict';

export class PhysicsWorld {
  constructor() {
    this.collisionConfiguration = null;
    this.dispatcher = null;
    this.broadphase = null;
    this.solver = null;
    this.physicsWorld = null;
    this.rigidBodies = [];
    this.margin = 0.05;
  }

  async init() {
    // Wait for Ammo.js to be ready
    await Ammo();

    // Initialize physics world
    this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
    this.broadphase = new Ammo.btDbvtBroadphase();
    this.solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(
      this.dispatcher,
      this.broadphase,
      this.solver,
      this.collisionConfiguration
    );
    this.physicsWorld.setGravity(new Ammo.btVector3(0, -9.81, 0));
  }

  addRigidBody(body, group = 1, mask = -1) {
    this.physicsWorld.addRigidBody(body, group, mask);
    this.rigidBodies.push(body);
  }

  stepSimulation() {
    let deltaTime = 1 / 60;
    this.physicsWorld.stepSimulation(deltaTime, 10);

    // Update positions of objects
    this.rigidBodies.forEach(rb => {
      let ms = rb.getMotionState();
      if (ms) {
        let transform = new Ammo.btTransform();
        ms.getWorldTransform(transform);
        let origin = transform.getOrigin();
        let rotation = transform.getRotation();

        let obj = rb.threeObject; // Assuming we store a reference to the graphical object
        if (obj) {
          obj.position.set(origin.x(), origin.y(), origin.z());
          obj.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
        }
      }
    });
  }
}
