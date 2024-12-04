'use strict';

import * as ImGui from 'imgui-js';

export class GUI {
  constructor(graphicsEngine, physicsWorld) {
    this.graphicsEngine = graphicsEngine;
    this.physicsWorld = physicsWorld;
    this.showDemoWindow = false;
    this.selectedObject = null;

    // Initialize ImGui
    ImGui.CreateContext();
    this.io = ImGui.GetIO();
    ImGui.StyleColorsDark();

    // Initialize ImGui_Impl
    ImGui_Impl.Init(this.graphicsEngine.gl.canvas);
  }

  render() {
    ImGui_Impl.NewFrame();
    ImGui.NewFrame();

    if (this.showDemoWindow) {
      ImGui.ShowDemoWindow(this.showDemoWindow);
    }

    ImGui.Begin("Physics Simulation Controls");

    if (ImGui.Button("Add Cube")) {
      this.addCube();
    }

    if (ImGui.Button("Add Sphere")) {
      this.addSphere();
    }

    ImGui.Separator();

    ImGui.Text("Objects in Scene:");

    this.graphicsEngine.objects.forEach((obj, index) => {
      if (ImGui.Selectable(`Object ${index}`, this.selectedObject === obj)) {
        this.selectedObject = obj;
      }
    });

    if (this.selectedObject) {
      ImGui.Text(`Selected Object: ${this.selectedObject.name}`);
      let position = [this.selectedObject.position[0], this.selectedObject.position[1], this.selectedObject.position[2]];
      if (ImGui.DragFloat3("Position", position)) {
        this.selectedObject.position = position;
      }

      // Additional controls for the selected object
    }

    ImGui.End();

    // Rendering
    ImGui.EndFrame();
    ImGui.Render();
    ImGui_Impl.RenderDrawData(ImGui.GetDrawData());
  }

  addCube() {
    // Code to add a cube to the scene and physics world
    let cube = createCube(this.graphicsEngine.gl, this.physicsWorld);
    this.graphicsEngine.addObject(cube);
  }

  addSphere() {
    // Code to add a sphere to the scene and physics world
    let sphere = createSphere(this.graphicsEngine.gl, this.physicsWorld);
    this.graphicsEngine.addObject(sphere);
  }
}

// Helper functions for ImGui rendering
class ImGui_Impl {
  static Init(canvas) {
    // Initialize ImGui for WebGL rendering
  }

  static NewFrame() {
    // Set up a new ImGui frame
  }

  static RenderDrawData(drawData) {
    // Render ImGui draw data
  }
}
