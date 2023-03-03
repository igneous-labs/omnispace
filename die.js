/**
 * A six-faced die
 */

/**
 * @typedef {1 | 2 | 3 | 4 | 5 | 6} DieChoice
 */

class Die {
  static constructor() {
    /**
     * @type {DieChoice}
     */
    this.choice = 1;
  }

  update() {
    // There's no regular game-tick update for dice,
    // it's updated by user input
  }

  render() {
    // TODO: render this.choice face up
  }
}
