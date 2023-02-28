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
