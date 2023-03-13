import { Scene3D } from "@enable3d/phaser-extension";

export class MainScene extends Scene3D {
  constructor() {
    super({ key: "MainScene" });
  }

  init() {
    this.accessThirdDimension({ gravity: { x: 0, y: -9.8, z: 0 } });
  }

  async create() {
    await this.third.warpSpeed("-orbitControls", "-fog");
    this.third.camera.position.set(12, 8, 12);
    this.third.camera.lookAt(0, 0, 0);
  }
}
