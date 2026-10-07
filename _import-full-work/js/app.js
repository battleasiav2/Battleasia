(function () {
  const state = {
    locale: "en",
    accent: "#E5C558",
    loggedIn: false,
    previewUser: "NovaAce",
    signupStep: 1,
    otpCooldown: 0,
    otpTimer: null,
    lastScroll: 0,
    headerHidden: false,
    scrollMotionReady: false,
    kpiCounted: false
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function t(key, vars = {}) {
    let s = (window.BA_I18N[state.locale] || window.BA_I18N.en)[key] || key;
    Object.entries(vars).forEach(([k, v]) => {
      s = s.replace(`{${k}}`, v);
    });
    return s;
  }

  function applyI18n() {
    $$("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      el.textContent = t(key);
    });
    $$("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    document.documentElement.lang = state.locale === "bn" ? "bn" : "en";
    renderGames();
    renderMatches();
    renderLeaderboards();
    renderFaq();
  }

  function toast(msg) {
    const stack = $("#toast-stack");
    const node = document.createElement("div");
    node.className = "toast glass";
    node.textContent = msg;
    stack.appendChild(node);
    setTimeout(() => node.remove(), 3200);
  }

  function formatNum(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return n.toLocaleString();
    return String(n);
  }

  function bacIcon(sizeClass = "bac-coin--xs") {
    return `<img src="assets/bac-coin.webp" alt="" class="bac-coin ${sizeClass}" width="18" height="18" loading="lazy">`;
  }

  function bacAmount(text, sizeClass = "bac-coin--xs") {
    return `<span class="bac-unit">${bacIcon(sizeClass)}<span>${text}</span></span>`;
  }

  function playerPhoto(user, photo) {
    if (photo) return photo;
    const boards = window.BA_FIXTURES.leaderboards;
    const row = [...boards.profit, ...boards.killers].find((r) => r.user === user);
    return row?.photo || "assets/players/player-shadownova.jpg";
  }

  function avatarHtml(user, photo) {
    const src = playerPhoto(user, photo);
    return `<span class="avatar avatar--photo"><img src="${src}" alt="" width="36" height="36" loading="lazy" onerror="this.src='assets/logo-battleasia.png'"></span>`;
  }

  function renderChampion() {
    const c = window.BA_FIXTURES.champion;
    const root = $("#champion-card");
    if (!root || !c) return;
    $(".champion-photo", root).src = c.photo;
    $(".champion-name", root).textContent = c.user;
    $(".champion-game", root).textContent = c.game;
    $(".champion-wins", root).textContent = String(c.wins);
    $(".champion-payout", root).innerHTML = bacAmount(c.payout, "bac-coin--sm");
  }

  function countUp(el, target, duration = 1200) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = formatNum(target);
      return;
    }
    const start = performance.now();
    const from = 0;
    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.floor(from + (target - from) * eased);
      el.textContent = formatNum(val);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = formatNum(target);
    }
    requestAnimationFrame(frame);
  }

  function renderStats() {
    const f = window.BA_FIXTURES.stats;
    $("#apk-version").textContent = `v${f.apkVersion} · ${f.apkSizeMb} MB`;
    $$("[data-apk-meta]").forEach((el) => (el.textContent = `v${f.apkVersion} · ${f.apkSizeMb} MB`));
    const ring = $(".progress-ring .fg");
    if (ring) {
      const pct = f.arenaFilled / f.arenaCapacity;
      const target = 283 - 283 * pct;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.gsap) {
        ring.style.strokeDashoffset = String(target);
      } else {
        ring.style.strokeDashoffset = "283";
        ring.dataset.ringTarget = String(target);
      }
    }
    $("#arena-count").textContent = `${f.arenaFilled} / ${f.arenaCapacity}`;
  }

  function renderLeaderboards() {
    const wrapP = $("#lb-profit");
    const wrapK = $("#lb-killers");
    if (!wrapP) return;
    wrapP.innerHTML = window.BA_FIXTURES.leaderboards.profit
      .map((r) => {
        const amt = r.score.replace(/\s*BAC\s*$/i, "");
        return `<div class="lb-row reveal"><span class="lb-rank">${r.rank}</span>${avatarHtml(r.user, r.photo)}<span>${r.user}</span><span class="lb-score">${bacAmount(amt + " BAC", "bac-coin--xs")}</span></div>`;
      })
      .join("");
    wrapK.innerHTML = window.BA_FIXTURES.leaderboards.killers
      .map(
        (r) => `<div class="lb-row reveal"><span class="lb-rank">${r.rank}</span>${avatarHtml(r.user, r.photo)}<span>${r.user}</span><span class="lb-score">${r.score}</span></div>`
      )
      .join("");
    observeReveals(wrapP);
    observeReveals(wrapK);
  }

  function statusLabel(s) {
    if (s === "open") return t("statusOpen");
    if (s === "full") return t("statusFull");
    return t("statusComplete");
  }

  function renderMatches(filter = "high") {
    const rail = $("#match-rail");
    if (!rail) return;
    let list = [...window.BA_FIXTURES.matches];
    if (filter === "live") list = list.filter((m) => m.status === "open" || m.status === "full");
    else list.sort((a, b) => b.prize - a.prize);
    delete rail.dataset.revealBound;
    rail.innerHTML = list
      .map((m) => {
        const pct = (m.filled / m.cap) * 100;
        return `<article class="match-card card reveal" data-match-id="${m.id}">
          <h4>${m.name}</h4>
          <p class="match-meta">${m.game}</p>
          <div class="match-bar" data-pct="${pct}"><span style="width:0%"></span></div>
          <div class="match-foot">
            <span>${t("entryFee")}: ${bacAmount(m.fee + " BAC", "bac-coin--xs")}</span>
            <span>${t("prizePool")}: ${bacAmount(formatNum(m.prize), "bac-coin--xs")}</span>
          </div>
          <div class="match-foot" style="margin-top:8px"><span>${statusLabel(m.status)}</span><span>${m.filled}/${m.cap}</span></div>
        </article>`;
      })
      .join("");
    if (state.scrollMotionReady) animateMatchBars(rail);
    else {
      $$(".match-bar", rail).forEach((bar) => {
        const span = bar.querySelector("span");
        const pct = bar.dataset.pct;
        setTimeout(() => (span.style.width = pct + "%"), 200);
      });
    }
    $$(".match-card", rail).forEach((card) => {
      card.addEventListener("click", () => {
        if (!state.loggedIn) openModal("signin");
        else toast(t("toastMatch"));
      });
    });
    observeReveals(rail);
  }

  function renderGames() {
    const grid = $("#games-grid");
    if (!grid) return;
    grid.innerHTML = window.BA_FIXTURES.games
      .map((g) => {
        const badge = g.popular
          ? `<span class="badge">${t("popular")}</span>`
          : g.comingSoon
          ? `<span class="badge badge-soon">${t("comingSoon")}</span>`
          : "";
        const img = g.img
          ? `<img src="${g.img}" alt="" loading="lazy" width="400" height="275">`
          : `<div class="game-placeholder"></div>`;
        return `<article class="game-tile reveal ${g.disabled ? "is-disabled" : ""}" data-game="${g.id}" tabindex="0">
          ${badge}${img}
          <div class="game-overlay"><h3>${g.title}</h3><p>${t("openMatches", { n: g.open })}</p></div>
        </article>`;
      })
      .join("");
    initGameTilt();
    $$(".game-tile:not(.is-disabled)", grid).forEach((tile) => {
      tile.addEventListener("click", () => {
        if (!state.loggedIn) openModal("signup");
        else toast(t("toastMatch"));
      });
    });
    observeReveals(grid);
  }

  function renderFaq() {
    const list = $("#faq-list");
    if (!list) return;
    list.innerHTML = window.BA_FIXTURES.faq
      .map(
        (item, i) => `<div class="faq-item" data-topic="${item.topic}" data-index="${i}">
        <button type="button" class="faq-q" aria-expanded="false"><span>${t(item.qKey)}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>
        <div class="faq-a"><div class="faq-a-inner">${t(item.aKey)}</div></div>
      </div>`
      )
      .join("");
    initFaqAccordion();
    filterFaq($(".faq-chip.is-active")?.dataset.topic || "all");
  }

  function filterFaq(topic) {
    $$(".faq-item").forEach((item) => {
      const show = topic === "all" || item.dataset.topic === topic;
      item.classList.toggle("is-hidden", !show);
    });
  }

  function initFaqAccordion() {
    $$(".faq-item").forEach((item) => {
      const btn = $(".faq-q", item);
      const panel = $(".faq-a", item);
      btn.addEventListener("click", () => {
        const open = item.classList.contains("is-open");
        $$(".faq-item.is-open").forEach((other) => {
          if (other !== item) closeFaq(other);
        });
        if (open) closeFaq(item);
        else openFaq(item, panel, btn);
      });
    });
  }

  function openFaq(item, panel, btn) {
    item.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    panel.style.height = panel.scrollHeight + "px";
  }

  function closeFaq(item) {
    const panel = $(".faq-a", item);
    const btn = $(".faq-q", item);
    item.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    panel.style.height = "0";
  }

  function updateHeaderAuth() {
    const guest = $(".guest-btns");
    const user = $(".user-btns");
    if (state.loggedIn) {
      guest.hidden = true;
      user.hidden = false;
      $(".user-name").textContent = state.previewUser;
      const av = $(".user-avatar");
      if (av?.tagName === "IMG") {
        av.src = playerPhoto(state.previewUser);
        av.alt = state.previewUser;
      }
    } else {
      guest.hidden = false;
      user.hidden = true;
    }
    $("#preview-toggle").checked = state.loggedIn;
  }

  function openModal(name) {
    closeAllModals();
    const root = $(`#modal-${name}`);
    if (!root) return;
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const first = $('input:not([type="hidden"])', root);
    if (first) setTimeout(() => first.focus(), 100);
    trapFocus(root);
  }

  function closeModal(root) {
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    if (!$$(".modal-root.is-open").length) document.body.classList.remove("modal-open");
  }

  function closeAllModals() {
    $$(".modal-root.is-open").forEach(closeModal);
  }

  function trapFocus(modal) {
    const handler = (e) => {
      if (e.key === "Escape") {
        closeModal(modal);
        document.removeEventListener("keydown", handler);
      }
    };
    document.addEventListener("keydown", handler);
  }

  function showFormError(root, msg) {
    const banner = $(".form-error-banner", root);
    banner.textContent = msg;
    banner.classList.add("is-visible");
  }

  function clearFormErrors(root) {
    $(".form-error-banner", root)?.classList.remove("is-visible");
    $$(".field.is-invalid", root).forEach((f) => f.classList.remove("is-invalid"));
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function maskEmail(email) {
    const [u, d] = email.split("@");
    return `${u[0]}***@${d}`;
  }

  function startOtpCooldown(btn) {
    state.otpCooldown = 60;
    clearInterval(state.otpTimer);
    const tick = () => {
      if (state.otpCooldown <= 0) {
        clearInterval(state.otpTimer);
        btn.disabled = false;
        btn.textContent = t("sendCode");
        return;
      }
      btn.disabled = true;
      btn.textContent = t("resendIn", { n: state.otpCooldown });
      state.otpCooldown -= 1;
    };
    tick();
    state.otpTimer = setInterval(tick, 1000);
  }

  function setupOtpInputs(container, onComplete) {
    const inputs = $$("input", container);
    inputs.forEach((inp, i) => {
      inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/\D/g, "").slice(0, 1);
        if (inp.value && inputs[i + 1]) inputs[i + 1].focus();
        if (inputs.every((x) => x.value)) onComplete(inputs.map((x) => x.value).join(""));
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !inp.value && inputs[i - 1]) inputs[i - 1].focus();
      });
      inp.addEventListener("paste", (e) => {
        e.preventDefault();
        const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
        text.split("").forEach((ch, j) => {
          if (inputs[j]) inputs[j].value = ch;
        });
        if (text.length === 6) onComplete(text);
      });
    });
  }

  function setSignupStep(step) {
    state.signupStep = step;
    $$(".step-dot").forEach((d, i) => {
      d.classList.toggle("is-active", i + 1 === step);
      d.classList.toggle("is-done", i + 1 < step);
    });
    $("#signup-step-1").classList.toggle("is-hidden", step !== 1);
    $("#signup-step-2").classList.toggle("is-hidden", step !== 2);
  }

  function initAuth() {
    $$("[data-open-modal]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(el.dataset.openModal);
      });
    });
    $$("[data-close-modal]").forEach((el) => {
      el.addEventListener("click", () => closeAllModals());
    });
    $$(".modal-backdrop").forEach((bd) => {
      bd.addEventListener("click", () => closeAllModals());
    });

    $$(".pw-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = btn.previousElementSibling || btn.parentElement.querySelector("input");
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.textContent = show ? "Hide" : "Show";
      });
    });

    const signinForm = $("#form-signin");
    signinForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      clearFormErrors(signinForm.closest(".modal-root"));
      const email = $("#signin-email").value.trim();
      const pass = $("#signin-password").value;
      if (!validateEmail(email)) {
        $("#field-signin-email").classList.add("is-invalid");
        return;
      }
      if (email.includes("unverified")) {
        $("#otp-email-mask").textContent = maskEmail(email);
        openModal("otp");
        return;
      }
      if (email.includes("rate")) {
        showFormError(signinForm.closest(".modal-root"), "Too many attempts. Try again in 42s.");
        return;
      }
      if (pass.length < 6) {
        $("#field-signin-pass").classList.add("is-invalid");
        return;
      }
      closeAllModals();
      state.loggedIn = true;
      updateHeaderAuth();
      toast(t("toastSignedIn"));
    });

    const emailInput = $("#signup-email");
    let emailTimer;
    emailInput?.addEventListener("input", () => {
      const status = $("#email-status");
      status.textContent = t("checking");
      status.className = "email-status";
      clearTimeout(emailTimer);
      emailTimer = setTimeout(() => {
        const v = emailInput.value.trim();
        if (!validateEmail(v)) {
          status.textContent = "";
          return;
        }
        if (v.startsWith("taken")) {
          status.textContent = t("taken");
          status.className = "email-status bad";
        } else {
          status.textContent = t("available");
          status.className = "email-status ok";
        }
      }, 400);
    });

    $("#signup-password")?.addEventListener("input", (e) => {
      const v = e.target.value;
      const score = Math.min(100, v.length * 12 + (/[A-Z]/.test(v) ? 15 : 0) + (/[0-9]/.test(v) ? 15 : 0));
      $(".strength span").style.width = score + "%";
    });

    $("#btn-signup-continue")?.addEventListener("click", () => {
      clearFormErrors($("#modal-signup"));
      const email = emailInput.value.trim();
      const p1 = $("#signup-password").value;
      const p2 = $("#signup-confirm").value;
      if (!validateEmail(email)) $("#field-signup-email").classList.add("is-invalid");
      if (p1.length < 8) $("#field-signup-pass").classList.add("is-invalid");
      if (p1 !== p2) $("#field-signup-confirm").classList.add("is-invalid");
      if ($$("#modal-signup .field.is-invalid").length) return;
      setSignupStep(2);
    });

    $("#btn-signup-back")?.addEventListener("click", () => setSignupStep(1));

    $("#form-signup")?.addEventListener("submit", (e) => {
      e.preventDefault();
      clearFormErrors($("#modal-signup"));
      if (!$("#signup-terms").checked) {
        showFormError($("#modal-signup"), "Please accept Terms & Privacy.");
        return;
      }
      $("#otp-email-mask").textContent = maskEmail($("#signup-email").value.trim());
      closeAllModals();
      openModal("otp");
    });

    const otpRoot = $("#modal-otp");
    setupOtpInputs($("#otp-inputs"), (code) => {
      if (code === "000000") {
        $("#otp-inputs").classList.add("is-shake");
        setTimeout(() => $("#otp-inputs").classList.remove("is-shake"), 300);
        return;
      }
      closeAllModals();
      state.loggedIn = true;
      updateHeaderAuth();
      toast(t("toastSignedIn"));
    });
    const resendBtn = $("#otp-resend");
    resendBtn?.addEventListener("click", () => startOtpCooldown(resendBtn));
    startOtpCooldown(resendBtn);

    $("#form-forgot")?.addEventListener("submit", (e) => {
      e.preventDefault();
      closeAllModals();
      openModal("reset");
    });

    $("#form-reset")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const p1 = $("#reset-pass").value;
      const p2 = $("#reset-confirm").value;
      clearFormErrors($("#modal-reset"));
      if (p1.length < 8 || p1 !== p2) {
        $("#field-reset-confirm").classList.add("is-invalid");
        return;
      }
      closeAllModals();
      openModal("signin");
      toast("Password updated. Sign in.");
    });

    const ref = new URLSearchParams(location.search).get("ref");
    if (ref) $("#referral-banner").hidden = false;
  }

  function initHeader() {
    const header = $(".site-header");
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        header.classList.toggle("is-scrolled", y > 40);
        if (y > 120) {
          if (y > state.lastScroll && !state.headerHidden) {
            header.classList.add("is-hidden");
            state.headerHidden = true;
          } else if (y < state.lastScroll && state.headerHidden) {
            header.classList.remove("is-hidden");
            state.headerHidden = false;
          }
        } else header.classList.remove("is-hidden");
        state.lastScroll = y;
        const doc = document.documentElement;
        const pct = (y / (doc.scrollHeight - doc.clientHeight)) * 100;
        $(".scroll-progress").style.width = pct + "%";
        ticking = false;
      });
    });

    $$(".nav-desktop a, .drawer-nav a").forEach((link) => {
      link.addEventListener("click", () => closeDrawer());
    });

    const burger = $(".burger");
    const drawer = $(".mobile-drawer");
    const overlay = $(".drawer-overlay");
    burger?.addEventListener("click", () => {
      drawer.classList.add("is-open");
      overlay.classList.add("is-open");
    });
    function closeDrawer() {
      drawer?.classList.remove("is-open");
      overlay?.classList.remove("is-open");
    }
    overlay?.addEventListener("click", closeDrawer);
    window.closeDrawer = closeDrawer;

    $("#btn-signout")?.addEventListener("click", () => {
      state.loggedIn = false;
      updateHeaderAuth();
      toast("Signed out");
    });
    $("#btn-arena")?.addEventListener("click", () => toast(t("toastArena")));
    $$("[data-arena]").forEach((b) => b.addEventListener("click", () => toast(t("toastArena"))));

    $$(".accent-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        $$(".accent-chip").forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        state.accent = chip.dataset.color;
        document.documentElement.style.setProperty("--accent", state.accent);
      });
    });

    $("#locale-select")?.addEventListener("change", (e) => {
      state.locale = e.target.value;
      applyI18n();
    });

    $("#preview-toggle")?.addEventListener("change", (e) => {
      state.loggedIn = e.target.checked;
      updateHeaderAuth();
    });
  }

  function initScrollSpy() {
    const sections = ["home", "about-us", "play", "rules"].map((id) => document.getElementById(id)).filter(Boolean);
    const links = $$(".nav-desktop a, .drawer-nav a");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    sections.forEach((s) => obs.observe(s));
  }

  function initKpiCountOnScroll() {
    const kpiGrid = $(".kpi-grid");
    if (!kpiGrid) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || state.kpiCounted) return;
        state.kpiCounted = true;
        $$("[data-count]", kpiGrid).forEach((el) => countUp(el, Number(el.dataset.count)));
        io.disconnect();
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(kpiGrid);
  }

  function observeReveals(root = document) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const staggerMs = reduced ? 0 : 90;
    const ioOpts = { threshold: 0.12, rootMargin: "0px 0px -40px 0px" };

    const show = (el, delay = 0) => {
      if (!el || el.classList.contains("is-visible")) return;
      if (delay <= 0) {
        el.classList.add("is-visible");
        return;
      }
      setTimeout(() => el.classList.add("is-visible"), delay);
    };

    $$(".reveal-group", root).forEach((group) => {
      if (group.dataset.revealBound) return;
      group.dataset.revealBound = "1";
      const items = group.classList.contains("reveal-group-direct")
        ? [...group.children].filter((el) => el.classList.contains("reveal"))
        : $$(".reveal", group);
      if (!items.length) return;
      items.forEach((el) => {
        el.dataset.revealGrouped = "1";
      });
      if (reduced) {
        items.forEach((el) => show(el));
        return;
      }
      const io = new IntersectionObserver((entries, o) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          items.forEach((el, i) => show(el, i * staggerMs));
          o.disconnect();
        });
      }, ioOpts);
      io.observe(group);
    });

    $$(".reveal", root).forEach((el) => {
      if (el.dataset.revealGrouped === "1") return;
      if (el.dataset.revealBound) return;
      el.dataset.revealBound = "1";
      if (reduced) {
        show(el);
        return;
      }
      const io = new IntersectionObserver((entries, o) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(el);
          o.unobserve(el);
        });
      }, ioOpts);
      io.observe(el);
    });
  }

  function initGameTilt() {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    $$(".game-tile:not(.is-disabled)").forEach((tile) => {
      tile.addEventListener("mousemove", (e) => {
        const r = tile.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        tile.style.setProperty("--mx", x + "%");
        tile.style.setProperty("--my", y + "%");
        const rx = ((y - 50) / 50) * -8;
        const ry = ((x - 50) / 50) * 8;
        tile.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      tile.addEventListener("mouseleave", () => {
        tile.style.transform = "";
      });
    });
  }

  function initMatchTabs() {
    const tabs = $$(".match-tab");
    const underline = $(".tab-underline");
    function moveUnderline(el) {
      underline.style.width = el.offsetWidth + "px";
      underline.style.left = el.offsetLeft + "px";
    }
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        moveUnderline(tab);
        renderMatches(tab.dataset.tab);
      });
    });
    if (tabs[0]) moveUnderline(tabs[0]);
  }

  function initRailNav() {
    const rail = $("#match-rail");
    $(".rail-prev")?.addEventListener("click", () => rail.scrollBy({ left: -300, behavior: "smooth" }));
    $(".rail-next")?.addEventListener("click", () => rail.scrollBy({ left: 300, behavior: "smooth" }));
  }

  function initFaqChips() {
    $$(".faq-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        $$(".faq-chip").forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        filterFaq(chip.dataset.topic);
      });
    });
  }

  function initDevMode() {
    const bar = $(".demo-bar");
    if (!bar) return;
    if (new URLSearchParams(location.search).get("dev") === "1") bar.classList.remove("is-hidden");
    else bar.classList.add("is-hidden");
  }

  function initApkDownload() {
    const url = window.BA_FIXTURES.stats.apkDownloadUrl;
    $$("[data-apk-download]").forEach((el) => {
      if (url) {
        el.setAttribute("href", url);
        el.setAttribute("download", "");
      }
      el.addEventListener("click", (e) => {
        if (!url) {
          e.preventDefault();
          toast("APK path not configured.");
        }
      });
    });
  }

  function initFab() {
    const fab = $(".fab-social");
    $(".fab-main")?.addEventListener("click", () => fab.classList.toggle("is-open"));
    const chatPanel = $(".chat-panel");
    $(".chat-fab")?.addEventListener("click", () => chatPanel.classList.toggle("is-open"));
    $("#chat-send")?.addEventListener("click", () => {
      const input = $("#chat-text");
      const text = input.value.trim();
      if (!text) return;
      const body = $(".chat-body");
      body.innerHTML += `<div class="chat-msg user">${text}</div><div class="chat-msg bot">Thanks! A support agent will reply in the full app. Try FAQ for quick answers.</div>`;
      input.value = "";
      body.scrollTop = body.scrollHeight;
    });
  }

  function initMagnetic() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    $$(".btn-magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.08;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.08;
        btn.style.transform = `translate(${Math.max(-8, Math.min(8, dx))}px, ${Math.max(-8, Math.min(8, dy))}px)`;
      });
      btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
    });
  }

  function animateMatchBars(root) {
    if (!root || !window.gsap || !window.ScrollTrigger) return;
    $$(".match-bar", root).forEach((bar) => {
      const span = bar.querySelector("span");
      const pct = bar.dataset.pct;
      if (!span || bar.dataset.barAnimated) return;
      bar.dataset.barAnimated = "1";
      span.style.width = "0%";
      gsap.to(span, {
        width: pct + "%",
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: {
          trigger: bar.closest(".match-card") || bar,
          start: "top 88%",
          once: true
        }
      });
    });
  }

  function initScrollAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;
    state.scrollMotionReady = true;
    gsap.registerPlugin(ScrollTrigger);

    const hero = $(".hero");
    const heroMedia = $(".hero-bg .hero-media");
    if (hero && heroMedia.length) {
      gsap.to(heroMedia, {
        yPercent: 14,
        scale: 1.06,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.55
        }
      });
    }

    const heroMesh = $(".hero-mesh");
    if (hero && heroMesh) {
      gsap.to(heroMesh, {
        opacity: 0.35,
        y: 40,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.8
        }
      });
    }

    gsap.utils.toArray("main > section:not(#home)").forEach((section) => {
      gsap.from(section, {
        opacity: 0.92,
        y: 28,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 88%",
          once: true
        }
      });
    });

    const ring = $(".progress-ring .fg");
    if (ring && ring.dataset.ringTarget) {
      gsap.to(ring, {
        strokeDashoffset: Number(ring.dataset.ringTarget),
        duration: 1.35,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ring.closest(".hero-side") || ring,
          start: "top 85%",
          once: true
        }
      });
    }

    const kpiGrid = $(".kpi-grid");
    if (kpiGrid) {
      ScrollTrigger.create({
        trigger: kpiGrid,
        start: "top 82%",
        once: true,
        onEnter: () => {
          if (state.kpiCounted) return;
          state.kpiCounted = true;
          $$("[data-count]", kpiGrid).forEach((el) => countUp(el, Number(el.dataset.count)));
        }
      });
    }

    const champion = $("#champion-card");
    if (champion) {
      gsap.from(champion, {
        scale: 0.97,
        opacity: 0.85,
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: {
          trigger: champion,
          start: "top 85%",
          once: true
        }
      });
    }

    animateMatchBars($("#match-rail"));

    ScrollTrigger.refresh();
  }

  function initHeroVideo() {
    const cfg = window.BA_FIXTURES?.heroVideo;
    const wrap = $("#hero-bg");
    const video = $("#hero-video");
    const hero = $(".hero");
    if (!wrap || !video) return;

    const src = cfg?.mp4 || video.getAttribute("src");
    if (!src) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    if (video.getAttribute("src") !== src) video.src = src;

    const markReady = () => {
      wrap.classList.add("is-video-ready", "is-video-playing");
    };

    const tryPlay = () => {
      const play = video.play();
      if (play && typeof play.then === "function") {
        play.then(markReady).catch(() => {});
      }
    };

    video.addEventListener("loadeddata", markReady);
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("playing", markReady);
    video.addEventListener("error", () => {
      wrap.classList.remove("is-video-ready", "is-video-playing");
    });

    if (video.readyState >= 2) tryPlay();
    else video.load();

    if (hero) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) tryPlay();
          else video.pause();
        },
        { threshold: 0.08 }
      );
      io.observe(hero);
    }
  }

  function heroIntro() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ease = "cubic-bezier(.22,1,.36,1)";
    const words = $$(".hero-title .word-inner");
    const seq = $$(".hero-content .hero-seq");
    const side = $(".hero-side.hero-seq");

    const revealWord = (w, delay) => {
      if (!w) return;
      if (reduced) {
        w.style.transform = "none";
        return;
      }
      setTimeout(() => {
        w.style.transition = `transform 0.7s ${ease}`;
        w.style.transform = "translateY(0)";
      }, delay);
    };

    const revealSeq = (el, delay) => {
      if (!el) return;
      setTimeout(() => el.classList.add("is-in"), delay);
    };

    if (reduced) {
      seq.forEach((el) => el.classList.add("is-in"));
      side?.classList.add("is-in");
      words.forEach((w) => (w.style.transform = "none"));
      return;
    }

    const t0 = 180;
    const gap = 95;
    revealSeq(seq[0], t0);
    revealWord(words[0], t0 + gap);
    revealWord(words[1], t0 + gap + 85);
    revealSeq(seq[1], t0 + gap * 2);
    revealSeq(seq[2], t0 + gap * 3);
    revealSeq(seq[3], t0 + gap * 4);
    revealSeq(side, t0 + gap * 5);
    setTimeout(() => {
      if (state.scrollMotionReady) return;
      const ring = $(".progress-ring .fg");
      if (ring?.dataset.ringTarget) ring.style.strokeDashoffset = ring.dataset.ringTarget;
    }, t0 + gap * 5 + 400);
  }

  function loadMotionLibs() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const gsapScript = document.createElement("script");
    gsapScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    gsapScript.onload = () => {
      const st = document.createElement("script");
      st.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
      st.onload = () => {
        gsap.utils.toArray(".blob").forEach((blob, i) => {
          gsap.to(blob, {
            x: i % 2 ? 40 : -30,
            y: i % 2 ? -25 : 35,
            duration: 8 + i * 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        });
        gsap.utils.toArray(".hero-float").forEach((el, i) => {
          gsap.fromTo(el, { scale: 1.06, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, delay: 0.5 + i * 0.15 });
          gsap.to(el, { y: i % 2 ? -12 : 10, duration: 3 + i, repeat: -1, yoyo: true, ease: "sine.inOut" });
        });
        initScrollAnimations();
        if (window.__lenis) {
          window.__lenis.on("scroll", ScrollTrigger.update);
        }
      };
      document.body.appendChild(st);
    };
    document.body.appendChild(gsapScript);

    const lenisScript = document.createElement("script");
    lenisScript.src = "https://cdnjs.cloudflare.com/ajax/libs/lenis/1.1.13/lenis.min.js";
    lenisScript.onload = () => {
      const lenis = new Lenis({ smoothWheel: true });
      window.__lenis = lenis;
      lenis.on("scroll", () => {
        if (window.ScrollTrigger) ScrollTrigger.update();
      });
      function raf(t) {
        lenis.raf(t);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    };
    document.body.appendChild(lenisScript);
  }

  function nudgeLiveStats() {
    setInterval(() => {
      const s = window.BA_FIXTURES.stats;
      s.playersOnline += Math.floor(Math.random() * 17) - 5;
      s.matchesToday += Math.floor(Math.random() * 3);
      const po = $("#stat-players");
      const mt = $("#stat-matches");
      if (po) po.textContent = formatNum(s.playersOnline);
      if (mt) mt.textContent = formatNum(s.matchesToday);
    }, 45000);
  }

  function init() {
    renderStats();
    renderMatches();
    renderGames();
    renderLeaderboards();
    renderFaq();
    applyI18n();
    renderChampion();
    initDevMode();
    initApkDownload();
    initHeader();
    initAuth();
    initScrollSpy();
    initHeroVideo();
    observeReveals();
    initKpiCountOnScroll();
    initMatchTabs();
    initRailNav();
    initFaqChips();
    initFab();
    initMagnetic();
    heroIntro();

    const f = window.BA_FIXTURES.stats;
    const po = $("#stat-players");
    const mt = $("#stat-matches");
    setTimeout(() => {
      countUp(po, f.playersOnline);
      countUp(mt, f.matchesToday);
    }, 900);

    $$(".mode-card, .about-bullet").forEach((c) => {
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) c.classList.add("is-visible");
      });
      io.observe(c);
    });

    requestAnimationFrame(() => loadMotionLibs());
    nudgeLiveStats();
    updateHeaderAuth();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
