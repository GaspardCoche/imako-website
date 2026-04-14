/* Imakō — interactions */
(() => {
  const $  = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

  /* Year */
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* ============================================================
     MODE SWITCH — Cuisine / Bien-être (deux univers, deux thèmes)
     ============================================================ */
  const MODE_KEY = "imako-mode-v1";
  const modeBtns = $$("[data-mode-btn]");
  const applyMode = (mode) => {
    document.body.dataset.mode = mode;
    modeBtns.forEach(b => {
      const active = b.dataset.modeBtn === mode;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
    });
    try { localStorage.setItem(MODE_KEY, mode); } catch (e) {}
  };
  try {
    const saved = localStorage.getItem(MODE_KEY);
    if (saved === "cuisine" || saved === "bien-etre") applyMode(saved);
  } catch (e) {}
  modeBtns.forEach(b => b.addEventListener("click", () => applyMode(b.dataset.modeBtn)));

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

  /* Aujourd'hui — heures + nav status */
  const HOURS = {
    0: { open: 18, close: 20.5, label: "18:00 — 20:30" },
    1: { open: 18, close: 20.5, label: "18:00 — 20:30" },
    2: { open: null, close: null, label: "Fermé aujourd'hui" },
    3: { open: 18, close: 21,   label: "18:00 — 21:00" },
    4: { open: 18, close: 21,   label: "18:00 — 21:00" },
    5: { open: 18, close: 21,   label: "18:00 — 21:00" },
    6: { open: 18, close: 21,   label: "18:00 — 21:00" },
  };
  const now      = new Date();
  const dayInfo  = HOURS[now.getDay()];
  const hourNow  = now.getHours() + now.getMinutes() / 60;

  const todayEl = $("[data-today-hours]");
  if (todayEl) todayEl.textContent = dayInfo.label;

  const navStatus  = $("[data-nav-status]");
  const statusText = $("[data-status-text]");
  if (navStatus && statusText) {
    if (dayInfo.open == null) {
      statusText.textContent = "Fermé aujourd'hui";
      navStatus.classList.add("is-closed");
    } else if (hourNow >= dayInfo.open && hourNow < dayInfo.close) {
      const closeH = Math.floor(dayInfo.close);
      const closeM = Math.round((dayInfo.close - closeH) * 60);
      statusText.textContent = `Ouvert · jusqu'à ${closeH}h${closeM ? closeM : ""}`;
    } else if (hourNow < dayInfo.open) {
      statusText.textContent = `Ouvert ce soir · ${dayInfo.label}`;
      navStatus.classList.add("is-closed");
    } else {
      statusText.textContent = "Fermé · ouvre demain";
      navStatus.classList.add("is-closed");
    }
  }

  /* Light parallax on hero bowl */
  const heroBowl = $(".hero__bowl");
  if (heroBowl && window.matchMedia("(min-width: 980px)").matches) {
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      heroBowl.style.setProperty("--mx", `${x}px`);
      heroBowl.style.setProperty("--my", `${y}px`);
      heroBowl.style.translate = `${x}px ${y}px`;
    });
  }

  /* ============================================================
     COMMANDER — bowl builder + cart + WhatsApp checkout
     ============================================================ */
  const STORAGE_KEY = "imako-cart-v1";
  const PHONE_WA = "3265587721";
  const fmt = (n) => `${n.toFixed(2).replace(".", ",")} €`;

  /* --- Cart state --------------------------------------------- */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { cart = []; }

  const saveCart = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {}
  };

  const cartFabs   = $$("[data-cart-open]");
  const cartCounts = $$("[data-cart-count]");
  const cartHead   = $("[data-cart-headcount]");
  const cartBody   = $("[data-cart-body]");
  const cartFoot   = $("[data-cart-foot]");
  const cartTotal  = $("[data-cart-total]");
  const cartEmpty  = $("[data-cart-empty]");
  const cartEl     = $("[data-cart]");
  const scrim      = $("[data-scrim]");
  const toastEl    = $("[data-toast]");
  const fabBtn     = $(".cart-fab");

  const totalQty   = () => cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = () => cart.reduce((s, i) => s + i.qty * i.price, 0);

  const renderCart = () => {
    const qty = totalQty();
    cartCounts.forEach(el => {
      el.textContent = qty;
      const wrap = el.closest(".cart-fab, .nav__cart");
      if (wrap) wrap.classList.toggle("has-items", qty > 0);
    });
    if (cartHead) cartHead.textContent = qty ? ` · ${qty} article${qty > 1 ? "s" : ""}` : "";

    // existing items wiped (keep the empty-state node detached when items present)
    $$(".cart__item", cartBody).forEach(n => n.remove());

    if (!cart.length) {
      if (cartEmpty) cartEmpty.style.display = "";
      cartFoot.hidden = true;
      return;
    }
    if (cartEmpty) cartEmpty.style.display = "none";
    cartFoot.hidden = false;

    cart.forEach((item, idx) => {
      const node = document.createElement("div");
      node.className = "cart__item";
      node.innerHTML = `
        <h4>${escapeHtml(item.name)}</h4>
        <span class="price">${fmt(item.qty * item.price)}</span>
        ${item.details ? `<p class="details">${escapeHtml(item.details)}</p>` : ""}
        <div class="controls">
          <div class="qty">
            <button type="button" data-dec="${idx}" aria-label="Diminuer">−</button>
            <span class="n">${item.qty}</span>
            <button type="button" data-inc="${idx}" aria-label="Augmenter">+</button>
          </div>
          <button type="button" class="remove" data-rm="${idx}">Retirer</button>
        </div>
      `;
      cartBody.appendChild(node);
    });
    cartTotal.textContent = fmt(totalPrice());
  };

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const bumpFab = () => {
    if (!fabBtn) return;
    fabBtn.classList.remove("bump");
    void fabBtn.offsetWidth;
    fabBtn.classList.add("bump");
  };

  let toastT;
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-show"), 2200);
  };

  const addItem = (item) => {
    const key = `${item.name}::${item.details || ""}`;
    const existing = cart.find(i => `${i.name}::${i.details || ""}` === key);
    if (existing) existing.qty += item.qty || 1;
    else cart.push({ ...item, qty: item.qty || 1 });
    saveCart();
    renderCart();
    bumpFab();
    toast(`${item.name} ajouté`);
  };

  /* --- Drawer toggle ------------------------------------------ */
  const openCart = () => {
    cartEl.classList.add("is-open");
    scrim.classList.add("is-open");
    cartEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const closeCart = () => {
    cartEl.classList.remove("is-open");
    scrim.classList.remove("is-open");
    cartEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  cartFabs.forEach(b => b.addEventListener("click", openCart));
  $$("[data-cart-close]").forEach(b => b.addEventListener("click", closeCart));
  scrim?.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

  /* --- Cart item controls (delegation) ------------------------ */
  cartBody?.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.inc != null) { cart[+t.dataset.inc].qty++; }
    else if (t.dataset.dec != null) {
      const i = +t.dataset.dec;
      cart[i].qty--;
      if (cart[i].qty <= 0) cart.splice(i, 1);
    }
    else if (t.dataset.rm != null) { cart.splice(+t.dataset.rm, 1); }
    saveCart();
    renderCart();
  });

  /* --- Mode toggle (address visibility) ----------------------- */
  const addressInput = $("[data-address]");
  const syncMode = () => {
    const mode = $('input[name="mode"]:checked')?.value;
    if (addressInput) {
      const liv = mode === "livraison";
      addressInput.style.display = liv ? "" : "none";
      addressInput.required = liv;
    }
  };
  $$('input[name="mode"]').forEach(r => r.addEventListener("change", syncMode));
  syncMode();

  /* --- Carte: + buttons --------------------------------------- */
  $$(".carte__panel article [data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const art = btn.closest("article");
      addItem({
        name: art.dataset.name,
        price: parseFloat(art.dataset.price),
      });
    });
  });

  /* --- Bowl builder ------------------------------------------- */
  const builder = $("[data-builder]");
  if (builder) {
    const summaryLines = $("[data-summary-lines]");
    const summaryTotal = $("[data-summary-total]");

    const readBuilder = () => {
      const base   = $('input[name="b-base"]:checked', builder);
      const prot   = $('input[name="b-prot"]:checked', builder);
      const sauce  = $('input[name="b-sauce"]:checked', builder);
      const veg    = $$('input[name="b-veg"]:checked', builder);
      const items  = [];
      if (prot)  items.push({ label: prot.value,  price: +prot.dataset.price });
      if (base)  items.push({ label: base.value,  price: +base.dataset.price });
      veg.forEach(v => items.push({ label: v.value, price: +v.dataset.price }));
      if (sauce) items.push({ label: sauce.value, price: +sauce.dataset.price });
      const total = items.reduce((s, i) => s + i.price, 0);
      return { items, total, prot, base, sauce, veg };
    };

    const renderBuilder = () => {
      const { items, total } = readBuilder();
      summaryLines.innerHTML = items.map(i =>
        `<li><span>${escapeHtml(i.label)}</span><span>${i.price > 0 ? "+" + fmt(i.price) : ""}</span></li>`
      ).join("");
      summaryTotal.textContent = fmt(total);
    };

    builder.addEventListener("change", renderBuilder);
    // Limit veg to 4
    $$('input[name="b-veg"]', builder).forEach(cb => {
      cb.addEventListener("change", () => {
        const checked = $$('input[name="b-veg"]:checked', builder);
        if (checked.length > 4) {
          cb.checked = false;
          toast("4 toppings maximum");
          renderBuilder();
        }
      });
    });
    renderBuilder();

    $("[data-builder-add]")?.addEventListener("click", () => {
      const { items, total, prot, base, sauce } = readBuilder();
      if (!prot || !base || !sauce) { toast("Choisissez base, protéine et sauce"); return; }
      const details = items.map(i => i.label).join(" · ");
      addItem({
        name: `Poke ${prot.value}`,
        price: total,
        details,
      });
    });
  }

  /* --- Checkout — WhatsApp ------------------------------------ */
  $("[data-cart-form]")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!cart.length) { toast("Votre panier est vide"); return; }
    const fd = new FormData(e.currentTarget);
    const mode = fd.get("mode");
    const lines = [
      `*Nouvelle commande Imakō*`,
      ``,
      `Nom : ${fd.get("name")}`,
      `Téléphone : ${fd.get("phone")}`,
      `Mode : ${mode === "livraison" ? "Livraison" : "À emporter"}`,
      `Heure souhaitée : ${fd.get("time")}`,
    ];
    if (mode === "livraison" && fd.get("address")) lines.push(`Adresse : ${fd.get("address")}`);
    if (fd.get("notes")) lines.push(`Notes : ${fd.get("notes")}`);
    lines.push(``, `*Détail*`);
    cart.forEach(i => {
      lines.push(`• ${i.qty} × ${i.name} — ${fmt(i.qty * i.price)}`);
      if (i.details) lines.push(`   ↳ ${i.details}`);
    });
    lines.push(``, `*Total : ${fmt(totalPrice())}*`);
    const url = `https://wa.me/${PHONE_WA}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");
    toast("Commande envoyée sur WhatsApp");
  });

  renderCart();
})();
