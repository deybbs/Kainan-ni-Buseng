'use strict';
/* =========================================================
   BUSENG KAIN TAYO! — Karinderya Simulator
   ========================================================= */
const $ = s => document.querySelector(s);
const rand = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rand(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const peso = n => '₱' + Math.round(n).toLocaleString('en-US');
const r1 = n => Math.round(n * 10) / 10;
const fmtQ = n => (Math.round(n * 10) / 10).toString();
const SAVE_KEY = 'busengKainTayo_save_v1', SET_KEY = 'busengKainTayo_settings_v1';
const FONT = '"Lilita One","Trebuchet MS",sans-serif';

/* ---------------- DATA ---------------- */
const ITEMS = {
  pork:    { name: 'Baboy',      unit: 'kg',   base: 180, step: .5 },
  chicken: { name: 'Manok',   unit: 'kg',   base: 150, step: .5 },
  fish:    { name: 'Isda',       unit: 'kg',   base: 120, step: .5 },
  gulay:   { name: 'Gulay',unit: 'kg',   base: 50,  step: .5 },
  rice:    { name: 'Bigas',      unit: 'kg',   base: 45,  step: 1 },
  rekado:  { name: 'Rekado',   unit: 'pakete', base: 20,  step: 1 },
};
const ITEM_ORDER = ['pork', 'chicken', 'fish', 'gulay', 'rice', 'rekado'];
const PERISH = ['pork', 'chicken', 'fish'];

const DISHES = {
  adobo:    { name: 'Adobong Baboy',        price: 70, lvl: 1, serv: 8,  time: 4.0, c1: '#6b3a1e', c2: '#a0612f', ing: { pork: 1, rekado: 1 },            steps: ['Bawang', 'Baboy', 'Toyo', 'Suka', 'Paminta'] },
  pinakbet: { name: 'Pinakbet',          price: 55, lvl: 1, serv: 8,  time: 3.6, c1: '#6f8f2f', c2: '#e0892a', ing: { gulay: 1.5, pork: .2, rekado: 1 }, steps: ['Bawang', 'Sibuyas', 'Baboy', 'Gulay', 'Bagoong'] },
  tinola:   { name: 'Tinolang Manok',    price: 65, lvl: 2, serv: 8,  time: 3.8, c1: '#e6cf7a', c2: '#7fbf4d', ing: { chicken: 1, gulay: .5, rekado: 1 }, steps: ['Luya', 'Sibuyas', 'Manok', 'Tubig', 'Sayote'] },
  sinigang: { name: 'Sinigang na Isda',  price: 75, lvl: 3, serv: 8,  time: 3.4, c1: '#d9b65a', c2: '#2e7d32', ing: { fish: 1, gulay: .5, rekado: 1 },    steps: ['Tubig', 'Kamatis', 'Sampalok', 'Isda', 'Kangkong'] },
  lumpia:   { name: 'Lumpiang Shanghai', price: 60, lvl: 4, serv: 10, time: 3.0, c1: '#d4952e', c2: '#f2c46a', ing: { pork: .5, gulay: .5, rekado: 1 },   steps: ['Baboy', 'Karot', 'Sibuyas', 'Balutin', 'Prituhin'] },
  kanin:    { name: 'Kanin',      price: 15, lvl: 1, serv: 10, time: 3.0, c1: '#ffffff', c2: '#f1efe6', ing: { rice: 1 },                       steps: [] },
};
const TRAY_ORDER = ['adobo', 'pinakbet', 'tinola', 'sinigang', 'lumpia', 'kanin'];
const VIANDS = TRAY_ORDER.filter(k => k !== 'kanin');
const TRAY_MAX = 40;
const STEP_COL = { Bawang: '#f3ead2', Baboy: '#d98a7a', Toyo: '#3b2314', Suka: '#efe9c9', Paminta: '#2a2a2a', Sibuyas: '#e8c8e8', Gulay: '#4caf50', Bagoong: '#7a4f3a', Luya: '#e0c070', Manok: '#f0c898', Tubig: '#9fd3ef', Sayote: '#a6d785', Kamatis: '#e53935', Sampalok: '#a1887f', Isda: '#cfd8dc', Kangkong: '#2e7d32', Karot: '#ff8f00', Balutin: '#f5deb3', Prituhin: '#d4a017' };

const UPGRADES = [
  { id: 'table',      name: 'Dagdag na Mesa',     cost: [500, 800, 1200, 1800], desc: 'Isang bagong mesa na may 2 upuan. Mas maraming makakakain nang sabay!', eff: '+2 upuan para sa kumakain' },
  { id: 'ricecooker', name: 'Mas Magandang Saingan', cost: [1000], desc: 'Kusang perpekto ang kanin: 15 hain bawat saing, laging 3 bituin.', eff: '+5 hain ng kanin bawat saing, +5% saya' },
  { id: 'stove',      name: 'Dagdag na Kalan',    cost: [1500], desc: 'Mas malaking kaldero at dagdag na apoy. Mas maraming ulam bawat luto.', eff: '+3 hain bawat luto' },
  { id: 'ref',        name: 'Pridyider',       cost: [2000], desc: 'Hindi masisira ang karne, isda at tirang ulam magdamag.', eff: 'Walang sira sa magdamag' },
  { id: 'sign',       name: 'Bagong Karatula',    cost: [700],  desc: 'Makinang na karatula sa harap — mas mapapansin ng mga dumadaan.', eff: '+15% na kumakain' },
  { id: 'plates',     name: 'Dagdag na Plato',    cost: [300, 600, 900], desc: 'Anim na bagong pares ng plato at baso. Hindi agad mauubusan ng malinis!', eff: '+6 plato at baso' },
  { id: 'sink',       name: 'Malaking Lababo',    cost: [800],  desc: 'Mas malaki at mas malakas ang gripo. Dalawang beses na mas mabilis maghugas.', eff: '2x bilis maghugas' },
  { id: 'decor',      name: 'Palamuti ng Karinderya',  cost: [3000], desc: 'Banderitas, halaman at magandang palamuti. Mas masaya ang mga kumakain!', eff: '+20% na kumakain, +10% saya' },
];

const EVENTS = {
  fiesta:  { name: 'Fiesta sa Barangay!', short: 'Fiesta!',     desc: 'Mas maraming kumakain ang bibisita sa iyong karinderya ngayon!', cust: 2.0 },
  sweldo:  { name: 'Araw ng Sweldo!',     short: 'Araw ng Sweldo',  desc: 'Sweldo ngayon! Mas maraming kumakain at mas malaki ang pabuya.', cust: 1.35, tip: 2 },
  ulan:    { name: 'Tag-ulan!',           short: 'Maulan',      desc: 'Umuulan… konti ang lalabas, pero gusto nila ng mainit na sabaw (Tinola, Sinigang).', cust: .7, soup: true },
  mahal:   { name: 'Taas-Presyo!',        short: 'Mahal Bilihin',desc: 'Tumaas ang presyo ng bilihin sa palengke ngayon. Mag-ingat sa gastos!', price: 1.3 },
  mura:    { name: 'Bagsak-Presyo!',      short: 'Mura sa Palengke', desc: 'Mura ang bilihin sa palengke ngayon! Magandang araw para mag-imbak.', price: .75 },
};

const TABLE_SLOTS = [{ x: 220, y: 425 }, { x: 1060, y: 425 }, { x: 220, y: 580 }, { x: 1060, y: 580 }, { x: 450, y: 505 }, { x: 830, y: 505 }];
const QUEUE_X = [440, 540, 640, 740, 840], QUEUE_Y = 335, DOOR = { x: 640, y: 760 };
const SHIRTS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#ecf0f1', '#ff7eb6', '#5d6d7e', '#ffffff', '#16a085'];
const HAIRS = ['#1b1b1b', '#2b1a10', '#3d2314', '#111', '#c9c9c9', '#5a3a1a'];
const SKINS = ['#f1c27d', '#e0ac69', '#c68642', '#d9a066', '#eab88a'];
const PANTS = ['#34495e', '#2c3e50', '#5d4037', '#1f3a5f', '#4e342e', '#37474f'];

/* ---------------- SETTINGS ---------------- */
let settings = { music: true, sfx: true, speed: 1 };
try { Object.assign(settings, JSON.parse(localStorage.getItem(SET_KEY) || '{}')); } catch (e) {}
function saveSettings() { try { localStorage.setItem(SET_KEY, JSON.stringify(settings)); } catch (e) {} }

/* ---------------- AUDIO ---------------- */
let AC = null;
function ac() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(f, dur, type = 'square', vol = .05, delay = 0, force) {
  if (!settings.sfx && !force) return;
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + delay;
  o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .03);
}
function noise(dur = .3, vol = .05, freq = 3000) {
  if (!settings.sfx) return;
  const a = ac(); if (!a) return;
  const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  f.type = 'bandpass'; f.frequency.value = freq; g.gain.value = vol;
  s.buffer = buf; s.connect(f).connect(g).connect(a.destination); s.start();
}
const SFX = {
  click() { tone(700, .05, 'square', .035); },
  coin() { tone(988, .07, 'square', .045); tone(1319, .16, 'square', .045, .07); },
  err() { tone(170, .18, 'sawtooth', .045); },
  lvl() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .2, 'square', .045, i * .09)); },
  ding() { tone(1568, .35, 'triangle', .08); tone(2093, .3, 'triangle', .05, .08); },
  angry() { tone(240, .12, 'square', .04); tone(170, .22, 'square', .04, .11); },
  sizzle() { noise(.35, .09, 4000); },
  plop() { tone(320, .08, 'sine', .08); tone(480, .06, 'sine', .05, .05); },
  door() { tone(880, .1, 'triangle', .05); tone(660, .15, 'triangle', .05, .1); },
};

/* ---- CUSTOM SOUND FILES ----
   Put .mp3 files in the "sounds" folder using the names below.
   If a file is there, the game plays it. If not, it uses the built-in beep sound. */
const SOUND_FILES = {
  click:  'sounds/click.mp3',    // pressing buttons
  coin:   'sounds/coin.mp3',     // getting paid
  err:    'sounds/error.mp3',    // can't do that
  lvl:    'sounds/levelup.mp3',  // level up / upgrade bought
  ding:   'sounds/ding.mp3',     // food cooked / shop opened
  angry:  'sounds/angry.mp3',    // customer leaves angry
  sizzle: 'sounds/sizzle.mp3',   // cooking in the wok
  plop:   'sounds/plop.mp3',     // ingredient / plate picked up
  door:   'sounds/door.mp3',     // customer enters
};
const MUSIC_FILE = 'sounds/music.mp3'; // background music (loops)
const SOUND_VOLUME = 0.45, MUSIC_VOLUME = 0.35;

const ALL_AUDIO = []; // every <audio> the game uses (needed to unlock sound on phones)
const loadedSounds = {};
for (const [name, src] of Object.entries(SOUND_FILES)) {
  const a = new Audio(); a.preload = 'auto'; ALL_AUDIO.push(a);
  a.addEventListener('canplaythrough', () => { loadedSounds[name] = a; }, { once: true });
  a.src = src;
  const builtIn = SFX[name];
  SFX[name] = () => {
    const file = loadedSounds[name];
    if (!file) return builtIn();
    if (!settings.sfx) return;
    const s = file.cloneNode(); s.volume = SOUND_VOLUME; s.play().catch(() => {});
  };
}
let musicAudio = null;
{
  const m = new Audio(); m.loop = true; m.preload = 'auto'; ALL_AUDIO.push(m);
  m.addEventListener('canplaythrough', () => { m.volume = MUSIC_VOLUME; musicAudio = m; }, { once: true });
  m.src = MUSIC_FILE;
}

/* ---- VOICE CLIPS ----
   Only the part from `start` to `end` (in seconds) of each file is played. */
const RICE_REQUEST_SOUND = { src: 'sounds/walang-kanin.mp4', start: 0, end: 5, volume: 0.45 }; // customer asks for EXTRA RICE
const HURRY_SOUND        = { src: 'sounds/bilisan-mo.mp4',   start: 0, end: 4, volume: 0.45 }; // patience bar turns RED
const OPEN_SOUND         = { src: 'sounds/pagbabalik.mp4',   start: 0, end: 8, volume: 0.45 }; // karinderya OPENS (Buksan button)
const PALIMOS_SOUND      = { src: 'sounds/palimos.mp4',      start: 0, end: 6, volume: 0.45 }; // pulubi says "Palimos po"
const ORDER_SOUND        = { src: 'sounds/order.mp4',        start: 0, end: 2, volume: 0.45 }; // customer reaches counter and ORDERS
const HURRY_AT = 0.25; // play "bilisan mo" when patience drops below 25% (when the bar turns red)

function makeClip(cfg, fallback) {
  let audio = null, stopT = null;
  const a = new Audio(); a.preload = 'auto'; ALL_AUDIO.push(a);
  a.addEventListener('canplaythrough', () => { audio = a; }, { once: true });
  a.src = cfg.src;
  return () => {
    if (!settings.sfx) return;
    if (!audio) return fallback(); // file missing → beep
    clearTimeout(stopT);
    audio.pause(); audio.currentTime = cfg.start; audio.volume = cfg.volume;
    audio.play().catch(() => {});
    stopT = setTimeout(() => audio.pause(), (cfg.end - cfg.start) * 1000);
  };
}
const playRiceRequest = makeClip(RICE_REQUEST_SOUND, () => { tone(880, .08, 'triangle', .06); tone(1175, .12, 'triangle', .06, .08); });
const playOpen = makeClip(OPEN_SOUND, () => SFX.ding());
const playHurry = makeClip(HURRY_SOUND, () => { tone(520, .1, 'square', .05); tone(440, .14, 'square', .05, .12); });
const playPalimos = makeClip(PALIMOS_SOUND, () => { tone(392, .18, 'triangle', .06); tone(330, .28, 'triangle', .06, .18); });
const playOrder = makeClip(ORDER_SOUND, () => tone(660, .08, 'triangle', .05));
/* Original background tune — a 3/4 waltz in Filipino rondalla style
   (plucked bandurria-like melody with tremolo + "oom-pah-pah" guitar/bass). */
const NOTE = n => { if (n === '-' || n === '.') return 0; const m = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }; return 440 * Math.pow(2, (m[n[0]] + (+n[1] - 4) * 12 - 9) / 12); };
// melody: one entry per beat, 3 beats per bar; "." = keep holding (tremolo)
const RONDALLA_MEL = (
  'E5 . G5  C6 . G5  F5 E5 D5  G5 . .  A5 . F5  E5 . C5  D5 E5 F5  E5 . . ' +
  'E5 . A5  A5 G5 F5  E5 . C5  D5 . G5  F5 . A5  G5 . E5  D5 F5 B4  C5 . .').split(/\s+/);
// chord per bar: [bass root, chord notes for the "pah-pah"]
const RONDALLA_CH = [
  ['C3', 'E4 G4'], ['C3', 'E4 G4'], ['G2', 'B3 D4'], ['G2', 'B3 D4'], ['F2', 'A3 C4'], ['C3', 'E4 G4'], ['G2', 'B3 D4'], ['C3', 'E4 G4'],
  ['A2', 'C4 E4'], ['F2', 'A3 C4'], ['C3', 'E4 G4'], ['G2', 'B3 D4'], ['F2', 'A3 C4'], ['C3', 'E4 G4'], ['G2', 'B3 F4'], ['C3', 'E4 G4']];
let musicStep = 0, musicNext = 0, musicTimer = null, musicHeld = 0;
function pluck(f, dur, vol, t) { playNote(f, dur, 'triangle', vol, t); playNote(f * 2, dur * .5, 'sine', vol * .25, t); }
function musicTick() {
  if (musicAudio) { // custom music file found
    if (settings.music && musicAudio.paused) musicAudio.play().catch(() => {});
    if (!settings.music && !musicAudio.paused) musicAudio.pause();
    return;
  }
  if (!settings.music || !AC) return;
  const a = AC, sub = .11; // one tremolo pick (1/4 of a beat) ≈ 136 bpm waltz
  if (musicNext < a.currentTime) musicNext = a.currentTime + .05;
  while (musicNext < a.currentTime + .4) {
    const beatIdx = Math.floor(musicStep / 4), q = musicStep % 4;
    const bar = Math.floor(beatIdx / 3) % RONDALLA_CH.length, beatInBar = beatIdx % 3;
    const mel = RONDALLA_MEL[beatIdx % RONDALLA_MEL.length];
    // melody: pluck on the beat; held notes get a soft bandurria tremolo
    if (q === 0 && mel !== '.') { musicHeld = NOTE(mel); pluck(musicHeld, .35, .032, musicNext); }
    else if (musicHeld && (mel === '.' || q === 2)) pluck(musicHeld, .12, .014, musicNext);
    // accompaniment: bass on beat 1, chord strums on beats 2 and 3
    if (q === 0) {
      const [root, chord] = RONDALLA_CH[bar];
      if (beatInBar === 0) playNote(NOTE(root), .5, 'triangle', .05, musicNext);
      else chord.split(' ').forEach((n, i) => playNote(NOTE(n), .14, 'triangle', .016, musicNext + i * .012));
    }
    musicNext += sub; musicStep++;
  }
}
function playNote(f, dur, type, vol, t) {
  if (!f) return;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + .02);
}
function startMusic() { if (!musicTimer) musicTimer = setInterval(musicTick, 100); }
document.addEventListener('pointerdown', () => { ac(); startMusic(); unlockAudio(); }, { once: false });

/* ---------------- PHONE / TOUCH SUPPORT ---------------- */
// Phones block sound until the player touches the screen. On the first touch, quietly
// start+stop every sound so the game is allowed to play them later.
let audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked) return; audioUnlocked = true;
  for (const a of ALL_AUDIO) {
    const wasMuted = a.muted; a.muted = true;
    const p = a.play(); if (p && p.then) p.then(() => { a.pause(); a.currentTime = 0; a.muted = wasMuted; }).catch(() => { a.muted = wasMuted; });
  }
}
// stop long-press menus, pinch-zoom and double-tap zoom
addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('gesturestart', e => e.preventDefault());
let lastTouchEnd = 0;
document.addEventListener('touchend', e => { const now = Date.now(); if (now - lastTouchEnd < 300 && e.target.tagName !== 'BUTTON') e.preventDefault(); lastTouchEnd = now; }, { passive: false });
function toggleFullscreen() {
  const d = document, el = d.documentElement;
  const isFull = d.fullscreenElement || d.webkitFullscreenElement;
  if (isFull) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!req) { toast('Sa iPhone: pindutin ang Share → "Add to Home Screen" para lumaki ang screen.', false, 4500); return; }
  Promise.resolve(req.call(el)).then(() => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); }).catch(() => {});
}
$('#mFull').onclick = () => { SFX.click(); toggleFullscreen(); };

/* ---------------- DRAW HELPERS ---------------- */
function blob(c, cx, cy, rx, ry, col, p = 2) {
  c.fillStyle = col;
  for (let y = -ry; y <= ry; y += p) {
    const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2)) / p) * p;
    c.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2, p);
  }
}
function rr(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function txt(c, s, x, y, size, col = '#fff', align = 'center', stroke = '#000', sw = 4) {
  c.font = `${size}px ${FONT}`; c.textAlign = align; c.textBaseline = 'middle';
  if (stroke) { c.lineWidth = sw; c.strokeStyle = stroke; c.lineJoin = 'round'; c.strokeText(s, x, y); }
  c.fillStyle = col; c.fillText(s, x, y);
}

/* Pixel person. (x,y) = feet center */
function drawPerson(c, x, y, o) {
  const u = o.u || 3, f = o.frame || 0;
  const r = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x + a * u), Math.round(y + b * u), w * u, h * u); };
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(Math.round(x - 6 * u), Math.round(y - u), 12 * u, 2 * u);
  let by;
  if (o.sit) by = -3;
  else {
    by = -6;
    r(-4, -6 + (f === 1 ? -1 : 0), 3, 6, o.pants); r(1, -6 + (f === 2 ? -1 : 0), 3, 6, o.pants);
    r(-4, -1 + (f === 1 ? -1 : 0), 3, 1, '#2a2a2a'); r(1, -1 + (f === 2 ? -1 : 0), 3, 1, '#2a2a2a');
  }
  const bob = o.bob ? Math.round(o.bob) : 0;
  by += bob;
  r(-5, by - 9, 10, 9, o.shirt);
  r(-5, by - 9, 10, 1, 'rgba(255,255,255,.18)');
  if (o.cheer) { r(-7, by - 15, 2, 7, o.shirt); r(5, by - 15, 2, 7, o.shirt); r(-7, by - 17, 2, 2, o.skin); r(5, by - 17, 2, 2, o.skin); }
  else { r(-7, by - 9, 2, 7, o.shirt); r(5, by - 9, 2, 7, o.shirt); r(-7, by - 2, 2, 2, o.skin); r(5, by - 2, 2, 2, o.skin); }
  if (o.apron) { r(-4, by - 7, 8, 7, '#fdfdfd'); r(-4, by - 7, 8, 1, '#ddd'); }
  if (o.bag) { r(6, by - 3, 4, 4, '#f5f5f5'); r(7, by - 4, 2, 1, '#ccc'); }
  if (o.plate) { r(-4, by - 6, 8, 2, '#fff'); r(-3, by - 7, 6, 1, o.plateCol || '#8a4b1f'); }
  const hy = by - 17;
  r(-4, hy, 8, 8, o.skin);
  if (o.dir === 'up') {
    r(-4, hy - 1, 8, 8, o.hair); r(-5, hy, 1, 6, o.hair); r(4, hy, 1, 6, o.hair);
    if (o.long) { r(-5, hy, 10, 10, o.hair); }
  } else {
    r(-4, hy - 1, 8, 3, o.hair); r(-5, hy, 1, 5, o.hair); r(4, hy, 1, 5, o.hair);
    if (o.long) { r(-5, hy, 1, 10, o.hair); r(4, hy, 1, 10, o.hair); }
    if (o.happyEyes) { r(-3, hy + 4, 2, 1, '#222'); r(1, hy + 4, 2, 1, '#222'); }
    else { r(-2, hy + 4, 1, 2, '#222'); r(1, hy + 4, 1, 2, '#222'); }
    r(-1, hy + 6, 2, 1, o.mad ? '#702020' : '#b0504a');
    r(-4, hy + 5, 1, 1, 'rgba(255,120,120,.35)'); r(3, hy + 5, 1, 1, 'rgba(255,120,120,.35)');
  }
  if (o.hat === 'chef') { r(-4, hy - 3, 8, 3, '#fff'); r(-5, hy - 6, 10, 3, '#fff'); r(-4, hy - 3, 8, 1, '#ddd'); }
  if (o.hat === 'salakot') { r(-8, hy - 1, 16, 2, '#d9b25c'); r(-6, hy - 3, 12, 2, '#e8c56e'); r(-3, hy - 5, 6, 2, '#f0d080'); r(-1, hy - 6, 2, 1, '#c09040'); }
}

