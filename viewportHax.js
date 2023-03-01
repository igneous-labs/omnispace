function setViewHeight() {
  console.log("called");
  const navHeight = document.querySelector("nav").offsetHeight;
  const footerHeight = document.querySelector("footer").offsetHeight;
  const vpH = window.visualViewport.height;
  // leave 15px for bottom margin between textrow and bottom of screen
  document.getElementById("main").style.height = `${Math.round(
    vpH - navHeight - 15,
  )}px`;
}

if (window.innerHeight > window.innerWidth) {
  setViewHeight();
}

const navFooterResizeObs = new ResizeObserver(setViewHeight);
navFooterResizeObs.observe(document.querySelector("nav"));
navFooterResizeObs.observe(document.querySelector("footer"));
window.visualViewport.addEventListener("resize", setViewHeight);
window.visualViewport.addEventListener("scroll", setViewHeight);
window.addEventListener("scroll", (e) => {
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
document.getElementById("chat_input").addEventListener("focus", (e) => {
  setTimeout(() => window.scrollTo(0, 0), 100);
});
