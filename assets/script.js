/* Imakō — interactions */
(() => {
  const $  = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

  /* Year */
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* Nav: stuck on scroll */
  const nav = $("[data-nav]");
  const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Burger */
  const burger = $("[data-burger]");
  const links  = $(".nav__links");
  if (burger) {
    burger.addEventListener("click", () => {
      const open = burger.classList.toggle("is-open");
      links.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    $$(".nav__links a").forEach(a => a.addEventListener("click", () => {
      burger.classList.remove("is-open");
      links.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }));
  }

  /* Carte tabs */
  const tabs = $$(".carte__tabs button");
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      tabs.forEach(b => b.setAttribute("aria-selected", b === btn ? "true" : "false"));
      $$(".carte__panel").forEach(p => p.classList.toggle("is-active", p.dataset.panel === target));
    });
  });

  /* Reveal-on-scroll: tag main blocks */
  $$(".section__head, .histoire__copy, .histoire__stats, .poke__text, .poke__visual, .carte__tabs, .carte__panel.is-active, .xcard, .bienetre__copy, .bienetre__list, .quotes li, .contact__card, .contact__parking, .footer__brand, .footer__cols").forEach((el, i) => {
    el.setAttribute("data-reveal", "");
    el.style.transitionDelay = `${Math.min(i * 30, 240)}ms`;
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
  $$("[data-reveal]").forEach(el => io.observe(el));
  // Failsafe: if for some reason IO never fires (printed view, very tall viewport,
  // print-to-PDF), reveal everything still visible after 1.5s.
  setTimeout(() => $$("[data-reveal]").forEach(el => el.classList.add("is-in")), 1500);

  /* Stat counters */
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const dur = 1200;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  $$("[data-count]").forEach(el => counterIO.observe(el));
  // Failsafe: ensure counters show their final value even if the observer never fires.
  setTimeout(() => $$("[data-count]").forEach(el => {
    if (el.textContent.trim() === "0") el.textContent = el.dataset.count;
  }), 2500);

  /* Aujourd'hui — heures */
  const todayEl = $("[data-today-hours]");
  if (todayEl) {
    const day = new Date().getDay(); // 0 dim, 1 lun, 2 mar, ...
    const map = {
      0: "18:00 — 20:30",
      1: "18:00 — 20:30",
      2: "Fermé aujourd'hui",
      3: "18:00 — 21:00",
      4: "18:00 — 21:00",
      5: "18:00 — 21:00",
      6: "18:00 — 21:00",
    };
    todayEl.textContent = map[day];
  }

  /* Light parallax on hero plate */
  const plate = $(".hero__plate");
  if (plate && window.matchMedia("(min-width: 980px)").matches) {
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      plate.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }
})();