function drawPlate(c, cx, cy, r, key) {
  blob(c, cx, cy + 2, r, r * .55, 'rgba(0,0,0,.15)');
  blob(c, cx, cy, r, r * .55, '#cfd3d8');
  blob(c, cx, cy - 1, r - 2, r * .55 - 2, '#ffffff');
  const d = DISHES[key];
  if (key === 'lumpia') {
    for (let i = 0; i < 4; i++) {
      const lx = cx - r * .55 + i * r * .3, ly = cy - r * .2 + (i % 2) * 3;
      c.fillStyle = '#b5731e'; c.fillRect(Math.round(lx), Math.round(ly), Math.round(r * .5), Math.max(3, Math.round(r * .18)));
      c.fillStyle = d.c2; c.fillRect(Math.round(lx), Math.round(ly), Math.round(r * .5), Math.max(1, Math.round(r * .08)));
    }
    return;
  }
  if (key === 'kanin') {
    blob(c, cx, cy - r * .1, r * .55, r * .35, '#ffffff');
    blob(c, cx, cy - r * .15, r * .5, r * .28, '#f4f2ea');
    c.fillStyle = '#e6e2d4';
    for (let i = 0; i < 6; i++) c.fillRect(Math.round(cx - r * .4 + i * r * .15), Math.round(cy - r * .2 + (i % 2) * 3), 2, 2);
    return;
  }
  blob(c, cx, cy - 1, r * .65, r * .36, d.c1);
  c.fillStyle = d.c2;
  const pts = [[-.35, -.1], [.2, -.15], [-.05, .08], [.35, .06], [-.2, .12], [.1, -.02]];
  for (const [a, b] of pts) c.fillRect(Math.round(cx + a * r), Math.round(cy + b * r - 1), Math.max(2, Math.round(r * .18)), Math.max(2, Math.round(r * .12)));
}

/* ---------------- ICONS (pixel, 16-grid) ---------------- */
function drawIcon(c, key, s, ox = 0, oy = 0) {
  const u = s / 16;
  const g = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(ox + x * u), Math.round(oy + y * u), Math.ceil(w * u), Math.ceil(h * u)); };
  const b = (x, y, rx, ry, col) => blob(c, ox + x * u, oy + y * u, rx * u, ry * u, col, Math.max(1, Math.round(u)));
  if (DISHES[key]) { drawPlate(c, ox + 8 * u, oy + 9 * u, 7 * u, key); return; }
  switch (key) {
    case 'pork': g(2, 4, 12, 1, '#f7c9b0'); g(2, 5, 12, 7, '#e98f8f'); g(2, 8, 12, 1, '#fff0f0'); g(2, 11, 12, 1, '#c46a6a'); g(1, 5, 1, 6, '#c46a6a'); g(14, 5, 1, 6, '#c46a6a'); break;
    case 'chicken': b(9, 7, 4, 4, '#d99a4e'); b(9, 6, 3, 2, '#e8b06a'); g(3, 10, 5, 2, '#f5f0e0'); g(2, 9, 2, 2, '#f5f0e0'); g(2, 12, 2, 2, '#f5f0e0'); break;
    case 'fish': b(8, 8, 5, 3, '#5a8fd0'); b(8, 9, 4, 1, '#bcd6f2'); g(1, 5, 2, 6, '#3a6fb0'); g(3, 7, 1, 2, '#3a6fb0'); g(10, 7, 1, 1, '#fff'); g(11, 7, 1, 1, '#000'); break;
    case 'gulay': b(6, 7, 4, 4, '#2e7d32'); b(6, 6, 3, 3, '#4caf50'); b(11, 10, 3, 3, '#e53935'); g(11, 7, 1, 1, '#2e7d32'); g(3, 11, 6, 2, '#ff8f00'); g(9, 11, 1, 2, '#ff8f00'); break;
    case 'rice': g(4, 4, 8, 10, '#efe3c2'); g(5, 3, 6, 1, '#d9c9a0'); g(7, 2, 2, 1, '#b08550'); g(5, 7, 6, 4, '#fff'); g(6, 8, 1, 1, '#ccc'); g(9, 9, 1, 1, '#ccc'); g(4, 13, 8, 1, '#c9b48a'); break;
    case 'rekado': g(4, 3, 3, 11, '#3b2314'); g(4, 2, 3, 1, '#d32f2f'); g(4, 7, 3, 3, '#f5deb3'); g(9, 5, 4, 9, '#f5f5f0'); g(9, 4, 4, 1, '#2e7d32'); g(10, 8, 2, 3, '#e57373'); break;
    case 'table': g(1, 5, 14, 3, '#a8692f'); g(1, 8, 14, 1, '#7a4a1e'); g(2, 9, 2, 6, '#7a4a1e'); g(12, 9, 2, 6, '#7a4a1e'); g(6, 3, 4, 2, '#fff'); break;
    case 'ricecooker': g(3, 5, 10, 9, '#f2f4f7'); g(3, 4, 10, 2, '#9ec5e8'); g(6, 3, 4, 1, '#6a9bc8'); g(3, 13, 10, 1, '#b0b8c0'); g(6, 9, 4, 2, '#4a6a8a'); g(7, 9, 1, 1, '#ff5252'); break;
    case 'ref': g(4, 1, 8, 14, '#e8eef2'); g(4, 6, 8, 1, '#9aa6b0'); g(10, 3, 1, 2, '#6a7680'); g(10, 8, 1, 4, '#6a7680'); g(4, 15, 8, 1, '#9aa6b0'); break;
    case 'decor': g(5, 11, 6, 4, '#b5532a'); g(5, 11, 6, 1, '#d06a3a'); b(8, 7, 5, 4, '#2e8b3a'); b(5, 5, 2, 2, '#ff6fa8'); b(11, 6, 2, 2, '#ffd23f'); b(8, 4, 2, 2, '#ff6fa8'); break;
    case 'stove': g(1, 8, 14, 7, '#7d858c'); g(1, 7, 14, 2, '#a7b0b8'); g(3, 11, 2, 2, '#333'); g(11, 11, 2, 2, '#333'); g(4, 3, 8, 4, '#c0c6cc'); g(3, 3, 10, 1, '#e0e4e8'); g(5, 6, 1, 1, '#ff9800'); g(8, 6, 1, 1, '#ffeb3b'); g(10, 6, 1, 1, '#ff9800'); break;
    case 'sign': g(2, 3, 12, 8, '#8a4b1f'); g(3, 4, 10, 6, '#ffcc55'); g(4, 6, 8, 1, '#8a4b1f'); g(5, 8, 6, 1, '#8a4b1f'); g(4, 11, 1, 4, '#5e3618'); g(11, 11, 1, 4, '#5e3618'); g(2, 2, 1, 1, '#fff59d'); g(13, 2, 1, 1, '#fff59d'); break;
    case 'cook': b(8, 10, 6, 3, '#222'); b(8, 9, 5, 2, '#3a3a3a'); b(7, 9, 2, 1, '#a0612f'); b(10, 9, 1, 1, '#4caf50'); g(14, 9, 2, 1, '#5e3618'); g(5, 13, 2, 2, '#ff9800'); g(8, 13, 2, 3, '#ffeb3b'); g(11, 13, 2, 2, '#ff9800'); g(6, 4, 1, 3, '#ddd'); g(9, 3, 1, 3, '#ddd'); break;
    case 'market': g(2, 8, 12, 6, '#c8873e'); g(2, 8, 12, 1, '#e0a55e'); g(4, 10, 8, 1, '#a0652a'); g(4, 4, 8, 1, '#a0652a'); g(3, 4, 1, 5, '#a0652a'); g(12, 4, 1, 5, '#a0652a'); b(5, 7, 2, 2, '#e53935'); b(8, 6, 2, 2, '#4caf50'); b(11, 7, 2, 2, '#ff8f00'); break;
    case 'plate': b(8, 9, 7, 4, '#cfd3d8'); b(8, 8, 6, 3, '#ffffff'); b(8, 8, 3, 1, '#e8e8e8'); break;
    case 'plates': for (let i = 0; i < 3; i++) { b(7, 12 - i * 3, 6, 2, '#cfd3d8'); b(7, 11 - i * 3, 5, 1, '#ffffff'); } g(12, 3, 3, 6, '#cfe8f5'); g(12, 6, 3, 3, '#9fd3ef'); g(12, 3, 3, 1, '#ffffff'); break;
    case 'sink': g(1, 8, 14, 7, '#7a8a96'); g(1, 7, 14, 2, '#c9d3da'); g(3, 7, 7, 1, '#8fa0ac'); g(5, 2, 1, 5, '#b0b8c0'); g(5, 2, 4, 1, '#b0b8c0'); g(8, 3, 1, 3, '#4fc3f7'); g(11, 5, 3, 2, '#ffffff'); g(4, 10, 4, 4, '#5e6c78'); g(9, 10, 4, 4, '#5e6c78'); break;
    case 'upgrade': g(2, 6, 12, 2, '#c0392b'); g(3, 5, 10, 1, '#c0392b'); g(5, 4, 6, 1, '#c0392b'); g(3, 8, 10, 7, '#f5deb3'); g(7, 11, 2, 4, '#8a4b1f'); g(4, 9, 2, 2, '#9fd3ef'); g(10, 9, 2, 2, '#9fd3ef'); g(12, 1, 3, 3, '#4caf50'); g(13, 0, 1, 5, '#2e7d32'); g(11, 2, 5, 1, '#2e7d32'); break;
  }
}
const iconCache = {};
function icon(key, s = 32) {
  const id = key + s;
  if (!iconCache[id]) {
    const cv = document.createElement('canvas'); cv.width = cv.height = s;
    const c = cv.getContext('2d'); drawIcon(c, key, s); iconCache[id] = cv.toDataURL();
  }
  return iconCache[id];
}

/* ---------------- GAME STATE ---------------- */
let S = null;        // persistent state
const G = {          // runtime
  screen: 'menu', t: 0, phase: 'prep', time: 360, paused: false, modal: null, modalDraw: null,
  customers: [], popups: [], seatOcc: {}, spawnT: 2, busX: 640, busTarget: 640, mouse: { x: 0, y: 0 },
  stats: null, cid: 0, P: null, dirty: {}, clean: 10, clouds: [], rain: [],
};

