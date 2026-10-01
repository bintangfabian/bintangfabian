// SVG components for the profile README. Each function returns an Svg document for one theme.
import { Svg, measure, wrap, sparkle, brandIcon, rng, n } from './lib.mjs';
import { profile, focus, stack, projects, footer } from './content.mjs';

const W = 1200;

// ---------------------------------------------------------------- shared pieces

// Night-sky card used by the hero and footer.
function nightCard(s, t, w, h, glows) {
  s.defs.push(
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.canvas}"/><stop offset="1" stop-color="${t.canvas2}"/></linearGradient>`,
    `<clipPath id="clip"><rect width="${w}" height="${h}" rx="24"/></clipPath>`,
    ...glows.map((g, i) => `<radialGradient id="glow${i}"><stop offset="0" stop-color="${g.color}" stop-opacity="${g.opacity}"/><stop offset="1" stop-color="${g.color}" stop-opacity="0"/></radialGradient>`),
  );
  return [
    `<rect width="${w}" height="${h}" rx="24" fill="url(#bg)"/>`,
    `<g clip-path="url(#clip)">`,
    ...glows.map((g, i) => `<circle cx="${g.cx}" cy="${g.cy}" r="${g.r}" fill="url(#glow${i})"/>`),
  ];
}

function closeNightCard(t, w, h) {
  return [`</g>`, `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="23.5" fill="none" stroke="${t.border}"/>`];
}

function starfield(t, { w, h, count, seed, quiet = () => false }) {
  const rand = rng(seed);
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 0.5 + rand() * 1.2;
    const hush = quiet(x, y);
    const o = (0.12 + rand() * 0.5) * (hush ? 0.45 : 1);
    const twinkle = !hush && rand() < 0.35;
    const anim = twinkle ? ` class="tw" style="animation-duration:${n(3 + rand() * 4)}s;animation-delay:-${n(rand() * 6)}s"` : '';
    out.push(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${t.star}" opacity="${n(o)}"${anim}/>`);
  }
  return out.join('');
}

// Point on a rectangle's (padded) border, in the direction of `from`.
function edge(from, rect, gap = 10) {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const dx = from[0] - cx;
  const dy = from[1] - cy;
  const k = Math.min((rect.w / 2 + gap) / Math.abs(dx || 1e-9), (rect.h / 2 + gap) / Math.abs(dy || 1e-9));
  return [cx + dx * k, cy + dy * k];
}

function toward(a, b, dist) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [a[0] + ((b[0] - a[0]) / len) * dist, a[1] + ((b[1] - a[1]) / len) * dist];
}

// A glowing dot travelling along `path` forever.
function packet(color, path, dur, delay = 0) {
  return `<g opacity="0"><circle r="9" fill="url(#pg-${color.slice(1)})"/><circle r="2.6" fill="${color}"/>` +
    `<animateMotion dur="${dur}s" begin="${delay}s" repeatCount="indefinite" path="${path}"/>` +
    `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.8;1" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/></g>`;
}

function packetGlow(color) {
  return `<radialGradient id="pg-${color.slice(1)}"><stop offset="0" stop-color="${color}" stop-opacity=".55"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
}

function arc(cx, cy, r, a1, a2) {
  const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x1, y1] = p(a1);
  const [x2, y2] = p(a2);
  return `M${n(x1)} ${n(y1)}A${r} ${r} 0 0 1 ${n(x2)} ${n(y2)}`;
}

const ICONS = {
  arrow: (c, w = 1.8) => `<path d="M7 17L17 7M9 7h8v8" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`,
  mail: (c) => `<rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M4 7.5l8 5.5 8-5.5" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  pin: (c) => `<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="${c}" stroke-width="1.8"/>`,
};

function uiIcon(name, x, y, size, color) {
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(size / 24)})">${ICONS[name](color)}</g>`;
}

const delay = (s) => `animation-delay:${s}s`;

// ---------------------------------------------------------------- hero

