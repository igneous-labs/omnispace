import CanvasTxt from "canvas-txt";
import { Game } from "@/js/index/game/game";
import { truncate } from "@/js/common/utils";

export class Sign {
  constructor(settings) {
    /**
     * @type {[number, number]}
     */
    this.position = settings.position;
    this.height = settings.height;
    this.width = settings.width;

    // Direction: whether the sign is on the side or front side
    this.direction = settings.direction;
    // Messages should be k:v pairs where key is number and v is string
    this.messages = settings.messages;
    this.state = 0;
  }

  // eslint-disable-next-line class-methods-use-this
  update() {}

  render() {
    Game.ctx.save();
    const angle = (Math.PI / 180) * 26.5;
    Game.ctx.translate(
      this.position[0] + this.width / 2,
      this.position[1] + this.height / 2,
    );
    if (this.direction === "side") {
      Game.ctx.rotate(angle);
      Game.ctx.transform(1, 0, Math.tan(angle), 1, 0, 0);
      Game.ctx.scale(1, Math.cos(angle));
    } else {
      Game.ctx.rotate(-angle);
      Game.ctx.transform(1, 0, Math.tan(angle * -1), 1, 0, 0);
      Game.ctx.scale(1, Math.cos(angle * -1));
    }
    Game.ctx.translate(
      -(this.position[0] + this.width / 2),
      -(this.position[1] + this.height / 2),
    );

    Game.ctx.fillStyle = "black";
    Game.ctx.fillRect(
      this.position[0] - 3,
      this.position[1] - 3,
      this.width + 6,
      this.height + 6,
    );
    Game.ctx.fillStyle = "brown";
    Game.ctx.fillRect(
      this.position[0],
      this.position[1],
      this.width,
      this.height,
    );
    Game.ctx.fillStyle = "black";
    const approxMaxCharLen = (this.height / 50) * (this.width / 4);
    CanvasTxt.drawText(
      Game.ctx,
      truncate(this.messages[this.state], approxMaxCharLen),
      this.position[0],
      this.position[1],
      this.width,
      this.height,
    );

    Game.ctx.restore();
  }
}
