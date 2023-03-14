import { ExtendedObject3D } from "@enable3d/phaser-extension";
import { Vector2, Vector3 } from "three";

const ASSET_PATH = "/assets/robot.glb";
const SCALE = 1 / 3;

const WALKING_ANIM_KEY = "Walking";
const IDLE_ANIM_KEY = "Idle";

const DIST_EPS = 1e-2;
const RADIANS_EPS = 3e-2;

const LINEAR_V = 1;
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
    this.body.body.setLinearFactor(0, 1, 0);
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
      if (this.hasReachedDestination()) {
        this.destination = null;
        this.stopMoving();
        this.stopRotating();
      } else {
        this.pathFindStep();
      }
    }
    this.updateAnim();
  }

  /**
   * @returns {boolean}
   */
  hasReachedDestination() {
    if (this.destination === null) {
      return true;
    }
    const destinationNoY = new Vector2(this.destination.x, this.destination.z);
    const positionNoY = new Vector2(this.body.position.x, this.body.position.z);
    return positionNoY.distanceTo(destinationNoY) < DIST_EPS;
  }

  /**
   * Note: under physics, you cannot change the position directly using
   * rotate* setPosition* etc, you can only set velocity
   */
  pathFindStep() {
    // TODO: clicking on top and right of the robot is jank,
    // render the destination on the world
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
    if (Math.abs(angleDeltaFlat) > RADIANS_EPS) {
      const cross = new Vector3().copy(facingFlat).cross(dirFlat);

      this.stopMoving();
      const isClockwise = cross.y > 0;
      this.body.body.setAngularVelocityY(isClockwise ? ANGULAR_V : -ANGULAR_V);
    } else {
      this.stopRotating();
      dirFlat.multiplyScalar(LINEAR_V);
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

  stopMoving() {
    this.body.body.setVelocityX(0);
    this.body.body.setVelocityZ(0);
  }

  stopRotating() {
    this.body.body.setAngularVelocityY(0);
  }
}
