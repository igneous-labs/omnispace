// Make sure script is ran in defer so that window is defined

let prevVVheight = window.visualViewport.height;

function onVirtualKeyboard(isUp) {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox
    const canvas = document.getElementById("canvas");
    canvas.style.zIndex = isUp ? -1 : 1;
    const view = document.getElementById("view");
    view.style.backgroundColor =  isUp ? "rgba(0, 0, 0, 0.5)" : "transparent";
    view.style.paddingTop = `${isUp ? 0 : canvas.offsetHeight}px`;

    const navHeight = document.querySelector("nav").offsetHeight;
    const footerHeight = document.querySelector("footer").offsetHeight;
    const vpH = window.visualViewport.height;
    // hax: add 20px to buffer margins, etc
    view.style.height = `${vpH - navHeight - footerHeight - 20}px`;
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

window.visualViewport.addEventListener('resize', viewportHandler);
// only run initial set if in portrait mode (on mobile)
if (window.innerHeight > window.innerWidth) {
    onVirtualKeyboardDown();
}
