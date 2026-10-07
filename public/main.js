(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yr = new Date().getFullYear();
  $$("#year, .yr").forEach((el) => (el.textContent = yr));

  /* Fit the wordmark edge to edge */
  const wm = $("#wordmark");
  const fitWordmark = () => {
    const avail = wm.parentElement.clientWidth - parseFloat(getComputedStyle(wm.parentElement).paddingLeft) * 2;
    wm.style.fontSize = "100px";
    wm.style.fontSize = `${(100 * avail * 0.985) / wm.scrollWidth}px`;
  };
  fitWordmark();
  document.fonts?.ready.then(fitWordmark);
  window.addEventListener("resize", fitWordmark);

  /* Highlight the nav pill for the section in view */
  const pills = $$(".nav-pill a");
  const sections = pills.map((a) => $(a.getAttribute("href") === "#top" ? "#reel-wrap" : a.getAttribute("href")));
  const navObs = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const i = sections.indexOf(e.target);
    pills.forEach((p, j) => p.classList.toggle("is-active", j === i));
  }), { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => s && navObs.observe(s));

  /* ---------- Reel: projects in order, with their length in the cut (seconds) ---------- */
  const PROJECTS = [
    { title: "66°North", cat: "Commercial", len: 2.8 },
    { title: "Aberfeldy", cat: "Brand film", len: 3.96 },
    { title: "London Jazz Festival 2024", cat: "Events", len: 3.84 },
    { title: "John Smith’s", cat: "Commercial", len: 2.8 },
    { title: "Vision Pro", cat: "Commercial", len: 2.2 },
    { title: "Serious Music", cat: "Interviews", len: 2.56 },
    { title: "The Hound Chiswick", cat: "Promo", len: 1.48 },
    { title: "London Jazz Festival 2026", cat: "Interviews", len: 2.28 },
  ];
  let t0 = 0;
  PROJECTS.forEach((p) => { p.start = t0; t0 += p.len; });

  const reel = $("#reel");
  const segList = $("#reel-segments");
  const now = $(".reel-now");
  const idxEl = $("#reel-index");
  const titleEl = $("#reel-title");
  const catEl = $("#reel-cat");

  const fills = PROJECTS.map((p, i) => {
    const li = document.createElement("li");
    li.style.setProperty("--w", p.len);
    li.innerHTML = `<button type="button" aria-label="Jump to ${p.title}" title="${p.title}"><span></span></button>`;
    $("button", li).addEventListener("click", () => { reel.currentTime = p.start + 0.01; reel.play().catch(() => {}); });
    segList.appendChild(li);
    return $("span", li);
  });

  let current = -1;
  const setProject = (i) => {
    if (i === current) return;
    current = i;
    now.classList.add("swap");
    setTimeout(() => {
      idxEl.textContent = String(i + 1).padStart(2, "0");
      titleEl.textContent = PROJECTS[i].title;
      catEl.textContent = PROJECTS[i].cat;
      now.classList.remove("swap");
    }, 180);
  };

  const tick = () => {
    const t = reel.currentTime;
    let i = PROJECTS.length - 1;
    while (i > 0 && t < PROJECTS[i].start) i--;
    fills.forEach((f, j) => {
      const p = PROJECTS[j];
      const v = j < i ? 1 : j > i ? 0 : Math.min(1, (t - p.start) / p.len);
      f.style.transform = `scaleX(${v})`;
    });
    setProject(i);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  /* ---------- Intro: frames flick through, then the reel expands to full screen ---------- */
  const loader = $("#loader");
  const frame = $("#loader-frame");
  const count = $("#loader-count");
  const THUMBS = ["66north-poster", "aberfeldy", "ljf24-poster", "johnsmiths", "visionpro-poster", "ljf24-launch", "hero-poster", "ljf26-poster", "still", "selected"];

  let seen = false;
  try { seen = sessionStorage.getItem("ps-intro") === "1"; } catch (e) {}

  const finishIntro = (animate) => {
    reel.currentTime = 0;
    reel.play().catch(() => {});
    if (animate) {
      const r = frame.getBoundingClientRect();
      const W = window.innerWidth, H = reel.getBoundingClientRect().height;
      reel.style.transition = "none";
      reel.style.clipPath = `inset(${r.top}px ${W - r.right}px ${H - r.bottom}px ${r.left}px)`;
      reel.getBoundingClientRect(); // commit the start state
      reel.style.transition = "";
      loader.classList.add("is-done");
      requestAnimationFrame(() => requestAnimationFrame(() => { reel.style.clipPath = "inset(0px 0px 0px 0px)"; }));
    } else {
      loader.classList.add("is-done");
    }
    document.body.classList.remove("is-intro");
    try { sessionStorage.setItem("ps-intro", "1"); } catch (e) {}
  };

  if (reduceMotion || seen) {
    finishIntro(false);
  } else {
    const imgs = THUMBS.map((n) => {
      const img = new Image();
      img.src = `/thumbs/${n}.jpg`;
      img.alt = "";
      frame.appendChild(img);
      return img;
    });

    const reelReady = new Promise((res) => {
      if (reel.readyState >= 3) return res();
      reel.addEventListener("canplay", res, { once: true });
      setTimeout(res, 5000); // never hold the intro hostage to a slow network
    });

    const FLICKS = 26;
    let n = 0;
    const flick = () => {
      imgs.forEach((im) => im.classList.remove("on"));
      imgs[n % imgs.length].classList.add("on");
      n++;
      count.textContent = String(Math.min(100, Math.round((n / FLICKS) * 100))).padStart(2, "0");
      if (n < FLICKS) {
        // fast in the middle, easing out towards the end
        const delay = n < 4 ? 140 : n > FLICKS - 5 ? 110 + (n - (FLICKS - 5)) * 40 : 70;
        setTimeout(flick, delay);
      } else {
        reelReady.then(() => {
          // land on the reel's first frame so the expansion is seamless
          imgs.forEach((im) => im.classList.remove("on"));
          setTimeout(() => finishIntro(true), 60);
        });
      }
    };
    Promise.all(imgs.map((im) => im.decode().catch(() => {}))).then(() => setTimeout(flick, 250));
  }

  /* ---------- Work tiles: play loops only while on screen ---------- */
  const vObs = new IntersectionObserver((entries) => entries.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) {
      if (!v.src) v.src = v.dataset.src;
      if (!reduceMotion) v.play().catch(() => {});
    } else if (v.src) v.pause();
  }), { threshold: 0.2 });
  $$(".tile video[data-src]").forEach((v) => vObs.observe(v));

  /* Pause the reel when it's off screen */
  new IntersectionObserver(([e]) => {
    if (document.body.classList.contains("is-intro")) return;
    e.isIntersecting ? reel.play().catch(() => {}) : reel.pause();
  }).observe($("#reel-wrap"));

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox");
  const lbFrame = $("#lightbox-frame");
  const lbTitle = $("#lightbox-title");
  let lastFocus = null;

  const embed = ({ provider, id, hash }) => {
    if (provider === "vimeo")
      return `<iframe src="https://player.vimeo.com/video/${id}?${hash ? `h=${hash}&` : ""}autoplay=1&title=0&byline=0&portrait=0&dnt=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video"></iframe>`;
    if (provider === "youtube")
      return `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen title="Video"></iframe>`;
    return `<video src="${id}" autoplay loop muted playsinline controls></video>`;
  };

  const open = (tile) => {
    lastFocus = document.activeElement;
    lbFrame.innerHTML = embed(tile.dataset);
    lbTitle.textContent = tile.dataset.title;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    reel.pause();
    requestAnimationFrame(() => lb.classList.add("is-open"));
    $(".lightbox-close", lb).focus();
  };
  const close = () => {
    lb.classList.remove("is-open");
    lbFrame.innerHTML = "";
    lb.hidden = true;
    document.body.style.overflow = "";
    lastFocus?.focus();
  };

  $$("button.tile").forEach((t) => t.addEventListener("click", () => open(t)));
  $(".lightbox-close", lb).addEventListener("click", close);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) close(); });
})();
