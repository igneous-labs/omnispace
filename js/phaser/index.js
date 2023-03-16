import { Game, Scale, WEBGL } from "phaser";
import { Canvas, enable3d } from "@enable3d/phaser-extension";
import { MainScene } from "@/js/phaser/scene";
import { HEIGHT, WIDTH } from "@/js/phaser/consts";

function onPageParsed() {
  enable3d(
    () =>
      new Game({
        type: WEBGL,
        // required for enable3d else black screen?
        transparent: true,
        scale: {
          parent: "phaser-game",
          mode: Scale.WIDTH_CONTROLS_HEIGHT,
          autoCenter: Scale.CENTER_BOTH,
          // Note: these control game's pixel resolution, not HTML element dims
          width: WIDTH * Math.max(1, window.devicePixelRatio / 2),
          height: HEIGHT * Math.max(1, window.devicePixelRatio / 2),
        },
        scene: [MainScene],
        ...Canvas(),
      }),
  ).withPhysics("/lib/ammo");
}

onPageParsed();
