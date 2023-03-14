import { ExtendedObject3D } from "@enable3d/phaser-extension";
import { Vector3 } from "three";

const ASSET_PATH = "/assets/robot.glb";
const SCALE = 1 / 3;

const WALKING_ANIM_KEY = "Walking";
const IDLE_ANIM_KEY = "Idle";

const DIST_EPS = 1e-2;
const RADIANS_EPS = 3e-2;
const ANGULAR_V = 2;

export class Robot {
  static SELF_TO_CAMERA = new Vector3(12, 8, 12);

  /** @type {ExtendedObject3D} */
  body;

  /** @type {?Vector3} */
  destination;

  /**
   *
   * @param {import("@enable3d/phaser-extension/dist/third.js").default} third
   * @returns {Promise<Robot>}
   */
  static async load(third) {
    const gltf = await third.load.gltf(ASSET_PATH);
    return new Robot(gltf, third);
  }

  /**
   *
   * @param {import("three/examples/jsm/loaders/GLTFLoader.js").GLTF} gltf
   * @param {import("@enable3d/phaser-extension/dist/third.js").default} third
   */
  constructor(gltf, third) {
    this.body = new ExtendedObject3D();
    this.body.add(gltf.scene);
    this.body.scale.set(SCALE, SCALE, SCALE);

    this.body.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // animations
    third.animationMixers.add(this.body.anims.mixer);
    gltf.animations.forEach((animation) =>
      this.body.anims.add(animation.name, animation),
    );

    // add to scene
    third.add.existing(this.body);
    // magic value copied from demo
    const height = 0.8;
    third.physics.add.existing(this.body, {
      shape: "capsule",
      ignoreScale: true,
      height,
      radius: height / 2,
      offset: { y: -height },
    });
    this.body.body.setLinearFactor(1, 1, 0);
    this.body.body.setAngularFactor(0, 0, 0);
    this.body.body.setFriction(0);

    this.destination = null;
  }

  /**
   *
   * @param {import("three").Camera} camera
   */
  updateCamera(camera) {
    camera.position.copy(this.cameraWorld());
    camera.lookAt(this.body.position);
  }

  /**
   * Calculates the world position to place the camera
   * to enforce an isometric view centered on (looking at) this robot
   * @returns {Vector3}
   */
  cameraWorld() {
    const res = new Vector3();
    return res.copy(this.body.position).add(Robot.SELF_TO_CAMERA);
  }

  /**
   *
   * @param {Vector3} posWorld
   */
  moveTo(posWorld) {
    this.destination = posWorld;
  }

  update() {
    if (this.destination) {
      if (this.body.position.distanceTo(this.destination) < DIST_EPS) {
        this.destination = null;
        this.body.body.setVelocity(0, 0, 0);
      } else {
        this.pathFindStep();
      }
    }
    this.updateAnim();
  }

  /**
   * Note: under physics, you cannot change the position directly using
   * rotate* setPosition* etc, you can only set velocity
   */
  pathFindStep() {
    /** @type {Vector3} */
    // @ts-ignore
    const dest = this.destination;
    const dirFlat = new Vector3();
    dirFlat.copy(dest).sub(this.body.position);
    dirFlat.setY(0);
    dirFlat.normalize();

    const facingFlat = new Vector3();
    this.body.getWorldDirection(facingFlat);

    const angleDeltaFlat = facingFlat.angleTo(dirFlat);
    // console.log(angleDeltaFlat);
    if (Math.abs(angleDeltaFlat) > RADIANS_EPS) {
      const cross = new Vector3().copy(facingFlat).cross(dirFlat);

      this.body.body.setVelocity(0, 0, 0);
      const isClockwise = cross.y > 0;
      this.body.body.setAngularVelocityY(isClockwise ? ANGULAR_V : -ANGULAR_V);
    } else {
      this.body.body.setAngularVelocityY(0);
      this.body.body.setVelocity(dirFlat.x, dirFlat.y, dirFlat.z);
    }
  }

  updateAnim() {
    if (this.destination && this.body.anims.current !== WALKING_ANIM_KEY) {
      this.body.anims.play(WALKING_ANIM_KEY);
    } else if (
      this.destination === null &&
      this.body.anims.current !== IDLE_ANIM_KEY
    ) {
      this.body.anims.play(IDLE_ANIM_KEY);
    }
  }
}
