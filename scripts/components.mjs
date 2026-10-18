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
  globe: (c) => `<circle cx="12" cy="12" r="9" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9s1.3-6.4 3.8-9z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/>`,
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
  const accent = { portfolio: t.blue, linkedin: t.blue, email: t.teal, instagram: t.purple }[link.id];
  s.add(`<rect x=".75" y=".75" width="${w - 1.5}" height="${h - 1.5}" rx="${h / 2 - 0.75}" fill="${t.surface}" stroke="${t.border}" stroke-width="1.5"/>`);
  s.add(link.icon in ICONS ? uiIcon(link.icon, 19, 14, 20, accent) : brandIcon(link.icon, 20, 15, 18, accent));
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
  alina(s, t, a) {
    s.css.push(`
.chk{stroke-dasharray:10;stroke-dashoffset:10;animation:chk 7s ease infinite}
@keyframes chk{0%,20%{stroke-dashoffset:10}30%,88%{stroke-dashoffset:0}96%,100%{stroke-dashoffset:10}}
.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.6s cubic-bezier(0,0,.2,1) infinite}
@keyframes ping{0%{transform:scale(1);opacity:.7}80%,100%{transform:scale(2.6);opacity:0}}
.float{animation:float 5s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@media (prefers-reduced-motion:reduce){.chk{stroke-dashoffset:0}}
`);
    const dress = (cx, y) => `M${cx - 7} ${y}L${cx - 14} ${y + 6}L${cx - 10} ${y + 13}L${cx - 8} ${y + 12}L${cx - 15} ${y + 40}H${cx + 15}L${cx + 8} ${y + 12}L${cx + 10} ${y + 13}L${cx + 14} ${y + 6}L${cx + 7} ${y}Q${cx} ${y + 6} ${cx - 7} ${y}Z`;
    const prices = ['Rp 189k', 'Rp 249k', 'Rp 159k'];
    return [
      `<rect x="60" y="64" width="310" height="142" rx="14" fill="${t.raised}" stroke="${t.border}" stroke-width="1.5"/>`,
      ...[0, 1, 2].map((i) => `<circle cx="${78 + i * 12}" cy="80" r="3.5" fill="${t.border}"/>`),
      `<rect x="124" y="73" width="150" height="14" rx="7" fill="${t.chip}" stroke="${t.hairline}"/>`,
      `<line x1="60" y1="95" x2="370" y2="95" stroke="${t.border}" stroke-width="1.2"/>`,
      ...prices.map((price, i) => {
        const x = 76 + i * 96;
        return `<g class="float" style="${delay(i * -1.6)}"><rect x="${x}" y="106" width="86" height="56" rx="9" fill="${a}" fill-opacity=".12"/>` +
          `<path d="${dress(x + 43, 112)}" fill="${i === 1 ? a : t.text2}" fill-opacity="${i === 1 ? 0.85 : 0.35}" stroke-linejoin="round"/>` +
          `<rect x="${x}" y="170" width="54" height="6" rx="3" fill="${t.text2}" opacity=".3"/>` +
          s.text(price, { x, y: 194, weight: 700, size: 12, fill: t.text }) + `</g>`;
      }),
      `<circle cx="250" cy="114" r="7" fill="${a}"/><circle cx="250" cy="114" r="7" fill="none" stroke="${a}" class="ping"/>`,
      `<path d="M247 114h6M250 111v6" stroke="${t.surface}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<rect x="398" y="72" width="160" height="134" rx="14" fill="${t.raised}" stroke="${t.border}" stroke-width="1.5"/>`,
      s.text('ORDER #1042', { x: 414, y: 97, font: 'mono', weight: 500, size: 12, ls: 1.2, fill: t.text2 }),
      `<line x1="421" y1="128" x2="421" y2="172" stroke="${t.border}" stroke-width="1.5" stroke-dasharray="2 3"/>`,
      ...['PAID · DOKU', 'PACKED', 'SHIPPED'].map((label, i) => {
        const y = 112 + i * 30;
        return `<rect x="414" y="${y}" width="14" height="14" rx="4" fill="${t.raised}" stroke="${t.border}" stroke-width="1.5"/>` +
          `<path d="M417 ${y + 7}l3 3 6-6" stroke="${a}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" pathLength="10" class="chk" style="${delay(i * 0.8)}"/>` +
          s.text(label, { x: 438, y: y + 11.5, font: 'mono', weight: 500, size: 11, ls: 0.8, fill: t.text2 });
      }),
    ];
  },

  xpresspos(s, t, a) {
    s.css.push(`
.print{animation:print 6s cubic-bezier(.4,0,.2,1) infinite}
@keyframes print{0%,8%{transform:translateY(-130px)}55%,90%{transform:translateY(0)}100%{transform:translateY(-130px)}}
.tap{transform-box:fill-box;transform-origin:center;animation:tap 3s ease-in-out infinite}
@keyframes tap{0%,100%{opacity:.25}12%,30%{opacity:.9}}
.led{animation:led 1.8s ease-in-out infinite}
@keyframes led{0%,100%{opacity:.35}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){.print{transform:none}}
`);
    s.defs.push(`<clipPath id="slot"><rect x="404" y="86" width="140" height="134"/></clipPath>`);
    const tiles = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const i = r * 3 + c;
        const x = 82 + c * 58;
        const y = 66 + r * 44;
        tiles.push(`<rect x="${x}" y="${y}" width="50" height="36" rx="8" fill="${a}" fill-opacity=".1" stroke="${t.border}"/>` +
          `<rect x="${x}" y="${y}" width="50" height="36" rx="8" fill="${a}" fill-opacity=".35" class="tap" style="${delay(i * 0.9 % 3)};opacity:0"/>` +
          `<rect x="${x + 8}" y="${y + 24}" width="${20 + (i * 7) % 16}" height="5" rx="2.5" fill="${t.text2}" opacity=".45"/>`);
      }
    }
    return [
      `<rect x="62" y="36" width="304" height="176" rx="16" fill="${t.raised}" stroke="${a}" stroke-width="1.6"/>`,
      s.text('OPEN BILL · T04', { x: 82, y: 56, font: 'mono', weight: 500, size: 11, ls: 1, fill: t.text2 }),
      `<circle cx="346" cy="52" r="3.5" fill="${t.teal}" class="led"/>`,
      ...tiles,
      `<line x1="262" y1="66" x2="262" y2="196" stroke="${t.border}" stroke-width="1.2"/>`,
      ...[0, 1, 2, 3].map((i) => `<rect x="274" y="${72 + i * 20}" width="${36 + (i * 9) % 20}" height="6" rx="3" fill="${t.text2}" opacity=".3"/><rect x="${336}" y="${72 + i * 20}" width="16" height="6" rx="3" fill="${t.text2}" opacity=".5"/>`),
      `<rect x="274" y="168" width="78" height="28" rx="8" fill="${a}"/>`,
      s.text('PAY', { x: 313, y: 186.5, font: 'mono', weight: 700, size: 12, ls: 1.4, anchor: 'middle', fill: t.surface }),
      `<g clip-path="url(#slot)"><g class="print">`,
      `<path d="M420 84H528V206L519 212L510 206L501 212L492 206L483 212L474 206L465 212L456 206L447 212L438 206L429 212L420 206Z" fill="${t.surface}" stroke="${t.border}" stroke-width="1.2" stroke-linejoin="round"/>`,
      s.text('RECEIPT', { x: 474, y: 108, font: 'mono', weight: 700, size: 11, ls: 1.6, anchor: 'middle', fill: t.text2 }),
      ...[0, 1, 2].map((i) => `<rect x="432" y="${120 + i * 14}" width="${40 + i * 6}" height="5" rx="2.5" fill="${t.text2}" opacity=".3"/><rect x="500" y="${120 + i * 14}" width="16" height="5" rx="2.5" fill="${t.text2}" opacity=".45"/>`),
      `<line x1="432" y1="168" x2="516" y2="168" stroke="${t.border}" stroke-dasharray="3 3"/>`,
      s.text('TOTAL', { x: 432, y: 188, font: 'mono', weight: 700, size: 11, ls: 1, fill: t.text }),
      s.text('86.000', { x: 516, y: 188, font: 'mono', weight: 700, size: 11, anchor: 'end', fill: a }),
      `</g></g>`,
      `<rect x="404" y="62" width="140" height="28" rx="10" fill="${t.raised}" stroke="${t.border}" stroke-width="1.5"/>`,
      `<rect x="418" y="82" width="112" height="4" rx="2" fill="${t.border}"/>`,
      `<circle cx="528" cy="74" r="3.5" fill="${a}" class="led"/>`,
    ];
  },

  ams(s, t, a) {
    s.css.push(`
.float{animation:float 5s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.sign{stroke-dasharray:100;stroke-dashoffset:100;animation:sign 7s ease-in-out infinite}
@keyframes sign{0%,35%{stroke-dashoffset:100}62%,90%{stroke-dashoffset:0}100%{stroke-dashoffset:100}}
.stamp{transform-box:fill-box;transform-origin:center;animation:stamp 7s ease infinite}
@keyframes stamp{0%,62%{opacity:0;transform:rotate(-12deg) scale(1.5)}68%,90%{opacity:1;transform:rotate(-12deg) scale(1)}100%{opacity:0;transform:rotate(-12deg) scale(1)}}
.led{animation:led 1.8s ease-in-out infinite}
@keyframes led{0%,100%{opacity:.35}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){.sign{stroke-dashoffset:0}.stamp{opacity:1;transform:rotate(-12deg)}}
`);
    s.defs.push(packetGlow(a));
    const orbit = 'M58 132A100 26 0 1 0 258 132A100 26 0 1 0 58 132';
    return [
      `<ellipse cx="158" cy="132" rx="100" ry="26" fill="none" stroke="${t.border}" stroke-width="1.4" stroke-dasharray="3 6"/>`,
      packet(a, orbit, 6, 0),
      `<g class="float">`,
      `<path d="M158 58L206 82L158 106L110 82Z" fill="${a}" fill-opacity=".28" stroke="${a}" stroke-width="1.6" stroke-linejoin="round"/>`,
      `<path d="M110 82L158 106V162L110 138Z" fill="${a}" fill-opacity=".12" stroke="${a}" stroke-width="1.6" stroke-linejoin="round"/>`,
      `<path d="M206 82L158 106V162L206 138Z" fill="${a}" fill-opacity=".2" stroke="${a}" stroke-width="1.6" stroke-linejoin="round"/>`,
      `<ellipse cx="182" cy="122" rx="10" ry="12" transform="skewY(-26 182 122)" fill="${t.raised}" stroke="${a}" stroke-width="1.6"/>`,
      `<circle cx="182" cy="120" r="3.5" fill="${a}" class="led"/>`,
      `</g>`,
      `<rect x="60" y="182" width="40" height="20" rx="10" fill="${t.raised}" stroke="${t.border}"/>`,
      s.text('3D', { x: 80, y: 196, font: 'mono', weight: 700, size: 11, ls: 1, anchor: 'middle', fill: t.text2 }),
      `<rect x="318" y="30" width="200" height="180" rx="14" fill="${t.raised}" stroke="${t.border}" stroke-width="1.5"/>`,
      s.text('SPH · QUOTATION', { x: 336, y: 56, font: 'mono', weight: 500, size: 12, ls: 1.2, fill: t.text2 }),
      ...[0, 1, 2].map((i) => `<rect x="336" y="${72 + i * 18}" width="${70 + (i * 23) % 40}" height="6" rx="3" fill="${t.text2}" opacity=".3"/><rect x="466" y="${72 + i * 18}" width="34" height="6" rx="3" fill="${t.text2}" opacity=".5"/>`),
      `<line x1="336" y1="128" x2="500" y2="128" stroke="${t.border}" stroke-dasharray="3 3"/>`,
      s.text('TOTAL', { x: 336, y: 146, font: 'mono', weight: 700, size: 11, ls: 1, fill: t.text }),
      `<rect x="452" y="138" width="48" height="8" rx="4" fill="${a}" opacity=".8"/>`,
      `<path d="M340 184C350 168 356 170 354 182C352 192 364 172 372 174C378 176 370 188 380 184C388 180 392 176 404 178" stroke="${a}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" pathLength="100" class="sign"/>`,
      `<line x1="336" y1="192" x2="420" y2="192" stroke="${t.border}" stroke-width="1.2"/>`,
      `<g class="stamp"><rect x="432" y="166" width="72" height="26" rx="6" fill="none" stroke="${t.teal}" stroke-width="1.8"/>`,
      s.text('SIGNED', { x: 468, y: 183.5, font: 'mono', weight: 700, size: 11, ls: 1.4, anchor: 'middle', fill: t.teal }), `</g>`,
    ];
  },

  sikopas(s, t, a) {
    s.css.push(`
.flow{stroke-dasharray:2 7;animation:flow 1.4s linear infinite}
@keyframes flow{to{stroke-dashoffset:-18}}
.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.6s cubic-bezier(0,0,.2,1) infinite}
@keyframes ping{0%{transform:scale(1);opacity:.7}80%,100%{transform:scale(3);opacity:0}}
.spin{transform-box:fill-box;transform-origin:center;animation:spin 2.4s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.prog{transform-box:fill-box;transform-origin:left center;animation:prog 5s ease-in-out infinite}
@keyframes prog{0%{transform:scaleX(.1)}70%,100%{transform:scaleX(1)}}
@media (prefers-reduced-motion:reduce){.prog{transform:none}}
`);
    const shade = [0.32, 0.16, 0.24, 0.1, 0.2, 0.36, 0.14, 0.28, 0.12, 0.26, 0.18, 0.3];
    const plots = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const x = 72 + c * 64 - r * 20;
        const y = 60 + r * 46;
        plots.push(`<path d="M${x + 20} ${y}H${x + 78}L${x + 58} ${y + 40}H${x}Z" fill="${a}" fill-opacity="${shade[r * 4 + c]}" stroke="${a}" stroke-opacity=".5" stroke-width="1.2" stroke-linejoin="round"/>` +
          `<path d="${sparkle(x + 39, y + 20, 5)}" fill="${a}" opacity=".7"/>`);
      }
    }
    const track = 'M70 206C120 196 150 168 196 150C232 136 250 112 254 98';
    return [
      ...plots,
      `<path d="${track}" stroke="${t.text2}" stroke-opacity=".7" stroke-width="1.6" fill="none" class="flow"/>`,
      `<path d="M254 98c-7-9-11-15-11-20a11 11 0 0 1 22 0c0 5-4 11-11 20z" fill="${t.raised}" stroke="${a}" stroke-width="1.6" stroke-linejoin="round"/>`,
      `<circle cx="254" cy="78" r="4" fill="${a}"/><circle cx="254" cy="98" r="4" fill="none" stroke="${a}" class="ping"/>`,
      `<rect x="412" y="20" width="104" height="196" rx="18" fill="${t.raised}" stroke="${a}" stroke-width="1.6"/>`,
      `<rect x="450" y="28" width="28" height="5" rx="2.5" fill="${t.border}"/>`,
      s.text('BLOK A12', { x: 426, y: 58, font: 'mono', weight: 700, size: 11, ls: 1, fill: t.text }),
      s.text('Panen · 1.2 t', { x: 426, y: 76, weight: 500, size: 11, fill: t.text2 }),
      ...[0, 1, 2].map((i) => `<rect x="426" y="${92 + i * 22}" width="76" height="16" rx="5" fill="${t.chip}" stroke="${t.hairline}"/><circle cx="436" cy="${100 + i * 22}" r="3" fill="${a}" opacity="${0.4 + i * 0.25}"/><rect x="444" y="${98 + i * 22}" width="${30 + i * 8}" height="4" rx="2" fill="${t.text2}" opacity=".35"/>`),
      `<g transform="translate(-6 0)"><g class="spin"><path d="M434 172a8 8 0 1 1 2.3 5.7" stroke="${a}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M433 177.5l3.4.4-.4-3.4" stroke="${a}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>`,
      s.text('SYNC', { x: 450, y: 176, font: 'mono', weight: 700, size: 11, ls: 1.2, fill: t.text2 }),
      `<rect x="426" y="190" width="76" height="5" rx="2.5" fill="${t.border}"/><rect x="426" y="190" width="76" height="5" rx="2.5" fill="${a}" class="prog"/>`,
      s.text('OFFLINE-FIRST', { x: 330, y: 206, font: 'mono', weight: 500, size: 10, ls: 1.2, anchor: 'middle', fill: t.muted }),
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
