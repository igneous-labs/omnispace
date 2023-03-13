import Alpine from "alpinejs";
import { onPageParsed as onPageParsedCharacterCustomizer } from "@/js/index/characterCustomizer";
import {
  logout,
  onPageParsed as onPageParsedMatrix,
  render,
  toggleAppMode,
} from "@/js/index/matrix";
import { onPageParsed as onPageParsedGame } from "@/js/index/game";
import { onPageParsed as onPageParsedViewportHax } from "@/js/index/viewportHax";
import { isMobile } from "@/js/common/utils";

function onPageParsed() {
  onPageParsedMatrix();
  onPageParsedViewportHax();
  onPageParsedGame();
  onPageParsedCharacterCustomizer();

  // pollute global scope so alpine can use
  // @ts-ignore
  window.isMobile = isMobile;

  // start alpine only after global namespace has been polluted
  // @ts-ignore
  window.Alpine = Alpine;
  Alpine.start();

  // @ts-ignore
  document.getElementById("logout-button").onclick = logout;

  // @ts-ignore
  document.getElementById("toggle_chat").onclick = () => {
    toggleAppMode();
    render();
  };
}

onPageParsed();
