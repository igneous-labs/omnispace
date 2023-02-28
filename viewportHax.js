// Make sure script is ran in defer so that window is defined

function onVirtualViewportChange() {
  const isOskUp = window.visualViewport.height < 0.75 * window.innerHeight;

  const canvas = document.getElementById("canvas");
  canvas.style.zIndex = isOskUp ? -1 : 1;
  const view = document.getElementById("view");
  view.style.backgroundColor = isOskUp ? "rgba(0, 0, 0, 0.5)" : "transparent";
  // NB: padding, margin doesnt work
  view.style.borderTop = `${
    isOskUp ? 0 : Math.round(canvas.offsetHeight)
  }px solid transparent`;

  setViewHeight();

  // scroll to top only at the end
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox
}

function setViewHeight() {
  const navHeight = document.querySelector("nav").offsetHeight;
  const footerHeight = document.querySelector("footer").offsetHeight;
  const vpH = window.visualViewport.height;
  // leave 15px for bottom margin between textrow and bottom of screen
  document.getElementById("view").style.height = `${Math.round(
    vpH - navHeight - footerHeight - 15,
  )}px`;
}

/**
 *
 * @param {*} event
 */
function viewportHandler(event) {
  const vp = event.target;
  // only run if in portrait mode (on mobile)
  if (window.innerHeight <= window.innerWidth) {
    return;
  }
  onVirtualViewportChange();
}

window.visualViewport.addEventListener("resize", viewportHandler);
// only run initial set if in portrait mode (on mobile)
if (window.innerHeight > window.innerWidth) {
  onVirtualViewportChange();
}

const navFooterResizeObs = new ResizeObserver(setViewHeight);
navFooterResizeObs.observe(document.querySelector("nav"));
navFooterResizeObs.observe(document.querySelector("footer"));
