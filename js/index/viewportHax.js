import { isMobile } from "@/js/common/utils";

function setMainHeight() {
  // console.log("called");
  // @ts-ignore
  const navHeight = document.querySelector("nav").offsetHeight;
  // @ts-ignore
  const vpH = window.visualViewport.height;
  // leave 15px for bottom margin between textrow and bottom of screen
  // @ts-ignore
  document.getElementById("main").style.height = `${Math.round(
    vpH - navHeight - 15,
  )}px`;
}

export function onPageParsed() {
  if (window.innerHeight > window.innerWidth) {
    setMainHeight();
  }

  const navFooterResizeObs = new ResizeObserver(setMainHeight);
  // @ts-ignore
  navFooterResizeObs.observe(document.querySelector("nav"));
  // @ts-ignore
  navFooterResizeObs.observe(document.querySelector("footer"));
  // @ts-ignore
  window.visualViewport.addEventListener("resize", setMainHeight);
  // @ts-ignore
  window.visualViewport.addEventListener("scroll", setMainHeight);
  window.addEventListener("scroll", () => {
    if (document.body.scrollTop > 0) {
      document.body.scrollTop = 0;
    }
  });

  /**
   * haxx0r for Safari:
   * safari scrolls to the focused element
   *  - after focus event listener fires
   *  - before new layout changes
   *  - without triggering scroll event
   * This causes it to scroll to the chat_input's old position far below the canvas.
   * Here we scroll to window top after a delay (instead of in the focus event listener)
   * to give the layout time to change.
   */
  // @ts-ignore
  document.getElementById("chat_input").addEventListener("focus", () => {
    setTimeout(() => window.scrollTo(0, 0), 100);
  });

  // This is used to disable scrolling on mobile everywhere except for inside of the #view element when the chat input is focused
  if (isMobile) {
    document.addEventListener(
      "touchmove",
      (e) => {
        // @ts-ignore
        if (document.activeElement.id !== "chat_input") return;
        // @ts-ignore
        const isChatView = e.target.closest("#view");
        if (!isChatView) {
          e.preventDefault();
        }
      },
      { passive: false },
    );
  }
}
