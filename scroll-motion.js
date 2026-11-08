(() => {
  const wrapAsFlowScene = (scene) => {
    if (scene.closest("[data-flow-section]")) return;

    const frame = document.createElement("div");
    const inner = document.createElement("div");
    frame.className = "flow-section";
    frame.dataset.flowSection = "";
    inner.className = "flow-art-container";
    inner.dataset.flowInner = "";
    scene.parentNode.insertBefore(frame, scene);
    frame.append(inner);
    inner.append(scene);
  };

  const isBookingWizard = Boolean(document.querySelector("[data-panel]"));
  if (!isBookingWizard) {
    document.querySelectorAll("main > section").forEach(wrapAsFlowScene);
    const footer = document.querySelector("footer.site-footer");
    if (footer) wrapAsFlowScene(footer);
  }

  const menuToggle = document.querySelector(".menu-toggle");
  const primaryNav = document.querySelector("#primary-nav");

  if (menuToggle && primaryNav) {
    const closeMenu = () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", document.documentElement.lang === "ru" ? "Открыть меню" : "Open menu");
      primaryNav.classList.remove("is-open");
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", document.documentElement.lang === "ru" ? (isOpen ? "Закрыть меню" : "Открыть меню") : (isOpen ? "Close menu" : "Open menu"));
      primaryNav.classList.toggle("is-open", isOpen);
    });
    primaryNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const flowSections = Array.from(document.querySelectorAll("[data-flow-section]"));
  const canUseFlowScroll = flowSections.length > 1 && window.gsap && window.ScrollTrigger;
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (canUseFlowScroll) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    const mm = window.gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const triggers = [];
      flowSections.forEach((section, index) => {
        const inner = section.querySelector("[data-flow-inner]");
        if (!inner) return;

        window.gsap.set(section, { zIndex: index + 1 });

        if (index > 0) {
          window.gsap.set(inner, { rotation: 30, transformOrigin: "bottom left" });
          const tween = window.gsap.to(inner, {
            rotation: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top 25%",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
          if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
        }

        if (index < flowSections.length - 2) {
          triggers.push(window.ScrollTrigger.create({
            trigger: section,
            start: "bottom bottom",
            end: "bottom top",
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          }));
        }
      });

      window.ScrollTrigger.refresh();
      return () => triggers.forEach((trigger) => trigger.kill());
    });
    window.addEventListener("load", () => window.ScrollTrigger.refresh(), { once: true });
    return;
  }

  if (motionPreference.matches || !("IntersectionObserver" in window)) return;

  const root = document.documentElement;
  const targets = isBookingWizard
    ? document.querySelectorAll(".top, main, .actions")
    : document.querySelectorAll("[data-flow-section]");
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-scroll-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  targets.forEach((target) => {
    target.dataset.scrollReveal = "";
    observer.observe(target);
  });

  root.classList.add("has-scroll-motion");
})();
