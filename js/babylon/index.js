import { Engine } from "@babylonjs/core/Engines/engine";
import { Game } from "@/js/babylon/game";

async function onPageParsed() {
  /** @type {HTMLCanvasElement} */
  // @ts-ignore
  const canvas = document.getElementById("renderCanvas");
  const engine = new Engine(canvas, true);
  const game = await Game.load({ canvas, engine });
  engine.runRenderLoop(() => {
    game.mainScene.render();
  });
  window.addEventListener("resize", () => engine.resize());
}

onPageParsed();
