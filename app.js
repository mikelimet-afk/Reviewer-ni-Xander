(function () {
'use strict';

/* ---------- basics ---------- */
var app = document.getElementById('app');
var KEY = 'tamprep.v1';
var LETTERS = 'ABCD';
var SEC = { english: 'English', math: 'Mathematics', science: 'Science', reasoning: 'Mental Ability' };
var TOPIC = {
  grammar: 'Grammar & Usage', vocab: 'Vocabulary', reading: 'Reading Comprehension',
  speed: 'Speed Math', arithmetic: 'Number Sense', algebra: 'Algebra', geometry: 'Geometry', trig: 'Trigonometry', stats: 'Statistics & Probability',
  bio: 'Biology', chem: 'Chemistry', physics: 'Physics', earth: 'Earth & Space',
  verbal: 'Analogies & Logic', series: 'Number & Letter Series', figure: 'Abstract Figures'
};
var TOPIC_SEC = {};
['grammar', 'vocab', 'reading'].forEach(function (t) { TOPIC_SEC[t] = 'english'; });
['speed', 'arithmetic', 'algebra', 'geometry', 'trig', 'stats'].forEach(function (t) { TOPIC_SEC[t] = 'math'; });
['bio', 'chem', 'physics', 'earth'].forEach(function (t) { TOPIC_SEC[t] = 'science'; });
['verbal', 'series', 'figure'].forEach(function (t) { TOPIC_SEC[t] = 'reasoning'; });

function rnd(n) { return Math.floor(Math.random() * n); }
function pick(a) { return a[rnd(a.length)]; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function sample(a, n) { return shuffle(a).slice(0, n); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function fmt(s) { s = Math.max(0, s); var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
function pct(c, t) { return t ? Math.round(c / t * 100) : 0; }
function mins(s) { return s % 60 === 0 ? (s / 60) + ' min' : fmt(s); }

/* ---------- storage ---------- */
function blank() { return { name: '', attempts: [], missed: {} }; }
function load() {
  try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && Array.isArray(d.attempts)) return Object.assign(blank(), d); } catch (e) {}
  return blank();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
var store = load();

/* ---------- generated questions ---------- */
function numOpts(ans, offs) {
  var out = [], cand = shuffle(offs || [1, -1, 2, -2, 10, -10, 3, -3, 5, -5]);
  for (var i = 0; i < cand.length && out.length < 3; i++) { var v = ans + cand[i]; if (v !== ans && v >= 0 && out.indexOf(v) < 0) out.push(v); }
  for (var k = 4; out.length < 3; k++) if (out.indexOf(ans + k) < 0) out.push(ans + k);
  return [ans].concat(out).map(String);
}
function G(sec, topic, q, c, exp) { return { id: null, sec: sec, topic: topic, q: q, c: c, exp: exp, p: null }; }

function speedQ(t) {
  var a, b, c, x, ans, n;
  switch (t) {
    case 0: a = rnd(400) + 100; b = rnd(400) + 100; ans = a + b;
      return G('math', 'speed', a + ' + ' + b + ' = ?', numOpts(ans, [10, -10, 100, -100, 1, -1, 20]), 'Add hundreds, tens, then ones: ' + a + ' + ' + b + ' = ' + ans + '.');
    case 1: a = rnd(500) + 300; b = rnd(250) + 50; ans = a - b;
      return G('math', 'speed', a + ' − ' + b + ' = ?', numOpts(ans, [10, -10, 100, -100, 1, -1, 20]), a + ' − ' + b + ' = ' + ans + '. Check by adding back: ' + ans + ' + ' + b + ' = ' + a + '.');
    case 2: a = rnd(18) + 12; b = rnd(8) + 2; ans = a * b; x = Math.floor(a / 10) * 10;
      return G('math', 'speed', a + ' × ' + b + ' = ?', numOpts(ans, [b, -b, 10, -10, 2, -2]), 'Split it: (' + x + ' × ' + b + ') + (' + (a - x) + ' × ' + b + ') = ' + (x * b) + ' + ' + ((a - x) * b) + ' = ' + ans + '.');
    case 3: b = rnd(10) + 3; x = rnd(20) + 5; a = b * x;
      return G('math', 'speed', a + ' ÷ ' + b + ' = ?', numOpts(x, [1, -1, 2, -2, 3, -3]), b + ' × ' + x + ' = ' + a + ', so ' + a + ' ÷ ' + b + ' = ' + x + '.');
    case 4: a = pick([5, 10, 20, 25, 40, 50, 75]); n = (rnd(20) + 2) * 20; ans = a * n / 100;
      return G('math', 'speed', 'What is ' + a + '% of ' + n + '?', numOpts(ans, [5, -5, 10, -10, 2, -2, 20]), a + '% means ' + a + '/100. ' + n + ' × ' + a + ' ÷ 100 = ' + ans + '.');
    case 5: c = pick([[3, 4], [2, 3], [3, 5], [5, 8], [2, 5], [5, 6]]); n = c[1] * (rnd(10) + 3); ans = n / c[1] * c[0];
      return G('math', 'speed', 'What is ' + c[0] + '/' + c[1] + ' of ' + n + '?', numOpts(ans, [c[0], -c[0], 1, -1, c[1], -c[1], 2]), 'Divide by the denominator, then multiply by the numerator: ' + n + ' ÷ ' + c[1] + ' = ' + (n / c[1]) + ', and ' + (n / c[1]) + ' × ' + c[0] + ' = ' + ans + '.');
    case 6: x = rnd(12) + 2; a = rnd(7) + 2; b = rnd(20) + 1; c = a * x + b;
      return G('math', 'speed', 'If ' + a + '<i>x</i> + ' + b + ' = ' + c + ', what is <i>x</i>?', numOpts(x, [1, -1, 2, -2, 3]), 'Subtract ' + b + ' from both sides: ' + a + '<i>x</i> = ' + (c - b) + '. Divide by ' + a + ': <i>x</i> = ' + x + '.');
    case 7: n = rnd(14) + 11; ans = n * n;
      if (rnd(2)) return G('math', 'speed', n + '² = ?', numOpts(ans, [n, -n, 10, -10, 20, -20]), n + ' × ' + n + ' = ' + ans + '. It helps to memorize the squares from 11 to 25.');
      return G('math', 'speed', '√' + ans + ' = ?', numOpts(n, [1, -1, 2, -2, 3]), n + ' × ' + n + ' = ' + ans + ', so √' + ans + ' = ' + n + '.');
    case 8: a = rnd(20) + 5; b = rnd(8) + 2; c = rnd(8) + 2; ans = a + b * c;
      return G('math', 'speed', a + ' + ' + b + ' × ' + c + ' = ?', [String(ans), String((a + b) * c), String(ans + b), String(ans - c)], 'Multiply before adding (PEMDAS): ' + b + ' × ' + c + ' = ' + (b * c) + ', then ' + a + ' + ' + (b * c) + ' = ' + ans + '. Adding first gives the common wrong answer ' + ((a + b) * c) + '.');
    default: n = rnd(30) + 20; a = rnd(9) + 1; b = rnd(9) + 1; x = [n - a, n + a + b, n - b];
      return G('math', 'speed', 'What is the average of ' + x.join(', ') + '?', numOpts(n, [1, -1, 2, -2, 3, -3]), 'Sum = ' + (3 * n) + '. Divide by 3 numbers: ' + (3 * n) + ' ÷ 3 = ' + n + '.');
  }
}
function speedSet(n) { var types = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).concat(shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])), out = []; for (var i = 0; i < n; i++) out.push(speedQ(types[i % 20])); return out; }

function numSeries() {
  var t = rnd(7), s = [], a, d, i, exp;
  if (t === 0) { d = pick([3, 4, 6, 7, 8, 9, -3, -4, -6]); a = rnd(20) + 1 + (d < 0 ? 60 : 0); for (i = 0; i < 6; i++) s.push(a + d * i); exp = 'Each term ' + (d > 0 ? 'adds ' : 'subtracts ') + Math.abs(d) + '.'; }
  else if (t === 1) { a = pick([1, 2, 3, 5]); d = pick([2, 3]); for (i = 0; i < 6; i++) s.push(a * Math.pow(d, i)); exp = 'Each term is multiplied by ' + d + '.'; }
  else if (t === 2) { a = rnd(9) + 1; d = pick([1, 2, 3]); s = [a]; for (i = 1; i < 6; i++) s.push(s[i - 1] + d * i); exp = 'The gaps keep growing: +' + d + ', +' + 2 * d + ', +' + 3 * d + ', +' + 4 * d + '… so the next gap is +' + 5 * d + '.'; }
  else if (t === 3) { a = rnd(6) + 1; for (i = 0; i < 6; i++) s.push((a + i) * (a + i)); exp = 'These are perfect squares: ' + a + '², ' + (a + 1) + '², ' + (a + 2) + '²… The next is ' + (a + 5) + '².'; }
  else if (t === 4) { a = rnd(10) + 1; var b = rnd(10) + 30, d1 = pick([2, 3, 4]), d2 = pick([-2, -3, 5]); for (i = 0; i < 4; i++) { s.push(a + d1 * i); s.push(b + d2 * i); } s = s.slice(0, 7); exp = 'Two series alternate. The 1st, 3rd, 5th… terms go ' + (d1 > 0 ? '+' : '') + d1 + '; the 2nd, 4th, 6th… terms go ' + (d2 > 0 ? '+' : '') + d2 + '. The missing term belongs to the first series.'; }
  else if (t === 5) { s = [rnd(4) + 1]; for (i = 1; i < 6; i++) s.push(s[i - 1] * 2 + 1); exp = 'Each term is double the previous term plus 1.'; }
  else { a = rnd(4) + 1; s = [a, a + rnd(3) + 1]; for (i = 2; i < 7; i++) s.push(s[i - 1] + s[i - 2]); exp = 'Each term is the sum of the two terms before it.'; }
  var ans = s[s.length - 1], shown = s.slice(0, -1);
  return G('reasoning', 'series', 'What number comes next?<br><b>' + shown.join(', ') + ', ?</b>', numOpts(ans), exp + ' Answer: ' + ans + '.');
}
function letterSeries() {
  var A = function (i) { return String.fromCharCode(65 + ((i % 26) + 26) % 26); }, i, shown = [];
  if (rnd(3) < 2) {
    var d = pick([2, 3, 4, 5, -2, -3]), st = d > 0 ? rnd(26 - 4 * d) : 25 - rnd(26 + 4 * d);
    for (i = 0; i < 4; i++) shown.push(A(st + d * i));
    var an = st + 4 * d, wrong = sample([1, -1, 2, -2].map(function (o) { return A(an + o); }), 3);
    return G('reasoning', 'series', 'What letter comes next?<br><b>' + shown.join(', ') + ', ?</b>', [A(an)].concat(wrong), 'The letters move ' + (d > 0 ? 'forward' : 'backward') + ' ' + Math.abs(d) + ' places in the alphabet each time. Tip: convert letters to numbers (A=1, B=2…). Answer: ' + A(an) + '.');
  }
  var k = rnd(20);
  for (i = 0; i < 4; i++) shown.push(A(k + i) + A(25 - k - i));
  return G('reasoning', 'series', 'What comes next?<br><b>' + shown.join(', ') + ', ?</b>',
    [A(k + 4) + A(21 - k), A(k + 4) + A(22 - k), A(k + 5) + A(21 - k), A(k + 3) + A(21 - k)],
    'The first letter moves forward one place each time while the second letter moves backward one place. Answer: ' + A(k + 4) + A(21 - k) + '.');
}

/* abstract figures (SVG) */
function svg(inner) { return '<svg class="fig" viewBox="0 0 60 60"><rect x="1" y="1" width="58" height="58" rx="6" class="fgb"/>' + inner + '</svg>'; }
var QM = '<svg class="fig" viewBox="0 0 60 60"><rect x="1" y="1" width="58" height="58" rx="6" class="fgb fq"/><text x="30" y="40" text-anchor="middle" font-size="28" font-weight="700" fill="currentColor">?</text></svg>';
var GLYPH = { F: 'M22 46V14H40M22 29H34', L: 'M22 12V46H42', P: 'M22 48V14H38V30H22', arrow: 'M30 50V14M20 24L30 12L40 24' };
function glyph(g, deg, mirror) {
  return svg('<g transform="rotate(' + deg + ' 30 30)' + (mirror ? ' translate(60 0) scale(-1 1)' : '') + '"><path d="' + GLYPH[g] + '" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>');
}
function frames(list) { return '<div class="frames">' + list.join('') + QM + '</div>'; }
function figRotation() {
  var g = pick(['arrow', 'F', 'P']), step = pick([45, 90, 135, -45, -90]), st = rnd(8) * 45;
  var ang = function (i) { return ((st + step * i) % 360 + 360) % 360; }, ans = ang(4);
  var wrong = sample([0, 45, 90, 135, 180, 225, 270, 315].filter(function (a) { return a !== ans; }), 3);
  return G('reasoning', 'figure', 'Which figure comes next in the series?' + frames([0, 1, 2, 3].map(function (i) { return glyph(g, ang(i)); })),
    [ans].concat(wrong).map(function (a) { return glyph(g, a); }),
    'The figure turns ' + Math.abs(step) + '° ' + (step > 0 ? 'clockwise' : 'counter-clockwise') + ' at every step. Continue the same turn one more time to get the answer.');
}
var PERIM = [[13, 13], [30, 13], [47, 13], [47, 30], [47, 47], [30, 47], [13, 47], [13, 30]];
function dotFig(i) { return svg('<rect x="13" y="13" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".4"/><circle cx="' + PERIM[i][0] + '" cy="' + PERIM[i][1] + '" r="6" fill="currentColor"/>'); }
function figDot() {
  var step = pick([1, 2, 3, -1, -2, -3]), st = rnd(8), pos = function (i) { return ((st + step * i) % 8 + 8) % 8; }, ans = pos(4);
  var wrong = sample([0, 1, 2, 3, 4, 5, 6, 7].filter(function (p) { return p !== ans; }), 3);
  return G('reasoning', 'figure', 'Which figure comes next in the series?' + frames([0, 1, 2, 3].map(function (i) { return dotFig(pos(i)); })),
    [ans].concat(wrong).map(dotFig),
    'Count the corners and the middle of each side as stops (8 in all). The dot moves ' + Math.abs(step) + ' stop' + (Math.abs(step) > 1 ? 's' : '') + ' ' + (step > 0 ? 'clockwise' : 'counter-clockwise') + ' each step.');
}
function poly(n, filled) {
  var pts = []; for (var k = 0; k < n; k++) { var a = (-90 + 360 * k / n) * Math.PI / 180; pts.push((30 + 20 * Math.cos(a)).toFixed(1) + ',' + (31 + 20 * Math.sin(a)).toFixed(1)); }
  return svg('<polygon points="' + pts.join(' ') + '" fill="' + (filled ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>');
}
function figSides() {
  var up = rnd(2) === 1, seq = up ? [3, 4, 5] : [6, 5, 4], ans = up ? 6 : 3, alts = up ? [5, 7] : [4, 5], f0 = rnd(2) === 1;
  var fill = function (i) { return (i % 2 === 0) === f0; }, f = fill(3);
  return G('reasoning', 'figure', 'Which figure comes next in the series?' + frames(seq.map(function (n, i) { return poly(n, fill(i)); })),
    [poly(ans, f), poly(ans, !f), poly(alts[0], f), poly(alts[1], f)],
    'Two things change at once: the number of sides ' + (up ? 'increases' : 'decreases') + ' by one, and the shading alternates. So the next figure has ' + ans + ' sides and is ' + (f ? 'shaded' : 'unshaded') + '.');
}
function dots(n) { var s = ''; for (var k = 0; k < n; k++) s += '<circle cx="' + (15 + 15 * (k % 3)) + '" cy="' + (15 + 15 * Math.floor(k / 3)) + '" r="5" fill="currentColor"/>'; return svg(s); }
function figCount() {
  var c = pick([[1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [3, 2], [9, -2], [8, -2], [7, -2], [9, -1], [6, -1]]), a = c[0], d = c[1], ans = a + 3 * d;
  var wrong = sample([-3, -2, -1, 1, 2, 3].map(function (o) { return ans + o; }).filter(function (v) { return v >= 1 && v <= 9; }), 3);
  return G('reasoning', 'figure', 'Which figure comes next in the series?' + frames([0, 1, 2].map(function (i) { return dots(a + d * i); })),
    [ans].concat(wrong).map(dots),
    'Count the dots: ' + a + ', ' + (a + d) + ', ' + (a + 2 * d) + '. The count ' + (d > 0 ? 'goes up' : 'goes down') + ' by ' + Math.abs(d) + ' each step, so the next figure has ' + ans + ' dot' + (ans > 1 ? 's' : '') + '.');
}
function figOdd() {
  var g = pick(['F', 'L', 'P']), a = shuffle([0, 90, 180, 270]);
  return G('reasoning', 'figure', 'Three of these figures are the same shape turned in different directions. Which one is different?',
    [glyph(g, a[3], true), glyph(g, a[0]), glyph(g, a[1]), glyph(g, a[2])],
    'Three figures are the same shape simply rotated. The odd one is a mirror image (flipped) — no amount of turning will make it match the others. Tip: mentally rotate each figure to the same upright position and compare.');
}
function figAnalogy() {
  var gs = sample(['F', 'L', 'P', 'arrow'], 2), t = pick([90, 180, 270]), a = rnd(4) * 90, c = rnd(4) * 90, ans = (c + t) % 360;
  var wrong = [0, 90, 180, 270].filter(function (x) { return x !== ans; });
  return G('reasoning', 'figure', 'Choose the figure that completes the analogy.<div class="frames">' + glyph(gs[0], a) + '<span class="rel">is to</span>' + glyph(gs[0], (a + t) % 360) + '<span class="rel">as</span>' + glyph(gs[1], c) + '<span class="rel">is to</span>' + QM + '</div>',
    [ans].concat(wrong).map(function (x) { return glyph(gs[1], x); }),
    'The first figure is turned ' + (t === 180 ? '180° (upside down)' : t === 90 ? '90° clockwise' : '90° counter-clockwise') + ' to get the second. Apply exactly the same turn to the third figure.');
}
var FIGS = [figRotation, figDot, figSides, figCount, figOdd, figAnalogy];
function figSet(n) { var order = shuffle(FIGS), out = []; for (var i = 0; i < n; i++) out.push(order[i % order.length]()); return out; }
function seriesSet(n) { var out = []; for (var i = 0; i < n; i++) out.push(i % 3 === 2 ? letterSeries() : numSeries()); return out; }

/* ---------- drawing from the bank ---------- */
function fromBank(sec, topic, n) { return sample(BANK.filter(function (q) { return q.sec === sec && q.topic === topic; }), n); }
function stratified(sec, n) {
  var groups = {}, keys, out = [];
  BANK.forEach(function (q) { if (q.sec === sec && q.topic !== 'reading') (groups[q.topic] = groups[q.topic] || []).push(q); });
  keys = shuffle(Object.keys(groups)); keys.forEach(function (k) { groups[k] = shuffle(groups[k]); });
  for (var i = 0; out.length < n && keys.some(function (k) { return groups[k].length; }); i++) { var g = groups[keys[i % keys.length]]; if (g.length) out.push(g.pop()); }
  return shuffle(out);
}
function readingSets(nPass) {
  var out = [];
  sample(Object.keys(PASSAGES), nPass).forEach(function (id) { out = out.concat(BANK.filter(function (q) { return q.p === id; })); });
  return out;
}

function buildAssessment() {
  return { type: 'assessment', title: 'Assessment Test', parts: [
    { name: 'Speed Math', note: 'Mental arithmetic — no calculator. Go fast, but stay accurate.', time: 360, qs: speedSet(20) },
    { name: 'Vocabulary & Grammar', time: 360, qs: shuffle(fromBank('english', 'grammar', 6).concat(fromBank('english', 'vocab', 6))) },
    { name: 'Reading Comprehension', note: 'Two passages. The passage stays on screen while you answer.', time: 600, qs: readingSets(2) },
    { name: 'Abstract & Logical Reasoning', time: 540, qs: figSet(5).concat(seriesSet(3), fromBank('reasoning', 'verbal', 4)) },
    { name: 'Science', time: 360, qs: stratified('science', 10) },
    { name: 'Math Problem Solving', note: 'Scratch paper allowed, no calculator.', time: 720, qs: stratified('math', 10) }
  ] };
}
function buildMock() {
  return { type: 'mock', title: 'Mock Exam', parts: [
    { name: 'English', note: 'Grammar, vocabulary, then three reading passages.', time: 1800, qs: shuffle(fromBank('english', 'grammar', 12).concat(fromBank('english', 'vocab', 8))).concat(readingSets(3)) },
    { name: 'Mathematics', note: 'Scratch paper allowed, no calculator.', time: 1800, qs: stratified('math', 25) },
    { name: 'Science', time: 900, qs: stratified('science', 20) },
    { name: 'Mental Ability', note: 'Figure patterns, number and letter series, analogies and logic.', time: 1200, qs: figSet(8).concat(seriesSet(5), fromBank('reasoning', 'verbal', 7)) }
  ] };
}
function buildPractice(topic, n) {
  var qs, name = TOPIC[topic] || SEC[topic];
  if (topic === 'speed') qs = speedSet(n);
  else if (topic === 'figure') qs = figSet(n);
  else if (topic === 'series') qs = seriesSet(n);
  else if (topic === 'reading') qs = readingSets(2);
  else if (topic === 'reasoning') qs = shuffle(figSet(Math.ceil(n * 0.4)).concat(seriesSet(Math.floor(n * 0.3)), fromBank('reasoning', 'verbal', n - Math.ceil(n * 0.4) - Math.floor(n * 0.3))));
  else if (SEC[topic]) qs = stratified(topic, n);
  else qs = fromBank(TOPIC_SEC[topic], topic, n);
  return { type: 'practice', title: 'Practice: ' + name, parts: [{ name: name, time: 0, qs: qs }] };
}

/* ---------- session ---------- */
var S = null, pending = null, timer = null;

function view(html) { app.innerHTML = html; window.scrollTo(0, 0); app.classList.remove('enter'); void app.offsetWidth; app.classList.add('enter'); }
function celebrate(it) {
  var ok = app.querySelector('.ch.ok'), bad = app.querySelector('.ch.bad');
  if (it.chosen !== 0) { if (bad) bad.classList.add('shake'); if (ok) ok.classList.add('reveal'); return; }
  if (!ok) return;
  ok.classList.add('pop');
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var colors = ['#f2b705', '#0f8a4b', '#3cc47a', '#ffd95a'];
  for (var i = 0; i < 14; i++) {
    var s = document.createElement('span'), ang = Math.random() * Math.PI * 2, dist = 40 + Math.random() * 70;
    s.className = 'spark';
    s.style.background = colors[i % colors.length];
    s.style.setProperty('--x', (10 + Math.random() * 80) + '%');
    s.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(0) + 'px');
    s.style.setProperty('--dy', (Math.sin(ang) * dist - 20).toFixed(0) + 'px');
    s.style.setProperty('--r', (Math.random() * 360 - 180).toFixed(0) + 'deg');
    ok.appendChild(s);
  }
  setTimeout(function () { var l = ok.querySelectorAll('.spark'); for (var j = 0; j < l.length; j++) l[j].remove(); }, 900);
}
function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
function total(sess) { return sess.parts.reduce(function (s, p) { return s + p.qs.length; }, 0); }
function totalTime(sess) { return sess.parts.reduce(function (s, p) { return s + p.time; }, 0); }

function intro(type) {
  S = null; stopTimer();
  pending = type === 'mock' ? buildMock() : buildAssessment();
  var rows = pending.parts.map(function (p, i) { return '<tr><td>' + (i + 1) + '. ' + p.name + '</td><td class="n">' + p.qs.length + ' items</td><td class="n">' + mins(p.time) + '</td></tr>'; }).join('');
  var blurb = type === 'mock'
    ? 'A full-length simulation covering the four areas past takers report on the FEUCAT: English, Mathematics, Science and Mental Ability. Each section has its own time limit. New questions are drawn every time.'
    : 'A quick diagnostic that measures your current level in speed math, vocabulary and grammar, reading comprehension, abstract reasoning, science and problem solving. Take it first, then use the results to decide what to practice.';
  view('<div class="card"><h1>' + pending.title + '</h1><p>' + blurb + '</p>' +
    '<table><tr><th>Section</th><th class="n">Items</th><th class="n">Time</th></tr>' + rows +
    '<tr><td><b>Total</b></td><td class="n"><b>' + total(pending) + ' items</b></td><td class="n"><b>' + mins(totalTime(pending)) + '</b></td></tr></table>' +
    '<label class="opt"><input type="checkbox" id="instant" checked><span><b>Show the correct answer and explanation after each question</b><br><span class="muted small">The timer pauses while you read the explanation. Untick this for real exam conditions — you will still get every answer and explanation at the end.</span></span></label>' +
    '<div class="row"><button class="btn" data-act="begin">Start</button><button class="btn alt" data-act="home">Back</button></div></div>');
}
function begin(sess, instant) {
  S = sess; S.instant = instant; S.pi = 0;
  S.parts.forEach(function (p) { p.items = p.qs.map(function (q) { return { q: q, order: shuffle(q.c.map(function (_, i) { return i; })), chosen: null, locked: false, time: 0 }; }); });
  if (S.parts.length === 1 && !S.parts[0].time) startPart(); else partIntro();
}
function partIntro() {
  var p = S.parts[S.pi];
  view('<div class="card"><div class="tag">Section ' + (S.pi + 1) + ' of ' + S.parts.length + '</div><h1>' + p.name + '</h1>' +
    '<p><b>' + p.items.length + ' items</b>' + (p.time ? ' · <b>' + mins(p.time) + '</b>' : '') + '</p>' + (p.note ? '<p class="muted">' + p.note + '</p>' : '') +
    '<p class="muted small">The timer starts when you press the button.</p><button class="btn" data-act="startPart">Start section</button></div>');
}
function startPart() {
  var p = S.parts[S.pi];
  S.qi = 0; S.remaining = p.time; S.paused = false;
  stopTimer();
  if (p.time) timer = setInterval(tick, 1000);
  renderQ(true);
}
function tick() {
  if (!S || S.paused) return;
  S.remaining--;
  var el = document.getElementById('timer');
  if (el) { el.textContent = fmt(S.remaining); el.classList.toggle('low', S.remaining <= 60); }
  if (S.remaining <= 0) endPart();
}
function choiceHtml(it, reveal, clickable) {
  return '<div class="choices">' + it.order.map(function (oi, k) {
    var cls = reveal ? (oi === 0 ? ' ok' : (oi === it.chosen ? ' bad' : '')) : (oi === it.chosen ? ' sel' : '');
    return '<button class="ch' + cls + '"' + (clickable ? ' data-act="choose" data-arg="' + k + '"' : ' disabled') + '><span class="lt">' + LETTERS[k] + '</span><span>' + it.q.c[oi] + '</span></button>';
  }).join('') + '</div>';
}
function feedbackHtml(it) {
  var ok = it.chosen === 0, letter = LETTERS[it.order.indexOf(0)];
  return '<div class="feedback' + (ok ? '' : ' wrong') + '" id="fb"><b>' + (ok ? '✓ Correct!' : (it.chosen === null ? 'No answer.' : '✗ Not quite.')) + '</b> The correct answer is <b>' + letter + '</b>.<p>' + it.q.exp + '</p></div>';
}
function renderQ(fresh) {
  var p = S.parts[S.pi], it = p.items[S.qi], q = it.q, last = S.qi === p.items.length - 1, reveal = S.instant && it.locked;
  var html = '<div class="qbar"><div><b>' + p.name + '</b><span>Question ' + (S.qi + 1) + ' of ' + p.items.length + '</span></div>' +
    (p.time ? '<div id="timer" class="timer' + (S.remaining <= 60 ? ' low' : '') + '">' + fmt(S.remaining) + '</div>' : '') +
    '<button class="link" data-act="quit">Quit</button></div><div class="prog"><i style="width:' + (S.qi / p.items.length * 100) + '%"></i></div>';
  if (q.p) html += '<div class="card passage"><h3>' + PASSAGES[q.p].title + '</h3>' + PASSAGES[q.p].text + '</div>';
  html += '<div class="card"><div class="tag">' + TOPIC[q.topic] + '</div><div class="qt">' + q.q + '</div>' + choiceHtml(it, reveal, !it.locked);
  if (reveal) html += feedbackHtml(it);
  if (reveal || !S.instant) html += '<div class="navrow"><button class="btn" data-act="next" id="nextBtn">' + (last ? (S.pi === S.parts.length - 1 ? 'Finish' : 'Finish section') : (!S.instant && it.chosen === null ? 'Skip' : 'Next')) + ' →</button></div>';
  html += '</div>';
  if (fresh) { view(html); S.qStart = Date.now(); }
  else { var pas = app.querySelector('.passage'), st = pas ? pas.scrollTop : 0; app.innerHTML = html; pas = app.querySelector('.passage'); if (pas) pas.scrollTop = st; }
}
function choose(k) {
  if (!S) return;
  var it = S.parts[S.pi].items[S.qi];
  if (it.locked || k >= it.order.length) return;
  it.chosen = it.order[k];
  if (S.instant) { it.locked = true; it.time += Date.now() - S.qStart; S.paused = true; }
  renderQ(false);
  if (S.instant) celebrate(it);
  var fb =document.getElementById('fb'); if (fb && fb.scrollIntoView) fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function next() {
  if (!S) return;
  var p = S.parts[S.pi], it = p.items[S.qi];
  if (!it.locked) { it.locked = true; it.time += Date.now() - S.qStart; }
  S.paused = false;
  if (S.qi + 1 < p.items.length) { S.qi++; renderQ(true); } else endPart();
}
function endPart() {
  stopTimer();
  S.parts[S.pi].items.forEach(function (it) { it.locked = true; });
  if (S.pi + 1 < S.parts.length) { S.pi++; partIntro(); } else finish();
}
function finish() {
  var at = { id: Date.now(), type: S.type, title: S.title, date: new Date().toISOString(), correct: 0, total: 0, secs: 0, instant: S.instant, parts: [], topics: {} };
  S.parts.forEach(function (p) {
    var pc = 0;
    p.items.forEach(function (it) {
      var ok = it.chosen === 0, t = at.topics[it.q.topic] = at.topics[it.q.topic] || { c: 0, t: 0 };
      t.t++; if (ok) { t.c++; pc++; }
      at.secs += it.time;
      if (it.q.id) { if (ok) delete store.missed[it.q.id]; else store.missed[it.q.id] = (store.missed[it.q.id] || 0) + 1; }
    });
    at.parts.push({ name: p.name, c: pc, t: p.items.length });
    at.correct += pc; at.total += p.items.length;
  });
  at.secs = Math.round(at.secs / 1000);
  store.attempts.push(at); save();
  var sess = S; S = null;
  results(at, sess);
}

/* ---------- results ---------- */
function verdict(p) {
  if (p >= 85) return ['Excellent', 'You are in very good shape. Keep sharp with one timed set a day and review any misses.'];
  if (p >= 70) return ['On track', 'Solid foundation. Focus your remaining time on the weakest topics listed below.'];
  if (p >= 50) return ['Needs work', 'You know a fair amount, but there are clear gaps. Practice the weak topics daily, then retake.'];
  return ['Focus up', 'Start with the weakest topics below and read every explanation carefully. Short daily sessions add up fast.'];
}
function bar(label, c, t) {
  var p = pct(c, t);
  return '<div class="bar ' + (p < 50 ? 'lowb' : p < 70 ? 'midb' : '') + '"><div class="lab"><span>' + label + '</span><span>' + c + '/' + t + ' · ' + p + '%</span></div><div class="tr"><i style="width:' + p + '%"></i></div></div>';
}
function breakdown(at) {
  var keys = Object.keys(at.topics).sort(function (a, b) { return pct(at.topics[a].c, at.topics[a].t) - pct(at.topics[b].c, at.topics[b].t); });
  return keys.map(function (k) { return bar(TOPIC[k] || k, at.topics[k].c, at.topics[k].t); }).join('');
}
function snippet(h) { return h.replace(/<svg[\s\S]*?<\/svg>/g, ' ▢ ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 95); }
function results(at, sess) {
  var p = pct(at.correct, at.total), v = verdict(p);
  var weak = Object.keys(at.topics).filter(function (k) { return pct(at.topics[k].c, at.topics[k].t) < 70; })
    .sort(function (a, b) { return pct(at.topics[a].c, at.topics[a].t) - pct(at.topics[b].c, at.topics[b].t); }).slice(0, 4);
  var html = '<div class="card"><div class="tag">' + at.title + ' — result saved</div><div class="score"><div class="ring" style="--p:' + p + '"><div>' + p + '%</div></div><div><h1>' + at.correct + ' / ' + at.total + '</h1><p><b>' + v[0] + '.</b> ' + v[1] + '</p><p class="muted small">Answering time: ' + fmt(at.secs) + (at.total ? ' · about ' + Math.round(at.secs / at.total) + ' s per item' : '') + '</p></div></div></div>';
  if (at.parts.length > 1) html += '<div class="card"><h2>By section</h2>' + at.parts.map(function (x) { return bar(x.name, x.c, x.t); }).join('') + '</div>';
  html += '<div class="card"><h2>By topic (weakest first)</h2>' + breakdown(at) +
    (weak.length ? '<p class="small muted" style="margin-top:12px">Practice your weakest topics:</p><div class="row">' + weak.map(function (k) { return '<button class="btn sm alt" data-act="prac" data-arg="' + k + '">' + TOPIC[k] + '</button>'; }).join('') + '</div>' : '') + '</div>';
  if (sess) {
    html += '<div class="card"><h2>Review every question</h2><p class="muted small">Tap a question to see the correct answer and the explanation.</p>';
    sess.parts.forEach(function (part) {
      if (sess.parts.length > 1) html += '<h3 style="margin-top:14px">' + part.name + '</h3>';
      part.items.forEach(function (it, i) {
        var ok = it.chosen === 0;
        html += '<details class="rv' + (ok ? '' : ' bad') + '"><summary><span class="mk">' + (ok ? '✓' : '✗') + '</span><span>' + (i + 1) + '. ' + snippet(it.q.q) + '</span></summary><div>' +
          (it.q.p ? '<p class="muted small">Passage: ' + PASSAGES[it.q.p].title + '</p>' : '') + '<div class="qt">' + it.q.q + '</div>' + choiceHtml(it, true, false) + feedbackHtml(it).replace(' id="fb"', '') + '</div></details>';
      });
    });
    html += '</div>';
  }
  html += '<div class="row"><button class="btn" data-act="home">Home</button><button class="btn alt" data-act="history">See my progress</button></div>';
  view(html);
}

/* ---------- home & other screens ---------- */
function ofType(t) { return store.attempts.filter(function (a) { return a.type === t; }); }
function lastPill(t) {
  var a = ofType(t); if (!a.length) return '<span class="pill gray">Not taken yet</span>';
  var l = a[a.length - 1]; return '<span class="pill">Last: ' + pct(l.correct, l.total) + '%</span> <span class="pill gray">Best: ' + Math.max.apply(null, a.map(function (x) { return pct(x.correct, x.total); })) + '%</span>';
}
function home() {
  S = null; stopTimer();
  var nm = Object.keys(store.missed).length;
  view('<div class="card hero"><h1>' + (store.name ? 'Kaya mo ’yan, ' + esc(store.name) + '!' : 'FEUCAT Reviewer') + '</h1><p>Practice for the FEU College Admission Test: English, Math, Science and Mental Ability. Every question shows the correct answer and why.</p>' +
    '<input id="name" placeholder="Type your name" maxlength="30" value="' + esc(store.name) + '" aria-label="Your name"></div>' +
    '<div class="grid">' +
    '<button class="tile" data-act="assessment"><b>1. Assessment Test</b><span class="muted">Find your level: speed math, reading, abstract reasoning and more. About 45 minutes.</span><br>' + lastPill('assessment') + '</button>' +
    '<button class="tile" data-act="mock"><b>2. Mock Exam</b><span class="muted">Full timed simulation, about 100 items in 95 minutes. New questions each time.</span><br>' + lastPill('mock') + '</button>' +
    '<button class="tile" data-act="practice"><b>3. Practice by Topic</b><span class="muted">Untimed drills with instant explanations. Pick the topic you need.</span></button>' +
    '<button class="tile" data-act="mistakes"><b>4. Retry My Mistakes</b><span class="muted">Questions you got wrong come back until you get them right.</span><br><span class="pill ' + (nm ? '' : 'gray') + '">' + nm + ' to review</span></button>' +
    '</div><div class="row"><button class="btn alt" data-act="history">My progress</button><button class="btn alt" data-act="tips">Exam tips &amp; study plan</button></div>');
}
function practiceMenu() {
  var groups = [['english', ['grammar', 'vocab', 'reading']], ['math', ['speed', 'arithmetic', 'algebra', 'geometry', 'trig', 'stats']], ['science', ['bio', 'chem', 'physics', 'earth']], ['reasoning', ['figure', 'series', 'verbal']]];
  view('<div class="card"><h1>Practice by Topic</h1><p class="muted">Untimed. The answer and explanation appear right after each question.</p></div>' +
    groups.map(function (g) {
      return '<div class="card"><h2>' + SEC[g[0]] + '</h2><div class="row">' + g[1].map(function (t) { return '<button class="btn sm alt" data-act="prac" data-arg="' + t + '">' + TOPIC[t] + '</button>'; }).join('') +
        '<button class="btn sm" data-act="prac" data-arg="' + g[0] + '">Mixed ' + SEC[g[0]] + '</button></div></div>';
    }).join('') + '<button class="btn alt" data-act="home">Back</button>');
}
function mistakes() {
  var ids = Object.keys(store.missed), qs = sample(BANK.filter(function (q) { return ids.indexOf(q.id) >= 0; }), 15);
  if (!qs.length) { view('<div class="card"><h1>Nothing to review</h1><p>You have no missed questions saved. Take the Assessment Test or a Mock Exam first.</p><button class="btn" data-act="home">Home</button></div>'); return; }
  qs.sort(function (a, b) { return (a.p || '') < (b.p || '') ? -1 : (a.p || '') > (b.p || '') ? 1 : 0; });
  begin({ type: 'practice', title: 'Retry My Mistakes', parts: [{ name: 'Retry My Mistakes', time: 0, qs: qs }] }, true);
}
function chart(list) {
  if (list.length < 2) return '';
  var W = 320, H = 130, pad = 22, n = list.length;
  var pts = list.map(function (a, i) { return [pad + i * (W - 2 * pad) / (n - 1), H - pad - pct(a.correct, a.total) / 100 * (H - 2 * pad), a]; });
  return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Score trend">' +
    [0, 50, 100].map(function (v) { var y = H - pad - v / 100 * (H - 2 * pad); return '<line x1="' + pad + '" x2="' + (W - pad) + '" y1="' + y + '" y2="' + y + '" stroke="currentColor" opacity=".15"/><text x="2" y="' + (y + 4) + '" font-size="9" fill="currentColor" opacity=".6">' + v + '</text>'; }).join('') +
    '<polyline fill="none" stroke="#0f8a4b" stroke-width="2" points="' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '"/>' +
    pts.map(function (p) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4" fill="' + (p[2].type === 'mock' ? '#f2b705' : '#0f8a4b') + '"/>'; }).join('') + '</svg>' +
    '<p class="small muted">Green = Assessment Test · Gold = Mock Exam (oldest to newest)</p>';
}
function history() {
  S = null; stopTimer();
  var all = store.attempts, main = all.filter(function (a) { return a.type !== 'practice'; }), mocks = ofType('mock'), ass = ofType('assessment');
  var best = function (l) { return l.length ? Math.max.apply(null, l.map(function (x) { return pct(x.correct, x.total); })) + '%' : '–'; };
  var html = '<div class="card"><h1>My Progress</h1><p class="muted">Saved on this device and browser only. Use Export to keep a backup or move scores to another device.</p></div>' +
    '<div class="stats"><div class="stat"><b>' + best(ass) + '</b><span>Best assessment</span></div><div class="stat"><b>' + best(mocks) + '</b><span>Best mock exam</span></div><div class="stat"><b>' + all.length + '</b><span>Total sessions</span></div></div>';
  if (main.length >= 2) html += '<div class="card"><h2>Score trend</h2>' + chart(main) + '</div>';
  html += '<div class="card"><h2>All sessions</h2>';
  if (!all.length) html += '<p class="muted">No scores yet. Take the Assessment Test to get started.</p>';
  all.slice().reverse().forEach(function (a) {
    var d = new Date(a.date);
    html += '<details class="rv"><summary><span class="mk" style="color:inherit">' + pct(a.correct, a.total) + '%</span><span>' + esc(a.title) + ' — ' + a.correct + '/' + a.total + '<br><span class="muted small">' + d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + fmt(a.secs) + '</span></span></summary><div>' +
      (a.parts.length > 1 ? a.parts.map(function (x) { return bar(x.name, x.c, x.t); }).join('') + '<hr style="border:0;border-top:1px solid var(--line)">' : '') + breakdown(a) + '</div></details>';
  });
  html += '</div><div class="card"><h2>Backup</h2><div class="row"><button class="btn sm alt" data-act="exportData">Export scores</button><button class="btn sm alt" data-act="importData">Import scores</button><button class="btn sm danger" data-act="resetData">Erase all scores</button></div><input type="file" id="file" accept="application/json,.json" hidden></div>' +
    '<button class="btn alt" data-act="home">Back</button>';
  view(html);
}
function tips() {
  S = null; stopTimer();
  view('<div class="card"><h1>Exam Tips &amp; Study Plan</h1><h3>What is known about the FEUCAT</h3><ul class="tight">' +
    '<li>FEU does <b>not</b> publish the exact sections, number of items, time limit or passing score. Anything online claiming exact figures is a guess.</li>' +
    '<li>Past takers describe a <b>multiple-choice aptitude test</b> covering <b>English, Mathematics, Science and mental ability</b> (abstract/logical reasoning). This reviewer is built around those four areas, using the usual high-school scope also seen in tests like the UPCAT and USTET.</li>' +
    '<li>You book your slot in FEU’s admissions portal; past announcements asked examinees to bring a valid ID (school ID preferred) and two pencils. Results are reported about two weeks after the test. Always follow the instructions on your own test permit.</li></ul>' +
    '<h3>One-week plan</h3><ul class="tight">' +
    '<li><b>Day 1:</b> Take the Assessment Test. Note your two weakest topics.</li>' +
    '<li><b>Days 2–3:</b> Practice by Topic on the weakest areas (2–3 sets each). Do one Speed Math set daily.</li>' +
    '<li><b>Day 4:</b> First Mock Exam under real conditions (answers hidden until the end).</li>' +
    '<li><b>Day 5:</b> Retry My Mistakes, then drill Abstract Figures and Series — the least familiar part for most students.</li>' +
    '<li><b>Day 6:</b> Second Mock Exam. Compare with Day 4 in My Progress.</li>' +
    '<li><b>Day 7:</b> Light review only. Prepare ID, pencils, permit. Sleep early.</li></ul>' +
    '<h3>During the test</h3><ul class="tight">' +
    '<li>Don’t get stuck. If an item takes more than a minute, make your best guess, mark it, and move on.</li>' +
    '<li>Answer every item unless the instructions say wrong answers are penalized.</li>' +
    '<li>Reading: skim the questions first, then read the passage looking for those answers.</li>' +
    '<li>Math: estimate first to eliminate choices; plug the choices back into the problem when solving is slow.</li>' +
    '<li>Figures: check one thing at a time — rotation, count, shading, position.</li>' +
    '<li>Series: look at the differences between terms; if they are irregular, check for two alternating series or multiplication.</li></ul>' +
    '<p class="small muted">Research sources: <a href="https://supertutor.ph/resources/blog/entrance-exams/feucat-overview/" target="_blank" rel="noopener">Super Tutor FEU-CAT overview</a>, <a href="https://thepost.net.ph/?p=60628" target="_blank" rel="noopener">The POST</a>, <a href="https://new.feuadvocate.net/feu-administers-october-feucat-offers-multiple-test-dates/" target="_blank" rel="noopener">FEU Advocate</a>. Questions in this app are original practice items, not actual exam questions.</p>' +
    '<button class="btn alt" data-act="home">Back</button></div>');
}

/* ---------- events ---------- */
var acts = {
  home: home, history: history, tips: tips, practice: practiceMenu, mistakes: mistakes,
  assessment: function () { intro('assessment'); }, mock: function () { intro('mock'); },
  begin: function () { begin(pending, document.getElementById('instant').checked); },
  startPart: startPart, next: next,
  choose: function (k) { choose(+k); },
  prac: function (t) { begin(buildPractice(t, 10), true); },
  quit: function () { if (confirm('Quit this session? Your progress in it will not be saved.')) home(); },
  exportData: function () {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(store, null, 1)], { type: 'application/json' }));
    a.download = 'feucat-reviewer-scores.json'; document.body.appendChild(a); a.click(); a.remove();
  },
  importData: function () { document.getElementById('file').click(); },
  resetData: function () { if (confirm('Erase ALL saved scores on this device? This cannot be undone.')) { store = blank(); save(); history(); } }
};
var GUARDED = { home: 1, history: 1, tips: 1 };
document.addEventListener('click', function (e) {
  var b = e.target.closest ? e.target.closest('[data-act]') : null;
  if (!b || !acts[b.dataset.act]) return;
  if (S && GUARDED[b.dataset.act] && !confirm('Leave this session? Your progress in it will not be saved.')) return;
  acts[b.dataset.act](b.dataset.arg);
});
document.addEventListener('change', function (e) {
  if (e.target.id === 'name') { store.name = e.target.value.trim(); save(); home(); }
  if (e.target.id === 'file' && e.target.files[0]) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var d = JSON.parse(r.result); if (!d || !Array.isArray(d.attempts)) throw 0;
        var seen = {}; store.attempts.forEach(function (a) { seen[a.id] = 1; });
        d.attempts.forEach(function (a) { if (a && a.id && !seen[a.id] && a.parts && a.topics) store.attempts.push(a); });
        store.attempts.sort(function (a, b) { return a.id - b.id; });
        if (!store.name && typeof d.name === 'string') store.name = d.name.slice(0, 30);
        save(); history();
      } catch (err) { alert('That file is not a valid score backup.'); }
    };
    r.readAsText(e.target.files[0]);
  }
});
document.addEventListener('keydown', function (e) {
  if (!S || !document.querySelector('.choices') || e.target.tagName === 'INPUT') return;
  var k = e.key.toLowerCase(), i = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
  if (k.length === 1 && i >= 0) choose(i);
  else if (e.key === 'Enter' && document.getElementById('nextBtn')) { e.preventDefault(); next(); }
});
window.addEventListener('beforeunload', function (e) { if (S) { e.preventDefault(); e.returnValue = ''; } });

home();
})();