function newState() {
  const s = {
    money: 1500, level: 1, xp: 0, day: 1, rep: 10,
    inv: { pork: 1.2, chicken: 0, fish: 0, gulay: 2, rice: 2, rekado: 3 },
    trays: {}, up: { table: 0, ricecooker: 0, ref: 0, decor: 0, stove: 0, sign: 0, plates: 0, sink: 0 },
    event: null, prices: {}, ayuda: 0, bestDay: 0,
  };
  TRAY_ORDER.forEach(k => s.trays[k] = { n: 0, q: 0 });
  rollPrices(s);
  return s;
}
function rollPrices(s) {
  const m = s.event && EVENTS[s.event].price || 1;
  ITEM_ORDER.forEach(k => s.prices[k] = Math.max(5, Math.round(ITEMS[k].base * rand(.88, 1.15) * m / 5) * 5));
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function loadSave() { try { const d = JSON.parse(localStorage.getItem(SAVE_KEY)); return d && d.trays ? d : null; } catch (e) { return null; } }

const xpNeed = lv => 70 + (lv - 1) * 55;
const unlocked = k => S.level >= DISHES[k].lvl;
const tableCount = () => 2 + S.up.table;
function seats() {
  const out = [];
  for (let i = 0; i < tableCount(); i++) {
    const t = TABLE_SLOTS[i];
    out.push({ i: i * 2, x: t.x - 64, y: t.y + 8, tx: t.x, ty: t.y, side: -1 });
    out.push({ i: i * 2 + 1, x: t.x + 64, y: t.y + 8, tx: t.x, ty: t.y, side: 1 });
  }
  return out;
}

/* ---------------- CANVAS SETUP ---------------- */
const cv = $('#scene'), ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
function fit() { const s = Math.min(innerWidth / 1280, innerHeight / 720); $('#game').style.transform = `scale(${s})`; }
addEventListener('resize', fit); fit();
for (let i = 0; i < 6; i++) G.clouds.push({ x: rand(0, 1280), y: rand(30, 200), s: rand(.7, 1.4), v: rand(6, 14) });

/* ---------------- TITLE SCENE ---------------- */
function drawCloud(c, x, y, s) {
  c.fillStyle = '#ffffff';
  blob(c, x, y, 40 * s, 16 * s, '#fff', 4); blob(c, x - 30 * s, y + 6 * s, 26 * s, 12 * s, '#fff', 4); blob(c, x + 32 * s, y + 6 * s, 28 * s, 12 * s, '#fff', 4);
  blob(c, x, y + 12 * s, 56 * s, 6 * s, '#e3f2fb', 4);
}
function drawTree(c, x, y, s, col = '#3f9b3a') {
  c.fillStyle = '#6b4423'; c.fillRect(x - 6 * s, y - 40 * s, 12 * s, 40 * s);
  blob(c, x, y - 60 * s, 40 * s, 32 * s, '#2f7a2c', 4); blob(c, x - 10 * s, y - 70 * s, 30 * s, 24 * s, col, 4); blob(c, x + 14 * s, y - 56 * s, 22 * s, 18 * s, '#57b04f', 4);
}
function drawPalm(c, x, y, s) {
  c.fillStyle = '#8b6a3e';
  for (let i = 0; i < 12; i++) c.fillRect(x + Math.round(Math.sin(i / 4) * 6 * s), y - i * 10 * s, 10 * s, 11 * s);
  const tx = x + Math.sin(3) * 6 * s + 5 * s, ty = y - 120 * s;
  c.fillStyle = '#2e8b3a';
  for (let a = 0; a < 6; a++) { const ang = a / 6 * Math.PI * 2 + .3; for (let k = 0; k < 8; k++) c.fillRect(Math.round(tx + Math.cos(ang) * k * 7 * s), Math.round(ty + Math.sin(ang) * k * 4 * s + k * k * .4 * s), 8 * s, 6 * s); }
}
function drawFlag(c, x, y, t) {
  c.fillStyle = '#ddd'; c.fillRect(x, y, 6, 200); c.fillStyle = '#ffd23f'; c.fillRect(x - 2, y - 6, 10, 8);
  const w = 120, h = 66;
  for (let i = 0; i < w; i += 4) {
    const off = Math.round(Math.sin(t * 3 + i / 18) * 4 * (i / w));
    c.fillStyle = '#0038a8'; c.fillRect(x + 6 + i, y + 4 + off, 4, h / 2);
    c.fillStyle = '#ce1126'; c.fillRect(x + 6 + i, y + 4 + h / 2 + off, 4, h / 2);
    const tri = Math.max(0, (h / 2) * (1 - i / (w * .5)));
    if (tri > 0) { c.fillStyle = '#fff'; c.fillRect(x + 6 + i, y + 4 + h / 2 - tri + off, 4, tri * 2); }
  }
  blob(c, x + 22, y + 4 + h / 2, 6, 6, '#fcd116', 2);
  c.fillStyle = '#fcd116'; c.fillRect(x + 10, y + 10, 4, 4); c.fillRect(x + 10, y + h - 6, 4, 4); c.fillRect(x + 46, y + h / 2 + 2, 4, 4);
}
function drawJeep(c, x, y) {
  // body
  c.fillStyle = '#5a5f66'; c.fillRect(x + 10, y + 96, 280, 10);
  c.fillStyle = '#c9ced6'; c.fillRect(x + 20, y + 30, 230, 70);
  c.fillStyle = '#e8ecf1'; c.fillRect(x + 20, y + 30, 230, 8);
  c.fillStyle = '#c9ced6'; c.fillRect(x + 250, y + 58, 50, 42);
  c.fillStyle = '#aab0b8'; c.fillRect(x + 250, y + 50, 40, 10);
  // roof & stripes
  c.fillStyle = '#e53935'; c.fillRect(x + 14, y + 16, 244, 14);
  c.fillStyle = '#ffd23f'; c.fillRect(x + 14, y + 12, 244, 5);
  c.fillStyle = '#1e88e5'; c.fillRect(x + 20, y + 80, 230, 6);
  c.fillStyle = '#ffd23f'; c.fillRect(x + 20, y + 87, 230, 4);
  c.fillStyle = '#e53935'; c.fillRect(x + 20, y + 74, 230, 5);
  // windows
  c.fillStyle = '#2b3a4a';
  for (let i = 0; i < 5; i++) c.fillRect(x + 30 + i * 42, y + 40, 34, 26);
  c.fillStyle = '#9fd3ef'; c.fillRect(x + 252, y + 34, 30, 22);
  // passengers silhouettes
  c.fillStyle = '#5a4030'; c.fillRect(x + 76, y + 50, 12, 16); c.fillRect(x + 160, y + 48, 12, 18);
  // grill/headlights
  c.fillStyle = '#e0e0e0'; c.fillRect(x + 290, y + 64, 14, 30); c.fillStyle = '#fff59d'; c.fillRect(x + 292, y + 66, 10, 8);
  // signboard
  c.fillStyle = '#fff'; c.fillRect(x + 40, y + 2, 150, 12); c.fillStyle = '#c62828'; c.font = `11px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BAYAN - PALENGKE', x + 115, y + 8);
  // horse ornament
  c.fillStyle = '#e0e0e0'; c.fillRect(x + 282, y + 40, 6, 12); c.fillRect(x + 280, y + 38, 12, 4);
  // wheels
  for (const wx of [x + 70, x + 250]) { blob(c, wx, y + 108, 20, 20, '#222', 2); blob(c, wx, y + 108, 10, 10, '#9e9e9e', 2); blob(c, wx, y + 108, 4, 4, '#555', 2); }
}
function drawKarinderya(c, x, y, t, open = true) {
  // x,y = left top of roof; width 640
  const W = 640;
  // back wall
  c.fillStyle = '#9a6234'; c.fillRect(x + 30, y + 70, W - 60, 200);
  for (let i = 0; i < W - 60; i += 24) { c.fillStyle = (i / 24) % 2 ? '#a66c3b' : '#9a6234'; c.fillRect(x + 30 + i, y + 70, 24, 200); c.fillStyle = '#7a4a26'; c.fillRect(x + 30 + i, y + 70, 2, 200); }
  // windows with goods
  c.fillStyle = '#4a2810'; c.fillRect(x + 380, y + 110, 180, 80); c.fillStyle = '#ffe9a8'; c.fillRect(x + 386, y + 116, 168, 68);
  c.fillStyle = '#4a2810'; c.fillRect(x + 468, y + 116, 4, 68); c.fillRect(x + 386, y + 148, 168, 4);
  for (let i = 0; i < 6; i++) { c.fillStyle = ['#e53935', '#43a047', '#fb8c00', '#1e88e5', '#fdd835', '#8e24aa'][i]; c.fillRect(x + 394 + i * 26, y + 126, 16, 18); c.fillRect(x + 396 + i * 26, y + 158, 14, 20); }
  // roof (corrugated red)
  for (let i = 0; i < 9; i++) { const yy = y + i * 8; c.fillStyle = i % 2 ? '#b5352a' : '#d0453a'; c.fillRect(x - i * 4, yy, W + i * 8, 8); }
  for (let i = -30; i < W + 30; i += 16) { c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x + i, y, 4, 72); }
  c.fillStyle = '#7a2a20'; c.fillRect(x - 36, y + 70, W + 72, 8);
  // sign
  c.fillStyle = '#5e3618'; c.fillRect(x + 150, y - 34, 340, 40); c.fillStyle = '#fbe3a8'; c.fillRect(x + 156, y - 28, 328, 28);
  txt(c, 'KARINDERYA NI DEYB', x + 320, y - 13, 22, '#8a2a10', 'center', null);
  // posts
  c.fillStyle = '#6b3d1f'; for (const px of [x + 10, x + W / 2 - 6, x + W - 22]) c.fillRect(px, y + 78, 12, 200);
  // lamps
  for (const lx of [x + 120, x + 320, x + 520]) {
    c.fillStyle = '#333'; c.fillRect(lx, y + 78, 2, 20);
    c.fillStyle = '#ffcc55'; c.fillRect(lx - 7, y + 98, 16, 12);
    c.fillStyle = `rgba(255,210,120,${.18 + Math.sin(t * 3 + lx) * .05})`; blob(c, lx + 1, y + 104, 26, 20, c.fillStyle, 2);
  }
  // counter with pots
  c.fillStyle = '#7a4a26'; c.fillRect(x + 40, y + 200, 300, 70); c.fillStyle = '#b07a43'; c.fillRect(x + 36, y + 194, 308, 10);
  for (let i = 0; i < 5; i++) { const px = x + 70 + i * 56; c.fillStyle = '#b0b8c0'; c.fillRect(px, y + 174, 40, 22); c.fillStyle = '#dde3e8'; c.fillRect(px - 2, y + 172, 44, 5); c.fillStyle = ['#6b3a1e', '#6f8f2f', '#e6cf7a', '#d9b65a', '#d4952e'][i]; c.fillRect(px + 3, y + 177, 34, 6); }
  // steam
  for (let i = 0; i < 5; i++) { const sx = x + 90 + i * 56, sy = y + 160 - ((t * 20 + i * 13) % 40); c.fillStyle = `rgba(255,255,255,${.5 - ((t * 20 + i * 13) % 40) / 80})`; c.fillRect(sx + Math.sin(t * 2 + i) * 4, sy, 6, 6); }
}
function drawTitle(c, t) {
  // sky
  const gr = c.createLinearGradient(0, 0, 0, 500); gr.addColorStop(0, '#5fb8ec'); gr.addColorStop(1, '#cdeeff');
  c.fillStyle = gr; c.fillRect(0, 0, 1280, 720);
  // sun
  c.fillStyle = 'rgba(255,240,150,.35)'; blob(c, 1120, 110, 80, 80, c.fillStyle, 4);
  blob(c, 1120, 110, 50, 50, '#ffd84a', 4); blob(c, 1112, 100, 30, 30, '#fff1a0', 4);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * .2; c.fillStyle = '#ffd84a'; c.fillRect(1120 + Math.cos(a) * 70 - 4, 110 + Math.sin(a) * 70 - 4, 8, 8); }
  // clouds
  for (const cl of G.clouds) { cl.x += cl.v * .016; if (cl.x > 1380) cl.x = -120; drawCloud(c, cl.x, cl.y, cl.s); }
  // city
  const bld = [[0, 120], [70, 180], [130, 140], [200, 210], [260, 150], [880, 170], [940, 230], [1010, 150], [1070, 200], [1150, 140], [1210, 190]];
  for (const [bx, bh] of bld) { c.fillStyle = '#9fb9cf'; c.fillRect(bx, 420 - bh, 60, bh); c.fillStyle = '#b9d0e2'; for (let wy = 430 - bh; wy < 410; wy += 18) for (let wx = 8; wx < 52; wx += 14) c.fillRect(bx + wx, wy, 6, 8); }
  // hills/trees
  blob(c, 200, 470, 360, 90, '#5fae4f', 4); blob(c, 1100, 470, 360, 90, '#5fae4f', 4);
  drawTree(c, 60, 470, 1.4); drawTree(c, 1230, 470, 1.5, '#4ea446'); drawPalm(c, 1000, 470, 1.6); drawTree(c, 330, 440, 1.1); drawTree(c, 960, 440, 1.0);
  // ground
  c.fillStyle = '#6dbb56'; c.fillRect(0, 460, 1280, 260);
  c.fillStyle = '#d9b27a'; c.fillRect(0, 600, 1280, 120);
  c.fillStyle = '#c99e62'; for (let i = 0; i < 1280; i += 40) c.fillRect(i + ((i / 40) % 2) * 12, 640 + ((i / 40) % 3) * 18, 14, 4);
  drawFlag(c, 140, 240, t);
  drawKarinderya(c, 320, 300, t);
  // plants & flowers
  for (const [px, py] of [[310, 600], [950, 600], [1010, 610]]) { c.fillStyle = '#b5532a'; c.fillRect(px - 16, py - 24, 32, 24); c.fillStyle = '#d06a3a'; c.fillRect(px - 18, py - 26, 36, 6); blob(c, px, py - 40, 26, 18, '#2e8b3a', 4); blob(c, px - 8, py - 48, 6, 6, '#ff6fa8', 2); blob(c, px + 10, py - 44, 6, 6, '#ffd23f', 2); }
  for (let i = 0; i < 18; i++) { const fx = 960 + (i * 37) % 300, fy = 560 + (i * 23) % 40; c.fillStyle = ['#ff6fa8', '#fff', '#ffd23f', '#e53935'][i % 4]; c.fillRect(fx, fy, 6, 6); c.fillStyle = '#2e7d32'; c.fillRect(fx + 2, fy + 6, 2, 6); }
  drawJeep(c, 10 + Math.sin(t * 8) * .8, 540 + Math.abs(Math.sin(t * 8)) * 1.5);
}

/* ---------------- RESTAURANT SCENE ---------------- */
function drawTable(c, x, y) {
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x - 50, y - 2, 100, 8);
  c.fillStyle = '#6b3d1f'; c.fillRect(x - 40, y - 22, 8, 24); c.fillRect(x + 32, y - 22, 8, 24);
  // red & white checkered plastic tablecloth (mantel)
  for (let yy = 0; yy < 32; yy += 8) for (let xx = 0; xx < 96; xx += 8) {
    c.fillStyle = ((xx + yy) / 8) % 2 ? '#f4f1ea' : '#d8413a'; c.fillRect(x - 48 + xx, y - 54 + yy, 8, 8);
  }
  c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x - 48, y - 54, 96, 3);
  // cloth hanging over the edge
  for (let xx = 0; xx < 100; xx += 8) { c.fillStyle = (xx / 8) % 2 ? '#e9e4da' : '#b8332d'; c.fillRect(x - 50 + xx, y - 22, 8, 9); }
  // condiments: patis, toyo, suka with sili, toothpick holder
  c.fillStyle = '#e0e0e0'; c.fillRect(x - 6, y - 48, 12, 8); c.fillStyle = '#c9a36a'; c.fillRect(x - 4, y - 52, 2, 5); c.fillRect(x, y - 53, 2, 6); c.fillRect(x + 3, y - 51, 2, 4);
  c.fillStyle = '#3b2314'; c.fillRect(x + 10, y - 50, 5, 11); c.fillStyle = '#d32f2f'; c.fillRect(x + 10, y - 52, 5, 3);
  c.fillStyle = '#efe9c9'; c.fillRect(x - 17, y - 50, 5, 11); c.fillStyle = '#e53935'; c.fillRect(x - 16, y - 46, 2, 4); c.fillStyle = '#43a047'; c.fillRect(x - 14, y - 44, 1, 3);
}
/* white (sometimes red) monobloc plastic chair — side: -1 = left of table, 1 = right */
function drawStool(c, x, y, side = -1, red = false) {
  const col = red ? '#d84a3a' : '#f2f2ee', sh = red ? '#a8352a' : '#c9c9c2';
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x - 16, y - 2, 32, 6);
  c.fillStyle = sh; c.fillRect(x - 14, y - 14, 4, 14); c.fillRect(x + 10, y - 14, 4, 14);
  c.fillStyle = col; c.fillRect(x - 15, y - 20, 30, 8); c.fillStyle = sh; c.fillRect(x - 15, y - 13, 30, 2);
  // backrest on the outer side, with the classic slots
  const bx = side < 0 ? x - 17 : x + 11;
  c.fillStyle = col; c.fillRect(bx, y - 46, 6, 30);
  c.fillStyle = sh; c.fillRect(bx + 2, y - 42, 2, 5); c.fillRect(bx + 2, y - 34, 2, 5); c.fillRect(bx + 2, y - 26, 2, 5);
}
/* ---- Filipino atmosphere props ---- */
const STREET = { x: 352, y: 86, w: 74, h: 92 };
function updateStreet(dt) {
  const s = G.street || (G.street = { cars: [], next: rand(3, 8) });
  s.next -= dt;
  if (s.next <= 0) {
    s.next = rand(7, 16);
    const dir = Math.random() < .5 ? 1 : -1, type = pick(['jeep', 'jeep', 'trike', 'trike', 'taho']);
    s.cars.push({ type, dir, x: dir > 0 ? -70 : STREET.w + 70, speed: type === 'taho' ? 10 : rand(28, 44), honked: false, col: pick(['#e53935', '#1e88e5', '#fdd835', '#43a047', '#8e24aa']) });
  }
  for (const car of s.cars) {
    car.x += car.dir * car.speed * dt;
    if (!car.honked && Math.abs(car.x - STREET.w / 2) < 10) {
      car.honked = true;
      if (G.screen === 'game' && !G.modal && Math.random() < .45) {
        if (car.type === 'taho') { popup('Tahooo!', STREET.x + 37, STREET.y - 6, '#fff6dc', 14); tone(523, .25, 'triangle', .03); tone(392, .4, 'triangle', .03, .25); }
        else { popup('Beep beep!', STREET.x + 37, STREET.y - 6, '#fff6dc', 14); tone(440, .09, 'square', .025); tone(440, .12, 'square', .025, .14); }
      }
    }
  }
  s.cars = s.cars.filter(car => car.x > -90 && car.x < STREET.w + 90);
}
function drawStreetWindow(c, t, night) {
  const { x, y, w, h } = STREET;
  c.fillStyle = '#4a2810'; c.fillRect(x - 8, y - 8, w + 16, h + 16);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  // sky
  c.fillStyle = night > .5 ? '#1f2a4a' : night > 0 ? '#e7905a' : '#8fd0f0'; c.fillRect(x, y, w, h);
  // houses across the street with yero roofs
  c.fillStyle = '#d9c49a'; c.fillRect(x - 4, y + 34, 40, 34); c.fillStyle = '#8f9aa3'; c.fillRect(x - 6, y + 28, 44, 7);
  c.fillStyle = '#b5d1a8'; c.fillRect(x + 40, y + 40, 40, 28); c.fillStyle = '#b5352a'; c.fillRect(x + 38, y + 34, 44, 7);
  c.fillStyle = night > .5 ? '#ffe08a' : '#5e6c78'; c.fillRect(x + 8, y + 44, 8, 8); c.fillRect(x + 52, y + 48, 8, 8);
  // electric wires (kawad)
  c.fillStyle = '#222'; c.fillRect(x, y + 16, w, 1); c.fillRect(x, y + 21, w, 1);
  // road
  c.fillStyle = '#6b6f73'; c.fillRect(x, y + 68, w, 24); c.fillStyle = '#e8e8e0'; for (let i = 0; i < w; i += 18) c.fillRect(x + i + ((t * 10) % 18) * 0, y + 79, 8, 2);
  // vehicles
  for (const car of (G.street ? G.street.cars : [])) {
    const cx = x + car.x, cy = y + 84;
    if (car.type === 'jeep') {
      c.fillStyle = '#c9ced6'; c.fillRect(cx - 30, cy - 16, 60, 14); c.fillStyle = car.col; c.fillRect(cx - 30, cy - 19, 60, 4); c.fillRect(cx - 30, cy - 6, 60, 2);
      c.fillStyle = '#2b3a4a'; for (let i = 0; i < 4; i++) c.fillRect(cx - 26 + i * 12, cy - 14, 8, 5);
      c.fillStyle = '#ffd23f'; c.fillRect(cx + car.dir * 28 - 1, cy - 10, 3, 3);
      c.fillStyle = '#e0e0e0'; c.fillRect(cx + car.dir * 26, cy - 24, 2, 5);
      c.fillStyle = '#222'; c.fillRect(cx - 22, cy - 3, 8, 5); c.fillRect(cx + 14, cy - 3, 8, 5);
    } else if (car.type === 'trike') {
      c.fillStyle = car.col; c.fillRect(cx - 14, cy - 16, 20, 14); c.fillStyle = '#2b3a4a'; c.fillRect(cx - 11, cy - 13, 8, 6);
      c.fillStyle = '#333'; c.fillRect(cx + 6 * car.dir, cy - 12, 10, 3);
      c.fillStyle = '#222'; c.fillRect(cx - 12, cy - 3, 6, 5); c.fillRect(cx + 8, cy - 3, 6, 5);
    } else { // taho vendor with two buckets on a pole
      const bob = Math.abs(Math.sin(t * 6)) * 2;
      c.fillStyle = '#8a5a32'; c.fillRect(cx - 16, cy - 22 - bob, 32, 2);
      c.fillStyle = '#c0c6cc'; c.fillRect(cx - 18, cy - 20 - bob, 8, 10); c.fillRect(cx + 10, cy - 20 - bob, 8, 10);
      c.fillStyle = '#e0ac69'; c.fillRect(cx - 3, cy - 30 - bob, 6, 6); c.fillStyle = '#3498db'; c.fillRect(cx - 4, cy - 24 - bob, 8, 12);
      c.fillStyle = '#333'; c.fillRect(cx - 3, cy - 12 - bob, 2, 8); c.fillRect(cx + 1, cy - 12 - bob, 2, 8);
    }
  }
  c.restore();
  // window bars & open capiz shutters
  c.fillStyle = '#4a2810'; c.fillRect(x + w / 2 - 1, y, 2, h); c.fillRect(x, y + h / 2 - 1, w, 2);
  for (const sx of [x - 24, x + w + 8]) {
    c.fillStyle = '#6b3d1f'; c.fillRect(sx, y - 6, 16, h + 12);
    for (let yy = 0; yy < h + 4; yy += 8) for (let xx = 0; xx < 12; xx += 6) { c.fillStyle = (yy / 8 + xx / 6) % 2 ? '#f3ead2' : '#e8dcc0'; c.fillRect(sx + 2 + xx, y - 4 + yy, 5, 7); }
  }
}
function drawWallClock(c, x, y) {
  blob(c, x, y, 19, 19, '#5e3618', 2); blob(c, x, y, 16, 16, '#fffbe8', 2);
  c.fillStyle = '#3a2210'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.fillRect(Math.round(x + Math.cos(a) * 13) - 1, Math.round(y + Math.sin(a) * 13) - 1, 2, 2); }
  const m = G.time % 60, h = (G.time / 60) % 12;
  c.strokeStyle = '#3a2210'; c.lineCap = 'round';
  c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(h / 12 * Math.PI * 2) * 8, y - Math.cos(h / 12 * Math.PI * 2) * 8); c.stroke();
  c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(m / 60 * Math.PI * 2) * 12, y - Math.cos(m / 60 * Math.PI * 2) * 12); c.stroke();
  c.lineCap = 'butt'; c.fillStyle = '#d32f2f'; c.fillRect(x - 1, y - 1, 3, 3);
}
function drawCalendar(c, x, y) {
  c.fillStyle = '#222'; c.fillRect(x + 20, y - 6, 2, 6);
  c.fillStyle = '#fff'; c.fillRect(x, y, 42, 48);
  c.fillStyle = '#7fbf4d'; c.fillRect(x + 3, y + 3, 36, 14); c.fillStyle = '#ffd23f'; c.fillRect(x + 26, y + 5, 6, 6); c.fillStyle = '#2e7d32'; c.fillRect(x + 3, y + 12, 36, 5);
  c.fillStyle = '#d32f2f'; c.fillRect(x, y + 18, 42, 8);
  txt(c, 'ARAW', x + 21, y + 22, 8, '#fff', 'center', null);
  txt(c, String(S.day), x + 21, y + 37, 15, '#d32f2f', 'center', null);
}
function drawUtangSign(c, x, y) {
  c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x + 3, y + 3, 150, 40);
  c.fillStyle = '#fffdf0'; c.fillRect(x, y, 150, 40);
  c.fillStyle = '#c9c9c2'; c.fillRect(x + 6, y - 3, 14, 6); c.fillRect(x + 130, y - 3, 14, 6);
  txt(c, 'BAWAL ANG UTANG', x + 75, y + 14, 15, '#d32f2f', 'center', null);
  txt(c, 'Bukas, pwede na!', x + 75, y + 30, 11, '#3a2210', 'center', null);
}
function drawCapizLamp(c, x, t, night) {
  c.fillStyle = '#222'; c.fillRect(x, 70, 2, 26);
  c.fillStyle = '#8a5a32'; c.fillRect(x - 14, 94, 30, 4);
  for (let i = 0; i < 6; i++) { const sw = Math.sin(t * 2 + i) * 1; c.fillStyle = i % 2 ? '#f3ead2' : '#e8dcc0'; c.fillRect(x - 13 + i * 5, 98, 4, 18 + (i === 2 || i === 3 ? 4 : 0) + sw); }
  c.fillStyle = '#fff3c4'; c.fillRect(x - 4, 108, 10, 6);
  if (night > 0 || S.up.decor) { c.fillStyle = `rgba(255,225,150,${.1 + night * .25})`; blob(c, x + 1, 120, 56, 36, c.fillStyle, 4); }
}
function drawRadio(c, x, y, t) {
  c.fillStyle = '#5e3618'; c.fillRect(x, y, 40, 22); c.fillStyle = '#8a5a32'; c.fillRect(x, y, 40, 3);
  c.fillStyle = '#3a2a1a'; for (let i = 0; i < 4; i++) c.fillRect(x + 4, y + 6 + i * 4, 14, 2);
  c.fillStyle = '#f3ead2'; c.fillRect(x + 22, y + 6, 14, 6); c.fillStyle = '#d32f2f'; c.fillRect(x + 24 + Math.round((Math.sin(t * .3) + 1) * 4), y + 6, 1, 6);
  c.fillStyle = '#c9c9c2'; c.fillRect(x + 24, y + 15, 4, 4); c.fillRect(x + 31, y + 15, 4, 4);
  c.fillStyle = '#9aa3ab'; c.fillRect(x + 34, y - 16, 2, 16);
  if (settings.music) for (let i = 0; i < 2; i++) {
    const ph = (t * 18 + i * 20) % 40, a = 1 - ph / 40;
    c.globalAlpha = a; txt(c, i ? '♫' : '♪', x + 10 + i * 14 + Math.sin(t * 3 + i) * 3, y - 6 - ph, 13, '#fff6dc', 'center', '#5e3618', 3); c.globalAlpha = 1;
  }
}
function drawFan(c, x, y, t) {
  const sway = Math.sin(t * .8) * 6;
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x - 16, y - 2, 32, 6);
  c.fillStyle = '#3a6fb0'; c.fillRect(x - 14, y - 6, 28, 6); c.fillStyle = '#9aa3ab'; c.fillRect(x - 2, y - 56, 4, 50);
  const hx = x + sway, hy = y - 74;
  blob(c, hx, hy, 20, 20, '#c9d3da', 2); blob(c, hx, hy, 17, 17, '#e8eef2', 2);
  c.fillStyle = 'rgba(58,111,176,.75)';
  for (let i = 0; i < 3; i++) { const a = t * 18 + i * Math.PI * 2 / 3; blob(c, hx + Math.cos(a) * 9, hy + Math.sin(a) * 9, 6, 6, c.fillStyle, 2); }
  c.fillStyle = '#9aa3ab'; for (let i = -16; i <= 16; i += 6) c.fillRect(hx + i, hy - 16, 1, 32);
  blob(c, hx, hy, 4, 4, '#3a6fb0', 2);
}
function drawPlant(c, x, y, big) {
  const s = big ? 1.3 : 1;
  c.fillStyle = '#b5532a'; c.fillRect(x - 14 * s, y - 22 * s, 28 * s, 22 * s); c.fillStyle = '#d06a3a'; c.fillRect(x - 16 * s, y - 24 * s, 32 * s, 6 * s);
  blob(c, x, y - 40 * s, 22 * s, 18 * s, '#2e7d32', 2); blob(c, x - 6 * s, y - 48 * s, 14 * s, 12 * s, '#43a047', 2); blob(c, x + 9 * s, y - 36 * s, 10 * s, 8 * s, '#66bb6a', 2);
}
function drawBubble(c, x, y, key, frac, out, t) {
  const w = 56, h = 46, bx = Math.round(x - w / 2), by = Math.round(y - h - 16);
  // patience bar
  c.fillStyle = '#2b170a'; c.fillRect(bx, by - 11, w, 8);
  c.fillStyle = frac > .5 ? '#5ccf4f' : frac > .25 ? '#ffc107' : '#f44336'; c.fillRect(bx + 1, by - 10, Math.max(0, (w - 2) * frac), 6);
  rr(c, bx, by, w, h, 10); c.fillStyle = '#fff'; c.fill();
  c.lineWidth = 3; c.strokeStyle = out ? (Math.sin(t * 10) > 0 ? '#e53935' : '#ff9a8a') : '#3a2210'; c.stroke();
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x - 7, by + h - 2); c.lineTo(x, by + h + 9); c.lineTo(x + 7, by + h - 2); c.fill();
  c.strokeStyle = out ? '#e53935' : '#3a2210'; c.beginPath(); c.moveTo(x - 7, by + h); c.lineTo(x, by + h + 9); c.lineTo(x + 7, by + h); c.stroke();
  drawPlate(c, x, by + h / 2 + 1, 18, key);
  if (out) { c.strokeStyle = '#e53935'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx + 8, by + 8); c.lineTo(bx + w - 8, by + h - 8); c.stroke(); }
}
function drawEmote(c, x, y, kind) {
  const bx = x - 16, by = y - 44;
  rr(c, bx, by, 32, 28, 8); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#3a2210'; c.stroke();
  if (kind === 'heart') { c.fillStyle = '#f2457a'; c.fillRect(x - 9, by + 7, 7, 6); c.fillRect(x + 2, by + 7, 7, 6); c.fillRect(x - 9, by + 11, 18, 5); c.fillRect(x - 6, by + 16, 12, 4); c.fillRect(x - 3, by + 20, 6, 3); }
  else if (kind === 'smile') { c.fillStyle = '#ffc107'; blob(c, x, by + 14, 10, 10, '#ffc107', 2); c.fillStyle = '#3a2210'; c.fillRect(x - 5, by + 10, 3, 3); c.fillRect(x + 2, by + 10, 3, 3); c.fillRect(x - 5, by + 17, 10, 2); c.fillRect(x - 6, by + 15, 2, 2); c.fillRect(x + 4, by + 15, 2, 2); }
  else if (kind === 'meh') { blob(c, x, by + 14, 10, 10, '#ffd36b', 2); c.fillStyle = '#3a2210'; c.fillRect(x - 5, by + 10, 3, 3); c.fillRect(x + 2, by + 10, 3, 3); c.fillRect(x - 5, by + 17, 10, 2); }
  else if (kind === 'angry') { blob(c, x, by + 14, 10, 10, '#ff6b4a', 2); c.fillStyle = '#3a0a0a'; c.fillRect(x - 6, by + 8, 4, 2); c.fillRect(x + 2, by + 8, 4, 2); c.fillRect(x - 5, by + 11, 3, 3); c.fillRect(x + 2, by + 11, 3, 3); c.fillRect(x - 4, by + 18, 8, 2); c.fillRect(x - 6, by + 20, 2, 2); c.fillRect(x + 4, by + 20, 2, 2); }
}

function drawRestaurant(c, t) {
  const night = clamp((G.time - 17.5 * 60) / 150, 0, 1);
  // ---- back wall
  c.fillStyle = '#7a4a26'; c.fillRect(0, 0, 1280, 270);
  for (let x = 0; x < 1280; x += 32) { c.fillStyle = (x / 32) % 2 ? '#86522b' : '#7a4a26'; c.fillRect(x, 66, 32, 204); c.fillStyle = '#5e3618'; c.fillRect(x, 66, 2, 204); }
  c.fillStyle = '#4a2810'; c.fillRect(0, 58, 1280, 12);
  c.fillStyle = '#5e3618'; c.fillRect(0, 236, 1280, 34);
  c.fillStyle = '#3a1f0b'; c.fillRect(0, 266, 1280, 6);
  // decor: banderitas
  if (S.up.decor) {
    const cols = ['#e53935', '#fdd835', '#1e88e5', '#43a047', '#ff6fa8', '#fb8c00'];
    for (let i = 0; i < 40; i++) { const bx = 10 + i * 32, sag = Math.sin(i / 40 * Math.PI * 4) * 6; c.fillStyle = cols[i % 6]; c.beginPath(); c.moveTo(bx, 74 + sag); c.lineTo(bx + 24, 74 + sag); c.lineTo(bx + 12, 94 + sag); c.fill(); }
    c.fillStyle = '#fff'; c.fillRect(0, 72, 1280, 2);
  }
  // chalkboard menu
  c.fillStyle = '#5e3618'; c.fillRect(124, 92, 216, 126); c.fillStyle = '#2e3b2f'; c.fillRect(132, 100, 200, 110);
  txt(c, 'ULAM NGAYON', 232, 114, 16, '#fff59d', 'center', null);
  let my = 134;
  for (const k of VIANDS) { if (!unlocked(k)) continue; c.font = `13px ${FONT}`; c.textAlign = 'left'; c.fillStyle = '#f2f2e6'; c.fillText(DISHES[k].name, 142, my); c.textAlign = 'right'; c.fillText(peso(DISHES[k].price), 322, my); my += 17; }
  c.textAlign = 'left'; c.fillStyle = '#c8e6c9'; c.font = `12px ${FONT}`; c.fillText('+ Kanin ₱15', 142, Math.min(my, 202));
  // fridge or shelf (left)
  if (S.up.ref) {
    c.fillStyle = '#c9d3da'; c.fillRect(26, 90, 84, 172); c.fillStyle = '#eef3f6'; c.fillRect(30, 94, 76, 164);
    c.fillStyle = '#9aa6b0'; c.fillRect(30, 146, 76, 3); c.fillStyle = '#6a7680'; c.fillRect(94, 112, 4, 22); c.fillRect(94, 162, 4, 40);
    c.fillStyle = '#ff6fa8'; c.fillRect(46, 108, 10, 10); c.fillStyle = '#ffd23f'; c.fillRect(60, 170, 12, 8);
  } else {
    c.fillStyle = '#5e3618'; c.fillRect(20, 150, 92, 8); c.fillRect(20, 210, 92, 8);
    for (let i = 0; i < 4; i++) { c.fillStyle = ['#e57373', '#fff176', '#81c784', '#ffb74d'][i]; c.fillRect(26 + i * 22, 130, 14, 20); c.fillStyle = '#ddd'; c.fillRect(26 + i * 22, 126, 14, 4); }
    drawPlant(c, 66, 210, false);
  }
  // sign over counter
  if (S.up.sign) {
    c.fillStyle = '#5e3618'; c.fillRect(440, 88, 400, 52); c.fillStyle = '#ffcc55'; c.fillRect(446, 94, 388, 40);
    for (let i = 0; i < 20; i++) { c.fillStyle = (Math.floor(t * 4) + i) % 2 ? '#fff59d' : '#ff7043'; c.fillRect(444 + i * 20, 86, 6, 6); c.fillRect(444 + i * 20, 136, 6, 6); }
    txt(c, "KARINDERYA NI DEYB", 640, 115, 24, '#8a2a10', 'center', null);
  } else {
    c.fillStyle = '#5e3618'; c.fillRect(500, 96, 280, 40); c.fillStyle = '#d9b27a'; c.fillRect(505, 101, 270, 30);
    txt(c, "KARINDERYA NI DEYB", 640, 117, 18, '#5e3618', 'center', null);
  }
  // Pinoy wall: street window, wall clock, calendar, capiz lamp
  drawStreetWindow(c, t, night);
  drawWallClock(c, 470, 165);
  drawCalendar(c, 788, 142);
  drawCapizLamp(c, 870, t, night);
  // ---- kitchen (right)
  c.fillStyle = '#5e3618'; c.fillRect(940, 120, 330, 8);
  for (let i = 0; i < 6; i++) { c.fillStyle = ['#e57373', '#fff176', '#81c784', '#ffb74d', '#a1887f', '#90caf9'][i]; c.fillRect(950 + i * 26, 100, 16, 20); c.fillStyle = '#eee'; c.fillRect(950 + i * 26, 96, 16, 4); }
  c.fillStyle = '#5e3618'; c.fillRect(1120, 84, 2, 40); c.fillStyle = '#bbb'; c.fillRect(1130, 84, 3, 34); c.fillRect(1142, 84, 3, 30); c.fillStyle = '#888'; c.fillRect(1126, 116, 10, 6); c.fillRect(1139, 112, 10, 4);
  c.fillStyle = '#6d757c'; c.fillRect(930, 178, 350, 92); c.fillStyle = '#9aa3ab'; c.fillRect(926, 170, 354, 12); c.fillStyle = '#b8c0c8'; c.fillRect(926, 170, 354, 3);
  // stove
  c.fillStyle = '#3a3f44'; c.fillRect(950, 160, 170, 14);
  const burners = S.up.stove ? [980, 1035, 1090] : [990, 1070];
  burners.forEach((bx, i) => {
    c.fillStyle = '#b0b8c0'; c.fillRect(bx - 22, 128, 44, 32); c.fillStyle = '#dde3e8'; c.fillRect(bx - 25, 124, 50, 6); c.fillStyle = '#555'; c.fillRect(bx - 28, 134, 4, 6); c.fillRect(bx + 24, 134, 4, 6);
    if (G.phase !== 'prep' || i === 0) {
      for (let k = 0; k < 3; k++) { const ph = (t * 18 + k * 12 + i * 7) % 36; c.fillStyle = `rgba(255,255,255,${.55 - ph / 70})`; c.fillRect(bx - 10 + k * 8 + Math.sin(t * 2 + k) * 3, 118 - ph, 6, 6); }
      c.fillStyle = Math.sin(t * 20 + i) > 0 ? '#ff9800' : '#ffc107'; c.fillRect(bx - 12, 160, 6, 4); c.fillRect(bx - 2, 159, 6, 5); c.fillRect(bx + 8, 160, 6, 4);
    }
  });
  // rice cooker
  const rcx = 1180;
  c.fillStyle = S.up.ricecooker ? '#e3ecff' : '#f2f2f2'; c.fillRect(rcx, 136, 56, 36); c.fillStyle = S.up.ricecooker ? '#5c8fe0' : '#e08ab0'; c.fillRect(rcx - 2, 128, 60, 10); c.fillStyle = '#555'; c.fillRect(rcx + 22, 124, 14, 4);
  c.fillStyle = '#333'; c.fillRect(rcx + 20, 150, 16, 8); c.fillStyle = S.trays.kanin.n > 0 ? '#76ff03' : '#ff5252'; c.fillRect(rcx + 23, 152, 4, 4);
  if (S.up.ricecooker) { c.fillStyle = '#fff'; c.fillRect(rcx + 4, 140, 4, 20); }
  drawUtangSign(c, 950, 196);
  // kitchen hover hint
  if (hoverKitchen()) { c.strokeStyle = '#ffe680'; c.lineWidth = 3; c.strokeRect(926, 92, 354, 92); txt(c, 'KUSINA – Magluto!', 1100, 80, 18, '#ffe680'); }

  // ---- Aling Mery behind counter (tindera)
  G.busX += (G.busTarget - G.busX) * Math.min(1, .1);
  drawPerson(c, G.busX, 232, { shirt: '#8a5bb5', hair: '#d8d8e0', skin: '#eab88a', pants: '#4e342e', apron: true, happyEyes: true, frame: 0, bob: Math.sin(t * 3) * .4 });
  c.fillStyle = '#c9c9d4'; c.fillRect(Math.round(G.busX - 6), 154, 12, 6);

  // ---- display counter (turo-turo)
  c.fillStyle = '#4a2810'; c.fillRect(374, 190, 532, 8);
  c.fillStyle = 'rgba(200,235,245,.55)'; c.fillRect(380, 196, 520, 48);
  TRAY_ORDER.forEach((k, i) => {
    const tx = 388 + i * 85, ty = 204, tw = 76, th = 34;
    c.fillStyle = '#8f979f'; c.fillRect(tx, ty, tw, th); c.fillStyle = '#c9ced4'; c.fillRect(tx + 2, ty + 2, tw - 4, th - 4);
    const tr = S.trays[k];
    if (!unlocked(k)) { c.fillStyle = '#5a6068'; c.fillRect(tx + 2, ty + 2, tw - 4, th - 4); txt(c, 'Antas ' + DISHES[k].lvl, tx + tw / 2, ty + th / 2, 14, '#ccc', 'center', null); return; }
    if (tr.n > 0) {
      const fill = clamp(tr.n / 16, .25, 1), d = DISHES[k];
      const fw = Math.round((tw - 8) * fill);
      if (k === 'lumpia') { for (let j = 0; j < Math.ceil(fill * 6); j++) { c.fillStyle = '#b5731e'; c.fillRect(tx + 6 + j * 11, ty + 8, 9, 20); c.fillStyle = d.c2; c.fillRect(tx + 6 + j * 11, ty + 8, 9, 4); } }
      else if (k === 'kanin') { blob(c, tx + tw / 2, ty + th / 2, Math.max(10, fw / 2), 12, '#ffffff', 2); blob(c, tx + tw / 2, ty + th / 2 - 3, Math.max(8, fw / 2 - 4), 7, '#f4f2ea', 2); }
      else { c.fillStyle = d.c1; c.fillRect(tx + 4, ty + 6, fw, th - 10); c.fillStyle = d.c2; for (let j = 0; j < fw / 9; j++) c.fillRect(tx + 6 + j * 9, ty + 9 + (j % 2) * 10, 5, 5); }
      if (k !== 'kanin' && k !== 'lumpia') for (let j = 0; j < 2; j++) { const ph = (t * 14 + i * 9 + j * 15) % 30; c.fillStyle = `rgba(255,255,255,${.45 - ph / 70})`; c.fillRect(tx + 20 + j * 30, ty - ph, 4, 4); }
    } else { txt(c, 'Ubos', tx + tw / 2, ty + th / 2, 14, '#8a8f96', 'center', null); }
  });
  c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(384, 198, 512, 3);
  // front panel
  c.fillStyle = '#8f5a2c'; c.fillRect(368, 244, 544, 44); c.fillStyle = '#c08a50'; c.fillRect(364, 240, 552, 8);
  for (let x = 368; x < 912; x += 34) { c.fillStyle = '#7a4a22'; c.fillRect(x, 248, 2, 40); }
  TRAY_ORDER.forEach((k, i) => { if (!unlocked(k)) return; const n = S.trays[k].n; txt(c, (k === 'kanin' ? 'Kanin ' : '') + 'x' + n, 388 + i * 85 + 38, 268, 17, n > 0 ? '#fff' : '#ff9a8a', 'center', '#3a1f0b', 4); });

  drawRadio(c, 862, 168, t);
  // ---- floor
  for (let y = 288; y < 720; y += 40) for (let x = 0; x < 1280; x += 40) { c.fillStyle = ((x + y) / 40) % 2 ? '#c99a63' : '#bb8b55'; c.fillRect(x, y, 40, 40); }
  c.fillStyle = '#c99a63'; c.fillRect(0, 272, 368, 16); c.fillRect(912, 272, 368, 16);
  c.fillStyle = 'rgba(0,0,0,.06)'; for (let y = 288; y < 720; y += 40) c.fillRect(0, y, 1280, 2);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(368, 288, 544, 6);
  // door mat
  c.fillStyle = '#a33'; c.fillRect(580, 620, 120, 14);

  // ---- floor objects sorted by y
  const objs = [];
  const st = seats();
  for (let i = 0; i < tableCount(); i++) { const tb = TABLE_SLOTS[i]; objs.push({ y: tb.y, d: () => drawTable(c, tb.x, tb.y) }); }
  for (const s of st) objs.push({ y: s.y - 1, d: () => drawStool(c, s.x, s.y, s.side, s.i % 3 === 2) });
  objs.push({ y: 345, d: () => drawFan(c, 40, 345, t) });
  const plants = []; if (S.up.decor) plants.push([340, 330], [940, 330], [40, 600], [1240, 600]);
  for (const [px, py] of plants) objs.push({ y: py, d: () => drawPlant(c, px, py, true) });
  for (const cu of G.customers) objs.push({ y: cu.y + .5, d: () => drawCustomer(c, cu, t) });
  if (G.beggar) objs.push({ y: G.beggar.y + .4, d: () => drawBeggar(c, t) });
  objs.push({ y: SINK.y + SINK.h, d: () => drawSink(c, t) });
  objs.push({ y: G.P.y + .6, d: () => drawPlayer(c, t) });
  objs.sort((a, b) => a.y - b.y).forEach(o => o.d());

  // plates on tables
  for (const cu of G.customers) if (cu.state === 'eating') { const s = cu.seat; drawPlate(c, s.tx + s.side * 24, s.ty - 38, 13, cu.dish); if (cu.rice) drawPlate(c, s.tx + s.side * 24 - s.side * 18, s.ty - 30, 9, 'kanin'); }
  // dirty dishes left on tables
  for (const k in G.dirty) drawDirty(c, G.dirty[k], t);
  // hover highlights
  if (!G.modal) {
    const ht = tableAt(G.mouse);
    if (ht != null && tableDirty(ht).length) { const tb = TABLE_SLOTS[ht]; c.strokeStyle = '#ffe680'; c.lineWidth = 3; c.strokeRect(tb.x - 90, tb.y - 64, 180, 76); txt(c, 'Linisin', tb.x, tb.y - 76, 18, '#ffe680'); }
    if (riceTrayAt(G.mouse)) { c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.strokeRect(809, 200, 84, 90); txt(c, 'Kumuha ng kanin', 851, 302, 15, '#fff'); }
    if (sinkAt(G.mouse)) { c.strokeStyle = '#9fe8ff'; c.lineWidth = 3; c.strokeRect(SINK.x - 6, SINK.y - 30, SINK.w + 12, SINK.h + 34); }
  }
  // walk target marker
  const P = G.P;
  if (P.path.length) { const e = P.path[P.path.length - 1]; c.fillStyle = 'rgba(255,230,120,.8)'; blob(c, e.x, e.y, 10 + Math.sin(t * 8) * 2, 4, c.fillStyle, 2); }
  // washing progress
  if (P.washing) {
    c.fillStyle = '#2b170a'; c.fillRect(P.x - 30, P.y - 104, 60, 10);
    c.fillStyle = '#4fc3f7'; c.fillRect(P.x - 29, P.y - 103, 58 * clamp(P.washT / washTime(), 0, 1), 8);
    txt(c, 'Naghuhugas…', P.x, P.y - 116, 15, '#9fe8ff');
  }

  // bubbles
  for (const cu of G.customers) {
    const headY = cu.y - (cu.state === 'eating' ? 60 : 72);
    if (cu.state === 'waiting' && !cu.path.length) drawBubble(c, cu.x, headY, cu.dish, cu.pat / cu.maxPat, S.trays[cu.dish].n <= 0, t);
    else if (cu.state === 'eating' && cu.req) { drawBubble(c, cu.x, headY, 'kanin', cu.req.t / cu.req.max, S.trays.kanin.n <= 0 && G.P.rice <= 0, t); txt(c, 'RICE PO!', cu.x, headY - 82, 14, '#fff6dc', 'center', '#7a3b0c', 4); }
    else if (cu.emoteT > 0) drawEmote(c, cu.x, headY, cu.emote);
  }

  drawBeggarBubble(c, t);
  // prep overlay hint
  if (G.phase === 'prep') {
    rr(c, 400, 296, 480, 80, 14); c.fillStyle = 'rgba(58,34,16,.82)'; c.fill(); c.strokeStyle = '#ffcc55'; c.lineWidth = 3; c.stroke();
    txt(c, 'SARADO PA — Maghanda!', 640, 320, 26, '#ffcc55', 'center', null);
    txt(c, 'Mamalengke, magluto, at magsaing bago buksan.', 640, 352, 18, '#fff6dc', 'center', null);
  }

  // rain
  if (S.event === 'ulan' && G.phase !== 'prep') {
    if (G.rain.length < 120) G.rain.push({ x: rand(0, 1280), y: rand(-720, 0) });
    c.fillStyle = 'rgba(160,190,230,.35)';
    for (const d of G.rain) { d.y += 14; d.x -= 2; if (d.y > 720) { d.y = rand(-60, 0); d.x = rand(0, 1320); } c.fillRect(d.x, d.y, 2, 12); }
    c.fillStyle = 'rgba(40,60,90,.12)'; c.fillRect(0, 0, 1280, 720);
  }
  // night tint
  if (night > 0) { c.fillStyle = `rgba(20,24,70,${night * .28})`; c.fillRect(0, 0, 1280, 720); }

  // popups
  for (const p of G.popups) { c.globalAlpha = clamp(p.life / .5, 0, 1); txt(c, p.text, p.x, p.y, p.size || 22, p.col || '#ffe14d', 'center', '#3a1f0b', 5); c.globalAlpha = 1; }
}
function drawCustomer(c, cu, t) {
  const sit = cu.state === 'eating';
  const frame = cu.path.length ? (Math.floor(cu.walk / 14) % 2) + 1 : 0;
  if (cu.hover) { c.fillStyle = 'rgba(255,230,120,.45)'; blob(c, cu.x, cu.y - 2, 28, 10, c.fillStyle, 2); }
  const dir = (cu.state === 'waiting' && !cu.path.length) ? 'up' : 'down';
  drawPerson(c, cu.x, sit ? cu.y - 14 : cu.y, {
    shirt: cu.shirt, hair: cu.hair, skin: cu.skin, pants: cu.pants, long: cu.long, frame, sit, dir,
    bob: sit ? Math.sin(t * 6 + cu.id) * .5 : 0, bag: cu.takeout && cu.state === 'leaving',
    happyEyes: cu.emote === 'heart' && cu.emoteT > 0, mad: cu.emote === 'angry',
    plate: cu.state === 'toSeat', plateCol: DISHES[cu.dish].c1,
  });
}

/* ---------------- GAMEPLAY ---------------- */
function popup(text, x, y, col, size) { G.popups.push({ text, x, y, col, size, life: 1.4 }); }
function toast(msg, big, dur = 2600) {
  const el = document.createElement('div'); el.className = 'toast' + (big ? ' big' : ''); el.textContent = msg;
  $('#toast').appendChild(el);
  setTimeout(() => { el.style.opacity = 0; el.style.transform = 'translateY(-10px)'; }, dur);
  setTimeout(() => el.remove(), dur + 500);
}

function custRate() {
  const h = G.time / 60;
  const hm = h < 10 ? .75 : h < 11 ? 1 : h < 13.5 ? 1.7 : h < 16.5 ? .8 : h < 19 ? 1.45 : .6;
  const ev = S.event && EVENTS[S.event].cust || 1;
  return .13 * (1 + Math.min(S.rep, 300) / 120) * hm * ev * (S.up.decor ? 1.2 : 1) * (S.up.sign ? 1.15 : 1);
}
function freeSpot() {
  const used = new Set(G.customers.filter(c => c.spot != null).map(c => c.spot));
  const free = [2, 1, 3, 0, 4].filter(i => !used.has(i));
  return free.length ? free[0] : null;
}
function chooseDish() {
  const av = VIANDS.filter(unlocked);
  const w = av.map(k => (S.trays[k].n > 0 ? 4 : 1) * (S.event === 'ulan' && (k === 'tinola' || k === 'sinigang') ? 2.5 : 1));
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < av.length; i++) { r -= w[i]; if (r <= 0) return av[i]; }
  return av[0];
}
function spawnCustomer() {
  const spot = freeSpot(); if (spot == null) return;
  const pat = rand(25, 30);
  G.customers.push({
    id: ++G.cid, x: DOOR.x + rand(-10, 10), y: DOOR.y, spot, state: 'enter', dish: chooseDish(),
    path: [{ x: 640, y: 420 }, { x: QUEUE_X[spot], y: QUEUE_Y }], walk: 0,
    pat, maxPat: pat, shirt: pick(SHIRTS), hair: pick(HAIRS), skin: pick(SKINS), pants: pick(PANTS), long: Math.random() < .45,
    emote: null, emoteT: 0, seat: null, eatT: 0, rice: false, takeout: false,
  });
  if (Math.random() < .5) SFX.door();
}
function leave(cu, from) {
  cu.state = 'leaving'; cu.spot = null;
  const p = [];
  if (from === 'seat') p.push({ x: cu.x, y: 370 });
  else p.push({ x: cu.x, y: 370 });
  p.push({ x: 640, y: 380 }, { x: DOOR.x, y: DOOR.y });
  cu.path = p;
}
function serve(cu) {
  const tr = S.trays[cu.dish];
  if (tr.n <= 0) { SFX.err(); popup('Wala pang ' + DISHES[cu.dish].name + '!', cu.x, cu.y - 130, '#ff8a7a', 18); return; }
  const free = seats().filter(s => !G.seatOcc[s.i] && !G.dirty[s.i]);
  if (free.length && G.clean <= 0) { SFX.err(); popup('Walang malinis na plato! Maghugas muna.', cu.x, cu.y - 130, '#ff8a7a', 18); return; }
  tr.n--;
  const kn = S.trays.kanin; let rice = false;
  if (kn.n > 0) { kn.n--; rice = true; }
  const waitFrac = 1 - cu.pat / cu.maxPat;
  const nDirty = Object.keys(G.dirty).length;
  let sat = 72 + (tr.q - .7) * 70 - waitFrac * 30 + (rice ? 0 : -22) + (S.up.decor ? 10 : 0) + (S.up.ricecooker ? 5 : 0) + rand(-4, 4);
  const dirtyPen = Math.min(15, nDirty * 3) + (!free.length && nDirty ? 10 : 0);
  sat -= dirtyPen;
  if (dirtyPen >= 6) popup(free.length ? 'Ang dumi ng mga mesa!' : 'Walang malinis na upuan!', cu.x, cu.y - 160, '#ffcf7a', 16);
  sat = Math.round(clamp(sat, 5, 100));
  let pay = DISHES[cu.dish].price + (rice ? DISHES.kanin.price : 0);
  let tip = 0;
  if (sat >= 85) tip = Math.round(rand(5, 20) * (S.event && EVENTS[S.event].tip || 1));
  S.money += pay + tip;
  G.stats.sales += pay; G.stats.tips += tip; G.stats.served++; G.stats.sats.push(sat);
  G.stats.dishes[cu.dish] = (G.stats.dishes[cu.dish] || 0) + 1;
  popup('+' + peso(pay + tip), cu.x, cu.y - 110);
  if (!rice) popup('Walang kanin?!', cu.x, cu.y - 140, '#ffb199', 16);
  SFX.coin();
  cu.emote = sat >= 80 ? 'heart' : sat >= 50 ? 'smile' : 'meh'; cu.emoteT = 2.5;
  cu.rice = rice;
  G.busTarget = clamp(cu.x, 420, 860);
  addXP(6 + Math.round(sat / 20));
  // seat
  const spotX = cu.x; cu.spot = null;
  if (free.length) {
    G.clean--;
    free.sort((a, b) => Math.abs(a.x - spotX) + a.y * .3 - (Math.abs(b.x - spotX) + b.y * .3));
    const s = free[Math.floor(Math.random() * Math.min(2, free.length))];
    G.seatOcc[s.i] = cu.id; cu.seat = s; cu.state = 'toSeat';
    cu.path = [{ x: spotX, y: 370 }, { x: s.x, y: 370 }, { x: s.x, y: s.y }];
  } else {
    cu.takeout = true; popup('Balot!', cu.x, cu.y - 140, '#9fe8ff', 16); leave(cu);
  }
}
function hurry(cu) {
  cu.hurried = true;
  popup('Bilisan mo!', cu.x, cu.y - 150, '#ff9a6a', 18);
  if (G.t - (G.lastHurry || -99) > 4) { G.lastHurry = G.t; playHurry(); } // cooldown so clips don't cut each other off
}

/* ---------------- RANDOM EVENT: Pulubi ("Palimos po") ---------------- */
const BEG_MAX_PER_DAY = 3;   // max pulubi visits per day
const BEG_ASK_TIME = 6;      // seconds they ask each customer before moving on
function scheduleBeggar() { G.begT = rand(30, 70); }
function spawnBeggar() {
  const kid = Math.random() < .5;
  G.beggar = {
    x: DOOR.x, y: DOOR.y, path: [], walk: 0, state: 'enter', target: null, askT: 0, asked: 0, kid, happy: false,
    shirt: pick(['#8d7b68', '#7a6a5a', '#9e9e8e', '#6b5d4f']), pants: pick(['#4e4238', '#5a5048', '#3e3630']),
    hair: pick(['#2b1a10', '#1b1b1b', '#3d2314']), skin: pick(['#c68642', '#d9a066', '#b5763a']), long: Math.random() < .4,
  };
  G.stats.beggars++;
  nextBeggarTarget(true);
  if (!G.begHint) { G.begHint = true; toast('May pulubing pumasok! I-click siya para tulungan — bigyan ng pagkain o ₱20.', false, 5000); }
}
function begValid(cu) { return cu && G.customers.includes(cu) && (cu.state === 'eating' || (cu.state === 'waiting' && !cu.path.length)); }
function nextBeggarTarget(first) {
  const b = G.beggar;
  const list = G.customers.filter(c => begValid(c) && !c.begged);
  if (!list.length || b.asked >= 3) { beggarLeave(); return; }
  list.sort((p, q) => Math.hypot(p.x - b.x, p.y - b.y) - Math.hypot(q.x - b.x, q.y - b.y));
  const cu = list[0]; cu.begged = true; b.target = cu; b.state = 'enter';
  const tx = cu.state === 'eating' ? cu.seat.x + cu.seat.side * 34 : cu.x + 34;
  const ty = cu.state === 'eating' ? cu.seat.y + 6 : cu.y + 8;
  b.path = first ? [{ x: 640, y: 600 }, ...findPath(640, 600, tx, ty)] : findPath(b.x, b.y, tx, ty);
}
function beggarLeave() {
  const b = G.beggar; b.state = 'leaving'; b.target = null;
  b.path = [...findPath(b.x, b.y, 640, 600), { x: DOOR.x, y: DOOR.y }];
}
function updateBeggar(gdt) {
  if (G.phase === 'open' && !G.beggar) {
    if (G.begT == null) scheduleBeggar();
    G.begT -= gdt;
    if (G.begT <= 0) {
      scheduleBeggar();
      if (G.stats.beggars < BEG_MAX_PER_DAY && G.customers.some(begValid) && Math.random() < .65) spawnBeggar();
    }
  }
  const b = G.beggar; if (!b) return;
  if (b.path.length) {
    const tg = b.path[0], dx = tg.x - b.x, dy = tg.y - b.y, d = Math.hypot(dx, dy), sp = (b.happy ? 120 : 85) * gdt;
    if (d <= sp) { b.x = tg.x; b.y = tg.y; b.path.shift(); b.walk += d; } else { b.x += dx / d * sp; b.y += dy / d * sp; b.walk += sp; }
    if (b.path.length) return;
  }
  if (b.state === 'leaving') { G.beggar = null; return; }
  if (b.state === 'enter') {
    if (begValid(b.target)) { b.state = 'asking'; b.askT = BEG_ASK_TIME; playPalimos(); }
    else nextBeggarTarget();
    return;
  }
  if (b.state === 'asking') {
    const cu = b.target;
    if (!begValid(cu)) { b.asked++; nextBeggarTarget(); return; }
    b.askT -= gdt;
    if (b.askT <= 0) {
      // customer got bothered and nobody helped
      cu.emote = 'meh'; cu.emoteT = 2.5;
      popup(pick(['Naku… wala akong barya.', 'Pasensya na, iho.', 'Hay naku…']), cu.x, cu.y - 120, '#ffd0a0', 15);
      S.rep = Math.max(0, S.rep - 1); G.stats.bothered++;
      if (G.stats.sats.length) G.stats.sats.push(Math.max(0, G.stats.sats.pop() - 10));
      b.asked++; nextBeggarTarget();
    }
  }
}
function beggarAt(m) { const b = G.beggar; return b && !b.happy && b.state !== 'leaving' && Math.abs(m.x - b.x) < 28 && m.y > b.y - 100 && m.y < b.y + 8; }
function goHelpBeggar() { const b = G.beggar; goTo(b.x + (G.P.x < b.x ? -34 : 34), b.y + 4, { type: 'beggar' }); }
function helpBeggar() {
  const b = G.beggar; if (!b || b.happy || b.state === 'leaving') return;
  if (Math.hypot(b.x - G.P.x, b.y - G.P.y) > 140) { popup('Lumayo siya…', G.P.x, G.P.y - 100, '#ddd', 14); return; }
  const k = VIANDS.filter(v => unlocked(v) && S.trays[v].n > 0).sort((p, q) => S.trays[q].n - S.trays[p].n)[0];
  if (k) {
    S.trays[k].n--; if (S.trays.kanin.n > 0) S.trays.kanin.n--;
    b.gift = k; popup('Binigyan ng ' + DISHES[k].name, b.x, b.y - 130, '#9fe8ff', 16);
  } else if (S.money >= 20) {
    S.money -= 20; G.stats.expenses += 20; popup('-₱20 limos', b.x, b.y - 130, '#ffcf7a', 16);
  } else popup('Pasensya na po, wala tayo ngayon…', b.x, b.y - 130, '#ddd', 15);
  S.rep += 3; G.stats.helped++; addXP(5); SFX.ding();
  popup('Salamat po! Pagpalain po kayo!', b.x, b.y - 106, '#9fffb0', 18);
  b.happy = true; b.emoteT = 3; beggarLeave();
}
function drawBeggar(c, t) {
  const b = G.beggar;
  const frame = b.path.length ? (Math.floor(b.walk / 12) % 2) + 1 : 0;
  const u = b.kid ? 2.4 : 3;
  if (beggarAt(G.mouse)) { c.fillStyle = 'rgba(255,230,120,.45)'; blob(c, b.x, b.y - 2, 24, 8, c.fillStyle, 2); }
  drawPerson(c, b.x, b.y, { u, shirt: b.shirt, pants: b.pants, hair: b.hair, skin: b.skin, long: b.long, frame, happyEyes: b.happy, bag: !!b.gift });
  // patches on worn clothes
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(Math.round(b.x - 3 * u), Math.round(b.y - 12 * u), Math.round(2 * u), Math.round(2 * u)); c.fillRect(Math.round(b.x + 1 * u), Math.round(b.y - 9 * u), Math.round(2 * u), Math.round(1.5 * u));
  // tin cup
  if (!b.happy) { c.fillStyle = '#9aa3ab'; c.fillRect(Math.round(b.x - 9 * u), Math.round(b.y - 10 * u), Math.round(3 * u), Math.round(3 * u)); c.fillStyle = '#c9d3da'; c.fillRect(Math.round(b.x - 9 * u), Math.round(b.y - 10 * u), Math.round(3 * u), Math.round(u * .7)); }
}
function drawBeggarBubble(c, t) {
  const b = G.beggar; if (!b) return;
  const h = b.kid ? 60 : 72;
  if (b.state === 'asking') {
    const off = b.target && b.target.x > b.x ? -44 : 44;
    const w = 128, cx = b.x + off, bx = cx - w / 2, by = b.y - h - 40;
    rr(c, bx, by, w, 34, 10); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#3a2210'; c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(b.x - 6, by + 32); c.lineTo(b.x, by + 42); c.lineTo(b.x + 6, by + 32); c.fill();
    txt(c, 'Palimos po…', cx, by + 17, 17, '#5a3a1a', 'center', null);
    c.fillStyle = '#2b170a'; c.fillRect(bx + 14, by - 9, w - 28, 6); c.fillStyle = '#ffb74d'; c.fillRect(bx + 15, by - 8, (w - 30) * clamp(b.askT / BEG_ASK_TIME, 0, 1), 4);
  } else if (b.happy && b.emoteT > 0) { b.emoteT -= 1 / 60; drawEmote(c, b.x, b.y - h, 'heart'); }
}
function addXP(n) {
  S.xp += n;
  while (S.xp >= xpNeed(S.level)) {
    S.xp -= xpNeed(S.level); S.level++;
    SFX.lvl();
    const nd = TRAY_ORDER.filter(k => DISHES[k].lvl === S.level);
    toast('TUMAAS ANG ANTAS! Antas ' + S.level + (nd.length ? ' — Bagong putahe: ' + nd.map(k => DISHES[k].name).join(', ') + '!' : ''), true, 3600);
  }
}
function update(dt) {
  updateStreet(dt);
  const gdt = dt * settings.speed;
  updatePlayer(gdt);
  for (const k in G.dirty) G.dirty[k].t += gdt;
  if (G.phase === 'open' || G.phase === 'closing') {
    G.time += gdt * 5;
    if (G.phase === 'open' && G.time >= 20 * 60) { G.phase = 'closing'; toast('8:00 PM — Sarado na! Tapusin ang mga kumakain.'); refreshToolbar(); }
    if (G.phase === 'open') {
      G.spawnT -= gdt;
      if (G.spawnT <= 0) { spawnCustomer(); G.spawnT = -Math.log(1 - Math.random()) / custRate(); G.spawnT = clamp(G.spawnT, 1.2, 14); }
    }
    for (const cu of G.customers) {
      if (cu.emoteT > 0) cu.emoteT -= dt;
      if (cu.path.length) {
        const tg = cu.path[0], dx = tg.x - cu.x, dy = tg.y - cu.y, d = Math.hypot(dx, dy), sp = 120 * gdt;
        if (d <= sp) { cu.x = tg.x; cu.y = tg.y; cu.path.shift(); cu.walk += d; }
        else { cu.x += dx / d * sp; cu.y += dy / d * sp; cu.walk += sp; }
        if (!cu.path.length) {
          if (cu.state === 'toSeat') {
            cu.state = 'eating'; cu.eatT = rand(9, 13);
            // some customers will ask for extra rice mid-meal (adobo lovers ask more!)
            cu.wantsRice = !cu.takeout && Math.random() < (cu.dish === 'adobo' ? .5 : .32) * (cu.rice ? 1 : 1.4);
            cu.reqAt = cu.eatT * rand(.35, .65); cu.req = null; cu.riceExtra = 0;
          }
          else if (cu.state === 'leaving') cu.gone = true;
          else if (cu.state === 'enter') {
            cu.state = 'waiting';
            if (Math.random() < .55) { const dn = DISHES[cu.dish].name; popup(pick(['Ate, pabili po!', 'Isang ' + dn + ' nga po!', 'Kuya, ' + dn + ' po!', 'Magkano po ang ' + dn + '?', 'Pa-order po!', 'Gutom na ako…', 'Ano pong ulam?']), cu.x, cu.y - 175, '#fff6dc', 14); }
            if (G.t - (G.lastOrder || -99) > 2.5) { G.lastOrder = G.t; playOrder(); } // cooldown so orders don't cut each other off
          }
        }
      } else if (cu.state === 'waiting') {
        cu.pat -= gdt;
        if (!cu.hurried && cu.pat / cu.maxPat < HURRY_AT) hurry(cu);
        if (cu.pat <= 0) {
          G.stats.lost++; G.stats.sats.push(0); S.rep = Math.max(0, S.rep - 1);
          cu.emote = 'angry'; cu.emoteT = 3; SFX.angry(); popup('Ang tagal!', cu.x, cu.y - 110, '#ff6b4a', 18);
          leave(cu);
        }
      } else if (cu.state === 'eating') {
        if (cu.req) {
          // waiting for extra rice — meal paused
          cu.req.t -= gdt;
          if (!cu.req.hurried && cu.req.t / cu.req.max < HURRY_AT) { cu.req.hurried = true; hurry(cu); }
          if (cu.req.t <= 0) {
            cu.req = null; cu.emote = 'angry'; cu.emoteT = 3; SFX.angry();
            popup('Wala pa rin ang rice ko!', cu.x, cu.y - 110, '#ff6b4a', 16);
            S.rep = Math.max(0, S.rep - 1); G.stats.riceMissed++;
            if (G.stats.sats.length) G.stats.sats.push(Math.max(0, G.stats.sats.pop() - 25));
          }
          continue;
        }
        cu.eatT -= gdt;
        if (cu.wantsRice && cu.eatT <= cu.reqAt) {
          cu.wantsRice = false;
          const pt = rand(25, 30);
          cu.req = { t: pt, max: pt };
          playRiceRequest();
          popup('Rice po!', cu.x, cu.y - 130, '#fff6dc', 16);
          if (!G.riceHint) { G.riceHint = true; toast('May humihingi ng RICE PO! Kumuha ng kanin sa turo-turo (lalagyan ng kanin) at ihatid sa mesa.', false, 4500); }
        }
        if (cu.eatT <= 0) {
          delete G.seatOcc[cu.seat.i];
          G.dirty[cu.seat.i] = { seat: cu.seat, ti: Math.floor(cu.seat.i / 2), t: 0, rice: cu.rice };
          if (Math.random() < .35) popup(pick(['Salamat po!', 'Sarap!', 'Busog!', 'Babalik ako!']), cu.x, cu.y - 80, '#fff', 16);
          leave(cu, 'seat');
        }
      }
    }
    G.customers = G.customers.filter(c => !c.gone);
    updateBeggar(gdt);
    if (G.phase === 'closing' && G.customers.length === 0 && !G.beggar) endDay();
  }
  for (const p of G.popups) { p.life -= dt; p.y -= 30 * dt; }
  G.popups = G.popups.filter(p => p.life > 0);
}

/* ---------------- INPUT ---------------- */
function toLocal(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * 1280 / r.width, y: (e.clientY - r.top) * 720 / r.height }; }
function hoverKitchen() { const m = G.mouse; return G.screen === 'game' && !G.modal && m.x > 926 && m.x < 1280 && m.y > 92 && m.y < 184; }
function custAt(m) {
  return G.customers.find(cu => ((cu.state === 'waiting' && !cu.path.length) || (cu.state === 'eating' && cu.req)) && Math.abs(m.x - cu.x) < 30 && m.y > cu.y - 140 && m.y < cu.y + 6);
}
/* ---- Extra rice ---- */
const RICE_SPOT = { x: 851, y: 316 }, RICE_MAX = 3;
function riceTrayAt(m) { return m.x > 805 && m.x < 900 && m.y > 196 && m.y < 292; }
function goGetRice() {
  if (G.P.rice >= RICE_MAX) { SFX.err(); popup('Puno na ang kamay sa kanin!', G.P.x, G.P.y - 110, '#ff8a7a', 16); return; }
  goTo(RICE_SPOT.x, RICE_SPOT.y, { type: 'rice' });
}
function takeRice() {
  const P = G.P, kn = S.trays.kanin;
  if (kn.n <= 0) { SFX.err(); popup('Ubos ang kanin! Magsaing muna.', P.x, P.y - 110, '#ff8a7a', 16); return; }
  const want = Math.max(1, Math.min(RICE_MAX - P.rice, G.customers.filter(c => c.req).length || 1, kn.n));
  kn.n -= want; P.rice += want; SFX.plop();
  popup('+' + want + ' kanin', P.x, P.y - 100, '#ffffff', 18);
}
function goDeliverRice(cu) {
  const s = cu.seat;
  goTo(s.x + s.side * 16, s.y + 4, { type: 'deliver', cu });
}
function deliverRice(cu) {
  const P = G.P;
  if (!cu.req) return;
  if (P.rice <= 0) { SFX.err(); popup('Kumuha muna ng kanin sa turo-turo!', P.x, P.y - 110, '#ff8a7a', 16); return; }
  P.rice--;
  const fast = cu.req.t / cu.req.max;
  const pay = DISHES.kanin.price, tip = fast > .5 ? Math.round(rand(3, 10) * (S.event && EVENTS[S.event].tip || 1)) : 0;
  S.money += pay + tip; G.stats.sales += pay; G.stats.tips += tip; G.stats.extraRice++;
  if (G.stats.sats.length) G.stats.sats.push(Math.min(100, G.stats.sats.pop() + 6));
  cu.req = null; cu.riceExtra++; cu.eatT += 4;
  cu.emote = 'heart'; cu.emoteT = 2.5;
  SFX.coin(); popup('+' + peso(pay + tip) + ' Rice po!', cu.x, cu.y - 110);
  addXP(3);
}
function tableAt(m) {
  if (!S) return null;
  for (let i = 0; i < tableCount(); i++) { const t = TABLE_SLOTS[i]; if (m.x > t.x - 90 && m.x < t.x + 90 && m.y > t.y - 66 && m.y < t.y + 14) return i; }
  return null;
}
function tableDirty(ti) { return Object.keys(G.dirty).filter(k => G.dirty[k].ti === ti); }
function sinkAt(m) { return m.x > SINK.x - 6 && m.x < SINK.x + SINK.w + 6 && m.y > SINK.y - 30 && m.y < SINK.y + SINK.h + 4; }
cv.addEventListener('pointermove', e => {
  G.mouse = toLocal(e);
  if (G.screen !== 'game') { cv.style.cursor = 'default'; return; }
  const cu = custAt(G.mouse);
  G.customers.forEach(c => c.hover = c === cu);
  const ti = tableAt(G.mouse);
  cv.style.cursor = (cu || beggarAt(G.mouse) || hoverKitchen() || riceTrayAt(G.mouse) || sinkAt(G.mouse) || (ti != null && tableDirty(ti).length)) ? 'pointer' : 'default';
});
cv.addEventListener('pointerdown', e => {
  if (G.screen !== 'game' || G.modal || G.paused) return;
  const m = toLocal(e); G.mouse = m;
  const cu = custAt(m);
  if (beggarAt(m)) { goHelpBeggar(); return; }
  if (cu) { if (cu.state === 'eating') goDeliverRice(cu); else goServe(cu); return; }
  if (riceTrayAt(m)) { goGetRice(); return; }
  if (sinkAt(m)) { goWash(); return; }
  const ti = tableAt(m);
  if (ti != null && tableDirty(ti).length) { goClean(ti); return; }
  if (hoverKitchen()) { SFX.click(); openCook(); return; }
  if (m.y > 290 && m.y < 640) goTo(m.x, m.y, null);
});
const KEYMAP = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
const keys = {};
addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (G.modal && G.modal.dataset.closable) { closeModal(); }
    else if (G.screen === 'game' && !G.modal) openPause();
    return;
  }
  if (G.screen !== 'game' || G.modal) return;
  if (KEYMAP[e.key]) { keys[KEYMAP[e.key]] = true; e.preventDefault(); }
  if ((e.key === 'e' || e.key === 'E' || e.key === ' ') && !e.repeat) { e.preventDefault(); interact(); }
});
addEventListener('keyup', e => { if (KEYMAP[e.key]) keys[KEYMAP[e.key]] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

/* ---------------- PLAYER (Buseng) ---------------- */
const SINK = { x: 1150, y: 280, w: 126, h: 70 };
const SINK_STAND = { x: 1116, y: 336 };
const CARRY_MAX = 4;
const platesMax = () => 10 + (S.up.plates || 0) * 6;
const washTime = () => S.up.sink ? .5 : 1.0;
function resetPlayer() {
  G.P = { x: 640, y: 470, path: [], task: null, walk: 0, carry: 0, rice: 0, washT: 0, washing: false };
  G.dirty = {}; G.clean = platesMax();
}
function obstacles() {
  const r = [];
  for (let i = 0; i < tableCount(); i++) { const t = TABLE_SLOTS[i]; r.push([t.x - 52, t.y - 46, 104, 52]); }
  r.push([SINK.x, SINK.y, SINK.w, SINK.h]);
  return r;
}
function walkable(x, y, obs) {
  if (x < 24 || x > 1256 || y < 306 || y > 626) return false;
  for (const [rx, ry, rw, rh] of obs) if (x > rx - 12 && x < rx + rw + 12 && y > ry - 4 && y < ry + rh + 6) return false;
  return true;
}
/* A* on a 16px grid, then string-pulled for smooth walking */
const GS = 16, GCOLS = 80, GY0 = 296, GROWS = 22;
function findPath(sx, sy, tx, ty) {
  const obs = obstacles();
  const ctr = (cx, cy) => ({ x: cx * GS + GS / 2, y: GY0 + cy * GS + GS / 2 });
  const ok = (cx, cy) => cx >= 0 && cy >= 0 && cx < GCOLS && cy < GROWS && walkable(ctr(cx, cy).x, ctr(cx, cy).y, obs);
  const cellOf = (x, y) => [clamp(Math.floor(x / GS), 0, GCOLS - 1), clamp(Math.floor((y - GY0) / GS), 0, GROWS - 1)];
  const nearest = (cx, cy) => {
    let best = null, bd = 1e9;
    for (let y = 0; y < GROWS; y++) for (let x = 0; x < GCOLS; x++) if (ok(x, y)) { const d = (x - cx) ** 2 + (y - cy) ** 2; if (d < bd) { bd = d; best = [x, y]; } }
    return best;
  };
  let exact = walkable(tx, ty, obs);
  let [ex, ey] = cellOf(tx, ty);
  if (!ok(ex, ey)) { const n = nearest(ex, ey); if (!n) return []; [ex, ey] = n; }
  let [bx, by] = cellOf(sx, sy);
  if (!ok(bx, by)) { const n = nearest(bx, by); if (!n) return []; [bx, by] = n; }
  const K = (x, y) => y * GCOLS + x;
  const g = new Map([[K(bx, by), 0]]), from = new Map(), closed = new Set(), open = [[bx, by]];
  const h = (x, y) => Math.hypot(x - ex, y - ey);
  let found = false;
  while (open.length) {
    let bi = 0, bf = 1e9;
    for (let i = 0; i < open.length; i++) { const [x, y] = open[i], f = g.get(K(x, y)) + h(x, y); if (f < bf) { bf = f; bi = i; } }
    const [cx, cy] = open.splice(bi, 1)[0], ck = K(cx, cy);
    if (closed.has(ck)) continue;
    closed.add(ck);
    if (cx === ex && cy === ey) { found = true; break; }
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = cx + dx, ny = cy + dy, nk = K(nx, ny);
      if (!ok(nx, ny) || closed.has(nk)) continue;
      if (dx && dy && (!ok(cx + dx, cy) || !ok(cx, cy + dy))) continue;
      const ng = g.get(ck) + (dx && dy ? 1.414 : 1);
      if (!g.has(nk) || ng < g.get(nk)) { g.set(nk, ng); from.set(nk, ck); open.push([nx, ny]); }
    }
  }
  if (!found) return [];
  const pts = [];
  let k = K(ex, ey);
  while (k !== undefined && k !== K(bx, by)) { pts.unshift(ctr(k % GCOLS, Math.floor(k / GCOLS))); k = from.get(k); }
  if (exact) pts.push({ x: tx, y: ty });
  // string pulling
  const los = (a, b) => { const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(d / 6)); for (let i = 1; i <= n; i++) if (!walkable(a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n, obs)) return false; return true; };
  const out = []; let cur = { x: sx, y: sy }, i = 0;
  while (i < pts.length) { let j = pts.length - 1; while (j > i && !los(cur, pts[j])) j--; out.push(pts[j]); cur = pts[j]; i = j + 1; }
  return out;
}
function goTo(x, y, task) {
  const P = G.P;
  P.washing = false; P.washT = 0; P.task = task;
  P.path = findPath(P.x, P.y, x, y);
  if (!P.path.length) arrive();
}
function goServe(cu) { goTo(cu.x, QUEUE_Y + 38, { type: 'serve', cu }); }
function goWash() {
  if (G.P.carry <= 0) { SFX.err(); popup('Wala kang dalang hugasin.', SINK.x + 50, SINK.y - 40, '#ff8a7a', 16); return; }
  goTo(SINK_STAND.x, SINK_STAND.y, { type: 'wash' });
}
function goClean(ti) {
  if (G.P.carry >= CARRY_MAX) { SFX.err(); popup('Puno na ang kamay! Hugasan muna.', G.P.x, G.P.y - 110, '#ff8a7a', 16); return; }
  const t = TABLE_SLOTS[ti], ks = tableDirty(ti);
  const side = ks.length === 1 ? G.dirty[ks[0]].seat.side : (G.P.x < t.x ? -1 : 1);
  goTo(t.x + side * 74, t.y + 4, { type: 'clean', ti });
}
function arrive() {
  const P = G.P, task = P.task; P.task = null;
  if (!task) return;
  if (task.type === 'serve') {
    const cu = task.cu;
    if (G.customers.includes(cu) && cu.state === 'waiting' && !cu.path.length && Math.hypot(cu.x - P.x, cu.y - P.y) < 110) serve(cu);
  } else if (task.type === 'clean') {
    const ks = tableDirty(task.ti);
    let got = 0;
    for (const k of ks) { if (P.carry >= CARRY_MAX) break; delete G.dirty[k]; P.carry++; got++; }
    if (got) { SFX.plop(); popup('+' + got + ' hugasin', P.x, P.y - 100, '#9fe8ff', 18); }
    if (tableDirty(task.ti).length) popup('Puno na ang kamay!', P.x, P.y - 124, '#ff8a7a', 16);
  } else if (task.type === 'beggar') {
    helpBeggar();
  } else if (task.type === 'rice') {
    takeRice();
  } else if (task.type === 'deliver') {
    const cu = task.cu;
    if (G.customers.includes(cu) && cu.req) deliverRice(cu);
  } else if (task.type === 'wash') {
    if (P.carry > 0) { P.washing = true; P.washT = 0; noise(.4, .05, 1200); }
  }
}
function interact() {
  const P = G.P;
  if (G.beggar && !G.beggar.happy && G.beggar.state !== 'leaving' && Math.hypot(G.beggar.x - P.x, G.beggar.y - P.y) < 90) { helpBeggar(); return; }
  // nearest waiting customer
  const cu = G.customers.filter(c => c.state === 'waiting' && !c.path.length).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))[0];
  if (cu && Math.hypot(cu.x - P.x, cu.y - P.y) < 90) { serve(cu); return; }
  const rq = G.customers.filter(c => c.state === 'eating' && c.req).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))[0];
  if (rq && P.rice > 0 && Math.hypot(rq.x - P.x, rq.y - P.y) < 100) { deliverRice(rq); return; }
  if (Math.hypot(RICE_SPOT.x - P.x, RICE_SPOT.y - P.y) < 70 && P.rice < RICE_MAX) { takeRice(); return; }
  if (Math.hypot(SINK_STAND.x - P.x, SINK_STAND.y - P.y) < 70 && P.carry > 0) { P.task = { type: 'wash' }; arrive(); return; }
  for (let i = 0; i < tableCount(); i++) {
    const t = TABLE_SLOTS[i];
    if (tableDirty(i).length && Math.abs(P.x - t.x) < 110 && Math.abs(P.y - t.y) < 60) { P.task = { type: 'clean', ti: i }; arrive(); return; }
  }
  if (Math.hypot(SINK_STAND.x - P.x, SINK_STAND.y - P.y) < 70) { goWash(); return; }
  if (P.y < 330 && P.x > 900) { openCook(); return; }
  popup('Walang malapit…', P.x, P.y - 100, '#ddd', 14);
}
function updatePlayer(gdt) {
  const P = G.P; if (!P) return;
  const kx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), ky = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
  const sp = 230 * gdt;
  if (kx || ky) {
    P.path = []; P.task = null; P.washing = false;
    const l = Math.hypot(kx, ky), obs = obstacles();
    const nx = P.x + kx / l * sp, ny = P.y + ky / l * sp;
    const ox = P.x, oy = P.y;
    if (walkable(nx, P.y, obs)) P.x = nx;
    if (walkable(P.x, ny, obs)) P.y = ny;
    P.walk += Math.hypot(P.x - ox, P.y - oy);
  } else if (P.path.length) {
    const tg = P.path[0], dx = tg.x - P.x, dy = tg.y - P.y, d = Math.hypot(dx, dy);
    if (d <= sp) { P.x = tg.x; P.y = tg.y; P.path.shift(); P.walk += d; if (!P.path.length) arrive(); }
    else { P.x += dx / d * sp; P.y += dy / d * sp; P.walk += sp; }
  }
  if (P.washing) {
    if (P.carry <= 0) P.washing = false;
    else {
      P.washT += gdt;
      if (P.washT >= washTime()) {
        P.washT = 0; P.carry--; G.clean = Math.min(platesMax(), G.clean + 1);
        if (G.stats) G.stats.washed++;
        SFX.plop(); popup('+1 malinis na plato', SINK.x + 40, SINK.y - 60, '#9fe8ff', 15);
        if (P.carry <= 0) { P.washing = false; SFX.ding(); addXP(2); }
        else noise(.4, .05, 1200);
      }
    }
  }
}
function drawPlayer(c, t) {
  const P = G.P, moving = P.path.length || keys.up || keys.down || keys.left || keys.right;
  const frame = moving ? (Math.floor(P.walk / 14) % 2) + 1 : 0;
  c.fillStyle = 'rgba(255,214,64,.55)'; blob(c, P.x, P.y, 22, 6, c.fillStyle, 2);
  drawPerson(c, P.x, P.y, { shirt: '#e74c3c', hair: '#1b1b1b', skin: '#e0ac69', pants: '#34495e', apron: true, hat: 'chef', frame, bob: P.washing ? Math.sin(t * 16) : 0 });
  // dirty stack in hands
  for (let i = 0; i < P.carry; i++) {
    const py = P.y - 30 - i * 6;
    blob(c, P.x, py, 14, 4, '#cfd3d8', 2); blob(c, P.x, py - 1, 12, 3, '#ffffff', 2);
    c.fillStyle = '#8a5a32'; c.fillRect(P.x - 6 + (i % 2) * 5, py - 2, 4, 2);
  }
  if (P.carry) { c.fillStyle = '#cfe8f5'; c.fillRect(P.x + 14, P.y - 44, 7, 12); c.fillStyle = '#fff'; c.fillRect(P.x + 14, P.y - 44, 7, 2); }
  for (let i = 0; i < P.rice; i++) { const ry = P.y - 34 - i * 9; c.fillStyle = '#c0392b'; c.fillRect(P.x - 26, ry, 12, 6); blob(c, P.x - 20, ry - 1, 6, 4, '#ffffff', 2); }
  txt(c, 'BUSENG', P.x, P.y + 12, 12, '#ffe680', 'center', '#3a1f0b', 3);
}
function drawDirty(c, d, t) {
  const s = d.seat, px = s.tx + s.side * 24, py = s.ty - 38;
  blob(c, px, py, 13, 7, '#cfd3d8', 2); blob(c, px, py - 1, 11, 5, '#f4f4f0', 2);
  c.fillStyle = '#8a5a32'; c.fillRect(px - 6, py - 3, 5, 3); c.fillRect(px + 2, py, 4, 2);
  c.fillStyle = '#c9a36a'; c.fillRect(px - 2, py - 4, 3, 2);
  c.fillStyle = '#9aa3ab'; c.fillRect(px + 4, py - 6, 10, 2);
  const gx = s.tx + s.side * 42, gy = s.ty - 52;
  c.fillStyle = '#cfe8f5'; c.fillRect(gx - 4, gy, 8, 13); c.fillStyle = '#9fd3ef'; c.fillRect(gx - 4, gy + 9, 8, 4); c.fillStyle = '#fff'; c.fillRect(gx - 4, gy, 8, 2);
  if (d.t > 18) { for (let i = 0; i < 2; i++) { const a = t * 6 + i * 3; c.fillStyle = '#222'; c.fillRect(Math.round(px + Math.cos(a) * 14), Math.round(py - 14 + Math.sin(a * 1.7) * 6), 3, 2); } }
  if (d.t > 30) { c.fillStyle = 'rgba(120,170,60,.7)'; for (let i = 0; i < 3; i++) c.fillRect(px - 8 + i * 8, py - 22 - ((t * 20 + i * 7) % 14), 2, 6); }
}
function drawSink(c, t) {
  const { x, y, w, h } = SINK;
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x - 4, y + h - 2, w + 8, 8);
  c.fillStyle = '#7a8a96'; c.fillRect(x, y + 16, w, h - 16);
  c.fillStyle = '#5e6c78'; c.fillRect(x + 8, y + 26, w / 2 - 12, h - 34); c.fillRect(x + w / 2 + 4, y + 26, w / 2 - 12, h - 34);
  c.fillStyle = '#c9d3da'; c.fillRect(x + w / 2 - 10, y + 40, 4, 8); c.fillRect(x + w / 2 + 6, y + 40, 4, 8);
  c.fillStyle = S.up.sink ? '#dfe6ea' : '#c9d3da'; c.fillRect(x - 4, y, w + 8, 18); c.fillStyle = '#eef3f6'; c.fillRect(x - 4, y, w + 8, 3);
  c.fillStyle = '#8fa0ac'; c.fillRect(x + 8, y + 4, S.up.sink ? 70 : 56, 11);
  const washing = G.P && G.P.washing;
  if (washing) { c.fillStyle = '#9fd3ef'; c.fillRect(x + 10, y + 7, S.up.sink ? 66 : 52, 7); for (let i = 0; i < 6; i++) { const ph = (t * 30 + i * 9) % 26; c.fillStyle = `rgba(255,255,255,${.9 - ph / 30})`; c.fillRect(x + 14 + i * 9 + Math.sin(t * 5 + i) * 3, y + 2 - ph, 5, 5); } }
  // faucet
  c.fillStyle = '#b0b8c0'; c.fillRect(x + 30, y - 22, 6, 24); c.fillRect(x + 30, y - 22, 22, 6);
  if (washing) { c.fillStyle = '#4fc3f7'; c.fillRect(x + 47, y - 16, 3, 20); }
  // clean plate stack
  const n = Math.min(G.clean, 10);
  for (let i = 0; i < n; i++) { blob(c, x + 100, y + 10 - i * 3, 13, 4, '#cfd3d8', 2); blob(c, x + 100, y + 9 - i * 3, 11, 3, '#ffffff', 2); }
  txt(c, `Plato ${G.clean}/${platesMax()}`, x + w / 2, y - 34, 15, G.clean > 2 ? '#fff' : '#ff9a8a', 'center', '#3a1f0b', 4);
  txt(c, 'LABABO', x + w / 2, y + h + 10, 12, '#ffe680', 'center', '#3a1f0b', 3);
}

/* ---------------- HUD / TOOLBAR ---------------- */
function fmtTime(m) { let h = Math.floor(m / 60), mm = Math.floor((m % 60) / 10) * 10; const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${String(mm).padStart(2, '0')} ${ap}`; }
function updateHUD() {
  $('#hMoney').textContent = peso(S.money);
  $('#hLvl').textContent = 'Antas ' + S.level;
  $('#hXp').style.width = (S.xp / xpNeed(S.level) * 100) + '%';
  $('#hRep').textContent = S.rep;
  $('#hDay').textContent = 'Araw ' + S.day;
  $('#hTime').textContent = fmtTime(G.time);
  $('#hSun').className = 'sun' + (G.time >= 18 * 60 ? ' moon' : '');
  const ev = $('#hEvent');
  if (S.event) { ev.classList.remove('hidden'); ev.textContent = EVENTS[S.event].short; } else ev.classList.add('hidden');
  // inventory strip (cheap diff)
  const html = ITEM_ORDER.map(k => `<div class="inv${S.inv[k] <= 0 ? ' low' : ''}" title="${ITEMS[k].name}"><img src="${icon(k, 32)}"><span>${fmtQ(S.inv[k])}</span></div>`).join('') + `<div class="inv${G.clean <= 2 ? ' low' : ''}" title="Malinis na plato"><img src="${icon('plate', 32)}"><span>${G.clean}/${platesMax()}</span></div>` + (G.P && G.P.carry ? `<div class="inv" title="Dalang hugasin"><img src="${icon('plates', 32)}"><span style="color:#ffcf7a">${G.P.carry}/${CARRY_MAX}</span></div>` : '') + (G.P && G.P.rice ? `<div class="inv" title="Dalang kanin"><img src="${icon('kanin', 32)}"><span style="color:#fff">${G.P.rice}/${RICE_MAX}</span></div>` : '');
  if (html !== updateHUD.last) { $('#invStrip').innerHTML = html; updateHUD.last = html; }
}
function refreshToolbar() {
  const b = $('#bOpen');
  if (G.phase === 'prep') { b.innerHTML = 'BUKSAN ANG<br>KARINDERYA'; b.className = 'btn green'; b.disabled = false; }
  else if (G.phase === 'open') { b.innerHTML = 'ISARA NANG<br>MAAGA'; b.className = 'btn red'; b.disabled = false; }
  else { b.innerHTML = 'NAGSASARA…'; b.className = 'btn'; b.disabled = true; }
}
$('#bOpen').onclick = () => {
  SFX.click();
  if (G.phase === 'prep') {
    const food = TRAY_ORDER.some(k => k !== 'kanin' && S.trays[k].n > 0);
    if (!food) {
      confirmBox('Wala ka pang lutong ulam! Siguradong bubuksan na ang karinderya?', 'Buksan', () => openShop());
    } else openShop();
  } else if (G.phase === 'open') {
    confirmBox('Isara na ba ang karinderya nang maaga? Hindi na tatanggap ng bagong kumakain.', 'Isara', () => { G.phase = 'closing'; refreshToolbar(); });
  }
};
function openShop() { G.phase = 'open'; G.time = Math.max(G.time, 7 * 60); G.spawnT = 1.5; refreshToolbar(); toast('BUKAS NA! Kain tayo!', true); playOpen(); }
$('#bCook').onclick = () => { SFX.click(); openCook(); };
$('#bMarket').onclick = () => { SFX.click(); openMarket(); };
$('#bUp').onclick = () => { SFX.click(); openUpgrades(); };
$('#bPause').onclick = () => { SFX.click(); openPause(); };

/* ---------------- MODALS ---------------- */
function openModal(html, closable = true) {
  for (const k in keys) keys[k] = false;
  closeModal();
  const ov = document.createElement('div'); ov.className = 'overlay'; ov.innerHTML = html;
  if (closable) ov.dataset.closable = '1';
  $('#modalRoot').appendChild(ov); G.modal = ov;
  const x = ov.querySelector('.closex'); if (x) x.onclick = () => { SFX.click(); closeModal(); };
  return ov;
}
function closeModal() { if (G.modal) { G.modal.remove(); G.modal = null; } G.modalDraw = null; }
function confirmBox(msg, yesLabel, onYes) {
  const ov = openModal(`<div class="panel" style="width:520px;padding:28px;text-align:center">
    <div style="font-weight:900;font-size:22px;margin-bottom:20px">${msg}</div>
    <div class="row" style="justify-content:center;gap:16px"><button class="btn green" id="cY">${yesLabel}</button><button class="btn red" id="cN">Huwag</button></div></div>`);
  ov.querySelector('#cY').onclick = () => { SFX.click(); closeModal(); onYes(); };
  ov.querySelector('#cN').onclick = () => { SFX.click(); closeModal(); };
}

/* ---------- COOKING ---------- */
let cook = null;
function openCook() {
  cook = { phase: 'select' };
  const ov = openModal(`<div class="panel" style="width:1000px;height:540px;padding:18px;display:flex;gap:18px">
    <button class="closex">✕</button>
    <div style="flex:none"><canvas id="stoveCv" class="pix card" width="440" height="500"></canvas></div>
    <div id="cookR" style="flex:1;display:flex;flex-direction:column;min-width:0"></div></div>`);
  const sc = ov.querySelector('#stoveCv').getContext('2d'); sc.imageSmoothingEnabled = false;
  let tt = 0;
  G.modalDraw = dt => {
    tt += dt;
    if (cook.phase === 'heat') {
      cook.prog += dt / cook.time;
      const bar = $('#hbFill'), nd = $('#hbNeedle'), tm = $('#hbTime');
      if (bar) { bar.style.width = Math.min(100, cook.prog * 100) + '%'; nd.style.left = `calc(${Math.min(100, cook.prog * 100)}% - 2px)`; tm.textContent = (cook.prog * cook.time).toFixed(2).padStart(5, '0'); }
      if (cook.prog >= 1) finishCook(true);
    }
    drawStove(sc, tt);
  };
  renderCook();
}
function canCook(k) {
  const d = DISHES[k];
  for (const i in d.ing) if (S.inv[i] + 1e-9 < d.ing[i]) return false;
  return true;
}
function servingsFor(k) { if (k === 'kanin') return S.up.ricecooker ? 15 : 10; return DISHES[k].serv + (S.up.stove ? 3 : 0); }
function renderCook() {
  const R = $('#cookR'); if (!R) return;
  if (cook.phase === 'select') {
    R.innerHTML = `<div style="text-align:center;margin-bottom:8px"><span class="ptitle">Kusina</span></div>
      <div class="muted" style="text-align:center;font-weight:900;margin-bottom:6px">Pumili ng lulutuin. Tumitigil ang oras habang nagluluto.</div>
      <div class="card" style="flex:1;overflow:auto;padding:4px 8px">${TRAY_ORDER.map(k => {
        const d = DISHES[k], lock = !unlocked(k), ok = canCook(k), full = S.trays[k].n >= TRAY_MAX;
        const ig = Object.entries(d.ing).map(([i, q]) => `<span class="${S.inv[i] + 1e-9 >= q ? 'ok' : 'bad'}">${ITEMS[i].name.split(' ')[0]} ${q}${ITEMS[i].unit === 'kg' ? 'kg' : ''}</span>`).join(' · ');
        return `<div class="dishRow ${lock ? 'locked' : ''}"><img src="${icon(k, 48)}">
          <div style="flex:1"><div class="nm">${d.name} <span class="muted" style="font-size:15px">${lock ? '' : '(' + servingsFor(k) + ' hain · ' + peso(d.price) + ' bawat isa)'}</span></div>
          <div class="ig">${lock ? 'Mabubuksan sa Antas ' + d.lvl : ig} <span class="muted">· Nasa lalagyan: ${S.trays[k].n}</span></div></div>
          <button class="btn small ${lock || !ok || full ? '' : 'green'}" data-cook="${k}" ${lock || !ok || full ? 'disabled' : ''}>${full ? 'Puno' : k === 'kanin' ? 'Magsaing' : 'Lutuin'}</button></div>`;
      }).join('')}</div>`;
    R.querySelectorAll('[data-cook]').forEach(b => b.onclick = () => startCook(b.dataset.cook));
  } else if (cook.phase === 'steps') {
    const d = DISHES[cook.dish];
    R.innerHTML = `<div class="card" style="padding:14px 18px;text-align:center">
        <div class="disp" style="font-size:32px">${d.name}</div>
        <img src="${icon(cook.dish, 64)}" style="width:64px;image-rendering:pixelated">
        <div style="font-weight:900;margin:6px 0 4px">Ilagay ang mga sangkap sa tamang pagkakasunod:</div>
        <div id="chips">${d.steps.map((s, i) => `<span class="chip ${i < cook.step ? 'done' : i === cook.step ? 'next' : ''}">${i + 1}. ${s}</span>`).join('')}</div>
      </div>
      <div id="ingGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px">
        ${cook.order.map(s => `<button class="ingBtn ${cook.used.includes(s) ? 'used' : ''}" data-ing="${s}"><span style="display:inline-block;width:14px;height:14px;background:${STEP_COL[s]};border:2px solid #4a2810;vertical-align:-2px;margin-right:6px"></span>${s}</button>`).join('')}
      </div>
      <div class="muted" style="margin-top:auto;text-align:center;font-weight:900">Mali: <span class="${cook.mistakes ? 'bad' : ''}">${cook.mistakes}</span> · Bawat mali ay bumababa ang kalidad!</div>`;
    R.querySelectorAll('[data-ing]').forEach(b => b.onclick = () => addIng(b.dataset.ing, b));
  } else if (cook.phase === 'heat') {
    const d = DISHES[cook.dish];
    R.innerHTML = `<div class="card" style="padding:14px 18px;text-align:center">
        <div class="disp" style="font-size:32px">${d.name}</div>
        <img src="${icon(cook.dish, 64)}" style="width:64px;image-rendering:pixelated">
        <div style="font-weight:900;margin-top:6px">${cook.dish === 'kanin' ? 'Hanguin ang kanin kapag nasa BERDE ang guhit!' : 'Pakuluan… Hanguin kapag nasa BERDE ang guhit!'}</div>
      </div>
      <div style="margin-top:26px" class="row"><div class="disp" style="font-size:30px;flex:none;width:150px;white-space:nowrap;overflow:hidden">⏱ <span id="hbTime" style="display:inline-block;width:92px;text-align:left;font-variant-numeric:tabular-nums">00.00</span></div>
      <div class="heatbar" style="flex:1"><div class="fill" id="hbFill"></div><div class="zone" style="left:${cook.zone[0] * 100}%;width:${(cook.zone[1] - cook.zone[0]) * 100}%"></div><div class="needle" id="hbNeedle"></div></div></div>
      <div style="text-align:center;margin-top:30px"><button class="btn yellow" id="hango" style="font-size:40px;padding:10px 60px">HANGO!</button></div>
      <div class="muted" style="text-align:center;margin-top:14px;font-weight:900">Kung maghihintay hanggang dulo… masusunog!</div>`;
    $('#hango').onclick = () => finishCook(false);
  } else if (cook.phase === 'done') {
    const d = DISHES[cook.dish], stars = cook.q >= .9 ? 3 : cook.q >= .7 ? 2 : 1;
    R.innerHTML = `<div class="card" style="padding:20px;text-align:center;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div class="disp" style="font-size:36px">${cook.burnt ? 'Nasunog nang konti…' : stars === 3 ? 'Perpekto! Ang sarap!' : stars === 2 ? 'Masarap!' : 'Puwede na…'}</div>
        <div style="font-size:60px;color:#ffc107;text-shadow:0 3px 0 #8a5a00;letter-spacing:6px">${'★'.repeat(stars)}<span style="color:#d6c3a0">${'★'.repeat(3 - stars)}</span></div>
        <img src="${icon(cook.dish, 80)}" style="width:80px;image-rendering:pixelated">
        <div style="font-weight:900;font-size:22px;margin-top:8px">+${cook.added} hain ng ${d.name} sa lalagyan</div>
        <div class="muted" style="font-weight:900">Kalidad: ${Math.round(cook.q * 100)}%</div>
      </div>
      <div class="row" style="justify-content:center;gap:16px;margin-top:14px"><button class="btn green" id="cMore">Magluto Pa</button><button class="btn" id="cDone">Tapos Na</button></div>`;
    $('#cMore').onclick = () => { SFX.click(); cook = { phase: 'select' }; renderCook(); };
    $('#cDone').onclick = () => { SFX.click(); closeModal(); };
  }
}
function startCook(k) {
  if (!canCook(k)) return;
  const d = DISHES[k];
  for (const i in d.ing) S.inv[i] = r1(S.inv[i] - d.ing[i]);
  G.stats && (G.stats.cooked++);
  SFX.sizzle();
  const z0 = rand(.6, .74);
  cook = { phase: 'steps', dish: k, step: 0, mistakes: 0, used: [], order: [...d.steps].sort(() => Math.random() - .5), blobs: [], prog: 0, time: d.time, zone: [z0, z0 + .14], q: 0 };
  if (k === 'kanin') {
    for (let i = 0; i < 14; i++) cook.blobs.push({ x: rand(-70, 70), y: rand(-16, 14), r: rand(10, 18), col: '#f4f2ea' });
    if (S.up.ricecooker) { cook.prog = 1; cook.heatScore = 1; return completeCook(1, 1, false); }
    cook.phase = 'heat';
  }
  renderCook();
}
function addIng(s, btn) {
  const d = DISHES[cook.dish];
  if (s === d.steps[cook.step]) {
    cook.used.push(s); cook.step++;
    for (let i = 0; i < 5; i++) cook.blobs.push({ x: rand(-80, 80), y: rand(-18, 16), r: rand(8, 16), col: STEP_COL[s] || '#ccc' });
    SFX.plop(); if (Math.random() < .6) SFX.sizzle();
    if (cook.step >= d.steps.length) { cook.phase = 'heat'; cook.prog = 0; }
    renderCook();
  } else {
    cook.mistakes++; SFX.err();
    btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
    renderCook();
  }
}
function finishCook(burnt) {
  if (cook.phase !== 'heat') return;
  const p = cook.prog, [a, b] = cook.zone;
  let heat;
  if (burnt) heat = .35;
  else if (p >= a && p <= b) heat = 1;
  else { const dist = p < a ? a - p : p - b; heat = clamp(1 - dist * 2.6, .4, .95); }
  const stepsQ = clamp(1 - cook.mistakes * .12, .4, 1);
  const q = cook.dish === 'kanin' ? heat : stepsQ * .4 + heat * .6;
  completeCook(q, heat, burnt);
}
function completeCook(q, heat, burnt) {
  const k = cook.dish, tr = S.trays[k], add = servingsFor(k);
  const n2 = Math.min(TRAY_MAX, tr.n + add); const added = n2 - tr.n;
  tr.q = tr.n + added > 0 ? (tr.n * tr.q + added * q) / (tr.n + added) : q; tr.n = n2;
  cook.phase = 'done'; cook.q = q; cook.burnt = burnt; cook.added = added;
  if (burnt) SFX.err(); else SFX.ding();
  addXP(4);
  renderCook();
}
function drawStove(c, t) {
  const W = 440, H = 500;
  c.fillStyle = '#e4dccb'; c.fillRect(0, 0, W, H);
  for (let y = 0; y < 300; y += 30) for (let x = (y / 30) % 2 ? 15 : 0; x < W; x += 30) { c.fillStyle = '#d6ccb6'; c.fillRect(x, y, 28, 28); }
  c.fillStyle = '#5e3618'; c.fillRect(20, 40, 400, 8);
  // utensils
  const ut = [[70, '#8a5a32', 'spoon'], [130, '#b0b8c0', 'ladle'], [190, '#8a5a32', 'spat'], [320, '#b0b8c0', 'ladle'], [380, '#8a5a32', 'spoon']];
  for (const [x, col, kd] of ut) { c.fillStyle = '#333'; c.fillRect(x, 40, 3, 10); c.fillStyle = col; c.fillRect(x - 2, 50, 7, 70); if (kd === 'ladle') blob(c, x + 1, 128, 14, 10, col, 2); else if (kd === 'spat') c.fillRect(x - 10, 118, 23, 24); else blob(c, x + 1, 126, 9, 12, col, 2); }
  // hanging garlic & chili
  c.fillStyle = '#f3ead2'; blob(c, 255, 80, 12, 10, '#f3ead2', 2); blob(c, 270, 96, 12, 10, '#e8dcc0', 2); c.fillStyle = '#e53935'; c.fillRect(280, 60, 6, 26); c.fillRect(292, 64, 6, 22);
  // stove body
  c.fillStyle = '#5f676e'; c.fillRect(20, 330, 400, 170); c.fillStyle = '#a7b0b8'; c.fillRect(14, 312, 412, 26); c.fillStyle = '#c8d0d6'; c.fillRect(14, 312, 412, 4);
  for (const kx of [80, 140, 300, 360]) { blob(c, kx, 400, 14, 14, '#2b2b2b', 2); blob(c, kx, 400, 8, 8, '#888', 2); c.fillStyle = '#ddd'; c.fillRect(kx - 1, 388, 3, 10); }
  c.fillStyle = '#3a3f44'; c.fillRect(60, 440, 320, 40); c.fillStyle = '#2b2f33'; for (let i = 70; i < 380; i += 20) c.fillRect(i, 445, 10, 30);
  // burner ring
  blob(c, 220, 318, 70, 10, '#2b2b2b', 2);
  const cooking = cook && (cook.phase === 'steps' || cook.phase === 'heat');
  if (cooking) {
    const inten = cook.phase === 'heat' ? 1 + cook.prog * .6 : .8;
    for (let i = -4; i <= 4; i++) {
      const fh = (14 + Math.sin(t * 25 + i * 1.7) * 6) * inten;
      c.fillStyle = '#ff6d00'; c.fillRect(220 + i * 14 - 5, 312 - fh, 10, fh);
      c.fillStyle = '#ffd600'; c.fillRect(220 + i * 14 - 3, 312 - fh * .6, 6, fh * .6);
      c.fillStyle = '#4fc3f7'; c.fillRect(220 + i * 14 - 3, 310, 6, 3);
    }
  }
  const k = cook && cook.dish;
  if (k === 'kanin') {
    // pot
    c.fillStyle = '#9aa3ab'; c.fillRect(130, 210, 180, 100); c.fillStyle = '#c8d0d6'; c.fillRect(124, 200, 192, 14); c.fillStyle = '#7d858c'; c.fillRect(110, 228, 20, 8); c.fillRect(310, 228, 20, 8);
    c.fillStyle = '#e8e8e8'; c.fillRect(132, 214, 176, 10);
    if (cook.phase === 'done' || cook.phase === 'heat') { blob(c, 220, 214, 84, 10, cook.burnt ? '#5a4a3a' : '#ffffff', 2); }
  } else {
    // wok
    blob(c, 220, 268, 150, 50, '#1e1e1e', 2);
    blob(c, 220, 262, 136, 38, '#3a3a3a', 2);
    c.fillStyle = '#6b3d1f'; c.fillRect(368, 252, 64, 12); c.fillStyle = '#1e1e1e'; c.fillRect(360, 254, 12, 8);
    if (cook) {
      const d = k && DISHES[k];
      for (const b of cook.blobs || []) blob(c, 220 + b.x, 262 + b.y + Math.sin(t * 6 + b.x) * 1.5, b.r, b.r * .55, b.col, 2);
      if (d && (cook.phase === 'heat' || cook.phase === 'done')) {
        c.globalAlpha = cook.phase === 'done' ? .85 : clamp(cook.prog * .9, 0, .85);
        blob(c, 220, 262, 118, 30, d.c1, 2);
        c.globalAlpha = 1;
        if (cook.phase === 'done') for (let i = 0; i < 8; i++) c.fillStyle = d.c2, c.fillRect(140 + i * 22, 252 + (i % 3) * 6, 10, 8);
        if (cook.phase === 'heat' && cook.prog > .9 || cook.burnt) { c.globalAlpha = cook.burnt ? .55 : (cook.prog - .9) * 5; blob(c, 220, 262, 118, 30, '#111', 2); c.globalAlpha = 1; }
      }
    }
  }
  // steam
  if (cooking || (cook && cook.phase === 'done')) {
    for (let i = 0; i < 8; i++) { const ph = (t * 40 + i * 23) % 120; c.fillStyle = `rgba(255,255,255,${.6 - ph / 200})`; const s = 8 + ph / 12; c.fillRect(150 + i * 20 + Math.sin(t * 2 + i) * 8, 230 - ph, s, s); }
  }
  if (cook && cook.phase === 'done' && !cook.burnt) for (let i = 0; i < 6; i++) { const a = t * 2 + i; c.fillStyle = '#fff59d'; c.fillRect(220 + Math.cos(a) * 160, 200 + Math.sin(a * 1.3) * 50, 6, 6); }
  if (!cook || cook.phase === 'select') txt(c, 'Pumili ng lulutuin →', 220, 180, 26, '#fff', 'center', '#4a2810', 6);
}

/* ---------- MARKET ---------- */
function openMarket() {
  const q = {}; ITEM_ORDER.forEach(k => q[k] = 0);
  const ov = openModal(`<div class="panel" style="width:1040px;height:540px;padding:18px;display:flex;gap:18px">
    <button class="closex">✕</button>
    <div style="flex:none;position:relative"><canvas id="mkCv" class="pix card" width="420" height="500"></canvas></div>
    <div style="flex:1;display:flex;flex-direction:column;min-width:0">
      <div style="text-align:center;margin-bottom:6px"><span class="ptitle red">PALENGKE</span></div>
      <div class="muted" style="text-align:center;font-weight:900;margin-bottom:6px">${S.event && EVENTS[S.event].price ? (EVENTS[S.event].price > 1 ? '⚠ Mahal ang bilihin ngayon!' : '★ Bagsak-presyo ngayon!') : 'Presyo ngayong araw — nagbabago araw-araw.'}${S.up.ref ? '' : ' Walang pridyider: masisira ang kalahati ng karne/isda magdamag.'}</div>
      <div class="card" style="flex:1;overflow:auto">
        <div class="mRow" style="font-size:14px;color:#8a6a4a"><span></span><span>Sangkap</span><span>Presyo</span><span>Meron</span><span>Bibilhin</span></div>
        ${ITEM_ORDER.map(k => `<div class="mRow"><img src="${icon(k, 32)}"><span>${ITEMS[k].name}</span><span>${peso(S.prices[k])}/${ITEMS[k].unit}</span><span>${fmtQ(S.inv[k])}</span>
          <span class="qty"><button data-m="${k}" data-d="-1">−</button><span id="q_${k}">0</span><button data-m="${k}" data-d="1">+</button></span></div>`).join('')}
      </div>
      <div class="row" style="margin-top:12px;justify-content:space-between">
        <div class="disp" style="font-size:26px">Kabuuan: <span id="mTot">₱0</span> <span class="muted" style="font-size:18px">/ Pera: ${peso(S.money)}</span></div>
        <div class="row"><button class="btn small" id="mAuto">Awto-Lista</button><button class="btn yellow" id="mBuy" style="font-size:28px">Bilhin</button></div>
      </div>
    </div></div>`);
  const total = () => ITEM_ORDER.reduce((s, k) => s + q[k] * S.prices[k], 0);
  const upd = () => {
    ITEM_ORDER.forEach(k => $('#q_' + k).textContent = fmtQ(q[k]) + (ITEMS[k].unit === 'kg' ? 'kg' : ''));
    const tt = total(); $('#mTot').textContent = peso(tt); $('#mTot').className = tt > S.money ? 'bad' : '';
    $('#mBuy').disabled = tt <= 0 || tt > S.money;
  };
  ov.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { SFX.click(); const k = b.dataset.m; q[k] = Math.max(0, r1(q[k] + ITEMS[k].step * +b.dataset.d)); upd(); });
  $('#mAuto').onclick = () => {
    SFX.click();
    // suggest a balanced shopping list for unlocked dishes (~2 batches each main)
    ITEM_ORDER.forEach(k => q[k] = 0);
    const need = { pork: 0, chicken: 0, fish: 0, gulay: 0, rice: 3, rekado: 0 };
    VIANDS.filter(unlocked).forEach(d => { for (const i in DISHES[d].ing) need[i] += DISHES[d].ing[i] * 1.5; });
    ITEM_ORDER.forEach(k => { const st = ITEMS[k].step; q[k] = Math.max(0, Math.ceil((need[k] - S.inv[k]) / st) * st); q[k] = r1(q[k]); });
    while (total() > S.money && ITEM_ORDER.some(k => q[k] > 0)) { const k = ITEM_ORDER.filter(k => q[k] > 0).sort((a, b) => q[b] * S.prices[b] - q[a] * S.prices[a])[0]; q[k] = r1(q[k] - ITEMS[k].step); }
    upd();
  };
  $('#mBuy').onclick = () => {
    const tt = total(); if (tt <= 0 || tt > S.money) { SFX.err(); return; }
    S.money -= tt; G.stats.expenses += tt;
    ITEM_ORDER.forEach(k => S.inv[k] = r1(S.inv[k] + q[k]));
    SFX.coin(); toast('Nabili! −' + peso(tt));
    closeModal(); if (G.phase === 'prep') save();
  };
  upd();
  const mc = ov.querySelector('#mkCv').getContext('2d'); mc.imageSmoothingEnabled = false;
  let tt = 0; G.modalDraw = dt => { tt += dt; drawMarket(mc, tt); };
}
function drawMarket(c, t) {
  const W = 420, H = 500;
  const gr = c.createLinearGradient(0, 0, 0, 260); gr.addColorStop(0, '#8fd0f0'); gr.addColorStop(1, '#d8f0e0'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
  drawTree(c, 40, 260, 1.1); drawTree(c, 390, 250, 1.2, '#4ea446');
  c.fillStyle = '#c9a36a'; c.fillRect(0, 250, W, 250);
  // background stalls & people
  c.fillStyle = '#7a5030'; c.fillRect(0, 200, 90, 60);
  drawPerson(c, 30, 262, { u: 2, shirt: '#3498db', hair: '#222', skin: '#e0ac69', pants: '#333', frame: Math.floor(t * 3) % 3 });
  drawPerson(c, 395, 266, { u: 2, shirt: '#e67e22', hair: '#444', skin: '#c68642', pants: '#2c3e50', long: true });
  // stall poles
  c.fillStyle = '#6b3d1f'; c.fillRect(50, 90, 10, 260); c.fillRect(360, 90, 10, 260);
  // awning
  for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? '#f5f5f0' : '#2e9b45'; c.fillRect(30 + i * 30, 60, 30, 50); blob(c, 45 + i * 30, 110, 15, 8, c.fillStyle, 2); }
  c.fillStyle = '#1f6e30'; c.fillRect(26, 54, 368, 8);
  // vendor
  drawPerson(c, 210, 300, { u: 5, shirt: '#4a7ac8', hair: '#2b1a10', skin: '#c68642', pants: '#333', hat: 'salakot', bob: Math.sin(t * 2) * .4 });
  // hanging bananas
  c.fillStyle = '#ffd23f'; for (let i = 0; i < 5; i++) c.fillRect(300 + i * 8, 130 + (i % 2) * 4, 6, 26);
  c.fillStyle = '#6b8e23'; c.fillRect(296, 124, 46, 6);
  // table
  c.fillStyle = '#8a5a32'; c.fillRect(30, 300, 360, 20); c.fillStyle = '#6b3d1f'; c.fillRect(30, 320, 360, 140);
  for (let x = 30; x < 390; x += 30) { c.fillStyle = '#5e3618'; c.fillRect(x, 320, 2, 140); }
  // produce baskets
  const prod = [['#e53935', '#ff7043'], ['#4caf50', '#2e7d32'], ['#ff8f00', '#ffb74d'], ['#e98f8f', '#fff0f0'], ['#5a8fd0', '#bcd6f2'], ['#8e24aa', '#ba68c8']];
  prod.forEach(([a, b2], i) => {
    const px = 70 + (i % 3) * 140, py = i < 3 ? 296 : 380;
    c.fillStyle = '#b07a43'; c.fillRect(px - 50, py - 10, 100, 34); c.fillStyle = '#d9a066'; c.fillRect(px - 50, py - 10, 100, 4);
    for (let j = 0; j < 9; j++) blob(c, px - 36 + (j % 5) * 18, py - 14 - Math.floor(j / 5) * 12, 9, 7, j % 2 ? a : b2, 2);
  });
  // price signs
  txt(c, '₱ SARIWA! ₱', 210, 30, 22, '#fff', 'center', '#1f6e30', 6);
}

