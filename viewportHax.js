// Make sure script is ran in defer so that window is defined

function setViewHeight() {
  const navHeight = document.querySelector("nav").offsetHeight;
  const footerHeight = document.querySelector("footer").offsetHeight;
  const vpH = window.visualViewport.height;
  // leave 15px for bottom margin between textrow and bottom of screen
  document.getElementById("view").style.height = `${Math.round(
    vpH - navHeight - footerHeight - 15,
  )}px`;
}

function viewportHandler() {
  // only run if in portrait mode (on mobile)
  if (window.innerHeight <= window.innerWidth) {
    return;
  }
  setViewHeight();
}

window.visualViewport.addEventListener("resize", viewportHandler);
// run initial set
viewportHandler();

const navFooterResizeObs = new ResizeObserver(setViewHeight);
navFooterResizeObs.observe(document.querySelector("nav"));
navFooterResizeObs.observe(document.querySelector("footer"));

const chatInput = document.getElementById("chat_input");
chatInput.addEventListener("blur", (e) => {
  // only run if in portrait mode (on mobile)
  if (window.innerHeight <= window.innerWidth) {
    return;
  }
  console.log("Chat input lost focus");
  const canvas = document.getElementById("canvas");
  canvas.style.zIndex = 1;
  const view = document.getElementById("view");
  view.style.backgroundColor = "transparent";
  view.style.borderTop = `${Math.round(
    canvas.offsetHeight,
  )}px solid transparent`;
});

chatInput.addEventListener("focus", (e) => {
  // only run if in portrait mode (on mobile)
  if (window.innerHeight <= window.innerWidth) {
    return;
  }
  console.log("Chat input on focus");
  const canvas = document.getElementById("canvas");
  canvas.style.zIndex = -1;
  const view = document.getElementById("view");
  view.style.backgroundColor = "rgba(220, 220, 220, 0.7)";
  view.style.borderTop = `0px solid transparent`;
});