export function hero(t) {
  const H = 470;
  const s = new Svg({
    width: W, height: H,
    title: `${profile.fullName} — ${profile.role}`,
    desc: `${profile.role} from ${profile.location}. A constellation links web, mobile and IoT around a star — "bintang" means star in Indonesian.`,
  });
  s.css.push(`
.bob1{animation:bob 7s ease-in-out infinite}
.bob2{animation:bob 6s ease-in-out -2s infinite}
.bob3{animation:bob 8s ease-in-out -4s infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.flow{stroke-dasharray:3 6;animation:flow 1.4s linear infinite}
@keyframes flow{to{stroke-dashoffset:-18}}
.breathe{transform-box:fill-box;transform-origin:center;animation:breathe 4.8s ease-in-out infinite}
@keyframes breathe{0%,100%{transform:scale(.9)}50%{transform:scale(1.06)}}
.halo{transform-box:fill-box;transform-origin:center;animation:halo 4.8s ease-in-out infinite}
@keyframes halo{0%,100%{opacity:.6;transform:scale(.9)}50%{opacity:1;transform:scale(1.08)}}
.orbit{transform-origin:960px 236px;animation:spin 26s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.6s cubic-bezier(0,0,.2,1) infinite}
@keyframes ping{0%{transform:scale(1);opacity:.7}80%,100%{transform:scale(2.8);opacity:0}}
.blink{animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.type{transform-box:fill-box;transform-origin:left center;animation:type 7s cubic-bezier(.6,0,.2,1) infinite}
@keyframes type{0%{transform:scaleX(0)}14%,84%{transform:scaleX(1);opacity:1}94%,100%{transform:scaleX(1);opacity:0}}
.bar{transform-box:fill-box;transform-origin:center bottom;animation:bar 3.4s ease-in-out infinite}
@keyframes bar{0%,100%{transform:scaleY(.5)}50%{transform:scaleY(1)}}
.trace{stroke-dasharray:90;stroke-dashoffset:90;animation:trace 5s ease-in-out infinite}
@keyframes trace{0%{stroke-dashoffset:90}40%,80%{stroke-dashoffset:0}100%{stroke-dashoffset:-90}}
.led{animation:led 1.8s ease-in-out infinite}
@keyframes led{0%,100%{opacity:.35}50%{opacity:1}}
.wave{opacity:0;animation:wave 2.4s ease-out infinite}
@keyframes wave{0%{opacity:0}30%{opacity:.9}100%{opacity:0}}
.shoot{opacity:0;animation:shoot 11s ease-in 2s infinite}
@keyframes shoot{0%{transform:translateX(0);opacity:0}1.5%{opacity:1}8%{transform:translateX(460px);opacity:0}100%{transform:translateX(460px);opacity:0}}
@media (prefers-reduced-motion:reduce){.wave{opacity:.6}.trace{stroke-dashoffset:0}}
`);
  s.defs.push(
    `<linearGradient id="brand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.blue}"/><stop offset="1" stop-color="${t.purple}"/></linearGradient>`,
    `<radialGradient id="starGlow"><stop offset="0" stop-color="${t.purple}" stop-opacity=".45"/><stop offset=".55" stop-color="${t.blue}" stop-opacity=".12"/><stop offset="1" stop-color="${t.blue}" stop-opacity="0"/></radialGradient>`,
    `<linearGradient id="tail" gradientUnits="userSpaceOnUse" x1="-110" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${t.star}" stop-opacity="0"/><stop offset="1" stop-color="${t.star}" stop-opacity=".95"/></linearGradient>`,
    packetGlow(t.blue), packetGlow(t.purple), packetGlow(t.teal),
  );

  s.add(...nightCard(s, t, W, H, [
    { cx: 960, cy: 236, r: 340, color: t.purple, opacity: t.glow },
    { cx: 780, cy: 110, r: 260, color: t.blue, opacity: t.glow * 0.6 },
  ]));
  s.add(starfield(t, { w: W, h: H, count: 95, seed: 7, quiet: (x, y) => x < 690 && y > 50 }));
  s.add(`<g transform="translate(640 34) rotate(24)"><g class="shoot"><line x1="-110" y1="0" x2="0" y2="0" stroke="url(#tail)" stroke-width="1.6" stroke-linecap="round"/><circle r="1.8" fill="${t.star}"/></g></g>`);

  // -- left: introduction
  const X = 76;
  const status = profile.status.toUpperCase();
  const statusW = measure(status, { font: 'mono', weight: 500, size: 14, ls: 2 });
  s.add(`<g class="fu" style="${delay(0.05)}">`,
    `<rect x="${X}" y="72" width="${n(statusW + 56)}" height="36" rx="18" fill="${t.chip}" stroke="${t.border}"/>`,
    `<circle cx="${X + 22}" cy="90" r="4.5" fill="${t.teal}"/><circle cx="${X + 22}" cy="90" r="4.5" fill="none" stroke="${t.teal}" class="ping"/>`,
    s.text(status, { x: X + 38, y: 95, font: 'mono', weight: 500, size: 14, ls: 2, fill: t.text2 }),
    `</g>`);

  let nameSize = 78;
  while (measure(profile.name, { weight: 800, size: nameSize, ls: -2 }) > 590) nameSize -= 2;
  const nameW = measure(profile.name, { weight: 800, size: nameSize, ls: -2 });
  s.add(s.text(profile.name, { x: X - 3, y: 194, weight: 800, size: nameSize, ls: -2, fill: t.text, cls: 'fu', style: delay(0.12) }));
  s.add(`<g class="fu" style="${delay(0.2)}"><path d="${sparkle(X + nameW + 22, 146, 13)}" fill="url(#brand)" class="breathe"/></g>`);

  s.add(s.text(profile.role, { x: X, y: 246, weight: 600, size: 30, ls: -0.4, fill: t.text, cls: 'fu', style: delay(0.28) }));
  profile.tagline.forEach((line, i) => {
    s.add(s.text(line, { x: X, y: 292 + i * 30, weight: 400, size: 21, fill: t.text2, cls: 'fu', style: delay(0.36 + i * 0.05) }));
  });

  let cx = X;
  focus.forEach((f, i) => {
    const w = 31 + measure(f.title, { weight: 500, size: 16 }) + 17;
    s.add(`<g class="fu" style="${delay(0.5 + i * 0.07)}">`,
      `<rect x="${n(cx)}" y="348" width="${n(w)}" height="38" rx="19" fill="${t.chip}" stroke="${t.border}"/>`,
      `<circle cx="${n(cx + 18)}" cy="367" r="4" fill="${t[f.accent]}"/>`,
      s.text(f.title, { x: cx + 31, y: 372.5, weight: 500, size: 16, fill: t.text2 }),
      `</g>`);
    cx += w + 10;
  });

  const meta = `${profile.location}   ·   ${profile.timezone}`;
  s.add(`<g class="fu" style="${delay(0.75)}">`, uiIcon('pin', X - 2, 414, 18, t.muted),
    s.text(meta, { x: X + 24, y: 428, font: 'mono', weight: 400, size: 15, ls: 0.4, fill: t.muted }), `</g>`);

  // -- right: the constellation (web, mobile and IoT around the star)
  const SC = [960, 236];
  const B = { x: 738, y: 66, w: 196, h: 126 };
  const P = { x: 1052, y: 132, w: 90, h: 160 };
  const C = { x: 800, y: 300, w: 92, h: 92 };
  const center = (r) => [r.x + r.w / 2, r.y + r.h / 2];
  const minors = [[1128, 62], [1110, 404], [714, 268]];

  const art = [];
  // faint outer constellation
  const ring = [[B, minors[0]], [minors[0], P], [P, minors[1]], [minors[1], C], [C, minors[2]], [minors[2], B]];
  for (const [a, b] of ring) {
    const pa = Array.isArray(a) ? a : edge(b, a, 8);
    const pb = Array.isArray(b) ? b : edge(a, b, 8);
    art.push(`<line x1="${n(pa[0])}" y1="${n(pa[1])}" x2="${n(pb[0])}" y2="${n(pb[1])}" stroke="${t.border}" stroke-width="1" stroke-dasharray="3 6"/>`);
  }
  for (const [mx, my] of minors) art.push(`<path d="${sparkle(mx, my, 5)}" fill="${t.star}" opacity=".7" class="tw"/>`);

  // flowing links from the star to each node
  const nodes = [[B, t.blue, 2.6], [P, t.purple, 3.2], [C, t.teal, 2.9]];
  nodes.forEach(([r, color, dur], i) => {
    const a = toward(SC, center(r), 36);
    const b = edge(SC, r, 12);
    const d = `M${n(a[0])} ${n(a[1])}L${n(b[0])} ${n(b[1])}`;
    art.push(`<path d="${d}" stroke="${color}" stroke-opacity=".75" stroke-width="2" stroke-linecap="round" class="flow"/>`);
    art.push(packet(color, d, dur, 0.6 + i * 0.5));
  });

  // the star
  art.push(`<circle cx="${SC[0]}" cy="${SC[1]}" r="80" fill="url(#starGlow)" class="halo"/>`,
    `<g class="orbit"><circle cx="${SC[0]}" cy="${SC[1]}" r="50" fill="none" stroke="${t.border}" stroke-dasharray="1 6"/><circle cx="${SC[0] + 50}" cy="${SC[1]}" r="3" fill="${t.blue}"/></g>`,
    `<path d="${sparkle(SC[0], SC[1], 28)}" fill="url(#brand)" class="breathe"/>`,
    `<path d="${sparkle(SC[0], SC[1], 9)}" fill="#ffffff" opacity=".9" class="breathe"/>`);

  // footnote: what the name means
  const noteW = measure(profile.meaning, { font: 'mono', weight: 400, size: 14, ls: 1.5 });
  art.push(`<path d="${sparkle(W - 40 - noteW - 15, 423, 7)}" fill="url(#brand)"/>`,
    s.text(profile.meaning, { x: W - 40, y: 428, font: 'mono', weight: 400, size: 14, ls: 1.5, anchor: 'end', fill: t.muted }));

  // web: a browser window typing code
  const codeLines = [[16, 46, 70, t.blue, 0.9], [28, 62, 104, t.purple, 0.75], [28, 78, 64, t.text2, 0.45], [16, 94, 120, t.teal, 0.75], [16, 110, 52, t.blue, 0.6]];
  art.push(`<g transform="translate(${B.x} ${B.y})"><g class="bob1">`,
    `<rect width="${B.w}" height="${B.h}" rx="14" fill="${t.raised}" stroke="${t.blue}" stroke-width="1.6"/>`,
    `<line x1="1" y1="30" x2="${B.w - 1}" y2="30" stroke="${t.border}"/>`,
    [16, 28, 40].map((x) => `<circle cx="${x}" cy="15" r="3.5" fill="${t.muted}" opacity=".6"/>`).join(''),
    `<rect x="58" y="9" width="118" height="12" rx="6" fill="${t.border}" opacity=".7"/>`,
    codeLines.map(([x, y, w, c, o], i) => `<rect x="${x}" y="${y}" width="${w}" height="7" rx="3.5" fill="${c}" opacity="${o}" class="type" style="${delay(i * 0.35)}"/>`).join(''),
    `<rect x="72" y="107" width="3" height="12" rx="1" fill="${t.text}" class="blink"/>`,
    `</g></g>`);

  // mobile: a phone with a live chart
  art.push(`<g transform="translate(${P.x} ${P.y})"><g class="bob2">`,
    `<rect width="${P.w}" height="${P.h}" rx="18" fill="${t.raised}" stroke="${t.purple}" stroke-width="1.6"/>`,
    `<rect x="33" y="9" width="24" height="5" rx="2.5" fill="${t.border}"/>`,
    `<circle cx="20" cy="33" r="7" fill="${t.purple}" opacity=".35"/>`,
    `<rect x="32" y="28" width="40" height="5" rx="2.5" fill="${t.text2}" opacity=".5"/><rect x="32" y="36" width="26" height="4" rx="2" fill="${t.muted}" opacity=".5"/>`,
    `<rect x="10" y="50" width="70" height="40" rx="8" fill="${t.purple}" opacity=".1"/>`,
    `<polyline points="16,80 26,72 36,76 46,64 56,68 66,58 74,62" fill="none" stroke="${t.purple}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="trace"/>`,
    [[16, 30], [32, 44], [48, 22], [64, 36]].map(([x, h], i) => `<rect x="${x}" y="${146 - h}" width="10" height="${h}" rx="3" fill="${t.purple}" opacity="${i % 2 ? 0.6 : 0.35}" class="bar" style="${delay(i * 0.4)}"/>`).join(''),
    `</g></g>`);

  // iot: a microcontroller broadcasting
  const pins = [22, 38, 54, 70];
  art.push(`<g transform="translate(${C.x} ${C.y})"><g class="bob3">`,
    pins.map((p) => `<path d="M${p} -8V0M${p} ${C.h}v8M-8 ${p}H0M${C.w} ${p}h8" stroke="${t.teal}" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>`).join(''),
    `<rect width="${C.w}" height="${C.h}" rx="12" fill="${t.raised}" stroke="${t.teal}" stroke-width="1.6"/>`,
    `<rect x="22" y="22" width="48" height="48" rx="8" fill="none" stroke="${t.teal}" stroke-opacity=".45"/>`,
    `<circle cx="46" cy="46" r="6" fill="${t.teal}" class="led"/><circle cx="46" cy="46" r="6" fill="none" stroke="${t.teal}" class="ping"/>`,
    [12, 20, 28].map((r, i) => `<path d="${arc(-14, 46, r, 140, 220)}" fill="none" stroke="${t.teal}" stroke-width="1.8" stroke-linecap="round" class="wave" style="${delay(i * 0.3)}"/>`).join(''),
    `</g></g>`);

  art.push(s.text('WEB', { x: B.x, y: B.y - 14, font: 'mono', weight: 500, size: 14, ls: 2.4, fill: t.blue }),
    s.text('MOBILE', { x: P.x, y: P.y - 14, font: 'mono', weight: 500, size: 14, ls: 2.4, fill: t.purple }),
    s.text('IOT', { x: C.x, y: C.y + C.h + 30, font: 'mono', weight: 500, size: 14, ls: 2.4, fill: t.teal }));

  s.add(`<g class="fi" style="${delay(0.3)}">`, ...art, `</g>`);
  s.add(...closeNightCard(t, W, H));
  return s;
}

