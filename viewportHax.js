// Make sure script is ran in defer so that window is defined

/**
 *
 * @param {boolean} isOskUp
 */
function setViewAppearance(isOskUp) {
  const view = document.getElementById("view");
  view.style.backgroundColor = isOskUp
    ? "rgba(220, 220, 220, 0.7)"
    : "transparent";
}

function viewportHandler() {
  // only run if in portrait mode (on mobile)
  if (window.innerHeight <= window.innerWidth) {
    return;
  }
  document.querySelector("body").style.height = `${Math.round(
    window.visualViewport.height,
  )}px`;
}

window.visualViewport.addEventListener("resize", viewportHandler);
// run initial set
viewportHandler();
setViewAppearance(false);

const chatInput = document.getElementById("chat_input");
chatInput.addEventListener("blur", (e) => {
  // only run if in portrait mode (on mobile)
  if (window.innerHeight <= window.innerWidth) {
    return;
  }
  console.log("Chat input lost focus");
  const canvas = document.getElementById("canvas");
  canvas.style.zIndex = 1;
  canvas.classList.remove("portrait:absolute");
  canvas.classList.add("portrait:relative");
  setViewAppearance(false);
});

chatInput.addEventListener("focus", (e) => {
  // only run if in portrait mode (on mobile)
  if (window.innerHeight <= window.innerWidth) {
    return;
  }
  console.log("Chat input on focus");
  const canvas = document.getElementById("canvas");
  canvas.style.zIndex = -1;
  canvas.classList.add("portrait:absolute");
  canvas.classList.remove("portrait:relative");
  setViewAppearance(true);
  // ios safari is FUCKED UP
  setTimeout(() => window.scrollTo(0, 0), 100);
});
