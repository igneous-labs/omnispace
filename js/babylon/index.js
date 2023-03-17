import { Engine } from "@babylonjs/core/Engines/engine";
import { Game } from "@/js/babylon/game";

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Engine} engine
 */
function resizeCanvas(canvas, engine) {
  const r = Math.min(window.innerWidth, 0.9 * window.innerHeight);
  // set style because engine.resize() modifies .width and .height to match them
  canvas.style.width = `${r}px`;
  canvas.style.height = canvas.style.width;
  engine.resize();
}

async function onPageParsed() {
  /** @type {HTMLCanvasElement} */
  // @ts-ignore
  const canvas = document.getElementById("renderCanvas");
  const engine = new Engine(canvas, true);
  resizeCanvas(canvas, engine);
  const game = await Game.load({ canvas, engine });
  engine.runRenderLoop(() => {
    game.mainScene.render();
  });
  window.addEventListener("resize", () => resizeCanvas(canvas, engine));
}

onPageParsed();
