import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const srcCss = path.resolve(root, '../_import-5173/battleasia-full-project/artifacts/battleasia/src/index.css');
const srcTsx = path.resolve(root, '../_import-5173/battleasia-full-project/artifacts/battleasia/src/App.tsx');
const outCss = path.join(root, 'src/styles/landing-5173.css');
const outTsx = path.join(root, 'src/pages/Landing5173.tsx');

function scopeCss(raw) {
  const importLines = [];
  const body = raw
    .replace(/^@import\s+'tailwindcss';\s*$/m, '')
    .replace(/^@import\s+'tw-animate-css';\s*$/m, '')
    .replace(/^@import[^\n]*\n/gm, (line) => {
      importLines.push(line.trim());
      return '';
    });
  let src = body;
  let i = 0;
  const len = src.length;
  let out = '';

  function skipSpace(buf) {
    let n = 0;
    while (i + n < len && /\s/.test(src[i + n])) n += 1;
    if (buf) out += src.slice(i, i + n);
    i += n;
  }
  function readComment() {
    const end = src.indexOf('*/', i + 2);
    const chunk = src.slice(i, end + 2);
    i = end + 2;
    return chunk;
  }
  function readUntilBrace() {
    let chunk = '';
    while (i < len) {
      if (src.startsWith('/*', i)) {
        chunk += readComment();
        continue;
      }
      if (src[i] === '{') return chunk;
      chunk += src[i];
      i += 1;
    }
    return chunk;
  }
  function readBalanced() {
    let depth = 1;
    let chunk = '';
    i += 1;
    while (i < len && depth > 0) {
      if (src.startsWith('/*', i)) {
        chunk += readComment();
        continue;
      }
      const ch = src[i];
      if (ch === '{') depth += 1;
      else if (ch === '}') depth -= 1;
      if (depth === 0) {
        i += 1;
        return chunk;
      }
      chunk += ch;
      i += 1;
    }
    return chunk;
  }
  function prefixSelector(sel) {
    const rawSel = sel.trim();
    if (!rawSel || rawSel.startsWith('@')) return rawSel;
    if (rawSel === 'from' || rawSel === 'to' || /^\d/.test(rawSel)) return rawSel;
    if (rawSel.startsWith('html.has-gaming-cursor')) return rawSel;
    if (rawSel.startsWith('html[lang')) return `${rawSel} .ba5173`;
    if (rawSel === ':root' || rawSel === 'html' || rawSel === 'body') return '.ba5173';
    if (rawSel === '*') return '.ba5173, .ba5173 *';
    if (rawSel.startsWith('.ba5173')) return rawSel;
    return `.ba5173 ${rawSel}`;
  }
  function prefixList(list) {
    return list
      .split(',')
      .map((part) => prefixSelector(part))
      .join(',');
  }
  function transformBlock() {
    while (i < len) {
      skipSpace(true);
      if (i >= len) return;
      if (src[i] === '}') {
        out += '}';
        i += 1;
        return;
      }
      if (src.startsWith('/*', i)) {
        out += readComment();
        continue;
      }
      if (src.startsWith('@property', i) || src.startsWith('@keyframes', i) || src.startsWith('@-webkit-keyframes', i)) {
        const head = readUntilBrace();
        const block = readBalanced();
        out += `${head}{${block}}`;
        continue;
      }
      if (src[i] === '@') {
        const head = readUntilBrace();
        out += `${head}{`;
        i += 1;
        transformBlock();
        continue;
      }
      const selector = readUntilBrace();
      const block = readBalanced();
      out += `${prefixList(selector)}{${block}}`;
    }
  }
  transformBlock();
  const fonts =
    "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap');\n";
  const extra = `
html[lang="zh"] .ba5173 { --app-font-sans: 'Noto Sans SC', 'Inter', system-ui, sans-serif; }
html[lang="hi"] .ba5173 { --app-font-sans: 'Noto Sans Devanagari', 'Inter', system-ui, sans-serif; }
html[lang="ur"] .ba5173 { --app-font-sans: 'Noto Nastaliq Urdu', 'Inter', system-ui, sans-serif; }
.ba5173 img.bac-coin-icon, .ba5173 img.brand-logo { max-width: none; display: inline-block; }
`;
  return `${fonts}${out}${extra}`;
}

function removeEffect(source, needle) {
  const idx = source.indexOf(needle);
  if (idx < 0) throw new Error(`missing effect ${needle}`);
  const start = source.lastIndexOf('useEffect(', idx);
  const brace = source.indexOf('{', source.indexOf('=>', start));
  let depth = 0;
  for (let j = brace; j < source.length; j += 1) {
    if (source[j] === '{') depth += 1;
    else if (source[j] === '}') {
      depth -= 1;
      if (depth === 0) {
        let end = j + 1;
        if (source.slice(end, end + 2) === ');') end += 2;
        return source.slice(0, start) + source.slice(end);
      }
    }
  }
  throw new Error(`unbalanced ${needle}`);
}