// ---------------------------------------------------------------- contact buttons

export function button(t, link) {
  const label = link.label;
  const labelW = measure(label, { weight: 600, size: 16 });
  const w = Math.ceil(48 + labelW + 14 + 16 + 18);
  const h = 48;
  const s = new Svg({ width: w, height: h, title: label });
  const accent = { linkedin: t.blue, email: t.teal, instagram: t.purple }[link.id];
  s.add(`<rect x=".75" y=".75" width="${w - 1.5}" height="${h - 1.5}" rx="${h / 2 - 0.75}" fill="${t.surface}" stroke="${t.border}" stroke-width="1.5"/>`);
  s.add(link.icon === 'mail' ? uiIcon('mail', 19, 14, 20, accent) : brandIcon(link.icon, 20, 15, 18, accent));
  s.add(s.text(label, { x: 48, y: 30, weight: 600, size: 16, fill: t.text }));
  s.add(uiIcon('arrow', w - 34, 17, 14, t.muted));
  return s;
}

// ---------------------------------------------------------------- section headers

export function sectionHeader(t, sec) {
  const H = 128;
  const top = 28;
  const s = new Svg({ width: W, height: H, title: `${sec.no} — ${sec.title}` });
  const noW = measure(sec.no, { font: 'mono', weight: 500, size: 16, ls: 2 });
  s.add(`<g class="fu">`,
    s.text(sec.no, { x: 0, y: top + 30, font: 'mono', weight: 500, size: 16, ls: 2, fill: t.blue }),
    s.text(`/  ${sec.eyebrow}`, { x: noW + 10, y: top + 30, font: 'mono', weight: 500, size: 16, ls: 2, fill: t.muted }),
    `</g>`);
  s.add(s.text(sec.title, { x: -2, y: top + 84, weight: 700, size: 40, ls: -0.8, fill: t.text, cls: 'fu', style: delay(0.08) }));
  const x1 = measure(sec.title, { weight: 700, size: 40, ls: -0.8 }) + 34;
  const x2 = W - 26;
  s.add(`<line x1="${n(x1)}" y1="${top + 70}" x2="${x2}" y2="${top + 70}" stroke="${t.border}" stroke-width="1.5" class="draw" style="--len:${n(x2 - x1)}px;${delay(0.2)}"/>`);
  s.add(`<path d="${sparkle(W - 10, top + 70, 8)}" fill="${t.blue}" class="tw"/>`);
  return s;
}

