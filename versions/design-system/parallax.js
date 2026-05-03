/*
 * WHY: Version 04 uses a tall fixed honeycomb layer that should drift against page content while scrolling.
 * WHAT: Publishes scroll-derived CSS offsets for the honeycomb mask and glow layers.
 */

const root = document.documentElement;
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let animationFrame = 0;

function setParallaxOffsets() {
  animationFrame = 0;

  if (reducedMotionQuery.matches) {
    root.style.setProperty("--honeycomb-parallax-y", "0px");
    root.style.setProperty("--honeycomb-glow-parallax-y", "0px");
    return;
  }

  const scrollY = window.scrollY || window.pageYOffset || 0;
  root.style.setProperty("--honeycomb-parallax-y", `${(-scrollY * 0.18).toFixed(2)}px`);
  root.style.setProperty("--honeycomb-glow-parallax-y", `${(-scrollY * 0.08).toFixed(2)}px`);
}

function requestParallaxUpdate() {
  if (animationFrame) {
    return;
  }

  animationFrame = window.requestAnimationFrame(setParallaxOffsets);
}

setParallaxOffsets();
window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
window.addEventListener("resize", requestParallaxUpdate);
reducedMotionQuery.addEventListener("change", requestParallaxUpdate);
