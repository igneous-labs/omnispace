import { ExtendedObject3D } from "@enable3d/phaser-extension";

const ASSET_PATH = "/assets/robot.glb";
const SCALE = 1 / 3;

export class Robot {
  /** @type {ExtendedObject3D} */
  body;

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
      //
      height,
      radius: height / 2,
      offset: { y: -height },
    });
    this.body.body.setLinearFactor(1, 1, 0);
    this.body.body.setAngularFactor(0, 0, 0);
    this.body.body.setFriction(0);
  }
}