// ---------------------------------------------------------------- what I do

export function focusCards(t) {
  const H = 300;
  const cardW = 384;
  const s = new Svg({ width: W, height: H, title: 'What I do', desc: focus.map((f) => `${f.title}: ${f.desc}`).join(' ') });
  s.css.push(`
.blink{animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.bar{transform-box:fill-box;transform-origin:center bottom;animation:bar 3s ease-in-out infinite}
@keyframes bar{0%,100%{transform:scaleY(.45)}50%{transform:scaleY(1)}}
.led{animation:led 1.8s ease-in-out infinite}
@keyframes led{0%,100%{opacity:.35}50%{opacity:1}}
.wave{opacity:0;animation:wave 2.4s ease-out infinite}
@keyframes wave{0%{opacity:0}30%{opacity:.9}100%{opacity:0}}
@media (prefers-reduced-motion:reduce){.wave{opacity:.6}}
`);
  const glyph = {
    web: (c) => `<rect x="40" y="43" width="36" height="30" rx="5" fill="none" stroke="${c}" stroke-width="2"/><line x1="40" y1="51" x2="76" y2="51" stroke="${c}" stroke-width="2"/>` +
      `<rect x="46" y="57" width="16" height="3.5" rx="1.75" fill="${c}" opacity=".7"/><rect x="46" y="63" width="10" height="3.5" rx="1.75" fill="${c}" opacity=".45"/><rect x="58" y="62" width="2.5" height="6" fill="${c}" class="blink"/>`,
    mobile: (c) => `<rect x="47" y="38" width="22" height="40" rx="5" fill="none" stroke="${c}" stroke-width="2"/>` +
      [[51, 9], [56, 14], [61, 6]].map(([x, h], i) => `<rect x="${x}" y="${71 - h}" width="3.5" height="${h}" rx="1.5" fill="${c}" class="bar" style="${delay(i * 0.35)}"/>`).join(''),
    iot: (c) => `<rect x="45" y="45" width="26" height="26" rx="5" fill="none" stroke="${c}" stroke-width="2"/>` +
      [51, 58, 65].map((p) => `<path d="M${p} 40v5M${p} 71v5M40 ${p}h5M71 ${p}h5" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`).join('') +
      `<circle cx="58" cy="58" r="3.5" fill="${c}" class="led"/>`,
  };
  focus.forEach((f, i) => {
    const x = i * (cardW + 24);
    const c = t[f.accent];
    const descLines = wrap(f.desc, cardW - 56, { weight: 400, size: 19 });
    s.add(`<g class="fu" style="${delay(i * 0.12)}"><g transform="translate(${x} 0)">`,
      `<rect x=".75" y=".75" width="${cardW - 1.5}" height="${H - 1.5}" rx="20" fill="${t.surface}" stroke="${t.border}" stroke-width="1.5"/>`,
      `<rect x="28" y="28" width="60" height="60" rx="16" fill="${c}" fill-opacity=".12" stroke="${c}" stroke-opacity=".35"/>`,
      glyph[f.id](c),
      s.text(f.label, { x: cardW - 28, y: 52, font: 'mono', weight: 500, size: 14, ls: 2.4, anchor: 'end', fill: c }),
      s.text(f.title, { x: 28, y: 136, weight: 700, size: 26, ls: -0.4, fill: t.text }),
      ...descLines.slice(0, 3).map((line, j) => s.text(line, { x: 28, y: 174 + j * 29, weight: 400, size: 19, fill: t.text2 })),
      s.text(f.tags.join(' · '), { x: 28, y: 270, font: 'mono', weight: 500, size: 14, ls: 1.2, fill: c }),
      `</g></g>`);
  });
  return s;
}

// ---------------------------------------------------------------- tech stack

export function stackCard(t) {
  const labelX = 34;
  const chipsX = 226;
  const maxX = W - 30;
  const chipH = 44;
  const gap = 10;
  const padY = 16;
  const rows = [];
  let y = 14;
  let index = 0;
  for (const group of stack) {
    const chips = [];
    let x = chipsX;
    let line = 0;
    for (const [label, slug] of group.items) {
      const w = 41 + measure(label, { weight: 500, size: 16 }) + 14;
      if (x + w > maxX) {
        x = chipsX;
        line += 1;
      }
      chips.push({ label, slug, x, line, w, index: index++ });
      x += w + gap;
    }
    const height = padY * 2 + (line + 1) * chipH + line * gap;
    rows.push({ group, chips, y, height });
    y += height;
  }
  const H = y + 14;
  const s = new Svg({ width: W, height: H, title: 'Tech stack', desc: stack.map((g) => `${g.label}: ${g.items.map((i) => i[0]).join(', ')}`).join('. ') });
  s.add(`<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="22" fill="${t.surface}" stroke="${t.border}" stroke-width="1.5"/>`);
  rows.forEach(({ group, chips, y: ry, height }, i) => {
    const accent = group.accent ? t[group.accent] : t.muted;
    if (i > 0) s.add(`<line x1="28" y1="${ry}" x2="${W - 28}" y2="${ry}" stroke="${t.hairline}" stroke-width="1.5"/>`);
    const midY = ry + padY + chipH / 2;
    s.add(`<circle cx="${labelX + 4}" cy="${midY}" r="4" fill="${accent}"/>`,
      s.text(group.label.toUpperCase(), { x: labelX + 18, y: midY + 5, font: 'mono', weight: 500, size: 14, ls: 1.6, fill: t.text2 }));
    for (const c of chips) {
      const cy = ry + padY + c.line * (chipH + gap);
      s.add(`<g class="fu" style="${delay(0.05 + c.index * 0.035)}">`,
        `<rect x="${n(c.x)}" y="${cy}" width="${n(c.w)}" height="${chipH}" rx="12" fill="${t.chip}" stroke="${t.border}"/>`,
        brandIcon(c.slug, c.x + 13, cy + 12, 20, group.accent ? accent : t.text2),
        s.text(c.label, { x: c.x + 41, y: cy + 28, weight: 500, size: 16, fill: t.text }),
        `</g>`);
    }
  });
  return s;
}

// ---------------------------------------------------------------- project cards

const PANEL_H = 220;

