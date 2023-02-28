// // // Make sure script is ran in defer so that window is defined

// // // let prevVVheight = window.visualViewport.height;

// // function onVirtualKeyboard() {
// //   // document.body.scrollTop = 0; // For Safari
// //   // document.documentElement.scrollTop = 0; // For Chrome, Firefox
// //   // const canvas = document.getElementById("canvas");
// //   // canvas.style.zIndex = isUp ? -1 : 1;
// //   // const view = document.getElementById("view");
// //   // view.style.backgroundColor = isUp ? "rgba(0, 0, 0, 0.5)" : "transparent";
// //   // // NB: padding, margin doesnt work
// //   // view.style.borderTop = `${
// //   //   isUp ? 0 : Math.round(canvas.offsetHeight)
// //   // }px solid transparent`;

// //   setViewHeight();
// // }

function setViewHeight() {
  console.log("called");
  const navHeight = document.querySelector("nav").offsetHeight;
  const footerHeight = document.querySelector("footer").offsetHeight;
  const vpH = window.visualViewport.height;
  // leave 15px for bottom margin between textrow and bottom of screen
  console.log(vpH);
  console.log(vpH, navHeight, footerHeight);
  document.getElementById("main").style.height = `${Math.round(
    vpH - navHeight - footerHeight - 15,
  )}px`;
}

// // function onVirtualKeyboardUp() {
// //   onVirtualKeyboard(true);
// // }

// // function onVirtualKeyboardDown() {
// //   onVirtualKeyboard(false);
// // }

// // /**
// //  *
// //  * @param {*} event
// //  */
// // function viewportHandler(event) {
// //   const vp = event.target;
// //   // only run if in portrait mode (on mobile)
// //   if (window.innerHeight <= window.innerWidth) {
// //     return;
// //   }
// //   onVirtualKeyboard();
// //   // if (prevVVheight > vp.height) {
// //   //   onVirtualKeyboardUp();
// //   // } else {
// //   //   onVirtualKeyboardDown();
// //   // }
// //   // prevVVheight = vp.height;
// // }

// only run initial set if in portrait mode (on mobile)
if (window.innerHeight > window.innerWidth) {
  setViewHeight();
}

const navFooterResizeObs = new ResizeObserver(setViewHeight);
navFooterResizeObs.observe(document.querySelector("nav"));
navFooterResizeObs.observe(document.querySelector("footer"));
window.visualViewport.addEventListener("resize", setViewHeight);
window.visualViewport.addEventListener("scroll", setViewHeight);

document.getElementById("chat_input").addEventListener("focus", (_) => {
  document.getElementById("canvas").style.zIndex = -1;
  document.getElementById("chat_input").style.background =
    "rgba(255, 255, 255, 1)";
});

document.getElementById("chat_input").addEventListener("blur", (_) => {
  document.getElementById("canvas").style.zIndex = 1;
  document.getElementById("chat_input").style.background = "transparent";
});
