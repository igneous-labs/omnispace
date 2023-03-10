import { Game } from "@/js/index/game/game";
import { Loader } from "@/js/index/game/loader";

export class PressurePlate {
  static spriteFile = "tile";

  static spriteSheetFrameMap = {
    default: [
      [0, 31],
      [32, 63],
    ],
  };

  constructor(settings) {
    /**
     * @type {[number, number]}
     */
    this.position = settings.position;
    this.count = 0;
  }

  // Check if an object's position is inside the pressure plate
  // Assume top left anchor
  onPressurePlate(position) {
    return (
      position[0] >= this.position[0] &&
      position[0] <= this.position[0] + 32 &&
      position[1] >= this.position[1] &&
      position[1] <= this.position[1] + 32
    );
  }

  // Look at game state and see how many players are within its area
  // Update the count appropriately
  update() {
    this.count = Object.values(Game.worldState.world_state_data).filter(
      (player) => this.onPressurePlate(player.position),
    ).length;
  }

  // Renders the pressure plate
  render() {
    Game.ctx.drawImage(
      Loader.getImage("tile"),
      this.count > 0 ? 32 : 0,
      0,
      32,
      32,
      this.position[0],
      this.position[1],
      32,
      32,
    );
  }
}