const art = {
  bhumi(s, t, a) {
    s.css.push(`
.grow{stroke-dasharray:100;stroke-dashoffset:100;animation:grow 7s ease-in-out infinite}
@keyframes grow{0%{stroke-dashoffset:100;opacity:1}24%,86%{stroke-dashoffset:0;opacity:1}96%,100%{stroke-dashoffset:0;opacity:0}}
.leafL{transform-origin:190px 112px;animation:leaf 7s ease-in-out infinite}
.leafR{transform-origin:191px 96px;animation:leaf 7s ease-in-out infinite}
@keyframes leaf{0%,22%{transform:scale(0);opacity:0}36%,86%{transform:scale(1);opacity:1}96%,100%{transform:scale(1);opacity:0}}
.chk{stroke-dasharray:10;stroke-dashoffset:10;animation:chk 7s ease infinite}
@keyframes chk{0%,30%{stroke-dashoffset:10}38%,88%{stroke-dashoffset:0}96%,100%{stroke-dashoffset:10}}
.prog{transform-box:fill-box;transform-origin:left center;animation:prog 7s ease-in-out infinite}
@keyframes prog{0%,30%{transform:scaleX(.22)}60%,90%{transform:scaleX(.68)}100%{transform:scaleX(.22)}}
@media (prefers-reduced-motion:reduce){.grow,.chk{stroke-dashoffset:0}.prog{transform:scaleX(.68)}}
`);
    return [
      `<line x1="110" y1="203" x2="270" y2="203" stroke="${t.border}" stroke-width="1.5" stroke-linecap="round"/>`,
      `<path d="M190 138C190 118 186 104 191 82" stroke="${t.teal}" stroke-width="3" stroke-linecap="round" fill="none" pathLength="100" class="grow"/>`,
      `<path d="M190 112C172 110 162 98 164 86C178 85 189 96 190 112Z" fill="${t.teal}" opacity=".9" class="leafL"/>`,
      `<path d="M191 96C205 86 219 88 224 76C209 70 195 79 191 96Z" fill="${t.teal}" opacity=".9" class="leafR"/>`,
      `<path d="M150 152H230L221 197Q220 202 215 202H165Q160 202 159 197Z" fill="${a}" fill-opacity=".14" stroke="${a}" stroke-width="1.6" stroke-linejoin="round"/>`,
      `<rect x="142" y="138" width="96" height="14" rx="5" fill="${t.raised}" stroke="${a}" stroke-width="1.6"/>`,
      `<path d="${sparkle(240, 84, 6)}" fill="${a}" class="tw"/>`,
      `<rect x="300" y="44" width="212" height="136" rx="14" fill="${t.raised}" stroke="${t.border}" stroke-width="1.5"/>`,
      s.text('DAY 14 · SEEDLING', { x: 318, y: 70, font: 'mono', weight: 500, size: 13, ls: 1.2, fill: t.text2 }),
      `<rect x="318" y="82" width="176" height="6" rx="3" fill="${t.border}"/><rect x="318" y="82" width="176" height="6" rx="3" fill="${a}" class="prog"/>`,
      ...[110, 86, 128].map((bw, i) => {
        const y = 104 + i * 24;
        return `<rect x="318" y="${y}" width="14" height="14" rx="4" fill="none" stroke="${t.border}" stroke-width="1.5"/>` +
          `<path d="M321 ${y + 7}l3 3 6-6" stroke="${a}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" pathLength="10" class="chk" style="${delay(i * 0.7)}"/>` +
          `<rect x="342" y="${y + 4}" width="${bw}" height="6" rx="3" fill="${t.text2}" opacity=".3"/>`;
      }),
    ];
  },

  talenta(s, t, a) {
    const P = 220;
    const pts = [];
    for (let x = 0; x <= 2 * P; x += 4) {
      const m = x % P;
      const y = 140 + 6 * Math.sin((2 * Math.PI * 6 * x) / P) + 4 * Math.sin((2 * Math.PI * 11 * x) / P + 1) - 20 * Math.exp(-((m - 150) ** 2) / 220);
      pts.push(`${n(308 + x)},${n(y)}`);
    }
    s.css.push(`
.scroll{animation:scroll 6s linear infinite}
@keyframes scroll{to{transform:translateX(-${P}px)}}
.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.6s cubic-bezier(0,0,.2,1) infinite}
@keyframes ping{0%{transform:scale(1);opacity:.7}80%,100%{transform:scale(3);opacity:0}}
.led{animation:led 1.8s ease-in-out infinite}
@keyframes led{0%,100%{opacity:.35}50%{opacity:1}}
`);
    s.defs.push(`<clipPath id="plot"><rect x="308" y="74" width="208" height="100"/></clipPath>`);
    return [
      `<path d="M0 220V178C60 150 110 92 190 86C240 82 262 120 292 160L320 220Z" fill="${a}" fill-opacity=".1"/>`,
      `<path d="M0 200C70 170 118 118 188 112C228 109 250 138 276 178" stroke="${a}" stroke-opacity=".45" stroke-width="1.4" stroke-dasharray="4 5" fill="none"/>`,
      `<path d="M0 214C80 192 130 150 186 140C220 136 238 156 256 190" stroke="${a}" stroke-opacity=".3" stroke-width="1.4" stroke-dasharray="4 5" fill="none"/>`,
      `<line x1="180" y1="88" x2="180" y2="110" stroke="${t.text2}" stroke-width="1.6"/><rect x="173" y="108" width="14" height="6" rx="2" fill="${t.text2}" opacity=".6"/>`,
      `<circle cx="180" cy="86" r="6" fill="${a}"/><circle cx="180" cy="86" r="6" fill="none" stroke="${a}" class="ping"/><circle cx="180" cy="86" r="6" fill="none" stroke="${a}" class="ping" style="${delay(1.3)}"/>`,
      `<rect x="292" y="36" width="240" height="150" rx="14" fill="${t.raised}" stroke="${t.border}" stroke-width="1.5"/>`,
      s.text('GROUND SENSOR', { x: 310, y: 62, font: 'mono', weight: 500, size: 12, ls: 1.2, fill: t.text2 }),
      `<rect x="440" y="47" width="76" height="20" rx="10" fill="${a}" fill-opacity=".14"/><circle cx="453" cy="57" r="3.5" fill="${a}" class="led"/>`,
      s.text('NORMAL', { x: 461, y: 61.5, font: 'mono', weight: 700, size: 11, ls: 0.8, fill: a }),
      ...[100, 124, 148].map((y) => `<line x1="308" y1="${y}" x2="516" y2="${y}" stroke="${t.hairline}" stroke-width="1.2" stroke-dasharray="2 4"/>`),
      `<line x1="308" y1="90" x2="516" y2="90" stroke="${a}" stroke-opacity=".5" stroke-dasharray="5 4"/>`,
      `<g clip-path="url(#plot)"><g class="scroll">`,
      `<polygon points="308,174 ${pts.join(' ')} ${308 + 2 * P},174" fill="${a}" fill-opacity=".08"/>`,
      `<polyline points="${pts.join(' ')}" fill="none" stroke="${a}" stroke-width="2" stroke-linejoin="round"/>`,
      `</g></g>`,
    ];
  },

  byplant(s, t, a) {
    s.css.push(`
.flow{stroke-dasharray:2 7;animation:flow 1.4s linear infinite}
@keyframes flow{to{stroke-dashoffset:-18}}
.led{animation:led 1.8s ease-in-out infinite}
@keyframes led{0%,100%{opacity:.35}50%{opacity:1}}
.gauge{animation:gauge 5s ease-in-out infinite}
@keyframes gauge{0%,100%{stroke-dasharray:58 100}50%{stroke-dasharray:70 100}}
`);
    s.defs.push(packetGlow(a));
    const l1 = 'M142 118C188 118 210 122 250 122';
    const l2 = 'M328 122C352 122 362 116 380 116';
    return [
      `<path d="${l1}" stroke="${a}" stroke-opacity=".55" stroke-width="1.5" fill="none" class="flow"/>`,
      `<path d="${l2}" stroke="${a}" stroke-opacity=".55" stroke-width="1.5" fill="none" class="flow"/>`,
      packet(a, l1, 2.4, 0.2), packet(a, l2, 1.8, 1.4),
      `<rect x="64" y="82" width="72" height="72" rx="16" fill="${t.raised}" stroke="${a}" stroke-width="1.6"/>`,
      `<path d="M100 134C86 130 82 116 88 104C100 102 112 110 112 124C110 132 106 134 100 134Z" fill="${a}" opacity=".85"/>`,
      `<path d="M100 134C99 124 96 116 91 109" stroke="${t.raised}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
      `<circle cx="125" cy="93" r="3.5" fill="${a}" class="led"/>`,
      s.text('SENSOR', { x: 100, y: 180, font: 'mono', weight: 500, size: 13, ls: 1.6, anchor: 'middle', fill: t.muted }),
      `<path d="M258 140H316A16 16 0 0 0 318 108.1A24 24 0 0 0 271.4 101.9A18 18 0 0 0 258 140Z" fill="${t.raised}" stroke="${t.text2}" stroke-opacity=".6" stroke-width="1.5" stroke-linejoin="round"/>`,
      s.text('MQTT', { x: 289, y: 131, font: 'mono', weight: 700, size: 13, ls: 1.6, anchor: 'middle', fill: t.text2 }),
      `<rect x="384" y="46" width="148" height="140" rx="16" fill="${t.raised}" stroke="${t.border}" stroke-width="1.5"/>`,
      `<circle cx="402" cy="66" r="3.5" fill="${a}" class="led"/>`,
      s.text('LIVE', { x: 412, y: 70.5, font: 'mono', weight: 500, size: 12, ls: 1.6, fill: t.text2 }),
      `<path d="M412 146A46 46 0 0 1 504 146" stroke="${t.border}" stroke-width="9" stroke-linecap="round" fill="none"/>`,
      `<path d="M412 146A46 46 0 0 1 504 146" stroke="${a}" stroke-width="9" stroke-linecap="round" fill="none" pathLength="100" stroke-dasharray="64 100" class="gauge"/>`,
      s.text('64%', { x: 458, y: 142, weight: 700, size: 24, anchor: 'middle', fill: t.text }),
      s.text('MOISTURE', { x: 458, y: 173, font: 'mono', weight: 500, size: 12, ls: 1.2, anchor: 'middle', fill: t.muted }),
    ];
  },

  moneymate(s, t, a) {
    s.css.push(`
.seg1{animation:seg1 6s ease-in-out infinite}.seg2{animation:seg2 6s ease-in-out infinite}.seg3{animation:seg3 6s ease-in-out infinite}
@keyframes seg1{0%{stroke-dasharray:0 100}30%,85%{stroke-dasharray:45 55}100%{stroke-dasharray:0 100}}
@keyframes seg2{0%,10%{stroke-dasharray:0 100}40%,85%{stroke-dasharray:30 70}100%{stroke-dasharray:0 100}}
@keyframes seg3{0%,20%{stroke-dasharray:0 100}50%,85%{stroke-dasharray:25 75}100%{stroke-dasharray:0 100}}
.bar{transform-box:fill-box;transform-origin:center bottom;animation:bar 3.6s ease-in-out infinite}
@keyframes bar{0%,100%{transform:scaleY(.55)}50%{transform:scaleY(1)}}
.float{animation:float 5s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@media (prefers-reduced-motion:reduce){.seg1{stroke-dasharray:45 55}.seg2{stroke-dasharray:30 70}.seg3{stroke-dasharray:25 75}}
`);
    const chip = (x, y, label, amount, color, d) => {
      const w = 26 + measure(label, { weight: 600, size: 13 }) + 14 + measure(amount, { weight: 700, size: 13 }) + 16;
      return `<g class="float" style="${delay(d)}"><rect x="${x}" y="${y}" width="${n(w)}" height="34" rx="17" fill="${t.raised}" stroke="${t.border}" stroke-width="1.5"/>` +
        `<circle cx="${x + 16}" cy="${y + 17}" r="4" fill="${color}"/>` +
        s.text(label, { x: x + 26, y: y + 21.5, weight: 600, size: 13, fill: t.text }) +
        s.text(amount, { x: x + w - 16, y: y + 21.5, weight: 700, size: 13, anchor: 'end', fill: color }) + `</g>`;
    };
    const donut = [[t.purple, 'seg1', 0], [t.blue, 'seg2', -45], [t.teal, 'seg3', -75]];
    return [
      chip(70, 70, 'Coffee', '−18k', a, 0),
      chip(56, 124, 'Transport', '−32k', t.blue, -1.6),
      `<rect x="250" y="24" width="100" height="224" rx="18" fill="${t.raised}" stroke="${a}" stroke-width="1.6"/>`,
      `<rect x="286" y="32" width="28" height="5" rx="2.5" fill="${t.border}"/>`,
      s.text('This month', { x: 264, y: 60, weight: 500, size: 11, fill: t.text2 }),
      s.text('Rp 1.2M', { x: 264, y: 78, weight: 800, size: 15, fill: t.text }),
      `<circle cx="300" cy="126" r="24" fill="none" stroke="${t.border}" stroke-width="9"/>`,
      ...donut.map(([c, cls, off]) => `<circle cx="300" cy="126" r="24" fill="none" stroke="${c}" stroke-width="9" pathLength="100" stroke-dashoffset="${off}" transform="rotate(-90 300 126)" class="${cls}"/>`),
      ...[[t.purple, 172], [t.blue, 192], [t.teal, 212]].map(([c, y]) => `<circle cx="268" cy="${y}" r="5" fill="${c}" opacity=".35"/><rect x="279" y="${y - 3}" width="34" height="6" rx="3" fill="${t.text2}" opacity=".3"/><rect x="320" y="${y - 3}" width="16" height="6" rx="3" fill="${t.text2}" opacity=".5"/>`),
      s.text('THIS WEEK', { x: 400, y: 66, font: 'mono', weight: 500, size: 12, ls: 1.4, fill: t.muted }),
      `<line x1="396" y1="178" x2="552" y2="178" stroke="${t.border}" stroke-width="1.5" stroke-linecap="round"/>`,
      ...[34, 58, 40, 76, 50, 92, 46].map((h, i) => `<rect x="${400 + i * 22}" y="${176 - h}" width="13" height="${h}" rx="4" fill="${a}" opacity="${i === 5 ? 0.9 : 0.3}" class="bar" style="${delay(i * 0.25)}"/>`),
    ];
  },
};

export function projectCard(t, p) {
  const CW = 600;
  const H = 440;
  const a = t[p.accent];
  const s = new Svg({ width: CW, height: H, title: p.name, desc: p.desc });
  s.css.push(`
.led{animation:led 1.8s ease-in-out infinite}
@keyframes led{0%,100%{opacity:.35}50%{opacity:1}}
`);
  s.defs.push(
    `<clipPath id="card"><rect width="${CW}" height="${H}" rx="22"/></clipPath>`,
    `<clipPath id="panel"><rect width="${CW}" height="${PANEL_H}"/></clipPath>`,
    `<linearGradient id="tint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}" stop-opacity=".13"/><stop offset="1" stop-color="${a}" stop-opacity=".03"/></linearGradient>`,
    `<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1" fill="${t.muted}" opacity=".35"/></pattern>`,
  );
  s.add(`<rect width="${CW}" height="${H}" rx="22" fill="${t.surface}"/>`,
    `<g clip-path="url(#card)">`,
    `<rect width="${CW}" height="${PANEL_H}" fill="url(#tint)"/><rect width="${CW}" height="${PANEL_H}" fill="url(#dots)"/>`,
    `<g clip-path="url(#panel)">`, ...art[p.id](s, t, a), `</g>`,
    `<line x1="0" y1="${PANEL_H}" x2="${CW}" y2="${PANEL_H}" stroke="${t.border}" stroke-width="1.5"/>`,
    `</g>`);

  if (p.live) {
    const w = 38 + measure(p.live, { font: 'mono', weight: 500, size: 13, ls: 0.4 }) + 14;
    s.add(`<rect x="22" y="20" width="${n(w)}" height="30" rx="15" fill="${t.raised}" stroke="${t.border}"/>`,
      `<circle cx="38" cy="35" r="4" fill="${t.teal}" class="led"/>`,
      s.text(p.live, { x: 50, y: 39.5, font: 'mono', weight: 500, size: 13, ls: 0.4, fill: t.text2 }));
  }
  s.add(`<circle cx="${CW - 42}" cy="40" r="19" fill="${t.raised}" stroke="${t.border}" stroke-width="1.5"/>`, uiIcon('arrow', CW - 51, 31, 18, t.text));

  s.add(s.text(p.kind, { x: 32, y: 262, font: 'mono', weight: 500, size: 14, ls: 2, fill: a }));
  s.add(s.text(p.name, { x: 31, y: 302, weight: 700, size: 30, ls: -0.6, fill: t.text }));
  wrap(p.desc, CW - 64, { weight: 400, size: 19 }).slice(0, 2).forEach((line, i) => {
    s.add(s.text(line, { x: 32, y: 340 + i * 28, weight: 400, size: 19, fill: t.text2 }));
  });
  s.add(s.text(p.stack.join(' · '), { x: 32, y: 414, font: 'mono', weight: 500, size: 14, ls: 1, fill: t.muted }));
  s.add(`<rect x=".75" y=".75" width="${CW - 1.5}" height="${H - 1.5}" rx="21.25" fill="none" stroke="${t.border}" stroke-width="1.5"/>`);
  return s;
}

// ---------------------------------------------------------------- footer

export function footerCard(t) {
  const H = 300;
  const gap = 28; // breathing room above the closing card
  const s = new Svg({ width: W, height: H + gap, title: footer.title, desc: footer.sub });
  s.css.push(`
.breathe{transform-box:fill-box;transform-origin:center;animation:breathe 4.8s ease-in-out infinite}
@keyframes breathe{0%,100%{transform:scale(.88)}50%{transform:scale(1.08)}}
`);
  s.defs.push(`<linearGradient id="brand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.blue}"/><stop offset="1" stop-color="${t.purple}"/></linearGradient>`);
  s.add(`<g transform="translate(0 ${gap})">`);
  s.add(...nightCard(s, t, W, H, [
    { cx: 600, cy: 70, r: 260, color: t.purple, opacity: t.glow },
    { cx: 600, cy: 300, r: 380, color: t.blue, opacity: t.glow * 0.5 },
  ]));
  s.add(starfield(t, { w: W, h: H, count: 60, seed: 21, quiet: (x, y) => x > 250 && x < 950 && y > 110 && y < 270 }));
  const constellations = [
    [[96, 214], [168, 168], [236, 196], [292, 120]],
    [[904, 118], [968, 184], [1046, 160], [1108, 220]],
  ];
  for (const pts of constellations) {
    s.add(`<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${t.border}" stroke-width="1" stroke-dasharray="3 6"/>`);
    pts.forEach(([x, y], i) => s.add(`<path d="${sparkle(x, y, i % 2 ? 4 : 6)}" fill="${t.star}" opacity=".75" class="tw" style="${delay(i * 0.6)}"/>`));
  }
  s.add(`<circle cx="600" cy="72" r="46" fill="url(#glow0)"/>`,
    `<path d="${sparkle(600, 72, 20)}" fill="url(#brand)" class="breathe"/>`,
    `<path d="${sparkle(600, 72, 7)}" fill="#ffffff" opacity=".9" class="breathe"/>`);
  s.add(s.text(footer.title, { x: 600, y: 160, weight: 800, size: 46, ls: -1.2, anchor: 'middle', fill: t.text, cls: 'fu' }));
  s.add(s.text(footer.sub, { x: 600, y: 204, weight: 400, size: 20, anchor: 'middle', fill: t.text2, cls: 'fu', style: delay(0.1) }));
  s.add(s.text(`${profile.location.toUpperCase()}   ·   ${profile.timezone}`, { x: 600, y: 254, font: 'mono', weight: 500, size: 12, ls: 2.4, anchor: 'middle', fill: t.muted, cls: 'fu', style: delay(0.2) }));
  s.add(...closeNightCard(t, W, H), `</g>`);
  return s;
}

// ---------------------------------------------------------------- activity (rebuilt by GitHub Actions)

export function activityCard(t, data) {
  const PAD = 32;
  const cell = 16;
  const step = 20;
  const gridX = 84;
  const gridY = 190;
  const first = new Date(`${data.days[0].date}T00:00:00Z`);
  const offset = first.getUTCDay();
  const weeks = Math.ceil((data.days.length + offset) / 7);
  const gridBottom = gridY + 6 * step + cell;
  const langY = gridBottom + 96;
  const H = langY + 110;
  const fmt = (v) => v.toLocaleString('en-US');
  const updated = data.updated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Jakarta' });

  const s = new Svg({
    width: W, height: H, title: 'GitHub activity',
    desc: `${fmt(data.total)} contributions in the last year, current streak ${data.current} days, longest streak ${data.longest} days, ${data.repos} public repositories.`,
  });
  s.css.push(`
.cell{opacity:0;animation:fi .6s ease forwards}
.seg{transform-box:fill-box;transform-origin:left center;transform:scaleX(0);animation:seg 1.1s cubic-bezier(.6,0,.2,1) forwards}
@keyframes seg{to{transform:scaleX(1)}}
.today{transform-box:fill-box;transform-origin:center;animation:today 2.4s ease-in-out infinite}
@keyframes today{0%,100%{opacity:1}50%{opacity:.35}}
@media (prefers-reduced-motion:reduce){.cell{opacity:1}.seg{transform:none}}
`);
  s.add(`<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="22" fill="${t.surface}" stroke="${t.border}" stroke-width="1.5"/>`);

  // headline numbers
  const stats = [
    [fmt(data.total), '', 'CONTRIBUTIONS · LAST YEAR'],
    [String(data.current), data.current === 1 ? 'day' : 'days', 'CURRENT STREAK'],
    [String(data.longest), data.longest === 1 ? 'day' : 'days', 'LONGEST STREAK'],
    [String(data.repos), '', 'PUBLIC REPOSITORIES'],
  ];
  const colW = (W - PAD * 2) / stats.length;
  stats.forEach(([value, unit, label], i) => {
    const x = PAD + i * colW + (i ? 28 : 0);
    if (i) s.add(`<line x1="${n(PAD + i * colW)}" y1="40" x2="${n(PAD + i * colW)}" y2="118" stroke="${t.hairline}" stroke-width="1.5"/>`);
    const vw = measure(value, { weight: 800, size: 44, ls: -1.2 });
    s.add(`<g class="fu" style="${delay(i * 0.08)}">`,
      s.text(value, { x, y: 88, weight: 800, size: 44, ls: -1.2, fill: i === 0 ? t.blue : t.text }),
      unit ? s.text(unit, { x: x + vw + 8, y: 88, weight: 500, size: 18, fill: t.text2 }) : '',
      s.text(label, { x, y: 118, font: 'mono', weight: 500, size: 13, ls: 1.4, fill: t.muted }),
      `</g>`);
  });
  s.add(`<line x1="${PAD}" y1="146" x2="${W - PAD}" y2="146" stroke="${t.hairline}" stroke-width="1.5"/>`);

  // contribution heatmap
  const months = new Set();
  data.days.forEach((d, i) => {
    const pos = i + offset;
    const week = Math.floor(pos / 7);
    const dow = pos % 7;
    const x = gridX + week * step;
    const y = gridY + dow * step;
    const isLast = i === data.days.length - 1;
    s.add(`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="4" fill="${t.heat[d.level]}" class="cell${isLast ? ' today' : ''}" style="${delay(n(0.15 + week * 0.014 + dow * 0.02))}"/>`);
    const date = new Date(`${d.date}T00:00:00Z`);
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    if (date.getUTCDate() <= 7 && dow === 0 && !months.has(key) && week < weeks - 1) {
      months.add(key);
      s.add(s.text(date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }), { x, y: gridY - 12, font: 'mono', weight: 400, size: 12, ls: 0.4, fill: t.muted }));
    }
  });
  [['Mon', 1], ['Wed', 3], ['Fri', 5]].forEach(([label, dow]) => {
    s.add(s.text(label, { x: PAD, y: gridY + dow * step + 12, font: 'mono', weight: 400, size: 12, ls: 0.4, fill: t.muted }));
  });
  const legendY = gridBottom + 34;
  const legendX = gridX + weeks * step - 4 - 5 * step;
  s.add(s.text(`Updated ${updated}`, { x: gridX, y: legendY + 11, font: 'mono', weight: 400, size: 12, ls: 0.4, fill: t.muted }),
    s.text('Less', { x: legendX - 10, y: legendY + 11, font: 'mono', weight: 400, size: 12, ls: 0.4, anchor: 'end', fill: t.muted }),
    ...t.heat.map((c, i) => `<rect x="${legendX + i * step}" y="${legendY}" width="${cell - 2}" height="${cell - 2}" rx="3.5" fill="${c}"/>`),
    s.text('More', { x: legendX + 5 * step + 6, y: legendY + 11, font: 'mono', weight: 400, size: 12, ls: 0.4, fill: t.muted }));
  s.add(`<line x1="${PAD}" y1="${legendY + 34}" x2="${W - PAD}" y2="${legendY + 34}" stroke="${t.hairline}" stroke-width="1.5"/>`);

  // languages
  const top = data.languages.slice(0, 5);
  const other = 100 - top.reduce((a, l) => a + l.pct, 0);
  const langs = other > 0.5 ? [...top, { name: 'Other', pct: other }] : top;
  const colors = [[t.blue, 1], [t.purple, 1], [t.teal, 1], [t.blue, 0.5], [t.purple, 0.5], [t.muted, 0.6]];
  s.add(s.text('TOP LANGUAGES · BY CODE VOLUME', { x: PAD, y: langY, font: 'mono', weight: 500, size: 13, ls: 1.4, fill: t.muted }));
  const barW = W - PAD * 2;
  let bx = PAD;
  langs.forEach((l, i) => {
    const w = (l.pct / 100) * barW;
    const [c, o] = colors[i];
    s.add(`<rect x="${n(bx)}" y="${langY + 18}" width="${n(Math.max(w - 3, 2))}" height="10" rx="5" fill="${c}" fill-opacity="${o}" class="seg" style="${delay(0.3 + i * 0.12)}"/>`);
    bx += w;
  });
  let lx = PAD;
  langs.forEach((l, i) => {
    const [c, o] = colors[i];
    const pct = `${l.pct.toFixed(1)}%`;
    const nw = measure(l.name, { weight: 500, size: 16 });
    s.add(`<g class="fu" style="${delay(0.5 + i * 0.06)}">`,
      `<circle cx="${n(lx + 5)}" cy="${langY + 61}" r="5" fill="${c}" fill-opacity="${o}"/>`,
      s.text(l.name, { x: lx + 18, y: langY + 66, weight: 500, size: 16, fill: t.text }),
      s.text(pct, { x: lx + 18 + nw + 8, y: langY + 66, font: 'mono', weight: 400, size: 14, fill: t.muted }),
      `</g>`);
    lx += 18 + nw + 8 + measure(pct, { font: 'mono', weight: 400, size: 14 }) + 32;
  });
  return s;
}
