/* ============================================================
   BATTLEASIA 2.0 — interactions
   Motions: reveal, LIVE pulse, count-up. Nothing else competes.
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  document.documentElement.classList.add("js");

  /* Header + scan */
  const header = $("#siteHeader");
  const scanBar = $("#scanBar");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 24);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (scanBar) scanBar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile drawer */
  const toggle = $("#menuToggle");
  const drawer = $("#mobileDrawer");
  if (toggle && drawer) {
    const setOpen = (open) => {
      drawer.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      drawer.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    drawer.addEventListener("click", (e) => e.stopPropagation());
    $$("#mobileDrawer a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("click", () => {
      if (drawer.classList.contains("open")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("open")) setOpen(false);
    });
  }

  /* Popovers */
  const closePopovers = (except) => {
    $$(".popover").forEach((p) => {
      if (p === except) return;
      const menu = p.querySelector(".popover-menu");
      const btn = p.querySelector("button");
      if (menu) menu.hidden = true;
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  };
  $$(".popover > button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const pop = btn.closest(".popover");
      const menu = pop.querySelector(".popover-menu");
      const open = menu.hidden;
      closePopovers(pop);
      menu.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
    });
  });
  $$(".popover-menu").forEach((menu) => {
    menu.addEventListener("click", (e) => e.stopPropagation());
  });
  document.addEventListener("click", () => closePopovers());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopovers();
  });

  /* Accent */
  const ACCENTS = {
    lime:  { gold: "#cbfb24", rgb: "203,251,36", ink: "#081401" },
    gold:  { gold: "#f5c518", rgb: "245,197,24", ink: "#111111" },
    ember: { gold: "#ff8a1a", rgb: "255,138,26", ink: "#140800" },
    jade:  { gold: "#3dff8a", rgb: "61,255,138", ink: "#04140a" },
    cyan:  { gold: "#22d3ee", rgb: "34,211,238", ink: "#041014" },
    sky:   { gold: "#60a5fa", rgb: "96,165,250", ink: "#040a14" },
  };
  const applyAccent = (id) => {
    const a = ACCENTS[id] || ACCENTS.lime;
    const r = document.documentElement.style;
    r.setProperty("--gold", a.gold);
    r.setProperty("--gold-rgb", a.rgb);
    r.setProperty("--gold-ink", a.ink);
    r.setProperty("--gold-06", `rgba(${a.rgb},.06)`);
    r.setProperty("--gold-14", `rgba(${a.rgb},.14)`);
    r.setProperty("--gold-24", `rgba(${a.rgb},.24)`);
    r.setProperty("--gold-40", `rgba(${a.rgb},.40)`);
    $$("[data-accent]").forEach((b) => b.classList.toggle("is-active", b.dataset.accent === id));
    try { localStorage.setItem("ba-accent", id); } catch (_) {}
  };
  $$("[data-accent]").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyAccent(btn.dataset.accent);
      closePopovers();
    });
  });
  try { applyAccent(localStorage.getItem("ba-accent") || "lime"); } catch (_) { applyAccent("lime"); }

  /* Language */
  const setLang = (code) => {
    const el = $("#langCode");
    if (el) el.textContent = code;
    $$("#langPopover [data-lang]").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.lang === code)
    );
    const cycle = $("[data-lang-cycle] span");
    if (cycle) cycle.textContent = code;
  };
  $$("#langPopover [data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setLang(btn.dataset.lang);
      closePopovers();
    });
  });
  const cycleBtn = $("[data-lang-cycle]");
  if (cycleBtn) {
    cycleBtn.addEventListener("click", () => {
      const next = (cycleBtn.querySelector("span").textContent === "EN") ? "BN" : "EN";
      setLang(next);
      cycleBtn.querySelector("span").textContent = next;
    });
  }

  /* Reveal */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
  );
  $$("[data-reveal]").forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 60 + "ms";
    io.observe(el);
  });

  /* Count-up */
  const fmt = (n) => n.toLocaleString("en-US");
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const divide = parseFloat(el.dataset.divide || "1");
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1500, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const shown = divide > 1 ? Math.round((target * eased) / divide) : Math.round(target * eased);
      el.textContent = prefix + fmt(shown) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + fmt(divide > 1 ? Math.round(target / divide) : target) + suffix;
    };
    requestAnimationFrame(step);
  };
  const countIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          runCount(e.target);
          countIO.unobserve(e.target);
        }
      });
    },
    { threshold: 0.55 }
  );
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* Rails */
  const highPrize = [
    { game: "PUBG", title: "Erangel Grand Final", spots: [78, 100], entry: "150 BAC", prize: "$5,000" },
    { game: "VALORANT", title: "Ascent Ace Cup", spots: [42, 64], entry: "200 BAC", prize: "$3,200" },
    { game: "FREE FIRE", title: "Bermuda Blaze Royale", spots: [96, 100], entry: "100 BAC", prize: "$2,800" },
    { game: "COD", title: "Nuketown Nightmare", spots: [30, 48], entry: "180 BAC", prize: "$2,400" },
    { game: "MLBB", title: "Land of Dawn Clash", spots: [55, 80], entry: "120 BAC", prize: "$1,900" },
  ];
  const ongoing = [
    { game: "PUBG", title: "Miramar Rush #204", spots: [100, 100], entry: "80 BAC", prize: "$900" },
    { game: "FREE FIRE", title: "Clash Squad Live", spots: [48, 48], entry: "60 BAC", prize: "$640" },
    { game: "VALORANT", title: "Split Skirmish", spots: [58, 64], entry: "90 BAC", prize: "$1,100" },
    { game: "COD", title: "Domination Sprint", spots: [40, 40], entry: "70 BAC", prize: "$720" },
    { game: "MLBB", title: "Rank Rumble Live", spots: [72, 80], entry: "50 BAC", prize: "$540" },
  ];

  const cardHTML = (m, live) => {
    const pct = Math.round((m.spots[0] / m.spots[1]) * 100);
    return `
      <article class="match-card${live ? " is-live" : ""}" data-game="${m.game}">
        <div class="mc-top">
          <span class="mc-game">${m.game}</span>
          <span class="mc-live"><span class="live-dot"></span>${live ? "LIVE" : "OPEN"}</span>
        </div>
        <h4 class="mc-title">${m.title}</h4>
        <div class="mc-grid">
          <div class="mc-cell" style="grid-column:1/3">
            <span>Spots · ${m.spots[0]}/${m.spots[1]}</span>
            <div class="mc-spots"><i style="width:${pct}%"></i></div>
          </div>
          <div class="mc-cell"><span>Entry</span><b>${m.entry}</b></div>
          <div class="mc-cell prize"><span>Prize</span><b>${m.prize}</b></div>
        </div>
        <a class="btn-play" href="#pulse">PLAY NOW
          <svg viewBox="0 0 24 24" width="15" height="15"><path d="M5 12h14m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </article>`;
  };

  const railHP = $("#rail-hp");
  const railOG = $("#rail-og");
  if (railHP) railHP.innerHTML = highPrize.map((m) => cardHTML(m, false)).join("");
  if (railOG) railOG.innerHTML = ongoing.map((m) => cardHTML(m, true)).join("");

  $$(".rail-arrow").forEach((btn) => {
    btn.addEventListener("click", () => {
      const rail = $("#rail-" + btn.dataset.rail);
      if (!rail) return;
      const card = rail.querySelector(".match-card:not(.hidden)");
      const step = card ? card.getBoundingClientRect().width + 18 : 320;
      rail.scrollBy({ left: step * parseInt(btn.dataset.dir, 10), behavior: "smooth" });
    });
  });

  /* Pulse game chips */
  $$(".command-panel .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$(".command-panel .chip").forEach((c) => c.classList.remove("chip-active"));
      chip.classList.add("chip-active");
      const g = chip.dataset.game;
      $$(".match-card").forEach((card) => {
        card.classList.toggle("hidden", g !== "ALL" && card.dataset.game !== g);
      });
      $$(".rail").forEach((rail) => { rail.scrollLeft = 0; });
    });
  });

  /* Play Your Game */
  const playTag = $("#playGameTag");
  const playChar = $("#playChar");
  $$(".game-switch").forEach((btn) => {
    if (btn.dataset.art) {
      const preload = new Image();
      preload.src = btn.dataset.art;
    }
    btn.addEventListener("click", () => {
      $$(".game-switch").forEach((b) => {
        b.classList.remove("is-selected");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-selected");
      btn.setAttribute("aria-selected", "true");
      if (playTag) playTag.textContent = btn.dataset.game;
      if (playChar && btn.dataset.art) {
        playChar.classList.add("is-swap");
        const next = btn.dataset.art;
        const apply = () => {
          playChar.src = next;
          playChar.alt = btn.dataset.game;
          playChar.classList.remove("is-swap");
        };
        setTimeout(apply, 160);
      }
    });
  });

  /* How To Play */
  const modes = {
    solo: {
      n: "01", art: "assets/modes/solo.webp",
      title: "SOLO — LAST ONE STANDING",
      text: "Drop alone, trust no one. Highest placement and kills win the pool. Perfect for players who want every frag credited to their own name.",
      size: "1 player", match: "18–24 min", entry: "50 BAC",
    },
    duo: {
      n: "02", art: "assets/modes/duo.webp",
      title: "DUO — WATCH EACH OTHER'S SIX",
      text: "You and one partner against the lobby. Shared revives, split rewards, double the firepower on every rotation.",
      size: "2 players", match: "20–26 min", entry: "80 BAC",
    },
    squad: {
      n: "03", art: "assets/modes/squad.webp",
      title: "SQUAD — FOUR AS ONE",
      text: "Full four-stack warfare. Coordinate drops, hold compounds, and stack placement points as a unit.",
      size: "4 players", match: "22–30 min", entry: "120 BAC",
    },
    tdm: {
      n: "04", art: "assets/modes/tdm.webp",
      title: "TDM — TEAM DEATHMATCH",
      text: "Respawn-enabled arena brawls. First team to the frag cap takes the pot. Pure aim, zero downtime.",
      size: "6–8 players", match: "8–12 min", entry: "70 BAC",
    },
  };
  Object.values(modes).forEach((d) => { const img = new Image(); img.src = d.art; });
  const modeArtImg = $("#modeArtImg");
  const modeTitle = $("#modeTitle");
  const modeText = $("#modeText");
  const modeFacts = $("#modeFacts");
  $$(".mode-item").forEach((item) => {
    item.addEventListener("click", () => {
      $$(".mode-item").forEach((m) => {
        m.classList.remove("is-active");
        m.setAttribute("aria-selected", "false");
      });
      item.classList.add("is-active");
      item.setAttribute("aria-selected", "true");
      const d = modes[item.dataset.mode];
      if (!d) return;
      if (modeArtImg) {
        modeArtImg.style.opacity = "0";
        setTimeout(() => {
          modeArtImg.src = d.art;
          modeArtImg.style.opacity = "1";
        }, 160);
      }
      const kicker = document.querySelector(".mode-detail-copy .kicker");
      if (kicker) kicker.textContent = "MODE " + d.n;
      modeTitle.textContent = d.title;
      modeText.textContent = d.text;
      modeFacts.innerHTML = `
        <li><span>TEAM SIZE</span><b>${d.size}</b></li>
        <li><span>AVG MATCH</span><b>${d.match}</b></li>
        <li><span>ENTRY FROM</span><b class="gold">${d.entry}</b></li>`;
    });
  });

  /* Rules filter */
  $$(".filter-chips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$(".filter-chips .chip").forEach((c) => c.classList.remove("chip-active"));
      chip.classList.add("chip-active");
      const f = chip.dataset.filter;
      $$(".faq-item").forEach((item) => {
        const show = f === "all" || item.dataset.cat === f;
        item.classList.toggle("hidden", !show);
        if (!show) item.removeAttribute("open");
      });
    });
  });
  $$(".faq-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) $$(".faq-item").forEach((o) => { if (o !== item) o.removeAttribute("open"); });
    });
  });

  /* Active nav */
  const sections = ["top", "about", "howto", "rules"].map((id) => $("#" + id)).filter(Boolean);
  const navLinks = $$(".primary-nav a, .mobile-nav a");
  let lockNav = null;
  let lockTimer = 0;
  const setActiveNav = (id) => {
    navLinks.forEach((a) => {
      const on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  };
  const syncNav = () => {
    if (lockNav) return;
    const y = window.scrollY + 160;
    let current = "top";
    sections.forEach((s) => {
      const top = s.getBoundingClientRect().top + window.scrollY;
      if (top <= y) current = s.id;
    });
    setActiveNav(current);
  };
  navLinks.forEach((a) => {
    a.addEventListener("click", () => {
      const id = (a.getAttribute("href") || "").replace("#", "");
      if (!id) return;
      lockNav = id;
      setActiveNav(id);
      clearTimeout(lockTimer);
      lockTimer = setTimeout(() => {
        lockNav = null;
        syncNav();
      }, 900);
    });
  });
  window.addEventListener("scroll", syncNav, { passive: true });
  window.addEventListener("hashchange", () => {
    const id = (location.hash || "#top").slice(1);
    if (["top", "about", "howto", "rules"].includes(id)) setActiveNav(id);
    else syncNav();
  });
  window.addEventListener("load", syncNav);
  const bootHash = (location.hash || "#top").slice(1);
  if (["top", "about", "howto", "rules"].includes(bootHash)) {
    lockNav = bootHash;
    setActiveNav(bootHash);
    clearTimeout(lockTimer);
    lockTimer = setTimeout(() => {
      lockNav = null;
      syncNav();
    }, 1000);
  } else {
    syncNav();
  }

  /* Pause hero video if reduced motion */
  const video = $(".hero-video");
  if (video && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    video.pause();
    video.removeAttribute("autoplay");
  }
})();
