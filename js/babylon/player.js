import { Vector3 } from "@babylonjs/core";
import { Robot } from "@/js/babylon/robot";

export const PLAYER_TO_CAMERA_VEC = new Vector3(20, 20, 20);
const INIT_POS = new Vector3(1, 10, 0);
const AGENT_PARAMS = {
  radius: 1.0,
  height: 0.2,
  maxAcceleration: 100.0,
  maxSpeed: 8.0,
  collisionQueryRange: 1.0,
  pathOptimizationRange: 1.0,
  separationWeight: 1.0,
};
const DISTANCE_EPS = 0.1;

export class Player {
  /**
   * @type {Robot}
   */
  robot;

  /**
   * @type {number}
   */
  agentId;

  /**
   * @type {import("@/js/babylon/game").Game}
   */
  game;

  /**
   * @type {?Vector3}
   */
  destination;

  /**
   *
   * Make sure game.crowd has been initialized before calling
   * @param {import("@/js/babylon/game").Game} game
   */
  constructor(game) {
    this.robot = new Robot(INIT_POS);
    /** @type {import("@babylonjs/core").ICrowd} */
    // @ts-ignore
    const { crowd } = game;
    this.agentId = crowd.addAgent(INIT_POS, AGENT_PARAMS, this.robot.rootNode);
    this.game = game;
    this.destination = null;
  }

  update() {
    /** @type {import("@babylonjs/core").ICrowd} */
    // @ts-ignore
    const { crowd } = this.game;
    const position = crowd.getAgentPosition(this.agentId);
    this.robot.update({
      position,
      velocity: crowd.getAgentVelocity(this.agentId),
    });
    // TODO: idk whats a better way to do this. If i dont, recast
    // very very slowly decreases velocity to 0
    if (
      this.destination &&
      this.destination.subtract(position).length() < DISTANCE_EPS
    ) {
      crowd.agentTeleport(this.agentId, this.destination);
      this.destination = null;
    }
  }

  /**
   *
   * @param {import("@babylonjs/core").PointerInfo} pointerInfo
   */
  onClick(pointerInfo) {
    if (!pointerInfo.pickInfo?.hit || !pointerInfo.pickInfo.pickedPoint) {
      return;
    }
    /** @type {import("@babylonjs/core").ICrowd} */
    // @ts-ignore
    const { crowd } = this.game;
    this.destination = this.game.nav.getClosestPoint(
      pointerInfo.pickInfo.pickedPoint,
    );
    crowd.agentGoto(this.agentId, this.destination);
  }

  /**
   * @returns {Vector3}
   */
  cameraPosition() {
    return this.robot.rootNode.getAbsolutePosition().add(PLAYER_TO_CAMERA_VEC);
  }
}