/* ---------- UPGRADES ---------- */
function openUpgrades() {
  let sel = UPGRADES[0].id;
  const ov = openModal(`<div class="panel" style="width:980px;height:520px;padding:18px;display:flex;gap:18px">
    <button class="closex">✕</button>
    <div style="flex:1.3;display:flex;flex-direction:column;min-width:0">
      <div class="row" style="margin-bottom:6px"><img src="${icon('upgrade', 48)}" style="width:48px;image-rendering:pixelated"><span class="ptitle">Pagpapaganda</span></div>
      <div id="uList" style="flex:1;overflow:auto"></div>
    </div>
    <div id="uPrev" class="card" style="flex:1;padding:16px;display:flex;flex-direction:column;align-items:center;text-align:center"></div></div>`);
  const lvlOf = u => S.up[u.id], maxOf = u => u.cost.length, costOf = u => u.cost[lvlOf(u)];
  const render = () => {
    $('#uList').innerHTML = UPGRADES.map(u => {
      const owned = lvlOf(u) >= maxOf(u);
      return `<div class="uRow ${u.id === sel ? 'sel' : ''}" data-u="${u.id}"><img src="${icon(u.id, 38)}"><span>${u.name}${maxOf(u) > 1 ? ` <span class="muted" style="font-size:15px">(${lvlOf(u)}/${maxOf(u)})</span>` : ''}</span>
        <span class="pr ${owned ? 'owned' : ''}">${owned ? 'MERON NA' : peso(costOf(u))}</span></div>`;
    }).join('');
    $('#uList').querySelectorAll('[data-u]').forEach(r => r.onclick = () => { SFX.click(); sel = r.dataset.u; render(); });
    const u = UPGRADES.find(x => x.id === sel), owned = lvlOf(u) >= maxOf(u), cost = costOf(u);
    $('#uPrev').innerHTML = `<canvas id="uCv" class="pix card" width="300" height="190" style="margin-bottom:12px"></canvas>
      <div class="disp" style="font-size:28px">${u.name}</div>
      <div style="font-weight:900;font-size:17px;margin:8px 0;color:#5a3a1a">${u.desc}</div>
      <div class="disp" style="font-size:22px;color:#2e7d32">${u.eff}</div>
      <div style="margin-top:auto">${owned ? '<button class="btn green" disabled>Nabili Na</button>' : `<button class="btn green" id="uBuy" ${S.money < cost ? 'disabled' : ''} style="font-size:26px">Bilhin ${peso(cost)}</button>`}</div>`;
    const uc = $('#uCv').getContext('2d'); uc.imageSmoothingEnabled = false;
    uc.fillStyle = '#f5e2b8'; uc.fillRect(0, 0, 300, 190);
    for (let y = 0; y < 190; y += 20) for (let x = (y / 20) % 2 ? 0 : 20; x < 300; x += 40) { uc.fillStyle = '#ead3a2'; uc.fillRect(x, y, 20, 20); }
    if (u.id === 'table') { drawTable(uc, 150, 140); drawStool(uc, 86, 148, -1); drawStool(uc, 214, 148, 1, true); drawPerson(uc, 86, 134, { sit: true, shirt: '#3498db', hair: '#222', skin: '#e0ac69', pants: '#333' }); drawPerson(uc, 214, 134, { sit: true, shirt: '#e74c3c', hair: '#3d2314', skin: '#f1c27d', pants: '#333', long: true }); }
    else drawIcon(uc, u.id, 150, 75, 22);
    const bb = $('#uBuy');
    if (bb) bb.onclick = () => {
      if (S.money < cost) { SFX.err(); return; }
      S.money -= cost; S.up[u.id] = (S.up[u.id] || 0) + 1; if (u.id === 'plates') G.clean += 6; SFX.lvl(); toast('Nabili: ' + u.name + '!', true);
      if (G.phase === 'prep') save();
      render();
    };
  };
  render();
}

