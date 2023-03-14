import { Scene3D } from "@enable3d/phaser-extension";
import { Robot } from "@/js/phaser/robot";

export class MainScene extends Scene3D {
  /** @type {Robot} */
  robot;

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
    const robot = await Robot.load(this.third);
    this.robot = robot;
    this.third.camera.lookAt(this.robot.body.position);
    this.robot.body.anims.play("Idle");

    // @ts-ignore
    // this draws the collision shapes etc
    this.third.physics.debug.enable();
  }
}
