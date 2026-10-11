const revealSelector =
  ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .heading-scroll-reveal, .box-scroll-reveal, .section-heading-ltr, .heading-ltr, .section-line-expand, h1, h2, h3, .heading-scroll-reveal > span, .heading-scroll-reveal > p, section img:not(.animate-hero-video-zoom)";

/** Progressive enhancement: content stays readable even without observers or animation APIs. */
export function installWebsiteMotion(root: HTMLElement): () => void {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const registered = new WeakSet<Element>();
  const animations = new Set<Animation>();
  let intersection: IntersectionObserver | undefined;
  let mutations: MutationObserver | undefined;

  const animate = (element: Element) => {
    // No DOM class changes here: content is visible by default and mutating SSR markup breaks hydration.
    if (!(element instanceof HTMLElement) || typeof element.animate !== "function") return;
    // Animate individual items, not entire sections with independently animated children.
    if (element.matches("section, .heading-scroll-reveal")) return;

    const isHeadline = element.matches("h1, h2, .section-heading-ltr, .heading-ltr");
    let from: Keyframe = { opacity: 0, transform: "translateY(40px)" };
    let delay = 0;
    if (isHeadline) {
      from = { opacity: 0, transform: "translateX(-120px)" };
    } else if (element.matches(".scroll-reveal-left")) {
      from = { opacity: 0, transform: "translateX(-70px)" };
    } else if (element.matches(".scroll-reveal-right")) {
      from = { opacity: 0, transform: "translateX(70px)" };
    } else if (element.matches(".scroll-reveal-scale, .box-scroll-reveal")) {
      from = { opacity: 0, transform: "translateY(40px) scale(0.94)" };
      const siblings = element.parentElement?.querySelectorAll(":scope > .box-scroll-reveal");
      if (siblings) delay = Math.min(Array.from(siblings).indexOf(element) * 90, 360);
    } else if (element.matches(".section-line-expand")) {
      from = { transform: "scaleX(0)" };
      delay = 160;
    } else if (element.matches("img")) {
      from = { opacity: 0, transform: "scale(1.08)" };
    } else if (element.matches(".heading-scroll-reveal > p")) {
      delay = 200;
    }

    // Devices with "reduce motion" (often battery saver) still get a gentle fade instead of nothing.
    if (preference.matches) from = { opacity: 0 };
    const animation = element.animate([from, { opacity: 1, transform: "none" }], {
      duration: preference.matches ? 700 : isHeadline ? 1200 : element.matches("img") ? 1300 : 900,
      delay,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "backwards",
    });
    animations.add(animation);
    animation.onfinish = () => animations.delete(animation);
    animation.oncancel = () => animations.delete(animation);
  };

  if (typeof IntersectionObserver !== "undefined") {
    intersection = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        intersection?.unobserve(entry.target);
        animate(entry.target);
      }
    }, { threshold: 0.01, rootMargin: "0px 0px -24px 0px" });
  }

  const register = () => {
    root.querySelectorAll(revealSelector).forEach((element) => {
      if (registered.has(element)) return;
      registered.add(element);
      intersection?.observe(element);
    });
  };
  register();
  // Routes and tabs can mount content after the layout effect; register those too.
  if (typeof MutationObserver !== "undefined") {
    mutations = new MutationObserver(register);
    mutations.observe(root, { childList: true, subtree: true });
  }

  return () => {
    intersection?.disconnect();
    mutations?.disconnect();
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  };
}