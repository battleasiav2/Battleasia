# PC → Git → Coolify Auto Deploy (সহজ গাইড)

আপনার চাওয়া ফ্লো:

```
Cursor-এ কোড বদলান
        ↓
PC-তে অটো সেভ (Auto Save)
        ↓
এক কমান্ডে GitHub push
        ↓
Coolify অটো Deploy (GitHub App)
        ↓
https://battleasia.gg লাইভ
```

---

## ধাপ A — PC অটো সেভ (একবার)

Cursor → **File → Auto Save** → ✅ On  
অথবা Settings → `files.autoSave` = `afterDelay`

এতে টাইপ/এডিটের পর ফাইল নিজে সেভ হয়।

---

## ধাপ B — GitHub token (একবার)

1. GitHub → Settings → Developer settings → Personal access token (`repo` scope)
2. ফাইলে রাখুন (এক লাইন):

`deploy/.github-token.local`

```powershell
# Windows PowerShell — PC-তে
notepad c:\Users\sumon\Desktop\battleasianew\deploy\.github-token.local
```

চ্যাটে token পাঠাবেন না।

---

## ধাপ C — Coolify অটো deploy (একবার)

| Check | Value |
|-------|--------|
| Git Source | **battleasia** (GitHub App) — Public GitHub নয় |
| Branch | `main` |
| Commit | `HEAD` |
| Advanced | **Managed by your Git App** |

GitHub Settings → Webhooks-এ ভাঙা/401 URL থাকলে **Delete**।

---

## ধাপ D — প্রতিদিনের কাজ (আপনি শুধু এটা)

### 1) Cursor-এ কোড বদলান  
Auto Save নিজেই সেভ করবে।

### 2) PC PowerShell — এক লাইন ship

```powershell
cd c:\Users\sumon\Desktop\battleasianew
.\deploy\ship.ps1
```

এটা করবে: `git add` → `commit` → `push` → GitHub `main`

### ৩) Coolify  
১–৩ মিনিট পর **Deployment Logs**-এ নতুন job (Source: Webhook)।  
না এলে UI-তে একবার **Deploy** চাপুন।

---

## চেকলিস্ট — অটো কাজ করছে কিনা

| ধাপ | কীভাবে বুঝবেন |
|-----|----------------|
| Auto Save | Cursor ট্যাবে সাদা ডট/unsaved চিহ্ন দ্রুত মিলবে |
| Git push | `.\deploy\ship.ps1` শেষে `Done.` |
| Coolify | Deployment Logs → নতুন commit + Webhook |

---

## Coolify Terminal (শুধু চেক)

```bash
# সার্ভিস চলছে কিনা
docker ps --format 'table {{.Names}}\t{{.Status}}'
```

Deploy trigger (পুরো URL + token লাগবে — Advanced থেকে copy):

```bash
curl -fsS 'PASTE_FULL_DEPLOY_WEBHOOK_URL_WITH_TOKEN'
```

Token ছাড়া → **401**। সহজ: UI **Deploy**।

---

## করবেন না

- প্রতি কীস্ট্রোকে auto commit (খারাপ history)
- GitHub-এ Coolify Deploy webhook URL ভুলে paste (401)
- `.env` / token commit

---

## ফাইল

| File | কাজ |
|------|-----|
| `deploy/ship.ps1` | Local → GitHub এক কমান্ড |
| `deploy/git-push.ps1` | শুধু push |
| `deploy/PC-GIT-COOLIFY-AUTO-BN.md` | এই গাইড |
| `deploy/COOLIFY-BN.md` | Coolify full setup |

---

**সংক্ষেপে:** Auto Save ON → কাজ শেষে `.\deploy\ship.ps1` → Coolify নিজে Deploy।
