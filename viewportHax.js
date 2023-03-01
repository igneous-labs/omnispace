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

// haxx0r for Safari
document.getElementById("chat_input")?.addEventListener("focus", (e) => {
  setTimeout(() => window.scrollTo(0, 0), 100);
});

document.addEventListener(
  "touchmove",
  function (e) {
    const isChatView = e.target.closest("#view");
    if (!isChatView) {
      e.preventDefault();
    }
  },
  { passive: false },
);
