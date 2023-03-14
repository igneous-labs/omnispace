import { Game, Scale, WEBGL } from "phaser";
import { Canvas, enable3d } from "@enable3d/phaser-extension";
import { MainScene } from "@/js/phaser/scene";

function onPageParsed() {
  enable3d(
    () =>
      new Game({
        type: WEBGL,
        // required for enable3d else black screen?
        transparent: true,
        scale: {
          mode: Scale.FIT,
          autoCenter: Scale.CENTER_BOTH,
          width: window.innerWidth * Math.max(1, window.devicePixelRatio / 2),
          height: window.innerHeight * Math.max(1, window.devicePixelRatio / 2),
        },
        scene: [MainScene],
        ...Canvas(),
      }),
  ).withPhysics("/lib/ammo");
}

onPageParsed();