/* ---------- PAUSE / SETTINGS ---------- */
function openPause() {
  const ov = openModal(`<div class="panel" style="width:420px;padding:26px;text-align:center">
    <button class="closex">✕</button>
    <div class="ptitle" style="margin-bottom:20px">Pahinga Muna</div>
    <div style="display:flex;flex-direction:column;gap:14px;align-items:center">
      <button class="btn green" id="pR" style="width:260px">Ituloy</button>
      <button class="btn" id="pS" style="width:260px">Ayos ng Laro</button>
      <button class="btn yellow" id="pF" style="width:260px">Palakihin ang Screen</button>
      <button class="btn red" id="pM" style="width:260px">Bumalik sa Simula</button>
    </div>
    <div class="muted" style="margin-top:14px;font-weight:900;font-size:14px">Kusang naiimbak ang laro tuwing umaga.</div></div>`);
  ov.querySelector('#pR').onclick = () => { SFX.click(); closeModal(); };
  ov.querySelector('#pS').onclick = () => { SFX.click(); openSettings(); };
  ov.querySelector('#pF').onclick = () => { SFX.click(); toggleFullscreen(); };
  ov.querySelector('#pM').onclick = () => {
    SFX.click();
    if (G.phase === 'prep') { save(); toMenu(); }
    else confirmBox('Bukas pa ang karinderya. Kapag umalis ka, mawawala ang progreso ngayong araw. Sige?', 'Umalis', toMenu);
  };
}
function openSettings() {
  const ov = openModal(`<div class="panel" style="width:480px;padding:26px;text-align:center">
    <button class="closex">✕</button>
    <div class="ptitle" style="margin-bottom:18px">Ayos ng Laro</div>
    <div style="display:flex;flex-direction:column;gap:14px;font-weight:900;font-size:22px">
      <div class="row" style="justify-content:space-between">Musika <button class="btn small" id="sMu"></button></div>
      <div class="row" style="justify-content:space-between">Mga Tunog <button class="btn small" id="sFx"></button></div>
      <div class="row" style="justify-content:space-between">Bilis ng Laro <button class="btn small" id="sSp"></button></div>
      <div class="row" style="justify-content:space-between">Burahin ang Laro <button class="btn small red" id="sDel">Burahin</button></div>
    </div></div>`);
  const r = () => {
    ov.querySelector('#sMu').textContent = settings.music ? 'BUKAS' : 'SARADO'; ov.querySelector('#sMu').className = 'btn small ' + (settings.music ? 'green' : '');
    ov.querySelector('#sFx').textContent = settings.sfx ? 'BUKAS' : 'SARADO'; ov.querySelector('#sFx').className = 'btn small ' + (settings.sfx ? 'green' : '');
    ov.querySelector('#sSp').textContent = settings.speed + 'x';
  };
  ov.querySelector('#sMu').onclick = () => { settings.music = !settings.music; saveSettings(); SFX.click(); r(); };
  ov.querySelector('#sFx').onclick = () => { settings.sfx = !settings.sfx; saveSettings(); SFX.click(); r(); };
  ov.querySelector('#sSp').onclick = () => { settings.speed = settings.speed === 1 ? 1.5 : settings.speed === 1.5 ? 2 : 1; saveSettings(); SFX.click(); r(); };
  ov.querySelector('#sDel').onclick = () => { confirmBox('Buburahin ang lahat ng progreso. Sigurado ka?', 'Burahin', () => { localStorage.removeItem(SAVE_KEY); toast('Nabura ang naka-imbak na laro.'); refreshMenu(); if (G.screen === 'game') toMenu(); }); };
  r();
}

