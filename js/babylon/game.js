// https://github.com/BabylonJS/Babylon.js/issues/6447
import "@babylonjs/core/Materials/standardMaterial";

import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { RecastJSPlugin } from "@babylonjs/core/Navigation/Plugins/recastJSPlugin";
import { setupNav } from "@/js/babylon/nav";
import { Tags } from "@babylonjs/core/Misc/tags";

// 20Hz
const GAME_UPDATE_PERIOD_MS = 50;

/**
 * @typedef CtorArgs
 * @property {import("@babylonjs/core").Engine} engine
 * @property {HTMLCanvasElement} canvas
 */

export class Game {
  /** @type {Scene} */
  mainScene;

  /** @type {number} */
  lastUpdateMs;

  /** @type {FreeCamera} */
  camera;

  /** @type {RecastJSPlugin} */
  nav;

  /** @type {?import("@babylonjs/core").ICrowd} */
  crowd;

  /**
   * @param {CtorArgs} args
   * @returns {Promise<Game>}
   */
  static async load(args) {
    // @ts-ignore
    // make sure to include recast.js as commonjs prior
    await window.Recast();
    return new Game(args);
  }

  /**
   *
   * @param {CtorArgs} args
   */
  constructor(args) {
    const { engine } = args;
    this.mainScene = new Scene(engine);
    // register game update loop
    this.mainScene.registerBeforeRender(() => {
      const now = performance.now();
      const deltaMs = now - this.lastUpdateMs;
      if (deltaMs >= GAME_UPDATE_PERIOD_MS) {
        this.update(now, deltaMs);
        this.lastUpdateMs = now;
      }
    });
    this.setupMainScene(args);
    this.nav = new RecastJSPlugin();
    this.nav.setWorkerURL("/lib/navMeshWorker.js");
    this.crowd = null;
    setupNav(this.mainScene, this.nav).then((crowd) => {
      this.crowd = crowd;
    });
  }

  /**
   *
   * @param {CtorArgs} _unnamed
   */
  setupMainScene({ canvas }) {
    this.camera = new FreeCamera("main", new Vector3(8, 12, 8), this.mainScene);
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl(canvas);

    const light = new HemisphericLight(
      "ambientLight",
      new Vector3(0, 1, 0),
      this.mainScene,
    );
    // at intensity 1, the whole canvas is white lmao
    light.intensity = 0.7;

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 100, height: 100 },
      this.mainScene,
    );
    Tags.AddTagsTo(ground, "navigable");
  }

  /* eslint-disable */
  /**
   * Main game update fn
   * @param {number} nowMs
   * @param {number} deltaMs
   */
  update(nowMs, deltaMs) {
    // TODO
  }
  /* eslint-enable */
}