if (process.argv.includes('--css-only')) {
  fs.writeFileSync(outCss, scopeCss(fs.readFileSync(srcCss, 'utf8')));
  console.log('css only', fs.statSync(outCss).size);
  process.exit(0);
}

let tsx = fs.readFileSync(srcTsx, 'utf8');
const textStart = tsx.indexOf('type Locale');
const gamesAt = tsx.indexOf('const games = [');
if (textStart < 0 || gamesAt < 0) throw new Error('text block not found');
tsx =
  tsx.slice(0, textStart) +
  `import { LANDING_LANG, landingText, readLandingLocale, type LandingLocale } from './landing5173-text';\ntype Locale = LandingLocale;\nconst text = landingText;\n` +
  tsx.slice(gamesAt);

tsx = tsx.replace(
  `import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowDownRight, ArrowLeft, ArrowRight, ChevronDown, Crosshair, Crown, Eye, EyeOff, Headphones, Menu, MessageCircle, ShieldCheck, Sparkles, Users, X, Zap } from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';
import { type ReactNode } from 'react';

const queryClient = new QueryClient();`,
  `import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, Crosshair, Crown, Eye, EyeOff, Headphones, Menu, MessageCircle, ShieldCheck, Sparkles, Users, X, Zap } from 'lucide-react';
import '../styles/landing-5173.css';
import { isApiError } from '../lib/api';
import { fetchAppDownload, formatApkSize } from '../lib/app-download';
import {
  checkEmailAvailable,
  clearSignedIn,
  forgotPassword,
  isSignedIn,
  markSignedIn,
  readSessionUser,
  resendVerification,
  resetPassword,
  safeReturnTo,
  signIn,
  signUp,
  verifyEmailSignup,
} from '../lib/auth';
import { fetchPublicDashboard } from '../lib/dashboard';
import { captureReferral } from '../lib/ref';`,
);

tsx = tsx.replace('function App() {', 'export function Landing5173({ chat = false }: { chat?: boolean }) {');
tsx = tsx.replace(
  "const [locale, setLocale] = useState<Locale>('EN');",
  'const [locale, setLocale] = useState<Locale>(readLandingLocale);\n  const navigate = useNavigate();',
);
tsx = tsx.replace(
  'const [logged, setLogged] = useState(false);',
  'const [logged, setLogged] = useState(isSignedIn);',
);
tsx = tsx.replace(
  'const [liveMatches, setLiveMatches] = useState(matchSeed);',
  `const [liveMatches, setLiveMatches] = useState<(typeof matchSeed[number] & { id?: string })[]>(matchSeed);
  const [gameOpen, setGameOpen] = useState<Record<string, number>>({});
  const [apkUrl, setApkUrl] = useState('');
  const [apkLabel, setApkLabel] = useState('Version 2.4.1 · 48 MB');
  const [returnPath, setReturnPath] = useState('/user/play');
  const playerName = readSessionUser()?.username || 'Player';`,
);

for (const needle of [
  'setLiveStats((prev)',
  'setTrustMetrics((prev)',
  'setArenaSeatsFilled((filled)',
  'setLiveMatches((prev)',
  'setProfitBoard((rows)',
]) {
  tsx = removeEffect(tsx, needle);
}

