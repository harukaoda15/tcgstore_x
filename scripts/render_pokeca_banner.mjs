import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function arg(name, fallback = '') {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && idx + 1 < process.argv.length) return process.argv[idx + 1];
  return fallback;
}

function escHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escCssUrl(s) {
  return String(s).replaceAll('"', '\\"').replaceAll('\\', '\\\\');
}

const img1 = arg('img1');
const img2 = arg('img2');
const img3 = arg('img3');
const title = arg('title', 'フリマ取引件数ランキング');
const subtitle = arg('subtitle', '注目カードはこちら！');
const out = arg('out', path.resolve('tmp_collage/generated/banner.png'));

if (!img1 || !img2 || !img3) {
  console.error('Missing required args: --img1 --img2 --img3');
  process.exit(1);
}

const cwd = process.cwd();
const logoPath = path.resolve(cwd, 'assets/tcgstore-logo.svg');
const outPath = path.resolve(cwd, out);
const outDir = path.dirname(outPath);
await fs.mkdir(outDir, { recursive: true });

const htmlPath = path.resolve(cwd, 'tmp_collage/generated/banner_render.html');
const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@700&family=Space+Mono:wght@700&display=swap" rel="stylesheet">
<style>
  html, body {
    margin:0;
    padding:0;
    width:600px;
    height:459px;
    overflow:hidden;
    background: transparent;
  }
  * { box-sizing: border-box; }
  .root {
    position: relative;
    width: 600px;
    height: 459px;
    background: linear-gradient(119.05deg, #FF732E 0%, #FA4573 52%, #5E54F2 100%);
    font-family: Inter, 'Hiragino Kaku Gothic ProN', sans-serif;
  }
  .glow { position:absolute; border-radius:999px; pointer-events:none; }
  .g1 { width:180px; height:180px; left:-40px; top:-70px; background:rgba(255,242,115,.45); filter: blur(12px); }
  .g2 { width:190px; height:190px; left:250px; top:-40px; background:rgba(89,242,255,.35); filter: blur(15px); }
  .g3 { width:230px; height:180px; left:120px; top:470px; background:rgba(255,115,191,.28); filter: blur(14px); }

  .header {
    position:absolute;
    width:549px;
    height:86px;
    left:20px;
    top:18px;
    background: rgba(40, 0, 81, 0.17);
    border: 1px solid rgba(255,255,255,0.36);
    backdrop-filter: blur(4px);
    border-radius: 18px;
  }
  .title {
    position:absolute;
    width:336px;
    left:132px;
    top:34px;
    font-weight:700;
    font-size:25px;
    line-height:30px;
    text-align:center;
    color:#fff;
  }
  .subtitle {
    position:absolute;
    width:336px;
    left:132px;
    top:70px;
    font-weight:700;
    font-size:15px;
    line-height:18px;
    text-align:center;
    color:#FFF7D1;
  }
  .rank {
    position:absolute;
    font-family:'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-weight:700;
    font-size:30px;
    line-height:44px;
    color:#fff;
  }
  .r1 { left:76px; top:111.5px; }
  .r2 { left:267.5px; top:111.5px; }
  .r3 { left:452.5px; top:111.5px; }

  .slot {
    position:absolute;
    width:170px;
    height:242px;
    top:156px;
    background:rgba(255,255,255,0.9);
    border-radius:12px;
    box-shadow: 0 6px 16px rgba(26,8,51,.28);
    overflow:hidden;
  }
  .s1 { left:21.5px; }
  .s2 { left:210px; }
  .s3 { left:398.5px; }
  .slot img {
    width:100%;
    height:100%;
    object-fit:cover;
    object-position:center 38%;
    transform: scale(1.08);
    display:block;
  }

  .hash {
    position:absolute;
    left:26px;
    top:422.5px;
    font-weight:700;
    font-size:20px;
    line-height:24px;
    color:#fff;
  }
  .logo {
    position:absolute;
    width:156px;
    height:22px;
    left:413px;
    top:422.5px;
  }
  .dot { position:absolute; border-radius:999px; }
  .d1{width:10px;height:10px;left:16px;top:138px;background:rgba(252,230,64,.9)}
  .d2{width:6px;height:6px;left:52px;top:124px;background:rgba(89,245,255,.9)}
  .d3{width:8px;height:8px;left:368px;top:128px;background:rgba(255,148,51,.9)}
  .d4{width:5px;height:5px;left:336px;top:112px;background:rgba(255,255,255,.9)}
  .d5{width:7px;height:7px;left:292px;top:126px;background:rgba(181,255,99,.9)}
  .d6{width:5px;height:5px;left:204px;top:118px;background:rgba(255,191,242,.9)}
</style>
</head>
<body>
  <div class="root">
    <div class="glow g1"></div><div class="glow g2"></div><div class="glow g3"></div>
    <div class="header"></div>
    <div class="title">${escHtml(title)}</div>
    <div class="subtitle">${escHtml(subtitle)}</div>
    <div class="rank r1">1st</div><div class="rank r2">2nd</div><div class="rank r3">3rd</div>
    <div class="slot s1"><img src="${escCssUrl(img1)}" /></div>
    <div class="slot s2"><img src="${escCssUrl(img2)}" /></div>
    <div class="slot s3"><img src="${escCssUrl(img3)}" /></div>
    <div class="hash">#ポケカ</div>
    <img class="logo" src="file://${logoPath}" />
    <div class="dot d1"></div><div class="dot d2"></div><div class="dot d3"></div>
    <div class="dot d4"></div><div class="dot d5"></div><div class="dot d6"></div>
  </div>
</body>
</html>`;

await fs.writeFile(htmlPath, html, 'utf8');

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
await execFileAsync(chrome, [
  '--headless=new',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=2',
  '--window-size=600,459',
  '--virtual-time-budget=5000',
  `--screenshot=${outPath}`,
  `file://${htmlPath}`,
]);

try {
  await execFileAsync('/opt/homebrew/bin/magick', [
    outPath,
    '-alpha',
    'off',
    '-fuzz',
    '1%',
    '-trim',
    '+repage',
    outPath,
  ]);
} catch {
  // keep original screenshot when magick is unavailable
}

console.log(outPath);