/* ---------- DIALOG (Aling Mery) ---------- */
function drawMery(c) {
  const W = 240, H = 250, u = 10;
  const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#8a5a32'); gr.addColorStop(1, '#5e3618'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
  c.fillStyle = '#9e6b3b'; for (let x = 0; x < W; x += 30) c.fillRect(x, 0, 3, H);
  c.fillStyle = '#ffd77a'; blob(c, 200, 40, 14, 12, 'rgba(255,215,122,.5)', 2);
  const r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x * u, y * u, w * u, h * u); };
  // body
  r(4, 18, 16, 8, '#8a5bb5'); r(3, 20, 18, 6, '#8a5bb5');
  r(7, 19, 10, 7, '#f4a7c1'); r(8, 20, 2, 1, '#fff'); r(13, 22, 2, 1, '#fff'); r(10, 24, 2, 1, '#ffeb3b');
  r(10, 17, 4, 2, '#e8b48a');
  // head
  r(6, 6, 12, 12, '#eab88a'); r(5, 8, 1, 7, '#eab88a'); r(18, 8, 1, 7, '#eab88a');
  // hair + bun
  r(5, 4, 14, 4, '#d8d8e0'); r(4, 6, 2, 8, '#d8d8e0'); r(18, 6, 2, 8, '#d8d8e0'); r(9, 1, 6, 4, '#c9c9d4'); r(10, 0, 4, 1, '#c9c9d4'); r(7, 5, 3, 1, '#f0f0f5');
  // eyes closed smiling
  r(8, 11, 3, 1, '#3a2210'); r(13, 11, 3, 1, '#3a2210'); r(7, 10, 1, 1, '#3a2210'); r(16, 10, 1, 1, '#3a2210');
  // wrinkles, cheeks
  r(7, 13, 2, 1, '#f08a8a'); r(15, 13, 2, 1, '#f08a8a');
  // smile
  r(10, 14, 4, 1, '#8a3a2a'); r(9, 13, 1, 1, '#8a3a2a'); r(14, 13, 1, 1, '#8a3a2a'); r(10, 15, 4, 1, '#c96a5a');
  // earrings
  r(4, 13, 1, 1, '#ffd23f'); r(19, 13, 1, 1, '#ffd23f');
}
function dialog(lines, done) {
  closeModal();
  let i = 0, shown = 0, timer = null;
  const ov = openModal(`<div id="dlg"><div class="por"><canvas id="meryCv" class="pix" width="240" height="250"></canvas></div>
    <div class="box"><div class="name">Aling Mery</div><div id="dlgTxt"></div><div class="more">▼</div></div></div>`, false);
  ov.style.alignItems = 'flex-end'; ov.style.background = 'rgba(20,10,4,.35)';
  drawMery(ov.querySelector('#meryCv').getContext('2d'));
  const show = () => {
    const s = lines[i]; shown = 0; clearInterval(timer);
    timer = setInterval(() => { const el = $('#dlgTxt'); if (!el) { clearInterval(timer); return; } shown++; el.textContent = s.slice(0, shown); if (shown % 3 === 0) tone(520 + Math.random() * 200, .03, 'square', .02); if (shown >= s.length) clearInterval(timer); }, 22);
  };
  ov.querySelector('.box').onclick = () => {
    if (shown < lines[i].length) { shown = lines[i].length; clearInterval(timer); $('#dlgTxt').textContent = lines[i]; return; }
    SFX.click(); i++;
    if (i >= lines.length) { clearInterval(timer); closeModal(); done && done(); } else show();
  };
  show();
}

