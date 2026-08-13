# PC → Git → Coolify Auto Deploy (সহজ গাইড)

```
Cursor-এ কোড বদলান
        ↓
PC-তে অটো সেভ (Auto Save)
        ↓
অটো Git push (watch চালু থাকলে)
        ↓
Coolify অটো Deploy (GitHub App)
        ↓
https://battleasia.gg লাইভ
```

---

## প্রতি পরিবর্তনেই Git কেন খারাপ?

| সমস্যা | কেন |
|--------|-----|
| শত শত ছোট commit | History নষ্ট |
| অর্ধেক কোড live | সাইট ভাঙতে পারে |
| Coolify বারবার build | RAM + ১০–২০ মিনিট spam |
| Secret ঝুঁকি | `.env` ভুলে push |
| GitHub limit | বেশি push = block |

**ভালো অটো:** সেভ অটো + **প্রতি ৩ মিনিট** পরিবর্তন থাকলে একবার Git।

---

## ধাপ A — Auto Save

Cursor → **File → Auto Save** → ✅ On

---

## ধাপ B — Token

`deploy/.github-token.local` এ GitHub PAT (এক লাইন)।

---

## ধাপ C — Coolify

Git Source = **battleasia** (GitHub App), Branch = `main`।

---

## ধাপ D — অটো Git (বারবার PowerShell লাগে না)

একবার চালু রাখুন:

```powershell
cd c:\Users\sumon\Desktop\battleasianew
.\deploy\auto-ship-watch.ps1
```

প্রতি ৩ মিনিট: পরিবর্তন থাকলে commit + push।  
বন্ধ: **Ctrl+C**

৫ মিনিট চাইলে:

```powershell
.\deploy\auto-ship-watch.ps1 -IntervalSeconds 300
```

---

## চেক

| ধাপ | বুঝবেন |
|-----|--------|
| Auto Save | unsaved ডট মিলবে |
| Auto Git | watch window: `Changes found → ship...` |
| Coolify | Deployment Logs → Webhook |

---

**সংক্ষেপে:** প্রতি কীস্ট্রোকে Git নয়। `auto-ship-watch.ps1` একবার চালু → সেভ + Git + Coolify অটো।
