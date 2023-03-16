// https://github.com/BabylonJS/Babylon.js/issues/6447
import "@babylonjs/core/Materials/standardMaterial";

import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { RecastJSPlugin } from "@babylonjs/core/Navigation/Plugins/recastJSPlugin";
import { setupNav } from "@/js/babylon/nav";
import { Tags } from "@babylonjs/core/Misc/tags";
import { Robot } from "@/js/babylon/robot";
import { Player, PLAYER_TO_CAMERA_VEC } from "@/js/babylon/player";
import { FollowCamera } from "@babylonjs/core/Cameras/followCamera";

// 20Hz
const GAME_UPDATE_PERIOD_MS = 50;

const NAVMESH_WORKER_URL = "/lib/navMeshWorker.js";

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

  /** @type {FollowCamera} */
  camera;

  /** @type {RecastJSPlugin} */
  nav;

  /** @type {?import("@babylonjs/core").ICrowd} */
  crowd;

  /** @type {?Player} */
  player;

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
    this.lastUpdateMs = performance.now();
    // register game update loop
    this.mainScene.registerBeforeRender(() => {
      // manually lock the camera because FollowCamera rotates with the locked mesh
      // this must run on every render step else screen will vibrate due to low
      // camera update frequency
      if (this.player) {
        this.camera.position = this.player.cameraPosition();
        this.camera.setTarget(this.player.robot.rootNode.getAbsolutePosition());
      }
      const now = performance.now();
      const deltaMs = now - this.lastUpdateMs;
      if (deltaMs >= GAME_UPDATE_PERIOD_MS) {
        this.update(now, deltaMs);
        this.lastUpdateMs = now;
      }
    });
    this.setupMainScene(args);
    // nav
    this.nav = new RecastJSPlugin();
    this.nav.setWorkerURL(NAVMESH_WORKER_URL);
    this.crowd = null;
    this.player = null;

    this.loadProgressive();
  }

  async loadProgressive() {
    // Takes around 2s for navmesh to be generated
    const navSetupPromise = setupNav(this.mainScene, this.nav);
    const robotLoadPromise = Robot.loadModel(this.mainScene);
    const crowd = await navSetupPromise;
    this.crowd = crowd;
    await robotLoadPromise;
    this.player = new Player(this);
    this.mainScene.onPointerObservable.add((pointerInfo) => {
      // @ts-ignore
      this.player.onClick(pointerInfo);
    });
  }

  /**
   *
   * @param {CtorArgs} _args
   */
  setupMainScene(_args) {
    // camera setup
    this.camera = new FollowCamera(
      "main",
      PLAYER_TO_CAMERA_VEC,
      this.mainScene,
    );
    // first point at 0 before player loaded
    this.camera.setTarget(Vector3.Zero());

    const light = new HemisphericLight(
      "ambientLight",
      new Vector3(0, 1, 0),
      this.mainScene,
    );
    // at intensity 1, the whole canvas is white lmao
    light.intensity = 0.7;

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 50, height: 50 },
      this.mainScene,
    );
    Tags.AddTagsTo(ground, "navigable");
  }

  /**
   * Main game update fn
   * @param {number} _nowMs
   * @param {number} _deltaMs
   */
  update(_nowMs, _deltaMs) {
    if (this.player) {
      this.player.update();
    }
  }
}
