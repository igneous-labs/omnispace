// https://forum.babylonjs.com/t/required-modules-to-load-gltf-models/5525/3,
// https://github.com/BabylonJS/Babylon.js/issues/12457
// why do they bother making it tree-shakeable when they dont do it properly
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Animations";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

/**
 * Model by Tomás Laulhé (https://www.patreon.com/quaternius), modifications by Don McCurdy (https://donmccurdy.com)
 * https://threejs.org/examples/#webgl_animation_skinning_morph
 * CC-0 license
 */

/**
 * @typedef UpdateData
 * @property {Vector3} position
 * @property {Vector3} velocity
 */

/**
 * @typedef {"Walking" | "Idle"} State
 */

/** @type {import("@babylonjs/core").AssetContainer} */
// @ts-ignore
let ASSET = null;

/**
 * indices derived from console.log(ASSET.animationGroups)
 */
const ANIMATION_GROUP_NAME_TO_INDEX = {
  Idle: 2,
  Walking: 10,
};

export class Robot {
  /**
   * @type {import("@babylonjs/core").InstantiatedEntries}
   * There should only be 1 rootNode
   */
  model;

  /**
   * @type {State}
   */
  state;

  get rootNode() {
    return this.model.rootNodes[0];
  }

  /**
   * Make sure to call on init
   * @param {import("@babylonjs/core").Scene} scene
   */
  static async loadModel(scene) {
    ASSET = await SceneLoader.LoadAssetContainerAsync(
      "/assets/models/",
      "robot.glb",
      scene,
    );
  }

  /**
   *
   * @param {Vector3} position
   */
  constructor(position) {
    this.model = ASSET.instantiateModelsToScene();
    if (this.model.rootNodes.length !== 1) {
      throw new Error(
        `Unexpected # rootNodes: ${this.model.rootNodes.length}, should only have 1`,
      );
    }
    this.state = "Idle";
    this.model.animationGroups[ANIMATION_GROUP_NAME_TO_INDEX[this.state]].play(
      true,
    );
    this.update({ position, velocity: Vector3.Zero() });
  }

  /**
   *
   * @param {UpdateData} _unnamed
   */
  update({ position, velocity }) {
    const newState = velocity.length() === 0 ? "Idle" : "Walking";
    if (newState !== this.state) {
      this.model.animationGroups[
        ANIMATION_GROUP_NAME_TO_INDEX[this.state]
      ].stop();
      this.model.animationGroups[ANIMATION_GROUP_NAME_TO_INDEX[newState]].play(
        true,
      );
      this.state = newState;
    }
    const rootNode = this.model.rootNodes[0];
    rootNode.setAbsolutePosition(position);
    if (velocity.length() !== 0) {
      const facingVector = new Vector3();
      facingVector.copyFrom(velocity);
      // either the model is flipped or direction is flipped for all 3 axes
      facingVector.negateInPlace();
      rootNode.setDirection(facingVector);
    }
  }
}
