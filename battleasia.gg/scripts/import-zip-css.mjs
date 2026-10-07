import { readFileSync, writeFileSync } from 'node:fs';

const src = new URL('../../_import-full-work/css/styles.css', import.meta.url);
const out = new URL('../src/styles/landing-full-work.css', import.meta.url);
let css = readFileSync(src, 'utf8');
css = css.replaceAll('url("../assets/', 'url("/assets/fw/');
css = css.replace(/^:root \{/m, '.landing-fw,\n.auth-page-fw {');
css = css.replace('html[lang="bn"] {', 'html[lang="bn"] .landing-fw,\nhtml[lang="bn"] .auth-page-fw {');
css = `/* Exact copy of BattleAsia-full-work.zip css/styles.css. Asset paths point at /assets/fw. Tokens live on .landing-fw so the arena app theme stays separate. */\n${css}`;
writeFileSync(out, css);
console.log('wrote landing-full-work.css', css.length);
