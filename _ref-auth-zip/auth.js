/* BattleAsia AUTH — production-identical account flow on the landing theme. */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const page = document.body.getAttribute("data-auth-page") || "";

  const KEYS = {
    accent: "ba-accent",
    lang: "ba-lang",
    remember: "ba_remember_email",
    referral: "battleasia_ref",
    session: "ba_auth_session",
    mockUsers: "ba_mock_users",
    mockResets: "ba_mock_resets",
  };

  const CONFIG = Object.assign(
    {
      apiBase: "",
      playPath: "../index.html#play",
      termsPath: "../index.html#rules",
      privacyPath: "../index.html#rules",
      stats: { activePlayers: "500K+", prizeMoney: "$2M+", matchRooms: "24/7" },
    },
    window.BA_AUTH_CONFIG || {}
  );

  const ACCENTS = {
    lime: { gold: "#cbfb24", rgb: "203,251,36", ink: "#081401" },
    gold: { gold: "#f5c518", rgb: "245,197,24", ink: "#111111" },
    ember: { gold: "#ff8a1a", rgb: "255,138,26", ink: "#140800" },
    jade: { gold: "#3dff8a", rgb: "61,255,138", ink: "#04140a" },
    cyan: { gold: "#22d3ee", rgb: "34,211,238", ink: "#041014" },
    sky: { gold: "#60a5fa", rgb: "96,165,250", ink: "#040a14" },
  };

  const GAME_SERVERS = [
    { value: "europe", label: "Europe" },
    { value: "asia", label: "Asia" },
    { value: "south-america", label: "South America" },
    { value: "middle-east", label: "Middle East" },
    { value: "krjp", label: "KRJP" },
  ];

  const PHONE_COUNTRIES = [
    { iso: "BD", dial: "880", min: 10, max: 10, label: "BD +880" },
    { iso: "IN", dial: "91", min: 10, max: 10, label: "IN +91" },
    { iso: "PK", dial: "92", min: 10, max: 10, label: "PK +92" },
    { iso: "NP", dial: "977", min: 10, max: 10, label: "NP +977" },
    { iso: "ID", dial: "62", min: 9, max: 12, label: "ID +62" },
    { iso: "MY", dial: "60", min: 9, max: 10, label: "MY +60" },
    { iso: "PH", dial: "63", min: 10, max: 10, label: "PH +63" },
    { iso: "SG", dial: "65", min: 8, max: 8, label: "SG +65" },
    { iso: "SA", dial: "966", min: 9, max: 9, label: "SA +966" },
    { iso: "AE", dial: "971", min: 9, max: 9, label: "AE +971" },
    { iso: "US", dial: "1", min: 10, max: 10, label: "US +1" },
    { iso: "GB", dial: "44", min: 10, max: 10, label: "GB +44" },
  ];

  const ICONS = {
    mail: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" d="M4 6h16v12H4z"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="m4 7 8 6 8-6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" d="M3 3l18 18M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.2M9.9 5.1A11 11 0 0 1 12 5c6 0 10 7 10 7a18 18 0 0 1-3.2 3.8M6.1 6.1C3.9 7.8 2 12 2 12s4 7 10 7c1.3 0 2.5-.2 3.6-.6"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="M5 19a7 7 0 0 1 14 0"/></svg>',
    pad: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3" y="8" width="18" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="M8 8V6a4 4 0 0 1 8 0v2M8 14h.01M16 14h.01"/></svg>',
    shield: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" d="M12 3 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6z"/></svg>',
    cup: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" d="M7 5h10v4a5 5 0 0 1-10 0V5zm10 1h2.5A2.5 2.5 0 0 1 17 8.5M7 6H4.5A2.5 2.5 0 0 0 7 8.5M8 20h8M12 14v6"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="M16 12h4v4h-4a2 2 0 0 1 0-4z"/></svg>',
    users: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="M3 19a6 6 0 0 1 12 0M17 8a2.5 2.5 0 1 0 0-5M21 19a5 5 0 0 0-6-4.8"/></svg>',
    medal: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><circle cx="12" cy="14" r="5" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="m8 4 4 4 4-4"/></svg>',
    check: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M3 8.2 6.2 11.4 13 4.6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M5 12h14m0 0-6-6m6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M19 12H5m0 0 6 6M5 12l6-6"/></svg>',
  };

  /* ---------- i18n ---------- */
  let dict = {};
  const t = (key) => {
    const parts = key.split(".");
    let cur = dict;
    for (const p of parts) cur = cur && cur[p];
    return typeof cur === "string" ? cur : key;
  };

  const applyI18n = () => {
    $$("[data-i18n]").forEach((el) => {
      const val = t(el.getAttribute("data-i18n"));
      if (el.hasAttribute("data-i18n-placeholder")) el.setAttribute("placeholder", val);
      else if (el.hasAttribute("data-i18n-aria")) el.setAttribute("aria-label", val);
      else el.textContent = val;
    });
    document.documentElement.lang = (localStorage.getItem(KEYS.lang) || "EN").toLowerCase() === "bn" ? "bn" : "en";
  };

  const loadI18n = async () => {
    const lang = (localStorage.getItem(KEYS.lang) || "EN").toUpperCase() === "BN" ? "bn" : "en";
    try {
      const res = await fetch(`../locales/auth-${lang}.json`, { cache: "no-store" });
      dict = await res.json();
    } catch (_) {
      dict = {};
    }
    applyI18n();
  };

  /* ---------- theme ---------- */
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
    try { localStorage.setItem(KEYS.accent, id); } catch (_) {}
  };

  const wireChrome = () => {
    applyAccent(localStorage.getItem(KEYS.accent) || "lime");
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
    document.addEventListener("click", () => closePopovers());
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePopovers(); });
    $$("[data-accent]").forEach((btn) =>
      btn.addEventListener("click", () => { applyAccent(btn.dataset.accent); closePopovers(); })
    );
    const setLang = async (code) => {
      try { localStorage.setItem(KEYS.lang, code); } catch (_) {}
      const el = $("#langCode");
      if (el) el.textContent = code;
      $$("[data-lang]").forEach((b) => b.classList.toggle("is-active", b.dataset.lang === code));
      await loadI18n();
    };
    $$("[data-lang]").forEach((btn) => btn.addEventListener("click", () => { setLang(btn.dataset.lang); closePopovers(); }));
    const savedLang = localStorage.getItem(KEYS.lang) || "EN";
    const el = $("#langCode");
    if (el) el.textContent = savedLang;
    $$("[data-lang]").forEach((b) => b.classList.toggle("is-active", b.dataset.lang === savedLang));
  };

  /* ---------- helpers ---------- */
  const toast = (msg) => {
    const n = $("#authToast");
    if (!n) return;
    n.textContent = msg;
    n.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => n.classList.remove("is-on"), 2800);
  };

  const qs = (k) => new URLSearchParams(location.search).get(k);
  const readJSON = (k, fb) => {
    try { return JSON.parse(localStorage.getItem(k)) || fb; } catch { return fb; }
  };
  const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };

  const getSession = () => readJSON(KEYS.session, null);
  const setSession = (session, user) => {
    writeJSON(KEYS.session, {
      accessToken: session?.accessToken || "",
      user: user || {},
      balance: user?.balance || 0,
    });
  };

  const safeReturnTo = (raw) => {
    if (!raw) return null;
    let value = raw.trim();
    try { value = decodeURIComponent(value); } catch (_) {}
    if (value.startsWith("#") && /^#[a-z0-9_-]+$/i.test(value)) return `../index.html${value}`;
    if (!value.startsWith("/")) return null;
    if (value.startsWith("//") || value.includes("://")) return null;
    if (/^\/(user|dashboard)\b/.test(value)) return value;
    if (value === "/" || value.startsWith("/index.html")) return `..${value === "/" ? "/index.html#play" : value}`;
    return null;
  };

  const goPlay = () => {
    location.href = safeReturnTo(qs("returnTo")) || CONFIG.playPath;
  };

  const setAlert = (kind, html) => {
    const box = $("#authAlert");
    if (!box) return;
    if (!html) { box.hidden = true; box.innerHTML = ""; return; }
    box.hidden = false;
    box.className = "auth-alert " + (kind === "ok" ? "auth-alert-ok" : "auth-alert-error");
    box.innerHTML = html;
  };

  const fieldError = (name, msg) => {
    const err = $(`[data-error-for="${name}"]`);
    const wrap = $(`[data-wrap="${name}"]`);
    if (err) err.textContent = msg || "";
    if (wrap) wrap.classList.toggle("is-invalid", Boolean(msg));
  };

  const clearErrors = () => {
    $$("[data-error-for]").forEach((el) => { el.textContent = ""; });
    $$("[data-wrap]").forEach((el) => el.classList.remove("is-invalid"));
  };

  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const parsePhone = (dial, national) => {
    const n = String(national || "").replace(/\D/g, "");
    const c = PHONE_COUNTRIES.find((x) => x.dial === dial);
    if (!c || n.length < c.min || n.length > c.max) return null;
    return { countryCode: dial, mobileNo: n, e164: `+${dial}${n}` };
  };

  const schema = {
    email: (v) => {
      if (!v) return t("auth.errors.emailRequired");
      if (!emailOk(v)) return t("auth.errors.emailInvalid");
      return "";
    },
    password: (v, min) => {
      if (!v) return t("auth.errors.passwordRequired");
      if (min && v.length < min) return t("auth.errors.passwordMin");
      return "";
    },
    confirm: (a, b) => {
      if (!b) return t("auth.errors.confirmRequired");
      if (a !== b) return t("auth.errors.passwordMatch");
      return "";
    },
    username: (v) => {
      if (!v) return t("auth.errors.usernameRequired");
      if (!/^[a-zA-Z0-9_]+$/.test(v)) return t("auth.errors.usernameFormat");
      return "";
    },
    pubgId: (v) => {
      const s = (v || "").trim();
      if (!s) return t("auth.errors.pubgRequired");
      if (s.length > 20) return t("auth.errors.pubgMax");
      if (!/^[a-zA-Z0-9]+$/.test(s)) return t("auth.errors.pubgFormat");
      return "";
    },
    code: (v) => {
      if (!v) return t("auth.errors.codeRequired");
      if (!/^\d{6}$/.test(v)) return t("auth.errors.codeLength");
      return "";
    },
  };

  /* ---------- API (live + mock) ---------- */
  const apiUrl = (path) => {
    const base = (CONFIG.apiBase || "").replace(/\/$/, "");
    return base ? `${base}/${path.replace(/^\//, "")}` : "";
  };

  const apiRequest = async (path, body) => {
    const url = apiUrl(path);
    if (!url) return mockRequest(path, body);
    const headers = { "Content-Type": "application/json" };
    const session = getSession();
    if (session?.accessToken) headers.authorization = `Bearer ${session.accessToken}`;
    let res;
    try {
      res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), credentials: "include" });
    } catch (err) {
      throw new Error(t("auth.errors.generic"));
    }
    let data = {};
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) {
      const err = new Error(data.message || t("auth.errors.generic"));
      err.data = data;
      throw err;
    }
    return data;
  };

  const mockUsers = () => readJSON(KEYS.mockUsers, {});
  const saveMockUsers = (u) => writeJSON(KEYS.mockUsers, u);
  const tokenFor = (email) => "ba_" + btoa(unescape(encodeURIComponent(email))).replace(/=+/g, "");

  const mockRequest = async (path, body) => {
    await new Promise((r) => setTimeout(r, 420));
    const users = mockUsers();
    if (path.includes("signin")) {
      const user = users[body.email.toLowerCase()];
      if (!user || user.password !== body.password) {
        const err = new Error(t("auth.errors.invalidCredentials"));
        err.data = { message: t("auth.errors.invalidCredentials") };
        throw err;
      }
      if (!user.verified) {
        const err = new Error("Email verification required");
        err.data = { emailVerificationRequired: true, email: user.email, message: "Email verification required" };
        throw err;
      }
      return { status: true, session: { accessToken: tokenFor(user.email) }, user: { _id: user.id, email: user.email, username: user.username, balance: 0 } };
    }
    if (path.includes("verify-email-signup")) {
      const user = users[(body.email || "").toLowerCase()];
      if (!user || body.code !== user.verifyCode) {
        const err = new Error("Invalid verification code");
        err.data = { message: "Invalid verification code" };
        throw err;
      }
      user.verified = true;
      saveMockUsers(users);
      return {
        status: true,
        emailVerified: true,
        session: { accessToken: tokenFor(user.email) },
        user: { _id: user.id, email: user.email, username: user.username, balance: 0 },
      };
    }
    if (path.includes("resend-verification-code")) {
      const user = users[(body.email || "").toLowerCase()];
      if (!user) {
        const err = new Error(t("auth.errors.generic"));
        err.data = { message: t("auth.errors.generic") };
        throw err;
      }
      user.verifyCode = "123456";
      saveMockUsers(users);
      return { status: true };
    }
    if (path.includes("signup")) {
      const email = body.email.toLowerCase();
      if (users[email] && users[email].verified) {
        const err = new Error("Email already registered");
        err.data = { message: "Email already registered" };
        throw err;
      }
      users[email] = {
        id: "u_" + Date.now(),
        email,
        password: body.password,
        username: body.username,
        countryCode: body.countryCode,
        mobileNo: body.mobileNo,
        pubgId: body.pubgId,
        gameServer: body.gameServer,
        referredBy: body.referredBy,
        verified: false,
        verifyCode: "123456",
      };
      saveMockUsers(users);
      return { status: true, emailVerificationRequired: true, email };
    }
    if (path.includes("forgot-password")) {
      const user = users[(body.email || "").toLowerCase()];
      const resets = readJSON(KEYS.mockResets, {});
      resets[(body.email || "").toLowerCase()] = "123456";
      writeJSON(KEYS.mockResets, resets);
      if (!user) return { status: true };
      return { status: true };
    }
    if (path.includes("verify-reset-code")) {
      const resets = readJSON(KEYS.mockResets, {});
      const ok = resets[(body.email || "").toLowerCase()] === body.code;
      if (!ok) {
        const err = new Error("Invalid verification code");
        err.data = { message: "Invalid verification code" };
        throw err;
      }
      return { status: true, codeValid: true };
    }
    if (path.includes("reset-password")) {
      const email = (body.email || "").toLowerCase();
      const resets = readJSON(KEYS.mockResets, {});
      if (resets[email] !== body.code) {
        const err = new Error("Invalid verification code");
        err.data = { message: "Invalid verification code" };
        throw err;
      }
      if (users[email]) users[email].password = body.newPassword;
      saveMockUsers(users);
      delete resets[email];
      writeJSON(KEYS.mockResets, resets);
      return { status: true };
    }
    return { status: false };
  };

  const api = {
    login: (data) => apiRequest("api/v2/users/signin", data),
    register: (data) => apiRequest("api/v2/users/signup", data),
    forgot: (email) => apiRequest("api/v2/users/forgot-password", { email }),
    verifyReset: (email, code) => apiRequest("api/v2/users/verify-reset-code", { email, code }),
    reset: (email, code, newPassword) => apiRequest("api/v2/users/reset-password", { email, code, newPassword }),
    verifySignup: (email, code) => apiRequest("api/v2/users/verify-email-signup", { email, code }),
    resend: (email) => apiRequest("api/v2/users/resend-verification-code", { email }),
  };

  const apiMessage = (err) => err?.data?.message || err?.message || t("auth.errors.generic");

  const setBusy = (btn, on, label) => {
    if (!btn) return;
    btn.disabled = on;
    if (on) {
      btn.dataset.label = btn.innerHTML;
      btn.innerHTML = `<span class="auth-spin" aria-hidden="true"></span> ${label}`;
    } else if (btn.dataset.label) {
      btn.innerHTML = btn.dataset.label;
    }
  };

  const wirePasswordToggles = () => {
    $$("[data-toggle-pass]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = document.getElementById(btn.getAttribute("data-toggle-pass"));
        if (!input) return;
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.innerHTML = show ? ICONS.eyeOff : ICONS.eye;
        btn.setAttribute("aria-label", show ? t("auth.hidePassword") : t("auth.showPassword"));
      });
    });
  };

  const wireSocial = () => {
    $$("[data-social]").forEach((btn) => {
      btn.addEventListener("click", () => toast(t("auth.socialComingSoon")));
    });
  };

  /* ---------- hero lazy ---------- */
  const mountHero = () => {
    const host = $("#authHero");
    if (!host) return;
    host.hidden = false;
    host.innerHTML = `
      <div class="auth-hero-inner">
        <img class="auth-hero-art" src="../assets/games/pubg.webp" alt="" loading="lazy" decoding="async" />
        <span class="auth-chip" data-i18n="auth.brandTagline">${t("auth.brandTagline")}</span>
        <h2 class="auth-hero-title">
          <span data-i18n="auth.heroHeadlineLine1">${t("auth.heroHeadlineLine1")}</span><br />
          <span class="gold" data-i18n="auth.heroHeadlineLine2">${t("auth.heroHeadlineLine2")}</span>
        </h2>
        <p class="auth-hero-copy" data-i18n="auth.heroDescription">${t("auth.heroDescription")}</p>
        <div class="auth-stats">
          <div class="auth-stat">
            <div class="auth-stat-k">${ICONS.users}<span data-i18n="auth.statActivePlayers">${t("auth.statActivePlayers")}</span></div>
            <div class="auth-stat-v">${CONFIG.stats.activePlayers}</div>
          </div>
          <div class="auth-stat">
            <div class="auth-stat-k">${ICONS.wallet}<span data-i18n="auth.statPrizesPaid">${t("auth.statPrizesPaid")}</span></div>
            <div class="auth-stat-v">${CONFIG.stats.prizeMoney}</div>
          </div>
          <div class="auth-stat">
            <div class="auth-stat-k">${ICONS.medal}<span data-i18n="auth.statMatchRooms">${t("auth.statMatchRooms")}</span></div>
            <div class="auth-stat-v">${CONFIG.stats.matchRooms}</div>
          </div>
        </div>
      </div>`;
  };

  /* ---------- pages ---------- */
  const signIn = () => {
    const form = $("#authForm");
    const remember = $("#rememberMe");
    try {
      const saved = localStorage.getItem(KEYS.remember);
      if (saved) {
        $("#email").value = saved;
        if (remember) remember.checked = true;
      }
    } catch (_) {}
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();
      setAlert();
      const email = $("#email").value.trim();
      const password = $("#password").value;
      const e1 = schema.email(email);
      const e2 = schema.password(password, 0);
      fieldError("email", e1);
      fieldError("password", e2);
      if (e1 || e2) return;
      const btn = form.querySelector("[type=submit]");
      setBusy(btn, true, t("auth.signIn") + "...");
      try {
        const data = await api.login({ email, password });
        if (!data.status || !data.session?.accessToken) throw new Error(data.message || t("auth.errors.generic"));
        try {
          if (remember?.checked) localStorage.setItem(KEYS.remember, email);
          else localStorage.removeItem(KEYS.remember);
        } catch (_) {}
        setSession(data.session, data.user || { email, username: email });
        goPlay();
      } catch (err) {
        if (err.data?.emailVerificationRequired) {
          const em = err.data.email || email;
          location.href = `./email-verification.html?email=${encodeURIComponent(em)}`;
          return;
        }
        setAlert("error", apiMessage(err));
      } finally {
        setBusy(btn, false);
      }
    });
  };

  const signUp = () => {
    const ref = qs("ref");
    if (ref) try { localStorage.setItem(KEYS.referral, ref); } catch (_) {}
    const cc = $("#countryCode");
    if (cc) {
      cc.innerHTML = PHONE_COUNTRIES.map((c) =>
        `<option value="${c.dial}" ${c.iso === "BD" ? "selected" : ""}>${c.label}</option>`
      ).join("");
    }
    const gs = $("#gameServer");
    if (gs) {
      gs.innerHTML =
        `<option value="" disabled selected>${t("auth.select")}</option>` +
        GAME_SERVERS.map((s) => `<option value="${s.value}">${s.label}</option>`).join("");
    }
    let step = 1;
    const showStep = (n, dir) => {
      step = n;
      const p1 = $('[data-step="1"]');
      const p2 = $('[data-step="2"]');
      p1.hidden = n !== 1;
      p2.hidden = n !== 2;
      p1.className = "auth-step-pane" + (n === 1 && dir === "back" ? " is-in-left" : "");
      p2.className = "auth-step-pane" + (n === 2 ? " is-in-right" : "");
      $$(".auth-step").forEach((el) => {
        const id = Number(el.dataset.stepId);
        el.classList.toggle("is-active", id === n);
        el.classList.toggle("is-done", id < n);
        const mark = el.querySelector(".auth-step-mark");
        if (mark) mark.innerHTML = id < n ? ICONS.check : "0" + id;
      });
      const line = $(".auth-step-line");
      if (line) line.classList.toggle("is-on", n > 1);
      const bar = $(".auth-progress > i");
      if (bar) bar.style.width = n === 1 ? "50%" : "100%";
    };
    $("#goNext")?.addEventListener("click", () => {
      setAlert();
      clearErrors();
      const email = $("#email").value.trim();
      const password = $("#password").value;
      const confirm = $("#confirmPassword").value;
      const e1 = schema.email(email);
      const e2 = schema.password(password, 8);
      const e3 = schema.confirm(password, confirm);
      fieldError("email", e1);
      fieldError("password", e2);
      fieldError("confirmPassword", e3);
      if (e1 || e2 || e3) return;
      showStep(2, "fwd");
    });
    $("#goBack")?.addEventListener("click", () => showStep(1, "back"));
    $("#authForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (step !== 2) {
        $("#goNext")?.click();
        return;
      }
      setAlert();
      clearErrors();
      const username = $("#inGameUserName").value.trim();
      const pubgId = $("#pubgId").value.trim();
      const mobile = $("#mobile").value;
      const dial = $("#countryCode").value;
      const server = $("#gameServer").value;
      const terms = $("#termsAccepted").checked;
      const u = schema.username(username);
      const p = schema.pubgId(pubgId);
      const phone = parsePhone(dial, mobile);
      fieldError("inGameUserName", u);
      fieldError("pubgId", p);
      fieldError("mobile", phone ? "" : t("auth.invalidPhone"));
      fieldError("gameServer", server ? "" : t("auth.errors.serverRequired"));
      fieldError("termsAccepted", terms ? "" : t("auth.errors.termsRequired"));
      if (u || p || !phone || !server || !terms) {
        if (!phone) setAlert("error", t("auth.invalidPhone"));
        return;
      }
      const btn = $("#authForm [type=submit]");
      setBusy(btn, true, t("auth.creatingAccount"));
      try {
        const data = await api.register({
          email: $("#email").value.trim(),
          password: $("#password").value,
          username,
          countryCode: phone.countryCode,
          mobileNo: phone.mobileNo,
          pubgId,
          gameServer: server,
          referredBy: localStorage.getItem(KEYS.referral) || undefined,
        });
        if (data.emailVerificationPending && data.email) {
          location.href = `./email-verification.html?email=${encodeURIComponent(data.email)}`;
          return;
        }
        if (!data.status) throw new Error(data.message || "Registration failed");
        if (data.emailVerificationRequired) {
          try { localStorage.removeItem(KEYS.referral); } catch (_) {}
          location.href = `./email-verification.html?email=${encodeURIComponent(data.email || $("#email").value.trim())}`;
          return;
        }
        throw new Error("Email verification is required for all new accounts");
      } catch (err) {
        if (err.data?.emailVerificationPending && err.data?.email) {
          location.href = `./email-verification.html?email=${encodeURIComponent(err.data.email)}`;
          return;
        }
        setAlert("error", apiMessage(err));
      } finally {
        setBusy(btn, false);
      }
    });
  };

  const forgot = () => {
    $("#authForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      setAlert();
      clearErrors();
      const email = $("#email").value.trim();
      const err = schema.email(email);
      fieldError("email", err);
      if (err) return;
      const btn = $("#authForm [type=submit]");
      setBusy(btn, true, t("common.sending") + "...");
      try {
        const data = await api.forgot(email);
        if (!data.status) throw new Error(data.message || "Failed to send reset code");
        setAlert("ok", `${t("auth.resetCodeSentSuccess")} <div style="margin-top:8px"><a class="auth-link" href="./reset-password.html?email=${encodeURIComponent(email)}">${t("auth.clickToEnterCode")}</a></div>`);
      } catch (ex) {
        setAlert("error", apiMessage(ex));
      } finally {
        setBusy(btn, false);
      }
    });
  };

  const reset = () => {
    const emailQ = qs("email") || "";
    const codeQ = qs("code") || qs("token") || "";
    if (emailQ) $("#email").value = emailQ;
    if (codeQ) $("#code").value = codeQ.slice(0, 6);
    let codeVerified = false;
    const revealPasswords = () => {
      $("#resetPassBlock").hidden = false;
      $("#verifyCodeBtn").hidden = true;
      $("#email").disabled = true;
      $("#code").disabled = true;
    };
    $("#verifyCodeBtn")?.addEventListener("click", async () => {
      setAlert();
      const email = $("#email").value.trim();
      const code = $("#code").value.trim();
      if (!email || !code) { setAlert("error", t("auth.errors.emailAndCode")); return; }
      const e1 = schema.email(email);
      const e2 = schema.code(code);
      fieldError("email", e1);
      fieldError("code", e2);
      if (e1 || e2) return;
      const btn = $("#verifyCodeBtn");
      setBusy(btn, true, t("auth.verifying") + "...");
      try {
        const data = await api.verifyReset(email, code);
        if (!data.status || !data.codeValid) throw new Error(data.message || "Invalid verification code");
        codeVerified = true;
        setAlert("ok", t("auth.codeVerifiedSuccess"));
        revealPasswords();
      } catch (ex) {
        codeVerified = false;
        setAlert("error", apiMessage(ex));
      } finally {
        setBusy(btn, false);
      }
    });
    $("#authForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      if ($("#resetPassBlock")?.hidden) {
        $("#verifyCodeBtn")?.click();
        return;
      }
      setAlert();
      const email = $("#email").value.trim();
      const code = $("#code").value.trim();
      const pw = $("#newPassword").value;
      const cf = $("#confirmPassword").value;
      const e1 = schema.email(email);
      const e2 = schema.code(code);
      const e3 = schema.password(pw, 8);
      const e4 = schema.confirm(pw, cf);
      fieldError("email", e1);
      fieldError("code", e2);
      fieldError("newPassword", e3);
      fieldError("confirmPassword", e4);
      if (e1 || e2 || e3 || e4) return;
      const btn = $("#authForm [type=submit]");
      setBusy(btn, true, t("auth.resetting") + "...");
      try {
        if (!codeVerified) {
          const v = await api.verifyReset(email, code);
          if (!v.status || !v.codeValid) throw new Error("Invalid verification code");
        }
        const data = await api.reset(email, code, pw);
        if (!data.status) throw new Error(data.message || "Failed to reset password");
        location.href = "./sign-in.html";
      } catch (ex) {
        setAlert("error", apiMessage(ex));
      } finally {
        setBusy(btn, false);
      }
    });
  };

  const verify = () => {
    const email = (qs("email") || "").trim();
    const missing = $("#verifyMissing");
    const ready = $("#verifyReady");
    if (!email) {
      if (missing) missing.hidden = false;
      if (ready) ready.hidden = true;
      setTimeout(() => { location.href = "./sign-up.html"; }, 3000);
      return;
    }
    if (missing) missing.remove();
    if (ready) ready.hidden = false;
    const slot = $("#verifyEmailSlot");
    if (slot) slot.textContent = email;
    let timeLeft = 900;
    let canResend = false;
    const timerEl = $("#verifyTimer");
    const resendBtn = $("#resendCode");
    const tick = () => {
      const m = Math.floor(timeLeft / 60);
      const s = String(timeLeft % 60).padStart(2, "0");
      if (timerEl) {
        timerEl.innerHTML = timeLeft > 0
          ? `${t("auth.timeRemaining")}: <strong>${m}:${s}</strong>`
          : t("auth.codeExpired");
      }
      if (resendBtn) {
        resendBtn.disabled = !canResend;
        resendBtn.textContent = canResend ? t("auth.resendCode") : t("auth.resendAfterTimer");
      }
    };
    tick();
    const onTick = () => {
      timeLeft -= 1;
      if (timeLeft <= 0) { timeLeft = 0; canResend = true; clearInterval(iv); }
      tick();
    };
    let iv = setInterval(onTick, 1000);
    resendBtn?.addEventListener("click", async () => {
      if (!canResend) return;
      setAlert();
      resendBtn.disabled = true;
      try {
        const data = await api.resend(email);
        if (!data.status) throw new Error(data.message || "Failed to resend code");
        setAlert("ok", t("auth.codeSent"));
        timeLeft = 900;
        canResend = false;
        clearInterval(iv);
        iv = setInterval(onTick, 1000);
        tick();
      } catch (ex) {
        setAlert("error", apiMessage(ex));
      }
    });
    $("#authForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      setAlert();
      const code = $("#code").value.trim();
      const err = schema.code(code);
      fieldError("code", err);
      if (err) return;
      const btn = $("#authForm [type=submit]");
      setBusy(btn, true, t("auth.verifying") + "...");
      try {
        const data = await api.verifySignup(email, code);
        if (!data.status || !data.emailVerified) throw new Error(data.message || "Invalid verification code");
        if (!data.session?.accessToken || !data.user) throw new Error("Session or user data is missing from response");
        setSession(data.session, data.user);
        goPlay();
      } catch (ex) {
        setAlert("error", apiMessage(ex));
      } finally {
        setBusy(btn, false);
      }
    });
  };

  /* ---------- boot ---------- */
  const boot = async () => {
    document.documentElement.classList.add("js");
    wireChrome();
    await loadI18n();
    if (getSession()?.accessToken && page !== "email-verification") {
      goPlay();
      return;
    }
    wirePasswordToggles();
    wireSocial();
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 80));
    idle(() => mountHero());
    if (page === "sign-in") signIn();
    if (page === "sign-up") signUp();
    if (page === "forgot") forgot();
    if (page === "reset") reset();
    if (page === "verify") verify();
  };

  boot();
})();
