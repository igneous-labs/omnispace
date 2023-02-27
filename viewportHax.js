// Make sure script is ran in defer so that window is defined

let prevVVheight = window.visualViewport.height;

function onVirtualKeyboard(isUp) {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox
  const canvas = document.getElementById("canvas");
  canvas.style.zIndex = isUp ? -1 : 1;
  const view = document.getElementById("view");
  view.style.backgroundColor = isUp ? "rgba(0, 0, 0, 0.5)" : "transparent";
  // NB: padding, margin doesnt work
  view.style.borderTop = `${
    isUp ? 0 : Math.round(canvas.offsetHeight)
  }px solid transparent`;

  const navHeight = document.querySelector("nav").offsetHeight;
  const footerHeight = document.querySelector("footer").offsetHeight;
  const vpH = window.visualViewport.height;
  view.style.height = `${Math.round(vpH - navHeight - footerHeight - 15)}px`;
}

function onVirtualKeyboardUp() {
  onVirtualKeyboard(true);
}

function onVirtualKeyboardDown() {
  onVirtualKeyboard(false);
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
  if (prevVVheight > vp.height) {
    onVirtualKeyboardUp();
  } else {
    onVirtualKeyboardDown();
  }
  prevVVheight = vp.height;
}

window.visualViewport.addEventListener("resize", viewportHandler);
// only run initial set if in portrait mode (on mobile)
if (window.innerHeight > window.innerWidth) {
  onVirtualKeyboardDown();
}