tsx = tsx.replace(
  `  useEffect(() => {
    document.documentElement.lang = locale === 'BN' ? 'bn' : 'en';
  }, [locale]);`,
  `  useEffect(() => {
    const lang = LANDING_LANG[locale];
    document.documentElement.lang = lang;
    try { localStorage.setItem('ba-lang', lang); } catch { /* ignore */ }
  }, [locale]);

  const chooseLocale = (id: Locale) => setLocale(id);

  useEffect(() => {
    captureReferral();
    const q = new URLSearchParams(window.location.search);
    const auth = q.get('auth');
    if (auth === 'signin' || auth === 'signup' || auth === 'otp' || auth === 'forgot' || auth === 'reset') setModal(auth);
    if (chat || q.get('chat') === '1') setChatOpen(true);
    const mail = q.get('email');
    if (mail) setEmail(mail);
    const back = safeReturnTo(q.get('returnTo'));
    if (q.get('returnTo')) setReturnPath(back);
    if (q.get('oauth') === 'failed') setToast('Sign-in was cancelled. Try again.');
  }, [chat]);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      try {
        const pulse = await fetchPublicDashboard();
        if (cancel) return;
        setLiveStats({
          players: pulse.playersOnline,
          matches: pulse.matchesToday,
          joins: pulse.todayJoins,
          totalMatches: pulse.matches,
          winningsBac: pulse.winnings,
          joinTrend: 0,
        });
        setArenaSeatsFilled(pulse.inSeats);
        const mapped = [...pulse.ongoingMatches, ...pulse.highPrizeMatches]
          .filter((m, index, arr) => m.id && arr.findIndex((row) => row.id === m.id) === index)
          .map((m) => ({
            id: m.id,
            name: m.matchName,
            game: m.gameName,
            entry: m.entryFee,
            prize: formatNumber(m.prizeEstimate),
            filled: m.participantsCount,
            capacity: Math.max(m.totalPlayer, 1),
          }));
        if (mapped.length) setLiveMatches(mapped);
        if (pulse.topProfit.length) setProfitBoard(pulse.topProfit.map((p) => ({ name: p.username, score: p.totalWinnings })));
        if (pulse.topKillers.length) setKillBoard(pulse.topKillers.map((p) => ({ name: p.username, score: p.totalKills })));
        const open: Record<string, number> = {};
        const alias: Record<string, RegExp> = {
          pubg: /pubg/i,
          fire: /free\\s*fire|freefire/i,
          cod: /call of duty|\\bcod\\b/i,
          mlbb: /mlbb|mobile legends/i,
          valorant: /valorant/i,
        };
        for (const [cls, re] of Object.entries(alias)) {
          const hit = Object.entries(pulse.openByGame).find(([name]) => re.test(name));
          open[cls] = hit ? hit[1] : 0;
        }
        setGameOpen(open);
      } catch { /* zip preview numbers stay if the API is down */ }
      try {
        const apk = await fetchAppDownload();
        if (cancel || !apk.downloadUrl) return;
        setApkUrl(apk.downloadUrl);
        const size = formatApkSize(apk.fileSize);
        const label = [apk.version ? \`v\${apk.version}\` : '', size].filter(Boolean).join(' · ');
        if (label) setApkLabel(label);
      } catch { /* keep the zip APK label */ }
    })();
    return () => { cancel = true; };
  }, []);`,
);

tsx = tsx.replace(
  `  const onJoin = () => logged ? notify('Arena is outside this demo.') : openAuth('signup');
  const onMatch = () => logged ? notify('Arena is outside this demo.') : openAuth('signin');
  const onGame = (disabled: boolean) => disabled ? notify('Valorant Mobile is coming soon.') : onMatch();`,
  `  const goArena = (path = '/user/play') => {
    if (!logged) { setReturnPath(path); openAuth('signin'); return; }
    navigate(path);
  };
  const onJoin = () => (logged ? navigate('/user/play') : openAuth('signup'));
  const onMatch = (id?: string) => goArena(id ? \`/user/play/\${id}/detail\` : '/user/play');
  const onGame = (disabled: boolean) => (disabled ? notify('Valorant Mobile is coming soon.') : goArena('/user/play'));`,
);

const authStart = tsx.indexOf('  const handleSignin = (event: FormEvent) => {');
const authEnd = tsx.indexOf('  const onOtpInput = ');
if (authStart < 0 || authEnd < 0) throw new Error('auth handlers not found');
tsx =
  tsx.slice(0, authStart) +
  `  const fail = (err: unknown) => setError(isApiError(err) ? err.message : 'Something went wrong. Try again.');
  const handleSignin = (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    if (password.length < 6) { setError('Enter your password to continue.'); return; }
    void signIn(email.trim(), password).then((user) => {
      markSignedIn(user);
      setLogged(true);
      closeModal();
      navigate(returnPath);
    }).catch(fail);
  };
  const handleSignupStep = (event: FormEvent) => {
    event.preventDefault();
    if (signupStep === 1) {
      if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
      if (password.length < 8) { setError('Use at least 8 characters for your password.'); return; }
      if (password !== confirm) { setError('Passwords do not match.'); return; }
      void checkEmailAvailable(email.trim()).then((row) => {
        if (!row.available) { setError(row.message || 'This email is already in use.'); return; }
        setError(''); setSignupStep(2);
      }).catch(fail);
      return;
    }
    if (!username.trim() || !gameId.trim() || !phone.trim()) { setError('Complete your player details to continue.'); return; }
    if (!terms) { setError('Please accept the terms to create your account.'); return; }
    const digits = phone.replace(/\\D/g, '');
    void signUp({
      email: email.trim(),
      username: username.trim(),
      password,
      pubgId: gameId.trim(),
      countryCode: '+880',
      mobileNo: digits.startsWith('880') ? digits.slice(3) : digits,
      phone: phone.trim(),
      gameServer: server,
    }).then(() => { setError(''); setModal('otp'); }).catch(fail);
  };
  const handleOtp = (event: FormEvent) => {
    event.preventDefault();
    if (otp.some((digit) => !digit)) { setError('Enter all six digits to verify.'); return; }
    void verifyEmailSignup(email.trim(), otp.join('')).then((user) => {
      markSignedIn(user);
      setLogged(true);
      closeModal();
      navigate(returnPath);
    }).catch(fail);
  };
  const handleForgot = (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    void forgotPassword(email.trim()).then(() => { setError(''); setOtp(['','','','','','']); setModal('reset'); }).catch(fail);
  };
  const handleReset = (event: FormEvent) => {
    event.preventDefault();
    if (otp.some((digit) => !digit)) { setError('Enter all six digits from your email.'); return; }
    if (password.length < 8 || password !== confirm) { setError('Use matching passwords with at least 8 characters.'); return; }
    void resetPassword(email.trim(), otp.join(''), password).then(() => {
      resetAuthFields();
      setModal('signin');
      notify('Password updated. Sign in.');
    }).catch(fail);
  };
  ` +
  tsx.slice(authEnd);

