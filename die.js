/**
 * A six-faced die.
 * Make sure to <script> before game.js so that game.js can use this for setup
 */

/**
 * @typedef {1 | 2 | 3 | 4 | 5 | 6} DieChoice
 */

class Die {
  static spriteFile = "die";

  // spritesheet is arranged horizontally,
  // with up-face ranging from 1 on the left to 6 on the right
  // and 4 directions for each up-face (total 4*6 = 24 sprites)
  static spriteHeightPx = 639;
  static spriteSectionWidthPx = 576;
  static spriteScale = 0.1;

  /**
   *
   * @param {{ position: [number, number] }} settings
   */
  constructor(settings) {
    /**
     * @type {DieChoice}
     */
    this.choice = 1;
    /**
     * @type {[number, number]}
     */
    this.position = settings.position;
  }

  update() {
    // There's no regular game-tick update for dice,
    // it's updated by user input
  }

  render() {
    // TODO: import asset
    // @ts-ignore
    Game.ctx.drawImage(
      // @ts-ignore
      Loader.getImage(Die.spriteFile),
      (this.choice - 1) * Die.spriteSectionWidthPx, // sx
      0, // sy
      Die.spriteSectionWidthPx, // swidth
      Die.spriteHeightPx, // sheight
      this.position[0], // dx
      this.position[1], // dy
      Die.spriteSectionWidthPx * Die.spriteScale, // dwidth
      Die.spriteHeightPx * Die.spriteScale, // dheight
    );
  }
}
