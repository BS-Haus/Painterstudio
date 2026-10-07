(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  document.getElementById("year").textContent = new Date().getFullYear();
  requestAnimationFrame(() => document.body.classList.add("is-loaded"));

  /* Nav background on scroll */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const toggle = $(".menu-toggle");
  const menu = $("#mobile-menu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* Hero montage: caption tracks which project is on screen */
  const heroVideo = $("#hero-video");
  const heroNow = $("#hero-now");
  const heroBar = $("#hero-bar");
  const chapters = [
    [0, "66°North — Commercial"],
    [1.4, "Aberfeldy — Brand Film"],
    [3.0, "London Jazz Festival — Highlights"],
    [4.88, "John Smith’s — Commercial"],
    [6.48, "Vision Pro — Commercial"],
    [8.68, "Corporate Interviews"],
    [10.28, "The Hound Chiswick — Promo"],
    [11.76, "Serious Music — LJF 2024 Launch"],
    [13.36, "London Jazz Festival 2026 — Launch"],
    [15.64, "Brand Films"],
  ];
  let lastChapter = 0;
  const tick = () => {
    if (heroVideo.duration) {
      const t = heroVideo.currentTime;
      heroBar.style.transform = `scaleX(${t / heroVideo.duration})`;
      let i = 0;
      while (i + 1 < chapters.length && t >= chapters[i + 1][0]) i++;
      if (i !== lastChapter) {
        lastChapter = i;
        heroNow.textContent = chapters[i][1];
      }
    }
    requestAnimationFrame(tick);
  };
  if (reduceMotion) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
  } else {
    heroVideo.play().catch(() => {});
    requestAnimationFrame(tick);
  }

  /* Reveal on scroll */
  const revealObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        revealObs.unobserve(e.target);
      }
    }),
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay ||= `${(i % 3) * 0.08}s`;
    revealObs.observe(el);
  });

  /* Tile loops: load + play only while on screen */
  const tileVideos = $$(".tile video[data-src]");
  const videoObs = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) {
        if (!v.src) v.src = v.dataset.src;
        if (!reduceMotion) v.play().catch(() => {});
      } else if (v.src) {
        v.pause();
      }
    }),
    { threshold: 0.15 }
  );
  tileVideos.forEach((v) => videoObs.observe(v));

  /* Filters */
  const grid = $("#grid");
  $$(".filter").forEach((btn) =>
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      $$(".filter").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
      });
      grid.classList.toggle("is-filtered", f !== "all");
      $$(".tile", grid).forEach((t) =>
        t.classList.toggle("is-hidden", f !== "all" && !t.dataset.cat.split(" ").includes(f))
      );
    })
  );

  /* Custom play cursor over tiles */
  const cursor = $("#cursor");
  if (window.matchMedia("(hover: hover)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursor.style.setProperty("--x", `${e.clientX}px`);
      cursor.style.setProperty("--y", `${e.clientY}px`);
    }, { passive: true });
    $$(".tile").forEach((t) => {
      t.addEventListener("mouseenter", () => cursor.classList.add("is-on"));
      t.addEventListener("mouseleave", () => cursor.classList.remove("is-on"));
    });
  }

  /* Lightbox */
  const lb = $("#lightbox");
  const lbFrame = $("#lightbox-frame");
  const lbTitle = $("#lightbox-title");
  let lastFocus = null;

  const embedFor = ({ provider, id }) => {
    if (provider === "vimeo")
      return `<iframe src="https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0&dnt=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video"></iframe>`;
    if (provider === "youtube")
      return `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen title="Video"></iframe>`;
    return `<video src="${id}" autoplay loop muted playsinline controls></video>`;
  };

  const openLightbox = (tile) => {
    lastFocus = document.activeElement;
    lbFrame.innerHTML = embedFor(tile.dataset);
    lbTitle.textContent = tile.dataset.title;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    cursor.classList.remove("is-on");
    requestAnimationFrame(() => lb.classList.add("is-open"));
    $(".lightbox-close", lb).focus();
  };
  const closeLightbox = () => {
    lb.classList.remove("is-open");
    lbFrame.innerHTML = "";
    lb.hidden = true;
    document.body.style.overflow = "";
    lastFocus?.focus();
  };

  $$(".tile").forEach((t) => $(".tile-btn", t).addEventListener("click", () => openLightbox(t)));
  $(".lightbox-close", lb).addEventListener("click", closeLightbox);
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lightbox-stage")) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lb.hidden) closeLightbox();
    if (e.key === "Escape" && !menu.hidden) setMenu(false);
  });
})();