tsx = tsx.replace('<div className="site-shell" style={{ \'--accent-color\': accent } as CSSProperties}>', '<div className="ba5173"><div className="site-shell" style={{ \'--accent-color\': accent } as CSSProperties}>');
tsx = tsx.replace(
  `    </div>
  );
}

function RoutedErrorBoundary`,
  `    </div>
    </div>
  );
}
`,
);
const cut = tsx.indexOf('function RoutedErrorBoundary');
if (cut > 0) tsx = tsx.slice(0, cut);

tsx = tsx.replaceAll('setLocale(e.target.value as Locale)', 'chooseLocale(e.target.value as Locale)');
tsx = tsx.replaceAll('<option>EN</option><option>BN</option>', '<option value="EN">EN</option><option value="BN">BN</option><option value="ZH">中文</option><option value="HI">हिन्दी</option><option value="UR">اردو</option>');
tsx = tsx.replaceAll("notify('Arena is outside this demo.')", "navigate('/user/play')");
tsx = tsx.replace("setLogged(false); notify('Signed out of preview mode.')", "clearSignedIn(); setLogged(false); notify('Signed out.')");
tsx = tsx.replace('PlayerAvatar name="RafsanX"', 'PlayerAvatar name={playerName}');
tsx = tsx.replace('onClick={onMatch}', 'onClick={() => onMatch(match.id)}');
tsx = tsx.replaceAll('game.count===0', "game.cls==='valorant'");
tsx = tsx.replaceAll('game.count', '(gameOpen[game.cls] ?? game.count)');
tsx = tsx.replace("onClick={()=>notify('Google sign-in is demo-only.')}", "onClick={() => { window.location.href = `/api/v2/users/oauth/google?returnTo=${encodeURIComponent(returnPath)}` }}");
tsx = tsx.replace("onClick={()=>notify('Discord sign-in is demo-only.')}", "onClick={() => { window.location.href = `/api/v2/users/oauth/discord?returnTo=${encodeURIComponent(returnPath)}` }}");
tsx = tsx.replace('<span style={{color:\'#858991\',fontSize:10}}>Demo code: <b style={{color:\'#ddd\'}}>123456</b></span>', '<span />');
tsx = tsx.replace("onClick={()=>{setCooldown(60);notify('A new demo code has been sent.')}}", "onClick={()=>{ setCooldown(60); void resendVerification(email.trim()).then(() => notify('A new code has been sent.')).catch(fail); }}");
tsx = tsx.replace("onClick={()=>setCooldown(60)}", "onClick={()=>{ setCooldown(60); void forgotPassword(email.trim()).catch(fail); }}");
tsx = tsx.replace("onClick={()=>notify('APK download · v2.4.1 · 48 MB — demo only')}", "onClick={() => { if (apkUrl) window.location.href = apkUrl; }}");
tsx = tsx.replace('Version 2.4.1 · 48 MB', '{apkLabel}');
tsx = tsx.replace('<span>Preview · no real money</span>', '<span>Bangladesh & Asia</span>');
tsx = tsx.replace(/<label className="demo-toggle">[\s\S]*?<\/label>/, '');

fs.writeFileSync(outCss, scopeCss(fs.readFileSync(srcCss, 'utf8')));
fs.writeFileSync(outTsx, tsx);
console.log('css', fs.statSync(outCss).size, 'tsx', fs.statSync(outTsx).size);
