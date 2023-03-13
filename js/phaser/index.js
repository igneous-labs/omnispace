import { Game, Scale, WEBGL } from "phaser";
import { Canvas, enable3d } from "@enable3d/phaser-extension";
import { MainScene } from "@/js/phaser/scene";
import { HEIGHT, WIDTH } from "@/js/phaser/consts";

function onPageParsed() {
  console.log(window.devicePixelRatio);
  enable3d(
    () =>
      new Game({
        type: WEBGL,
        // required for enable3d else black screen?
        transparent: true,
        scale: {
          mode: Scale.FIT,
          autoCenter: Scale.CENTER_BOTH,
          width: WIDTH * Math.max(1, window.devicePixelRatio / 2),
          height: HEIGHT * Math.max(1, window.devicePixelRatio / 2),
        },
        scene: [MainScene],
        ...Canvas(),
      }),
  ).withPhysics("/lib/ammo");
}

onPageParsed();
