import { Scene3D } from "@enable3d/phaser-extension";
import { Robot } from "@/js/phaser/robot";
import { Raycaster, OrthographicCamera } from "three";

export class MainScene extends Scene3D {
  /** @type {Robot} */
  robot;

  /** @type {Raycaster} */
  raycaster;

  constructor() {
    super({ key: "MainScene" });
    // @ts-ignore
    this.robot = undefined;
    this.raycaster = new Raycaster();
  }

  init() {
    // smaller the frustum, narrower FOV
    const frustumSize = 8;
    const aspect = this.cameras.main.width / this.cameras.main.height;
    // y - up
    // x - southeast
    // z - southwest
    this.accessThirdDimension({
      gravity: { x: 0, y: -9.8, z: 0 },
      camera: new OrthographicCamera(
        (frustumSize * aspect) / -2,
        (frustumSize * aspect) / 2,
        frustumSize / 2,
        frustumSize / -2,
      ),
    });
  }

  async create() {
    await this.third.warpSpeed("-orbitControls", "-fog", "-camera");
    this.third.camera.position.set(12, 8, 12);
    this.third.camera.lookAt(0, 0, 0);
    const robot = await Robot.load(this.third);
    this.robot = robot;
    this.third.camera.lookAt(this.robot.body.position);
    this.robot.body.anims.play("Idle");

    // @ts-ignore
    // this draws the collision outlines etc
    // this.third.physics.debug.enable();

    const { canvas } = this.game;
    const touchHandler = this.handleTouchOrClick.bind(this);
    canvas.addEventListener("touchstart", touchHandler);
    canvas.addEventListener("touchmove", touchHandler);
    canvas.addEventListener("click", touchHandler);
  }

  update(_time, _delta) {
    if (!this.robot) {
      return;
    }
    this.robot.update();
    this.robot.updateCamera(this.third.camera);
  }

  /**
   *
   * @param {PointerEvent | TouchEvent} e
   */
  handleTouchOrClick(e) {
    /** @type {HTMLCanvasElement} */
    // @ts-ignore
    const canvas = e.target;
    /** @type {number} */
    let playerX;
    /** @type {number} */
    let playerY;
    // @ts-ignore
    if (e.touches) {
      /** @type {TouchEvent} */
      // @ts-ignore
      const eTouch = e;
      playerX = eTouch.touches[0].pageX - canvas.offsetLeft;
      playerY = eTouch.touches[0].pageY - canvas.offsetTop;
      console.log(`Touch:  x: ${playerX}, y: ${playerY}`);
      // @ts-ignore
    } else if (e.type === "click" && e.button === 0) {
      /** @type {PointerEvent} */
      // @ts-ignore
      const eClick = e;
      playerX = eClick.pageX - canvas.offsetLeft;
      playerY = eClick.pageY - canvas.offsetTop;
      console.log(`Click:  x: ${playerX}, y: ${playerY}`);
    } else {
      return;
    }
    // convert to NDC: y is reversed
    // See: https://threejs.org/docs/#api/en/core/Raycaster
    playerX = (playerX / canvas.clientWidth) * 2 - 1;
    playerY = -(playerY / canvas.clientHeight) * 2 + 1;
    const destWorldCoords = this.canvas2DToWorld3D(playerX, playerY);
    if (destWorldCoords) {
      this.robot.moveTo(destWorldCoords);
    } else {
      console.log("Clicked off the ground");
    }
  }

  /**
   *
   * @param {number} x in NDC (-1, 1)
   * @param {number} y in NDC (-1, 1)
   * @returns {?import("three").Vector3}
   */
  canvas2DToWorld3D(x, y) {
    this.raycaster.setFromCamera({ x, y }, this.third.camera);
    // emptySpace is located ~500 units away
    const [closest, emptySpace] = this.raycaster.intersectObjects(
      this.third.scene.children,
    );
    // closest is emptySpace, discard this result
    if (!emptySpace) {
      return null;
    }
    return closest.point;
  }
}
