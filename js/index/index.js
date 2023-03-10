import Alpine from "alpinejs";
import { onPageParsed as onPageParsedCharacterCustomizer } from "@/js/index/characterCustomizer";
import {
  logout,
  onPageParsed as onPageParsedMatrix,
  render,
  toggleAppMode,
} from "@/js/index/matrix";
import { onPageParsed as onPageParsedGame } from "@/js/index/game";
import { isMobile } from "@/js/common/utils";

function onPageParsed() {
  onPageParsedMatrix();
  onPageParsedCharacterCustomizer();
  onPageParsedGame();

  // @ts-ignore
  window.Alpine = Alpine;

  queueMicrotask(() => {
    Alpine.start();
  });

  // @ts-ignore
  document.getElementById("logout-button").onclick = logout;

  // @ts-ignore
  document.getElementById("toggle_chat").onclick = () => {
    toggleAppMode();
    render();
  };

  // pollute global scope so alpine can use
  // @ts-ignore
  window.isMobile = isMobile;
}

onPageParsed();