/* ---------- EVENT POPUP ---------- */
function eventPopup(evk, done) {
  const ev = EVENTS[evk];
  const ov = openModal(`<div class="evWrap"><canvas id="evCv" class="pix" width="660" height="440"></canvas>
    <div class="evIn"><div class="ribbon">KAGANAPAN!</div><div class="evCard"><h2>${ev.name}</h2><p>${ev.desc}</p><button class="btn yellow" id="evOk" style="font-size:30px;padding:4px 50px">SIGE</button></div></div></div>`, false);
  const ec = ov.querySelector('#evCv').getContext('2d'); ec.imageSmoothingEnabled = false;
  let tt = 0;
  const kids = [0, 1, 2, 3, 4].map(i => ({ x: 60 + i * 135 + (i > 1 ? 30 : 0), shirt: pick(SHIRTS), hair: pick(HAIRS), skin: pick(SKINS), pants: pick(PANTS), long: i % 2 }));
  G.modalDraw = dt => {
    tt += dt;
    const c = ec;
    const sky = evk === 'ulan' ? ['#7d8fa6', '#b6c2d0'] : ['#7ec8f0', '#e0f4ff'];
    const gr = c.createLinearGradient(0, 0, 0, 440); gr.addColorStop(0, sky[0]); gr.addColorStop(1, sky[1]); c.fillStyle = gr; c.fillRect(0, 0, 660, 440);
    // church
    c.fillStyle = '#e8d8b8'; c.fillRect(500, 170, 140, 200); c.fillRect(540, 110, 60, 70); c.fillStyle = '#c9b48a'; c.fillRect(560, 80, 20, 34); c.fillStyle = '#8a5a32'; c.fillRect(566, 60, 8, 24); c.fillRect(558, 68, 24, 6);
    c.fillStyle = '#6b4a2a'; c.fillRect(550, 300, 40, 70); blob(c, 570, 300, 20, 14, '#6b4a2a', 2); c.fillStyle = '#9fd3ef'; c.fillRect(560, 130, 20, 26);
    drawTree(c, 40, 380, 1.2); drawTree(c, 470, 380, 1);
    c.fillStyle = '#6dbb56'; c.fillRect(0, 370, 660, 70);
    // bunting
    const cols = ['#e53935', '#fdd835', '#1e88e5', '#43a047', '#ff6fa8', '#fb8c00'];
    for (let row = 0; row < 2; row++) for (let i = 0; i < 24; i++) { const bx = i * 28 - 4, by = 8 + row * 30 + Math.sin(i / 24 * Math.PI) * 18 + Math.sin(tt * 3 + i) * 2; c.fillStyle = cols[(i + row * 2) % 6]; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 22, by); c.lineTo(bx + 11, by + 20); c.fill(); }
    // rain
    if (evk === 'ulan') { c.fillStyle = 'rgba(220,235,255,.6)'; for (let i = 0; i < 70; i++) { const x = (i * 97 + tt * 60) % 700 - 20, y = (i * 53 + tt * 500) % 460 - 20; c.fillRect(x, y, 2, 12); } }
    // kids cheering
    kids.forEach((k, i) => drawPerson(c, k.x, 440 - Math.abs(Math.sin(tt * 5 + i)) * 10, { u: 5, shirt: k.shirt, hair: k.hair, skin: k.skin, pants: k.pants, long: k.long, cheer: Math.sin(tt * 5 + i) > 0, happyEyes: true }));
  };
  ov.querySelector('#evOk').onclick = () => { SFX.click(); closeModal(); done && done(); };
  SFX.lvl();
}

/* ---------- DAY FLOW ---------- */
function resetStats() { G.stats = { sales: 0, expenses: 0, tips: 0, served: 0, lost: 0, sats: [], dishes: {}, cooked: 0, washed: 0, extraRice: 0, riceMissed: 0, beggars: 0, helped: 0, bothered: 0, repStart: S.rep }; }
function startDay() {
  G.phase = 'prep'; G.time = 6 * 60; G.customers = []; G.beggar = null; G.begT = null; G.seatOcc = {}; G.popups = []; G.rain = []; resetPlayer();
  resetStats(); refreshToolbar(); save();
}
function endDay() {
  G.phase = 'report'; refreshToolbar();
  const st = G.stats;
  const avg = st.sats.length ? st.sats.reduce((a, b) => a + b, 0) / st.sats.length : 0;
  const repDelta = Math.round((avg - 50) / 5 + st.served / 4 - st.lost);
  S.rep = Math.max(0, S.rep + repDelta);
  const income = st.sales + st.tips, profit = income - st.expenses;
  if (profit > S.bestDay) S.bestDay = profit;
  const best = Object.entries(st.dishes).sort((a, b) => b[1] - a[1])[0];
  const ov = openModal(`<div class="panel" style="width:760px;padding:24px 30px;text-align:center">
    <div class="row" style="justify-content:center;margin-bottom:14px"><img src="${icon('sign', 44)}" style="width:44px;image-rendering:pixelated"><span class="disp" style="font-size:40px">Ulat ng Araw — Araw ${S.day}</span></div>
    <div class="row" style="gap:16px;align-items:stretch">
      <div class="rbox" style="flex:1">
        <div class="row"><span>Kabuuang Benta</span><span>${peso(st.sales)}</span></div>
        <div class="row"><span>Pabuya</span><span>${peso(st.tips)}</span></div>
        <div class="row"><span>Gastos</span><span>${peso(st.expenses)}</span></div>
        <div class="row disp" style="font-size:28px;color:${profit >= 0 ? '#2e7d32' : '#c62828'};border-top:3px dashed #e0c48f;padding-top:8px"><span>Tubo</span><span>${profit >= 0 ? '' : '−'}${peso(Math.abs(profit))} ${profit >= 0 ? '▲' : '▼'}</span></div>
      </div>
      <div class="rbox" style="flex:1">
        <div class="row"><span>Napagsilbihan</span><span>${st.served}</span></div>
        <div class="row"><span>Umalis nang galit</span><span class="${st.lost ? 'bad' : ''}">${st.lost}</span></div>
        <div class="row"><span>Nahugasang plato</span><span>${st.washed}</span></div>
        <div class="row"><span>Rice po</span><span>${st.extraRice}${st.riceMissed ? ' <span class="bad">(' + st.riceMissed + ' nakalimutan)</span>' : ''}</span></div>
        ${st.beggars ? `<div class="row"><span>Natulungang pulubi</span><span>${st.helped}/${st.beggars}</span></div>` : ''}
        <div class="row"><span>Kasiyahan</span><span>${Math.round(avg)}%</span></div>
        <div class="row"><span>Reputasyon</span><span style="color:${repDelta >= 0 ? '#2e7d32' : '#c62828'}">★ ${repDelta >= 0 ? '+' : ''}${repDelta}</span></div>
        <div class="row" style="font-size:16px"><span>Pinakamabenta</span><span>${best ? DISHES[best[0]].name + ' (' + best[1] + ')' : '—'}</span></div>
      </div>
    </div>
    <button class="btn" id="rC" style="margin-top:20px;font-size:30px;padding:6px 60px">Ituloy</button></div>`, false);
  SFX.ding();
  ov.querySelector('#rC').onclick = () => { SFX.click(); closeModal(); nextDay(profit, avg, st); };
}
function nextDay(profit, avg, st) {
  const notes = [];
  // spoilage
  if (!S.up.ref) {
    const left = TRAY_ORDER.reduce((s, k) => s + S.trays[k].n, 0);
    TRAY_ORDER.forEach(k => S.trays[k] = { n: 0, q: 0 });
    let spoiled = 0; PERISH.forEach(k => { const lost = r1(S.inv[k] / 2); spoiled += lost; S.inv[k] = r1(S.inv[k] - lost); });
    if (left > 0 || spoiled > 0) notes.push(`Walang pridyider, apo… ${left ? 'Napanis ang ' + left + ' tirang hain' : ''}${left && spoiled ? ' at ' : ''}${spoiled ? 'nasira ang ' + fmtQ(spoiled) + 'kg na karne/isda' : ''}. Bumili tayo ng Pridyider balang araw!`);
  } else {
    TRAY_ORDER.forEach(k => S.trays[k].q *= .92);
  }
  const lines = [];
  if (st.served === 0) lines.push('Walang kumain ngayon, apo… Siguraduhing may lutong ulam at kanin bago magbukas!');
  else if (profit > 0 && avg >= 75) lines.push(pick(['Ang galing mo, apo! Ang karinderya natin, mas lalo pang sumisikat!', 'Napakasarap daw ng luto mo sabi ng mga suki! Proud si Lola!', 'Ayan! Busog ang mga tao, puno ang kaha. Ganyan nga, apo!']));
  else if (profit > 0) lines.push('May kita tayo ngayon, apo. Pero pwede pa nating pagandahin ang serbisyo — bilisan ang pagsilbi!');
  else lines.push('Medyo lugi tayo ngayon, apo. Ayos lang, bukas babawi tayo! Huwag bumili ng sobra sa palengke.');
  if (st.lost > 2) lines.push('Maraming umalis dahil naghintay nang matagal. Magluto nang mas marami bago magbukas!');
  lines.push(...notes);
  lines.push(pick([
    'Payo ni Lola: Huwag kalimutan ang kanin! Bawal ang ulam na walang kanin sa Pinoy.',
    'Payo ni Lola: Tuwing tanghalian (11AM–1PM) at hapunan (5PM–7PM) ang dagsa ng tao.',
    'Payo ni Lola: Mas masarap na luto = mas masaya ang kumakain = mas malaking pabuya!',
    'Payo ni Lola: Mag-ipon para sa Pagpapaganda. Ang dagdag na mesa ay dagdag na kita!',
    'Payo ni Lola: Tingnan ang presyo sa palengke araw-araw. Minsan mura, minsan mahal!',
  ]));
  S.day++;
  // ayuda safety net
  const anyFood = TRAY_ORDER.some(k => S.trays[k].n > 0) || ITEM_ORDER.some(k => k !== 'rekado' && S.inv[k] >= .5);
  if (S.money < 250 && !anyFood) { S.money += 600; lines.push('Naku, ubos ang puhunan natin. Heto, ₱600 galing sa ipon ni Lola. Galingan mo, ha!'); }
  // event roll
  S.event = null;
  if (S.day >= 2 && Math.random() < .4) S.event = pick(S.day % 7 === 0 ? ['fiesta'] : Object.keys(EVENTS));
  if (S.day % 7 === 0 && S.day > 0) S.event = 'fiesta';
  if (S.day % 15 === 0) S.event = 'sweldo';
  rollPrices(S);
  startDay();
  dialog(lines, () => { if (S.event) eventPopup(S.event, () => {}); });
}

/* ---------------- SCREENS ---------------- */
function refreshMenu() { $('#mCont').disabled = !loadSave(); }
function toMenu() {
  closeModal(); G.screen = 'menu';
  $('#menu').classList.remove('hidden'); $('#hud').classList.add('hidden'); $('#toolbar').classList.add('hidden');
  refreshMenu();
}
function enterGame() {
  G.screen = 'game'; G.paused = false;
  $('#menu').classList.add('hidden'); $('#hud').classList.remove('hidden'); $('#toolbar').classList.remove('hidden');
  $('#icCook').src = icon('cook', 36); $('#icMarket').src = icon('market', 36); $('#icUp').src = icon('upgrade', 36);
}
function newGame() {
  S = newState(); enterGame(); startDay();
  dialog([
    'Apo Buseng! Maligayang pagdating! Ikaw na ang bahala sa karinderya natin simula ngayon.',
    'Una, pumunta ka sa PALENGKE para bumili ng sangkap. May konting baboy, gulay at bigas pa tayo dito.',
    'Pagkatapos, magluto ka sa KUSINA. Ilagay ang sangkap sa tamang pagkakasunod, at HANGUIN sa tamang oras!',
    'Huwag kalimutang MAGSAING ng kanin — walang Pilipinong kumakain nang walang kanin!',
    'Ikaw si BUSENG! Sa phone: i-TAP lang ang sahig para maglakad, at i-tap ang kumakain, mesa o lababo para kumilos. Sa computer: WASD o arrow keys, at E o Space.',
    'Kapag handa na, pindutin ang BUKSAN. I-click ang kumakain sa turo-turo para pagsilbihan sila. Kain tayo!',
    'Kapag tapos kumain ang suki, may maiiwang PLATO at BASO sa mesa. I-click ang maduming mesa para ligpitin, tapos dalhin sa LABABO para hugasan!',
    'Tandaan: limitado ang malinis na plato, at hindi makakaupo ang kumakain sa maduming mesa. Laging maglinis, apo!',
    'At minsan, hihingi ng "RICE PO!" ang mga kumakain! I-click ang lalagyan ng kanin sa turo-turo para kumuha, tapos ihatid sa mesa nila. May dagdag na ₱15 at pabuya pa!',
  ]);
}
$('#mNew').onclick = () => { SFX.click(); if (loadSave()) confirmBox('May naka-imbak kang laro. Magsimula ng bago? (Mabubura ang luma)', 'Bago', newGame); else newGame(); };
$('#mCont').onclick = () => {
  SFX.click(); const d = loadSave(); if (!d) return;
  S = Object.assign(newState(), d);
  S.up = Object.assign(newState().up, d.up || {});
  TRAY_ORDER.forEach(k => { if (!S.trays[k]) S.trays[k] = { n: 0, q: 0 }; });
  enterGame(); startDay();
  dialog(['Maligayang pagbabalik, apo! Araw ' + S.day + ' na. Handa ka na bang magluto?'], () => { if (S.event) eventPopup(S.event, () => {}); });
};
$('#mSet').onclick = () => { SFX.click(); openSettings(); };
$('#mQuit').onclick = () => {
  SFX.click();
  const ov = openModal(`<div class="panel" style="width:520px;padding:30px;text-align:center">
    <div class="disp" style="font-size:40px">Salamat sa paglalaro!</div>
    <div style="font-weight:900;font-size:20px;margin:10px 0 20px">Paalam muna, apo. Balik ka ha? Kain tayo ulit!</div>
    <button class="btn" id="qB">Bumalik sa Simula</button></div>`);
  ov.querySelector('#qB').onclick = () => { SFX.click(); closeModal(); };
  try { window.close(); } catch (e) {}
};

/* ---------------- MAIN LOOP ---------------- */
let last = performance.now();
function loop(now) {
  const dt = Math.min(.1, (now - last) / 1000); last = now; G.t += dt;
  if (G.screen === 'game' && S) {
    if (!G.paused && !G.modal) update(dt);
    drawRestaurant(ctx, G.t);
    updateHUD();
  } else drawTitle(ctx, G.t);
  if (G.modalDraw) G.modalDraw(dt);
  requestAnimationFrame(loop);
}
refreshMenu();
requestAnimationFrame(loop);
