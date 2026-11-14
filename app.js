(function () {
'use strict';

/* ---------- basics ---------- */
var app = document.getElementById('app');
var KEY = 'tamprep.v1';
var LETTERS = 'ABCD';
var SEC = { english: 'English', math: 'Mathematics', science: 'Science', reasoning: 'Mental Ability' };
var TOPIC = {
  grammar: 'Grammar & Usage', vocab: 'Vocabulary', reading: 'Reading Comprehension',
  speed: 'Speed Math', arithmetic: 'Number Sense', algebra: 'Algebra', geometry: 'Geometry', trig: 'Trigonometry', stats: 'Statistics & Probability', seq: 'Arithmetic & Geometric Sequences',
  bio: 'Biology', chem: 'Chemistry', physics: 'Physics', earth: 'Earth & Space',
  verbal: 'Analogies & Logic', series: 'Number & Letter Series', figure: 'Abstract Figures', coded: 'Letter & Number Analogies'
};
var TOPIC_SEC = {};
['grammar', 'vocab', 'reading'].forEach(function (t) { TOPIC_SEC[t] = 'english'; });
['speed', 'arithmetic', 'algebra', 'geometry', 'trig', 'stats', 'seq'].forEach(function (t) { TOPIC_SEC[t] = 'math'; });
['bio', 'chem', 'physics', 'earth'].forEach(function (t) { TOPIC_SEC[t] = 'science'; });
['verbal', 'series', 'figure', 'coded'].forEach(function (t) { TOPIC_SEC[t] = 'reasoning'; });
var LVNAME = ['', 'Easy', 'Mixed', 'Real exam'];
var LVDESC = ['', 'The original practice set: straightforward items to build the basics.', 'A blend of easy items and real-exam-level items.', 'Harder items modeled on real FEUCAT-style reviewers: multi-step math, two-rule figures, coded analogies.'];

function rnd(n) { return Math.floor(Math.random() * n); }
function pick(a) { return a[rnd(a.length)]; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function sample(a, n) { return shuffle(a).slice(0, n); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function fmt(s) { s = Math.max(0, s); var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
function pct(c, t) { return t ? Math.round(c / t * 100) : 0; }
function mins(s) { return s % 60 === 0 ? (s / 60) + ' min' : fmt(s); }
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
function neg(n) { if (typeof n !== 'number') return String(n); n = Math.round(n * 1000) / 1000; return n < 0 ? '−' + (-n) : String(n); }
function sgn(n) { return n < 0 ? ' − ' + (-n) : ' + ' + n; }

/* ---------- storage ---------- */
var DEF = { level: 1, qtimer: true, debt: false, paceMin: 120, paceItems: 150, bg: 100 };
function blank() { return { name: '', attempts: [], missed: {}, settings: Object.assign({}, DEF) }; }
function load() {
  try {
    var d = JSON.parse(localStorage.getItem(KEY));
    if (d && Array.isArray(d.attempts)) { var o = Object.assign(blank(), d); o.settings = Object.assign({}, DEF, d.settings || {}); return o; }
  } catch (e) {}
  return blank();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
var store = load();
function lv() { return store.settings.level; }
function hardNow(L) { L = L || lv(); return L === 3 || (L === 2 && rnd(2) === 1); }
function applyBg() { document.documentElement.style.setProperty('--bgk', (store.settings.bg / 100).toFixed(2)); }
applyBg();

/* ---------- generated questions ---------- */
function numOpts(ans, offs, allowNeg) {
  var out = [], cand = shuffle(offs || [1, -1, 2, -2, 10, -10, 3, -3, 5, -5]);
  for (var i = 0; i < cand.length && out.length < 3; i++) { var v = Math.round((ans + cand[i]) * 1000) / 1000; if (v !== ans && (allowNeg || v >= 0) && out.indexOf(v) < 0) out.push(v); }
  for (var k = 4; out.length < 3; k++) if (out.indexOf(ans + k) < 0) out.push(ans + k);
  return [ans].concat(out).map(neg);
}
// choices(answer, [distractor candidates], numericAnswerForFill?) -> 4 distinct strings, correct first
function choices(ans, cands, n) {
  var out = [neg(ans)];
  for (var i = 0; i < cands.length && out.length < 4; i++) { var c = neg(cands[i]); if (out.indexOf(c) < 0) out.push(c); }
  if (typeof n === 'number') for (var k = 1; out.length < 4 && k < 50; k++) [n + k, n - k].forEach(function (v) { var s = neg(v); if (out.length < 4 && out.indexOf(s) < 0) out.push(s); });
  // fallback for string answers such as "₱24" or "25%": vary the first number inside the answer
  var m = out[0].indexOf('<svg') < 0 && out[0].match(/−?\d+(\.\d+)?/);
  if (m) {
    var base = parseFloat(m[0].replace('−', '-')), step = Math.max(1, Math.round(Math.abs(base) * 0.1));
    for (var j = 1; out.length < 4 && j < 40; j++) [base + j * step, base - j * step].forEach(function (v) {
      if (out.length >= 4 || v < 0 && base >= 0) return;
      var s = out[0].replace(m[0], neg(v)); if (out.indexOf(s) < 0) out.push(s);
    });
  }
  return out;
}
function G(sec, topic, q, c, exp) {
  if (new Set(c).size !== c.length || c.length !== 4) c = choices(c[0], c.slice(1)).slice(0, 4);
  return { id: null, sec: sec, topic: topic, q: q, c: c, exp: exp, p: null };
}
function genSet(fn, n, L) {
  var out = [], seen = {};
  for (var t = 0; out.length < n && t < n * 10; t++) { var q = fn(L || lv()); if (!q || seen[q.q]) continue; seen[q.q] = 1; out.push(q); }
  return out;
}

function speedQ(t, L) {
  var a, b, c, d, x, ans, n, h = hardNow(L);
  switch (t) {
    case 0:
      a = h ? rnd(9000) + 1000 : rnd(400) + 100; b = h ? rnd(900) + 100 : rnd(400) + 100; ans = a + b;
      return G('math', 'speed', a + ' + ' + b + ' = ?', numOpts(ans, [10, -10, 100, -100, 1, -1, 20, 1000]), 'Add place by place (thousands, hundreds, tens, ones): ' + a + ' + ' + b + ' = ' + ans + '.');
    case 1:
      a = h ? rnd(8000) + 2000 : rnd(500) + 300; b = h ? rnd(1500) + 150 : rnd(250) + 50; ans = a - b;
      return G('math', 'speed', a + ' − ' + b + ' = ?', numOpts(ans, [10, -10, 100, -100, 1, -1, 20]), a + ' − ' + b + ' = ' + ans + '. Check by adding back: ' + ans + ' + ' + b + ' = ' + a + '.');
    case 2:
      if (h) { a = rnd(40) + 12; b = rnd(14) + 11; } else { a = rnd(18) + 12; b = rnd(8) + 2; }
      ans = a * b; x = Math.floor(a / 10) * 10;
      return G('math', 'speed', a + ' × ' + b + ' = ?', numOpts(ans, [b, -b, 10, -10, 2, -2, a, -a]), 'Split it: (' + x + ' × ' + b + ') + (' + (a - x) + ' × ' + b + ') = ' + (x * b) + ' + ' + ((a - x) * b) + ' = ' + ans + '.');
    case 3:
      b = h ? rnd(14) + 11 : rnd(10) + 3; x = h ? rnd(40) + 12 : rnd(20) + 5; a = b * x;
      return G('math', 'speed', a + ' ÷ ' + b + ' = ?', numOpts(x, [1, -1, 2, -2, 3, -3]), b + ' × ' + x + ' = ' + a + ', so ' + a + ' ÷ ' + b + ' = ' + x + '.');
    case 4:
      if (h) { a = pick([15, 35, 45, 65, 85, 120, 150, 175]); n = (rnd(15) + 2) * 20; } else { a = pick([5, 10, 20, 25, 40, 50, 75]); n = (rnd(20) + 2) * 20; }
      ans = a * n / 100;
      return G('math', 'speed', 'What is ' + a + '% of ' + n + '?', numOpts(ans, [5, -5, 10, -10, 2, -2, 20]), a + '% means ' + a + '/100. ' + n + ' × ' + a + ' ÷ 100 = ' + ans + (h ? '. Shortcut: 10% of ' + n + ' is ' + (n / 10) + ', 5% is ' + (n / 20) + ' — build ' + a + '% from those pieces.' : '.'));
    case 5:
      c = h ? pick([[5, 12], [7, 8], [4, 9], [11, 15], [5, 7], [7, 16]]) : pick([[3, 4], [2, 3], [3, 5], [5, 8], [2, 5], [5, 6]]);
      n = c[1] * (rnd(10) + (h ? 5 : 3)); ans = n / c[1] * c[0];
      return G('math', 'speed', 'What is ' + c[0] + '/' + c[1] + ' of ' + n + '?', numOpts(ans, [c[0], -c[0], 1, -1, c[1], -c[1], 2]), 'Divide by the denominator, then multiply by the numerator: ' + n + ' ÷ ' + c[1] + ' = ' + (n / c[1]) + ', and ' + (n / c[1]) + ' × ' + c[0] + ' = ' + ans + '.');
    case 6:
      if (h) {
        x = rnd(21) - 10; if (!x) x = 7; a = rnd(5) + 4; b = rnd(a - 1) + 1; c = rnd(20) + 1; d = (a - b) * x + c;
        return G('math', 'speed', 'If ' + a + '<i>x</i>' + sgn(c) + ' = ' + (b === 1 ? '' : b) + '<i>x</i>' + sgn(d) + ', what is <i>x</i>?', numOpts(x, [1, -1, 2, -2, 3, -2 * x], true),
          'Move the <i>x</i> terms to one side: ' + (a - b) + '<i>x</i>' + sgn(c) + ' = ' + neg(d) + '. Subtract ' + c + ': ' + (a - b) + '<i>x</i> = ' + neg(d - c) + '. Divide by ' + (a - b) + ': <i>x</i> = ' + neg(x) + '.');
      }
      x = rnd(12) + 2; a = rnd(7) + 2; b = rnd(20) + 1; c = a * x + b;
      return G('math', 'speed', 'If ' + a + '<i>x</i> + ' + b + ' = ' + c + ', what is <i>x</i>?', numOpts(x, [1, -1, 2, -2, 3]), 'Subtract ' + b + ' from both sides: ' + a + '<i>x</i> = ' + (c - b) + '. Divide by ' + a + ': <i>x</i> = ' + x + '.');
    case 7:
      if (h && rnd(3) === 0) { n = rnd(8) + 5; ans = n * n * n; return G('math', 'speed', n + '³ = ?', numOpts(ans, [n * n, -n * n, 2 * n, 10, -10]), n + ' × ' + n + ' × ' + n + ' = ' + (n * n) + ' × ' + n + ' = ' + ans + '. Memorize the cubes up to 12³ = 1,728.'); }
      n = h ? rnd(15) + 21 : rnd(14) + 11; ans = n * n;
      if (rnd(2)) return G('math', 'speed', n + '² = ?', numOpts(ans, [n, -n, 10, -10, 20, -20]), n + ' × ' + n + ' = ' + ans + '. ' + (h ? 'Trick: (' + (n - n % 10) + ' + ' + (n % 10) + ')² = ' + ((n - n % 10) * (n - n % 10)) + ' + 2·' + (n - n % 10) + '·' + (n % 10) + ' + ' + ((n % 10) * (n % 10)) + '.' : 'It helps to memorize the squares from 11 to 25.'));
      return G('math', 'speed', '√' + ans + ' = ?', numOpts(n, [1, -1, 2, -2, 3]), n + ' × ' + n + ' = ' + ans + ', so √' + ans + ' = ' + n + '.');
    case 8:
      if (h) {
        a = rnd(8) + 2; b = rnd(9) + 2; c = rnd(9) + 2; d = rnd(7) + 2; ans = a * (b + c) - d * d;
        return G('math', 'speed', a + ' × (' + b + ' + ' + c + ') − ' + d + '² = ?', choices(ans, [a * b + c - d * d, a * (b + c) - 2 * d, a * (b + c) + d * d], ans),
          'Parentheses first: ' + b + ' + ' + c + ' = ' + (b + c) + '. Exponent: ' + d + '² = ' + (d * d) + '. Multiply: ' + a + ' × ' + (b + c) + ' = ' + (a * (b + c)) + '. Subtract: ' + (a * (b + c)) + ' − ' + (d * d) + ' = ' + neg(ans) + '.');
      }
      a = rnd(20) + 5; b = rnd(8) + 2; c = rnd(8) + 2; ans = a + b * c;
      return G('math', 'speed', a + ' + ' + b + ' × ' + c + ' = ?', choices(ans, [(a + b) * c, ans + b, ans - c], ans), 'Multiply before adding (PEMDAS): ' + b + ' × ' + c + ' = ' + (b * c) + ', then ' + a + ' + ' + (b * c) + ' = ' + ans + '. Adding first gives the common wrong answer ' + ((a + b) * c) + '.');
    default:
      n = rnd(30) + 20;
      if (h) { a = rnd(9) + 1; b = rnd(9) + 1; c = rnd(9) + 1; d = rnd(9) + 1; x = [n - a, n + b, n - c, n + d, n + a + c - b - d]; }
      else { a = rnd(9) + 1; b = rnd(9) + 1; x = [n - a, n + a + b, n - b]; }
      return G('math', 'speed', 'What is the average of ' + x.join(', ') + '?', numOpts(n, [1, -1, 2, -2, 3, -3]), 'Sum = ' + (x.length * n) + '. Divide by ' + x.length + ' numbers: ' + (x.length * n) + ' ÷ ' + x.length + ' = ' + n + '.');
  }
}
function speedSet(n) { var types = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).concat(shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])), out = []; for (var i = 0; i < n; i++) out.push(speedQ(types[i % 20])); return out; }

/* number series */
function seriesQ(s, exp, hide) {
  var i = hide == null ? s.length - 1 : hide, ans = s[i], last = i === s.length - 1;
  var sp = Math.max(3, Math.round(Math.abs(ans) * 0.1));
  var shown = s.map(function (v, k) { return k === i ? '?' : neg(v); });
  return G('reasoning', 'series', (last ? 'What number comes next?' : 'What number replaces the ?') + '<br><b>' + shown.join(', ') + '</b>', numOpts(ans, [1, -1, 2, -2, sp, -sp, 2 * sp], true), exp + ' Answer: ' + neg(ans) + '.');
}
function diffs(s) { var d = []; for (var i = 1; i < s.length; i++) d.push(s[i] - s[i - 1]); return d; }
function numSeriesEasy() {
  var t = rnd(7), s = [], a, d, i, exp;
  if (t === 0) { d = pick([3, 4, 6, 7, 8, 9, -3, -4, -6]); a = rnd(20) + 1 + (d < 0 ? 60 : 0); for (i = 0; i < 6; i++) s.push(a + d * i); exp = 'Each term ' + (d > 0 ? 'adds ' : 'subtracts ') + Math.abs(d) + '.'; }
  else if (t === 1) { a = pick([1, 2, 3, 5]); d = pick([2, 3]); for (i = 0; i < 6; i++) s.push(a * Math.pow(d, i)); exp = 'Each term is multiplied by ' + d + '.'; }
  else if (t === 2) { a = rnd(9) + 1; d = pick([1, 2, 3]); s = [a]; for (i = 1; i < 6; i++) s.push(s[i - 1] + d * i); exp = 'The gaps keep growing: +' + d + ', +' + 2 * d + ', +' + 3 * d + ', +' + 4 * d + '… so the next gap is +' + 5 * d + '.'; }
  else if (t === 3) { a = rnd(6) + 1; for (i = 0; i < 6; i++) s.push((a + i) * (a + i)); exp = 'These are perfect squares: ' + a + '², ' + (a + 1) + '², ' + (a + 2) + '²… The next is ' + (a + 5) + '².'; }
  else if (t === 4) { a = rnd(10) + 1; var b = rnd(10) + 30, d1 = pick([2, 3, 4]), d2 = pick([-2, -3, 5]); for (i = 0; i < 4; i++) { s.push(a + d1 * i); s.push(b + d2 * i); } s = s.slice(0, 7); exp = 'Two series alternate. The 1st, 3rd, 5th… terms go ' + (d1 > 0 ? '+' : '') + d1 + '; the 2nd, 4th, 6th… terms go ' + (d2 > 0 ? '+' : '') + d2 + '. The missing term belongs to the first series.'; }
  else if (t === 5) { s = [rnd(4) + 1]; for (i = 1; i < 6; i++) s.push(s[i - 1] * 2 + 1); exp = 'Each term is double the previous term plus 1.'; }
  else { a = rnd(4) + 1; s = [a, a + rnd(3) + 1]; for (i = 2; i < 7; i++) s.push(s[i - 1] + s[i - 2]); exp = 'Each term is the sum of the two terms before it.'; }
  return seriesQ(s, exp);
}
var PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61];
function digitSum(n) { return String(Math.abs(n)).split('').reduce(function (s, c) { return s + (+c); }, 0); }
function numSeriesHard() {
  var t = rnd(12), s = [], a, b, c, d, r, i, exp, hide = null;
  switch (t) {
    case 0: a = rnd(10) + 1; d = pick([1, 2, 3]); r = pick([2, 3]); s = [a]; for (i = 1; i < 6; i++) s.push(s[i - 1] + d * Math.pow(r, i - 1));
      exp = 'Look at the differences: ' + diffs(s).join(', ') + '. Each difference is ×' + r + ' the one before.'; break;
    case 1: a = rnd(5) + 1; c = pick([2, 3]); d = pick([1, 2, 3, 4, 5]); s = [a]; for (i = 1; i < 7; i++) s.push(i % 2 ? s[i - 1] * c : s[i - 1] + d);
      exp = 'Two operations take turns: ×' + c + ', then +' + d + ', then ×' + c + ', +' + d + '… The next step is ×' + c + '.'; break;
    case 2: a = rnd(4) + 1; c = pick([-1, 1, 2, -2]); for (i = 0; i < 6; i++) s.push(Math.pow(a + i, 3) + c);
      exp = 'Each term is a perfect cube ' + (c > 0 ? 'plus ' + c : 'minus ' + (-c)) + ': ' + a + '³' + sgn(c) + ', ' + (a + 1) + '³' + sgn(c) + '… The next is ' + (a + 5) + '³' + sgn(c) + '.'; break;
    case 3: a = pick([1, 2, 3]); s = [a]; for (i = 1; i < 6; i++) s.push(s[i - 1] * (i + 1));
      exp = 'Multiply by 2, then 3, then 4, then 5… (the multiplier goes up by 1). The next step is ×6.'; break;
    case 4: c = pick([1, 2, 3]); a = rnd(5) + c + 2; s = [a]; for (i = 1; i < 6; i++) s.push(2 * s[i - 1] - c);
      exp = 'Each term is double the previous term minus ' + c + '.'; break;
    case 5: a = rnd(8) + 2; d = pick([3, 4, 5, 7]); b = pick([1, 2, 3]); r = pick([2, 3]); for (i = 0; i < 4; i++) { s.push(a + d * i); s.push(b * Math.pow(r, i)); }
      exp = 'Two series are woven together. Odd positions: +' + d + ' each time (' + [0, 2, 4, 6].map(function (k) { return s[k]; }).join(', ') + '). Even positions: ×' + r + ' each time (' + [1, 3, 5].map(function (k) { return s[k]; }).join(', ') + ', …).'; break;
    case 6: a = rnd(9); s = PRIMES.slice(a, a + 6);
      exp = 'These are consecutive prime numbers (divisible only by 1 and themselves).'; break;
    case 7: s = [rnd(2) + 1, rnd(2) + 1, rnd(3) + 2]; for (i = 3; i < 7; i++) s.push(s[i - 1] + s[i - 2] + s[i - 3]);
      exp = 'Each term is the sum of the three terms before it.'; break;
    case 8: a = pick([1, 2, 3, 5]); r = pick([-2, -3]); for (i = 0; i < 6; i++) s.push(a * Math.pow(r, i));
      exp = 'Each term is multiplied by ' + neg(r) + ', so the signs alternate.'; break;
    case 9: c = pick([[729, 2, 3], [256, 1, 2], [1024, 3, 4], [3125, 2, 5], [4096, 1, 4]]); s = [c[0]]; for (i = 1; i < 6; i++) s.push(s[i - 1] * c[1] / c[2]);
      exp = 'Each term is multiplied by ' + c[1] + '/' + c[2] + ' (a geometric sequence with a fractional ratio).'; break;
    case 10: a = rnd(3) + 1; b = rnd(7) - 3; c = rnd(6); for (i = 1; i <= 6; i++) s.push(a * i * i + b * i + c); hide = rnd(3) + 2;
      exp = 'Differences: ' + diffs(s).join(', ') + '. The differences grow by ' + (2 * a) + ' each time (a constant second difference).'; break;
    default: a = rnd(30) + 10; s = [a]; for (i = 1; i < 6; i++) s.push(s[i - 1] + digitSum(s[i - 1]));
      exp = 'Add the digit sum of each term to itself: e.g. ' + s[1] + ' + (' + String(s[1]).split('').join('+') + ') = ' + s[2] + '.'; break;
  }
  return seriesQ(s, exp, hide);
}
function numSeries(L) { return hardNow(L) ? numSeriesHard() : numSeriesEasy(); }

function A_(i) { return String.fromCharCode(65 + ((i % 26) + 26) % 26); }
function letterSeries(L) {
  var A = A_, i, shown = [], k;
  if (hardNow(L)) {
    var t = rnd(4);
    if (t === 0) {
      var st = rnd(8), pos = [st]; for (i = 1; i < 6; i++) pos.push(pos[i - 1] + i);
      shown = pos.slice(0, 5).map(A); var an = pos[5];
      return G('reasoning', 'series', 'What letter comes next?<br><b>' + shown.join(', ') + ', ?</b>', [A(an), A(an - 1), A(an + 1), A(an - 2)],
        'Convert to positions: ' + pos.slice(0, 5).map(function (p) { return p + 1; }).join(', ') + '. The gaps grow +1, +2, +3, +4, so the next gap is +5 → ' + A(an) + '.');
    }
    if (t === 1) {
      var s1 = rnd(6), s2 = 25 - rnd(4), d1 = pick([2, 3]), d2 = pick([-1, -2]);
      for (i = 0; i < 3; i++) { shown.push(A(s1 + d1 * i)); shown.push(A(s2 + d2 * i)); }
      var nx = A(s1 + d1 * 3);
      return G('reasoning', 'series', 'What letter comes next?<br><b>' + shown.join(', ') + ', ?</b>', [nx, A(s2 + d2 * 3), A(s1 + d1 * 3 + 1), A(s1 + d1 * 3 - 1)],
        'Two series alternate. Odd positions move forward ' + d1 + ' (' + [0, 2, 4].map(function (j) { return shown[j]; }).join(', ') + '); even positions move backward ' + (-d2) + '. The next letter belongs to the first series: ' + nx + '.');
    }
    if (t === 2) {
      k = rnd(5); var dA = pick([2, 3]), dB = pick([-2, -3]);
      var pair = function (j) { return A(k + dA * j) + A(25 + dB * j); };
      for (i = 0; i < 4; i++) shown.push(pair(i));
      return G('reasoning', 'series', 'What comes next?<br><b>' + shown.join(', ') + ', ?</b>', [pair(4), A(k + dA * 4) + A(25 + dB * 4 + 1), A(k + dA * 4 + 1) + A(25 + dB * 4), A(k + dA * 3) + A(25 + dB * 4)],
        'The first letter moves forward ' + dA + ' each time; the second letter moves backward ' + (-dB) + ' starting from Z. Answer: ' + pair(4) + '.');
    }
    k = rnd(3);
    var trip = function (j) { var a0 = k + j, st2 = j + 1; return A(a0) + A(a0 + st2) + A(a0 + 2 * st2); };
    for (i = 0; i < 3; i++) shown.push(trip(i));
    var ans = trip(3), a3 = k + 3;
    return G('reasoning', 'series', 'What comes next?<br><b>' + shown.join(', ') + ', ?</b>', [ans, A(a3) + A(a3 + 3) + A(a3 + 6), A(a3) + A(a3 + 4) + A(a3 + 7), A(a3 + 1) + A(a3 + 5) + A(a3 + 9)],
      'Group by group: the first letter moves forward 1, and inside each group the step grows — +1 in the first group, +2 in the second, +3 in the third — so the fourth group uses +4: ' + ans + '.');
  }
  if (rnd(3) < 2) {
    var d = pick([2, 3, 4, 5, -2, -3]), st0 = d > 0 ? rnd(26 - 4 * d) : 25 - rnd(26 + 4 * d);
    for (i = 0; i < 4; i++) shown.push(A(st0 + d * i));
    var an0 = st0 + 4 * d, wrong = sample([1, -1, 2, -2].map(function (o) { return A(an0 + o); }), 3);
    return G('reasoning', 'series', 'What letter comes next?<br><b>' + shown.join(', ') + ', ?</b>', [A(an0)].concat(wrong), 'The letters move ' + (d > 0 ? 'forward' : 'backward') + ' ' + Math.abs(d) + ' places in the alphabet each time. Tip: convert letters to numbers (A=1, B=2…). Answer: ' + A(an0) + '.');
  }
  k = rnd(20);
  for (i = 0; i < 4; i++) shown.push(A(k + i) + A(25 - k - i));
  return G('reasoning', 'series', 'What comes next?<br><b>' + shown.join(', ') + ', ?</b>',
    [A(k + 4) + A(21 - k), A(k + 4) + A(22 - k), A(k + 5) + A(21 - k), A(k + 3) + A(21 - k)],
    'The first letter moves forward one place each time while the second letter moves backward one place. Answer: ' + A(k + 4) + A(21 - k) + '.');
}

/* letter / number / mixed analogies (common in FEUCAT-style reviewers) */
function codedQ(L) {
  var A = A_, t = rnd(hardNow(L) ? 6 : 3), k, a, b, c, w;
  var WORDS = ['STAR', 'LAMP', 'BIRD', 'FISH', 'GOLD', 'ROAD', 'MILK', 'DESK', 'SNOW', 'WIND', 'PLUM', 'CLAY'];
  if (t === 0) {
    k = pick([3, 4, 6, 7, 8, 9, 11, 12]); a = rnd(8) + 2; b = rnd(9) + 3; if (b === a) b++;
    return G('reasoning', 'coded', a + ' is to ' + (a * k) + ' as ' + b + ' is to ?', numOpts(b * k, [k, -k, 1, -1, b, a * k - a]), 'The second number is the first multiplied by ' + k + ': ' + a + ' × ' + k + ' = ' + (a * k) + ', so ' + b + ' × ' + k + ' = ' + (b * k) + '.');
  }
  if (t === 1) {
    k = pick([1, 2, 3]); a = rnd(14); b = rnd(14) + 6;
    var p1 = A(a) + A(a + k + 1), p2 = A(b) + A(b + k + 1);
    return G('reasoning', 'coded', p1 + ' is to ' + A(a + 2 * k + 2) + A(a + 3 * k + 3) + ' as ' + p2 + ' is to ?', [A(b + 2 * k + 2) + A(b + 3 * k + 3), A(b + 2 * k + 1) + A(b + 3 * k + 3), A(b + 2 * k + 2) + A(b + 3 * k + 2), A(b + k + 1) + A(b + 2 * k + 2)],
      'Each letter jumps ' + (k + 1) + ' places (skipping ' + k + ' letter' + (k > 1 ? 's' : '') + ') to the next. Continue the same jumps from ' + p2 + '.');
  }
  if (t === 2) {
    var ws = sample(WORDS, 2);
    var rev = function (s) { return s.split('').reverse().join(''); };
    return G('reasoning', 'coded', ws[0] + ' is to ' + rev(ws[0]) + ' as ' + ws[1] + ' is to ?', [rev(ws[1]), ws[1].slice(1) + ws[1][0], ws[1].split('').sort().join(''), rev(ws[1]).slice(1) + rev(ws[1])[0]],
      'The letters of the word are written in reverse order.');
  }
  if (t === 3) {
    a = rnd(8); b = rnd(8) + 10;
    var num = function (i) { return String(i + 1) + String(i + 2); };
    return G('reasoning', 'coded', A(a) + A(a + 1) + ' is to ' + num(a) + ' as ' + A(b) + A(b + 1) + ' is to ?', [num(b), String(b) + String(b + 1), String(b + 2) + String(b + 3), String(b + 1) + String(b + 3)],
      'Replace each letter by its position in the alphabet (A=1, B=2 … Z=26): ' + A(b) + ' = ' + (b + 1) + ', ' + A(b + 1) + ' = ' + (b + 2) + '.');
  }
  if (t === 4) {
    w = sample(WORDS, 2); k = pick([1, 2, 3]);
    var shift = function (s, d) { return s.split('').map(function (ch) { return A(ch.charCodeAt(0) - 65 + d); }).join(''); };
    return G('reasoning', 'coded', 'In a code, <b>' + w[0] + '</b> is written as <b>' + shift(w[0], k) + '</b>. How is <b>' + w[1] + '</b> written?', [shift(w[1], k), shift(w[1], -k), shift(w[1], k + 1), shift(w[1], k).split('').reverse().join('')],
      'Each letter is shifted ' + k + ' place' + (k > 1 ? 's' : '') + ' forward in the alphabet (' + w[0][0] + ' → ' + shift(w[0][0], k) + '). Apply the same shift to every letter of ' + w[1] + '.');
  }
  a = rnd(80) + 12; b = rnd(80) + 12; if (digitSum(a) === digitSum(b)) b += 1;
  c = [b + 9, b * 2, b + 1].map(function (x) { return x; });
  var ansNum = digitSum(b);
  return G('reasoning', 'coded', a + ' is to ' + digitSum(a) + ' as ' + b + ' is to ?', numOpts(ansNum, [1, -1, 2, -2, 3, 10]),
    'The second number is the sum of the digits of the first: ' + String(a).split('').join(' + ') + ' = ' + digitSum(a) + '. So ' + String(b).split('').join(' + ') + ' = ' + ansNum + '.');
}

/* arithmetic & geometric sequences */
function seqQ(L) {
  var T = L === 1 ? [0, 1, 2, 3, 6, 7] : L === 2 ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 11] : [3, 4, 5, 6, 8, 9, 10, 11, 4, 5];
  var a, d, n, r, m, ans, x, y;
  switch (pick(T)) {
    case 0: a = rnd(15) + 1; d = pick([2, 3, 4, 5, 7, -3, -4]); n = rnd(12) + 8; ans = a + (n - 1) * d;
      return G('math', 'seq', 'In the arithmetic sequence ' + [a, a + d, a + 2 * d, a + 3 * d].map(neg).join(', ') + ', …, what is the ' + n + 'th term?', choices(ans, [a + n * d, a + (n - 2) * d, n * d], ans),
        'aₙ = a₁ + (n − 1)d = ' + a + ' + (' + n + ' − 1)(' + neg(d) + ') = ' + a + sgn((n - 1) * d) + ' = ' + neg(ans) + '. A common mistake is multiplying by n instead of n − 1.');
    case 1:
      if (rnd(2)) { a = pick([2, 3, 5, 7]); r = pick([2, 3, 4]); return G('math', 'seq', 'What is the common ratio of the geometric sequence ' + [a, a * r, a * r * r, a * r * r * r].join(', ') + ', …?', choices(r, [a * r - a, '1/' + r, r + 1, r * r], r), 'Divide any term by the one before it: ' + (a * r) + ' ÷ ' + a + ' = ' + r + '.'); }
      a = rnd(30) + 40; d = -pick([3, 4, 6, 7, 9]);
      return G('math', 'seq', 'What is the common difference of ' + [a, a + d, a + 2 * d, a + 3 * d].join(', ') + ', …?', choices(d, [-d, d - 1, d + 1]), 'Subtract any term from the next one: ' + (a + d) + ' − ' + a + ' = ' + neg(d) + '. The terms decrease, so the difference is negative.');
    case 2:
      a = rnd(5) + 2; d = rnd(4) + 2;
      return G('math', 'seq', 'Which of these is a <b>geometric</b> sequence?', ['' + [a, a * d, a * d * d, a * d * d * d].join(', '), [a, a + d, a + 2 * d, a + 3 * d].join(', '), [a, a + 1, a + 3, a + 6].join(', '), [a * a, (a + 1) * (a + 1), (a + 2) * (a + 2), (a + 3) * (a + 3)].join(', ')],
        'A geometric sequence multiplies by the same number each time (here ×' + d + '). The second choice adds the same number (arithmetic); the others follow neither rule.');
    case 3: a = pick([1, 2, 3, 5]); r = pick([2, 3]); n = rnd(4) + (r === 2 ? 6 : 5); ans = a * Math.pow(r, n - 1);
      return G('math', 'seq', 'Find the ' + n + 'th term of the geometric sequence ' + [a, a * r, a * r * r].join(', ') + ', …', choices(ans, [a * Math.pow(r, n), a * r * (n - 1), ans / r], ans),
        'aₙ = a₁ · rⁿ⁻¹ = ' + a + ' · ' + r + '^' + (n - 1) + ' = ' + a + ' · ' + Math.pow(r, n - 1) + ' = ' + ans + '.');
    case 4: a = rnd(10) + 1; d = rnd(5) + 2; n = rnd(15) + 10; ans = n * (2 * a + (n - 1) * d) / 2;
      return G('math', 'seq', 'Find the sum of the first ' + n + ' terms of ' + [a, a + d, a + 2 * d].join(', ') + ', …', choices(ans, [n * (a + (n - 1) * d), ans - (a + (n - 1) * d), ans + d * n], ans),
        'The ' + n + 'th term is ' + a + ' + ' + (n - 1) + '·' + d + ' = ' + (a + (n - 1) * d) + '. Sₙ = n/2 · (first + last) = ' + n + '/2 · (' + a + ' + ' + (a + (n - 1) * d) + ') = ' + ans + '.');
    case 5: m = rnd(4) + 2; n = m + rnd(6) + 3; d = pick([2, 3, 4, 5, -2, -3]); a = rnd(20) - 5; x = a + (m - 1) * d; y = a + (n - 1) * d;
      if (L === 3 && rnd(2)) return G('math', 'seq', 'In an arithmetic sequence, a' + sub(m) + ' = ' + neg(x) + ' and a' + sub(n) + ' = ' + neg(y) + '. What is a₁?', choices(a, [a + d, a - d, x - m * d], a),
        'd = (' + neg(y) + ' − ' + neg(x) + ') ÷ (' + n + ' − ' + m + ') = ' + neg(d) + '. Then a₁ = a' + sub(m) + ' − (' + m + ' − 1)d = ' + neg(x) + ' − ' + (m - 1) + '(' + neg(d) + ') = ' + neg(a) + '.');
      return G('math', 'seq', 'In an arithmetic sequence, a' + sub(m) + ' = ' + neg(x) + ' and a' + sub(n) + ' = ' + neg(y) + '. What is the common difference?', choices(d, [-d, (y - x) / (n - m + 1), d * 2], d),
        'd = (a' + sub(n) + ' − a' + sub(m) + ') ÷ (' + n + ' − ' + m + ') = (' + neg(y - x) + ') ÷ ' + (n - m) + ' = ' + neg(d) + '.');
    case 6: a = rnd(9) + 1; d = rnd(6) + 2; n = rnd(25) + 12; x = a + (n - 1) * d;
      return G('math', 'seq', 'How many terms are in the sequence ' + [a, a + d, a + 2 * d].join(', ') + ', …, ' + x + '?', choices(n, [n - 1, n + 1, Math.round(x / d)], n),
        'n = (last − first) ÷ d + 1 = (' + x + ' − ' + a + ') ÷ ' + d + ' + 1 = ' + (n - 1) + ' + 1 = ' + n + '. Forgetting the "+1" is the most common error.');
    case 7: n = rnd(40) + 20;
      if (rnd(2)) return G('math', 'seq', 'What is 1 + 2 + 3 + … + ' + n + '?', choices(n * (n + 1) / 2, [n * n / 2, n * (n - 1) / 2, n * (n + 1)], n * (n + 1) / 2), 'Sum of 1 to n = n(n + 1)/2 = ' + n + ' × ' + (n + 1) + ' ÷ 2 = ' + (n * (n + 1) / 2) + '.');
      return G('math', 'seq', 'What is the sum of the first ' + n + ' odd numbers (1 + 3 + 5 + …)?', choices(n * n, [n * (n + 1), 2 * n * n, n * n - 1], n * n), 'The sum of the first n odd numbers is n². So ' + n + '² = ' + (n * n) + '.');
    case 8: a = pick([1, 2, 3, 4]); r = pick([2, 3, -2]); x = a * r; y = a * Math.pow(r, 4);
      return G('math', 'seq', 'In a geometric sequence, the 2nd term is ' + neg(x) + ' and the 5th term is ' + neg(y) + '. What is the common ratio?', choices(r, [-r, r * r, (y - x) / 3]),
        'From the 2nd to the 5th term you multiply by r three times: r³ = ' + neg(y) + ' ÷ ' + neg(x) + ' = ' + neg(Math.pow(r, 3)) + ', so r = ' + neg(r) + '.');
    case 9: a = pick([1, 2, 3]); r = pick([2, 3]); n = rnd(4) + 4; ans = a * (Math.pow(r, n) - 1) / (r - 1);
      return G('math', 'seq', 'Find the sum of the first ' + n + ' terms of ' + [a, a * r, a * r * r].join(' + ') + ' + …', choices(ans, [a * Math.pow(r, n), a * Math.pow(r, n - 1), ans + a], ans),
        'Sₙ = a₁(rⁿ − 1)/(r − 1) = ' + a + '(' + r + '^' + n + ' − 1)/(' + r + ' − 1) = ' + a + ' × ' + (Math.pow(r, n) - 1) + ' ÷ ' + (r - 1) + ' = ' + ans + '.');
    case 10:
      var R = pick([[1, 2], [1, 3], [2, 3], [1, 4], [-1, 2]]), ok = [6, 9, 12, 18, 24, 30, 36, 48].filter(function (v) { return (v * R[1]) % (R[1] - R[0]) === 0; });
      a = pick(ok); ans = a * R[1] / (R[1] - R[0]);
      return G('math', 'seq', 'Find the sum of the infinite geometric series ' + a + ' + ' + neg(a * R[0] / R[1]) + ' + ' + neg(a * R[0] * R[0] / (R[1] * R[1])) + ' + …', choices(ans, [a * 2, ans + a, a * R[1]], ans),
        'r = ' + neg(R[0]) + '/' + R[1] + ', and |r| < 1, so S = a₁ ÷ (1 − r) = ' + a + ' ÷ (' + (R[1] - R[0]) + '/' + R[1] + ') = ' + ans + '.');
    default:
      if (rnd(2)) { var P = pick([[4, 25, 10], [2, 18, 6], [3, 27, 9], [5, 20, 10], [8, 32, 16], [9, 16, 12], [4, 9, 6]]);
        return G('math', 'seq', 'What is the positive geometric mean of ' + P[0] + ' and ' + P[1] + '?', choices(P[2], [(P[0] + P[1]) / 2, P[2] * 2, P[2] + 1], P[2]), 'Geometric mean = √(' + P[0] + ' × ' + P[1] + ') = √' + (P[0] * P[1]) + ' = ' + P[2] + '. (The arithmetic mean would be ' + ((P[0] + P[1]) / 2) + '.)'); }
      a = rnd(10) + 2; d = rnd(6) + 2; x = a + 4 * d;
      return G('math', 'seq', 'Three arithmetic means are inserted between ' + a + ' and ' + x + '. What is the middle one?', choices(a + 2 * d, [a + d, a + 3 * d, (a + x) / 2 + 1], a + 2 * d),
        'Five terms in all, so d = (' + x + ' − ' + a + ') ÷ 4 = ' + d + '. The sequence is ' + [a, a + d, a + 2 * d, a + 3 * d, x].join(', ') + '; the middle term is ' + (a + 2 * d) + '.');
  }
}
function sub(n) { return String(n).split('').map(function (c) { return '₀₁₂₃₄₅₆₇₈₉'[+c]; }).join(''); }

/* abstract figures (SVG) */
function svg(inner) { return '<svg class="fig" viewBox="0 0 60 60"><rect x="1" y="1" width="58" height="58" rx="6" class="fgb"/>' + inner + '</svg>'; }
var QM = '<svg class="fig" viewBox="0 0 60 60"><rect x="1" y="1" width="58" height="58" rx="6" class="fgb fq"/><text x="30" y="40" text-anchor="middle" font-size="28" font-weight="700" fill="currentColor">?</text></svg>';
var GLYPH = { F: 'M22 46V14H40M22 29H34', L: 'M22 12V46H42', P: 'M22 48V14H38V30H22', R: 'M22 48V14H38V29H22M30 29L40 48', arrow: 'M30 50V14M20 24L30 12L40 24' };
function glyphPath(g, deg, mirror, extra) {
  return '<g transform="rotate(' + deg + ' 30 30)' + (mirror ? ' translate(60 0) scale(-1 1)' : '') + (extra || '') + '"><path d="' + GLYPH[g] + '" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>';
}
function glyph(g, deg, mirror) { return svg(glyphPath(g, deg, mirror)); }
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
function polyPts(n, r, cx, cy, rot) {
  var pts = []; for (var k = 0; k < n; k++) { var a = ((rot || -90) + 360 * k / n) * Math.PI / 180; pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1)); }
  return pts.join(' ');
}
function poly(n, filled) { return svg('<polygon points="' + polyPts(n, 20, 30, 31) + '" fill="' + (filled ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>'); }
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
/* harder figures */
var RING = [[8, 8], [30, 8], [52, 8], [52, 30], [52, 52], [30, 52], [8, 52], [8, 30]];
function dualFig(ang, pos) { return svg(glyphPath('arrow', ang, false, ' translate(30 30) scale(.6) translate(-30 -30)') + '<circle cx="' + RING[pos][0] + '" cy="' + RING[pos][1] + '" r="4.5" fill="currentColor"/>'); }
function figDual() {
  var st1 = rnd(8) * 45, s1 = pick([45, 90, -45, -90, 135]), st2 = rnd(8), s2 = pick([1, 2, 3, -1, -2]);
  var A = function (i) { return ((st1 + s1 * i) % 360 + 360) % 360; }, P = function (i) { return ((st2 + s2 * i) % 8 + 8) % 8; };
  var aA = A(4), aP = P(4), oA = (aA + pick([90, 180, 270])) % 360, oP = (aP + pick([2, 4, 6])) % 8;
  return G('reasoning', 'figure', 'Two things change in this series. Which figure comes next?' + frames([0, 1, 2, 3].map(function (i) { return dualFig(A(i), P(i)); })),
    [dualFig(aA, aP), dualFig(aA, oP), dualFig(oA, aP), dualFig(oA, (oP + 1) % 8)],
    'Track each part separately. The arrow turns ' + Math.abs(s1) + '° ' + (s1 > 0 ? 'clockwise' : 'counter-clockwise') + ' each step, while the dot moves ' + Math.abs(s2) + ' stop' + (Math.abs(s2) > 1 ? 's' : '') + ' ' + (s2 > 0 ? 'clockwise' : 'counter-clockwise') + ' around the border. Only one choice gets both right.');
}
var MSHAPES = ['circle', 'tri', 'square', 'pent'];
function mShape(shape, fill) {
  var st = 'stroke="currentColor" stroke-width="3" stroke-linejoin="round" fill="' + (fill === 2 ? 'currentColor' : 'none') + '"', el;
  if (shape === 'circle') el = '<circle cx="30" cy="30" r="17" ' + st + '/>';
  else if (shape === 'square') el = '<rect x="14" y="14" width="32" height="32" ' + st + '/>';
  else el = '<polygon points="' + polyPts(shape === 'tri' ? 3 : 5, 19, 30, shape === 'tri' ? 33 : 31) + '" ' + st + '/>';
  if (fill === 1) el += '<circle cx="30" cy="' + (shape === 'tri' ? 35 : 30) + '" r="4.5" fill="currentColor"/>';
  return svg(el);
}
function figMatrix() {
  var S = sample(MSHAPES, 3), F = shuffle([0, 1, 2]), cells = [];
  for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) cells.push([S[(i + j) % 3], F[(i + 2 * j) % 3]]);
  var ans = cells[8], wS = S.filter(function (s) { return s !== ans[0]; }), wF = F.filter(function (f) { return f !== ans[1]; });
  var grid = '<div class="matrix">' + cells.slice(0, 8).map(function (c) { return mShape(c[0], c[1]); }).join('') + QM + '</div>';
  return G('reasoning', 'figure', 'Which figure completes the grid?' + grid,
    [mShape(ans[0], ans[1]), mShape(ans[0], wF[0]), mShape(wS[0], ans[1]), mShape(wS[1], wF[1])],
    'Every row and every column contains each shape exactly once AND each style (empty, dotted, solid) exactly once. The bottom row is missing a ' + (ans[0] === 'tri' ? 'triangle' : ans[0] === 'pent' ? 'pentagon' : ans[0]) + ', and the last column is missing the ' + ['empty', 'dotted', 'solid'][ans[1]] + ' style.');
}
var SEGS = ['M14 14H46', 'M46 14V46', 'M14 46H46', 'M14 14V46', 'M14 14L46 46', 'M46 14L14 46', 'M30 14V46', 'M14 30H46'];
function lineFig(m) { var s = '<circle cx="30" cy="30" r="1.6" fill="currentColor" opacity=".25"/>'; for (var k = 0; k < 8; k++) if (m & (1 << k)) s += '<path d="' + SEGS[k] + '" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>'; return svg(s); }
function bits(m) { var c = 0; while (m) { c += m & 1; m >>= 1; } return c; }
function randMask() { var m; do { m = rnd(256); } while (bits(m) < 2 || bits(m) > 4); return m; }
function xorPair() { var a, b; do { a = randMask(); b = randMask(); } while (!(a & b) || !(a ^ b) || a === b || bits(a ^ b) < 2); return [a, b]; }
function figXor() {
  var r1 = xorPair(), r2 = xorPair(), X = r2[0] ^ r2[1], cand = [r2[0] | r2[1], r2[0] & r2[1]], out = [X];
  for (var k = 0; k < 8; k++) cand.push(X ^ (1 << k));
  cand = [cand[0]].concat(shuffle(cand.slice(1)));
  cand.forEach(function (m) { if (out.length < 4 && m && out.indexOf(m) < 0) out.push(m); });
  var row = function (a, b, c) { return '<div class="frames">' + lineFig(a) + '<span class="rel">+</span>' + lineFig(b) + '<span class="rel">=</span>' + (c == null ? QM : lineFig(c)) + '</div>'; };
  return G('reasoning', 'figure', 'The first row shows the rule. Which figure completes the second row?' + row(r1[0], r1[1], r1[0] ^ r1[1]) + row(r2[0], r2[1]),
    out.map(lineFig),
    'Overlay the two figures. A line that appears in only one of them stays; a line that appears in BOTH cancels out (disappears). Check row 1: the shared lines are gone in the third figure. Choosing "all lines combined" is the classic trap.');
}
function figOddHard() {
  var g = pick(['F', 'P', 'R', 'L']), a = sample([0, 45, 90, 135, 180, 225, 270, 315], 4);
  return G('reasoning', 'figure', 'Four figures, but one is not like the others: three are the same shape rotated, one is a mirror image. Which one is different?',
    [glyph(g, a[3], true), glyph(g, a[0]), glyph(g, a[1]), glyph(g, a[2])],
    'Rotate each figure back to upright in your head (the turns here include 45° steps). Three match exactly; the odd one is flipped like a reflection in a mirror, which no rotation can undo.');
}
function figAnalogyHard() {
  var gs = sample(['F', 'P', 'R'], 2), t = pick([0, 90, 180, 270]), a = rnd(4) * 90, c = rnd(4) * 90, ans = ((2 * a + t - c) % 360 + 360) % 360;
  return G('reasoning', 'figure', 'Choose the figure that completes the analogy.<div class="frames">' + glyph(gs[0], a) + '<span class="rel">is to</span>' + glyph(gs[0], (a + t) % 360, true) + '<span class="rel">as</span>' + glyph(gs[1], c) + '<span class="rel">is to</span>' + QM + '</div>',
    [glyph(gs[1], ans, true), glyph(gs[1], ans), glyph(gs[1], (ans + 180) % 360, true), glyph(gs[1], (ans + 90) % 360, true)],
    'The second figure is a mirror image of the first — it is flipped across a line, not just turned (try rotating it back: it never matches). Flip the third figure across the same mirror line. One choice is only rotated: that is the trap.');
}
var FIGS_E = [figRotation, figDot, figSides, figCount, figOdd, figAnalogy];
var FIGS_H = [figDual, figMatrix, figXor, figOddHard, figAnalogyHard];
function figOne(L) { return (hardNow(L) ? pick(FIGS_H) : pick(FIGS_E))(); }
function figSet(n, L) {
  L = L || lv();
  var pool = L === 1 ? FIGS_E : L === 3 ? FIGS_H : FIGS_E.concat(FIGS_H), order = shuffle(pool), out = [];
  for (var i = 0; i < n; i++) out.push(order[i % order.length]());
  return out;
}
function seriesSet(n) { var out = []; for (var i = 0; i < n; i++) out.push(i % 3 === 2 ? letterSeries() : numSeries()); return out; }

/* ---------- drawing from the bank (difficulty-aware) ---------- */
function weigh(q, L) { var d = q.lv || 1; return L === 1 ? (d === 1 ? 0 : 5) : L === 3 ? (d === 3 ? 0 : 1.5) : 0; }
function byLevel(pool, n) {
  var L = lv();
  return pool.map(function (q) { return [weigh(q, L) + Math.random() * (L === 3 ? 1.2 : 1), q]; })
    .sort(function (a, b) { return a[0] - b[0]; }).slice(0, n).map(function (x) { return x[1]; });
}
function fromBank(sec, topic, n) { return shuffle(byLevel(BANK.filter(function (q) { return q.sec === sec && q.topic === topic && !q.p; }), n)); }
function stratified(sec, n) {
  var groups = {}, keys, out = [];
  BANK.forEach(function (q) { if (q.sec === sec && q.topic !== 'reading') (groups[q.topic] = groups[q.topic] || []).push(q); });
  keys = shuffle(Object.keys(groups)); keys.forEach(function (k) { groups[k] = byLevel(groups[k], groups[k].length).reverse(); });
  for (var i = 0; out.length < n && keys.some(function (k) { return groups[k].length; }); i++) { var g = groups[keys[i % keys.length]]; if (g.length) out.push(g.pop()); }
  return shuffle(out);
}
function readingSets(nPass) {
  var L = lv(), ids = Object.keys(PASSAGES), out = [];
  ids = ids.map(function (id) { return [weigh(PASSAGES[id], L) + Math.random(), id]; }).sort(function (a, b) { return a[0] - b[0]; }).slice(0, nPass).map(function (x) { return x[1]; });
  ids.forEach(function (id) { out = out.concat(BANK.filter(function (q) { return q.p === id; })); });
  return out;
}

function buildAssessment() {
  return { type: 'assessment', title: 'Assessment Test', parts: [
    { name: 'Speed Math', note: 'Mental arithmetic — no calculator. Go fast, but stay accurate.', time: 360, qs: speedSet(20) },
    { name: 'Vocabulary & Grammar', time: 360, qs: shuffle(fromBank('english', 'grammar', 6).concat(fromBank('english', 'vocab', 6))) },
    { name: 'Reading Comprehension', note: 'Two passages. The passage stays on screen while you answer.', time: 600, qs: readingSets(2) },
    { name: 'Abstract & Logical Reasoning', time: 540, qs: figSet(5).concat(seriesSet(3), lv() > 1 ? genSet(codedQ, 2) : [], fromBank('reasoning', 'verbal', lv() > 1 ? 2 : 4)) },
    { name: 'Science', time: 360, qs: stratified('science', 10) },
    { name: 'Math Problem Solving', note: 'Scratch paper allowed, no calculator.', time: 720, qs: stratified('math', lv() > 1 ? 9 : 10).concat(lv() > 1 ? genSet(seqQ, 1) : []) }
  ] };
}
function buildMock() {
  return { type: 'mock', title: 'Mock Exam', parts: [
    { name: 'English', note: 'Grammar, vocabulary, then three reading passages.', time: 1800, qs: shuffle(fromBank('english', 'grammar', 12).concat(fromBank('english', 'vocab', 8))).concat(readingSets(3)) },
    { name: 'Mathematics', note: 'Scratch paper allowed, no calculator.', time: 1800, qs: shuffle(stratified('math', 22).concat(genSet(seqQ, 3))) },
    { name: 'Science', time: 900, qs: stratified('science', 20) },
    { name: 'Mental Ability', note: 'Figure patterns, number and letter series, coded analogies and logic.', time: 1200, qs: figSet(8).concat(seriesSet(5), genSet(codedQ, 3), fromBank('reasoning', 'verbal', 4)) }
  ] };
}
function buildPractice(topic, n) {
  var qs, name = TOPIC[topic] || SEC[topic];
  if (topic === 'speed') qs = speedSet(n);
  else if (topic === 'figure') qs = figSet(n);
  else if (topic === 'series') qs = seriesSet(n);
  else if (topic === 'seq') qs = genSet(seqQ, n);
  else if (topic === 'coded') qs = genSet(codedQ, n);
  else if (topic === 'reading') qs = readingSets(2);
  else if (topic === 'reasoning') qs = shuffle(figSet(4).concat(seriesSet(2), genSet(codedQ, 2), fromBank('reasoning', 'verbal', n - 8)));
  else if (SEC[topic]) qs = stratified(topic, n);
  else qs = fromBank(TOPIC_SEC[topic], topic, n);
  return { type: 'practice', title: 'Practice: ' + name, parts: [{ name: name, time: 0, qs: qs }] };
}

/* ---------- session ---------- */
var S = null, pending = null, pendingType = null, timer = null;

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
function practicePace() { var s = store.settings; return Math.max(5, Math.round(s.paceMin * 60 / Math.max(1, s.paceItems))); }
function idealFor(p) { return p.time ? p.time / Math.max(1, (p.items || p.qs).length) : practicePace(); }
function secs(x) { x = Math.round(x); return x < 60 ? x + ' s' : fmt(x); }

function levelSlider(note) {
  var L = lv();
  return '<div class="lvl"><div class="lvlhead"><span>Difficulty</span><b id="lvlName" class="lv' + L + '">' + LVNAME[L] + '</b></div>' +
    '<input type="range" id="lvl" min="1" max="3" step="1" value="' + L + '" aria-label="Difficulty">' +
    '<div class="lvlticks"><span>Easy</span><span>Mixed</span><span>Real exam</span></div><p class="small muted" id="lvlDesc">' + LVDESC[L] + (note ? ' ' + note : '') + '</p></div>';
}

function intro(type) {
  S = null; stopTimer();
  pendingType = type;
  pending = type === 'mock' ? buildMock() : buildAssessment();
  var rows = pending.parts.map(function (p, i) { return '<tr><td>' + (i + 1) + '. ' + p.name + '</td><td class="n">' + p.qs.length + ' items</td><td class="n">' + mins(p.time) + '</td><td class="n">' + secs(idealFor(p)) + '</td></tr>'; }).join('');
  var blurb = type === 'mock'
    ? 'A full-length simulation covering the four areas past takers report on the FEUCAT: English, Mathematics, Science and Mental Ability. Each section has its own time limit. New questions are drawn every time.'
    : 'A quick diagnostic that measures your current level in speed math, vocabulary and grammar, reading comprehension, abstract reasoning, science and problem solving. Take it first, then use the results to decide what to practice.';
  view('<div class="card"><h1>' + pending.title + '</h1><p>' + blurb + '</p>' + levelSlider() +
    '<table><tr><th>Section</th><th class="n">Items</th><th class="n">Time</th><th class="n">Per item</th></tr>' + rows +
    '<tr><td><b>Total</b></td><td class="n"><b>' + total(pending) + ' items</b></td><td class="n"><b>' + mins(totalTime(pending)) + '</b></td><td></td></tr></table>' +
    '<label class="opt"><input type="checkbox" id="instant" checked><span><b>Show the correct answer and explanation after each question</b><br><span class="muted small">The timer pauses while you read the explanation. Untick this for real exam conditions — you will still get every answer and explanation at the end.</span></span></label>' +
    '<p class="small muted">Per-question timer: ' + (store.settings.qtimer ? 'on' : 'off') + ' · Time debt: ' + (store.settings.debt ? 'carried over' : 'off') + ' — change these in <button class="link" data-act="settings">Settings</button>.</p>' +
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
    '<p><b>' + p.items.length + ' items</b>' + (p.time ? ' · <b>' + mins(p.time) + '</b> · ideal pace <b>' + secs(idealFor(p)) + '</b> per question' : '') + '</p>' + (p.note ? '<p class="muted">' + p.note + '</p>' : '') +
    '<p class="muted small">The timer starts when you press the button.</p><button class="btn" data-act="startPart">Start section</button></div>');
}
function startPart() {
  var p = S.parts[S.pi];
  S.qi = 0; S.used = 0; S.remaining = p.time; S.paused = false; S.debt = 0; S.ideal = idealFor(p); S.last = Date.now();
  stopTimer();
  timer = setInterval(tick, 250);
  renderQ(true);
}
function qElapsed(it) { return (it.time + (it.locked || S.paused ? 0 : Date.now() - S.qStart)) / 1000; }
function qState(it) {
  var rem = it.budget - qElapsed(it);
  if (rem > 0) return { cls: rem > S.ideal * 0.35 ? 'g' : 'y', txt: fmt(Math.ceil(rem)) };
  return { cls: 'r', txt: '+' + fmt(Math.floor(-rem)) };
}
function debtHtml() {
  if (!store.settings.debt) return '';
  var d = Math.round(S.debt);
  return '<span id="debt" class="debt' + (d > 0 ? '' : ' none') + '" title="Time debt carried into this question">' + (d > 0 ? 'Debt −' + fmt(d) : 'No debt') + '</span>';
}
function qtHtml(it) {
  if (!store.settings.qtimer) return '';
  var st = qState(it);
  return '<div class="qtw"><span id="qt" class="qtimer ' + st.cls + '" title="Ideal time for this question (' + secs(S.ideal) + ')">' + st.txt + '</span>' + debtHtml() + '</div>';
}
function tick() {
  if (!S) return;
  var now = Date.now(), dt = now - S.last; S.last = now;
  if (S.paused) return;
  var p = S.parts[S.pi];
  if (p.time) {
    S.used += dt; S.remaining = p.time - Math.floor(S.used / 1000);
    var el = document.getElementById('timer');
    if (el) { el.textContent = fmt(S.remaining); el.classList.toggle('low', S.remaining <= 60); }
    if (S.remaining <= 0) { endPart(); return; }
  }
  var it = p.items[S.qi], qt = document.getElementById('qt');
  if (qt && it && !it.locked) { var st = qState(it); qt.textContent = st.txt; qt.className = 'qtimer ' + st.cls; }
}
function settle(it) {
  if (it.settled) return;
  it.settled = true;
  var spent = it.time / 1000;
  it.over = spent - S.ideal;
  if (store.settings.debt) S.debt = Math.max(0, spent - it.budget);
}
function choiceHtml(it, reveal, clickable) {
  return '<div class="choices">' + it.order.map(function (oi, k) {
    var cls = reveal ? (oi === 0 ? ' ok' : (oi === it.chosen ? ' bad' : '')) : (oi === it.chosen ? ' sel' : '');
    return '<button class="ch' + cls + '"' + (clickable ? ' data-act="choose" data-arg="' + k + '"' : ' disabled') + '><span class="lt">' + LETTERS[k] + '</span><span>' + it.q.c[oi] + '</span></button>';
  }).join('') + '</div>';
}
function timeNote(it) {
  if (it.over == null) return '';
  var o = Math.round(it.over);
  return '<span class="tnote ' + (o > 0 ? 'r' : 'g') + '">⏱ ' + secs(it.time / 1000) + (o > 0 ? ' · ' + secs(o) + ' over the ideal' : ' · within the ideal time') + '</span>';
}
function feedbackHtml(it) {
  var ok = it.chosen === 0, letter = LETTERS[it.order.indexOf(0)];
  return '<div class="feedback' + (ok ? '' : ' wrong') + '" id="fb"><b>' + (ok ? '✓ Correct!' : (it.chosen === null ? 'No answer.' : '✗ Not quite.')) + '</b> The correct answer is <b>' + letter + '</b>. ' + timeNote(it) + '<p>' + it.q.exp + '</p></div>';
}
function renderQ(fresh) {
  var p = S.parts[S.pi], it = p.items[S.qi], q = it.q, last = S.qi === p.items.length - 1, reveal = S.instant && it.locked;
  if (fresh) { it.debtIn = store.settings.debt ? S.debt : 0; it.budget = S.ideal - it.debtIn; S.qStart = Date.now(); }
  var html = '<div class="qbar"><div><b>' + p.name + '</b><span>Question ' + (S.qi + 1) + ' of ' + p.items.length + '</span></div>' + qtHtml(it) +
    (p.time ? '<div id="timer" class="timer' + (S.remaining <= 60 ? ' low' : '') + '" title="Section time left">' + fmt(S.remaining) + '</div>' : '') +
    '<button class="link" data-act="quit">Quit</button></div><div class="prog"><i style="width:' + (S.qi / p.items.length * 100) + '%"></i></div>';
  if (q.p) html += '<div class="card passage"><h3>' + PASSAGES[q.p].title + '</h3>' + PASSAGES[q.p].text + '</div>';
  html += '<div class="card"><div class="tag">' + (TOPIC[q.topic] || q.topic) + (q.lv === 3 ? ' · <span class="realtag">Real-exam level</span>' : '') + '</div><div class="qt">' + q.q + '</div>' + choiceHtml(it, reveal, !it.locked);
  if (reveal) html += feedbackHtml(it);
  if (reveal || !S.instant) html += '<div class="navrow"><button class="btn" data-act="next" id="nextBtn">' + (last ? (S.pi === S.parts.length - 1 ? 'Finish' : 'Finish section') : (!S.instant && it.chosen === null ? 'Skip' : 'Next')) + ' →</button></div>';
  html += '</div>';
  if (fresh) view(html);
  else { var pas = app.querySelector('.passage'), st = pas ? pas.scrollTop : 0; app.innerHTML = html; pas = app.querySelector('.passage'); if (pas) pas.scrollTop = st; }
}
function choose(k) {
  if (!S) return;
  var it = S.parts[S.pi].items[S.qi];
  if (it.locked || k >= it.order.length) return;
  it.chosen = it.order[k];
  if (S.instant) { it.locked = true; it.time += Date.now() - S.qStart; S.paused = true; settle(it); }
  renderQ(false);
  if (S.instant) celebrate(it);
  var fb = document.getElementById('fb'); if (fb && fb.scrollIntoView) fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function next() {
  if (!S) return;
  var p = S.parts[S.pi], it = p.items[S.qi];
  if (!it.locked) { it.locked = true; it.time += Date.now() - S.qStart; }
  settle(it);
  S.paused = false; S.last = Date.now();
  if (S.qi + 1 < p.items.length) { S.qi++; renderQ(true); } else endPart();
}
function endPart() {
  stopTimer();
  S.parts[S.pi].items.forEach(function (it) { it.locked = true; });
  if (S.pi + 1 < S.parts.length) { S.pi++; partIntro(); } else finish();
}
function finish() {
  var at = { id: Date.now(), type: S.type, title: S.title, date: new Date().toISOString(), level: lv(), correct: 0, total: 0, secs: 0, onPace: 0, timed: 0, instant: S.instant, parts: [], topics: {} };
  S.parts.forEach(function (p) {
    var pc = 0;
    p.items.forEach(function (it) {
      var ok = it.chosen === 0, t = at.topics[it.q.topic] = at.topics[it.q.topic] || { c: 0, t: 0 };
      t.t++; if (ok) { t.c++; pc++; }
      at.secs += it.time;
      if (it.over != null) { at.timed++; if (it.over <= 0) at.onPace++; }
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
  var weak = Object.keys(at.topics).filter(function (k) { return pct(at.topics[k].c, at.topics[k].t) < 70 && TOPIC_SEC[k]; })
    .sort(function (a, b) { return pct(at.topics[a].c, at.topics[a].t) - pct(at.topics[b].c, at.topics[b].t); }).slice(0, 4);
  var html = '<div class="card"><div class="tag">' + at.title + ' · ' + LVNAME[at.level || 1] + ' — result saved</div><div class="score"><div class="ring" style="--p:' + p + '"><div>' + p + '%</div></div><div><h1>' + at.correct + ' / ' + at.total + '</h1><p><b>' + v[0] + '.</b> ' + v[1] + '</p><p class="muted small">Answering time: ' + fmt(at.secs) + (at.total ? ' · about ' + Math.round(at.secs / at.total) + ' s per item' : '') +
    (at.timed ? '<br>' + at.onPace + ' of ' + at.timed + ' answered within the ideal time per question' : '') + '</p></div></div></div>';
  if (at.parts.length > 1) html += '<div class="card"><h2>By section</h2>' + at.parts.map(function (x) { return bar(x.name, x.c, x.t); }).join('') + '</div>';
  html += '<div class="card"><h2>By topic (weakest first)</h2>' + breakdown(at) +
    (weak.length ? '<p class="small muted" style="margin-top:12px">Practice your weakest topics:</p><div class="row">' + weak.map(function (k) { return '<button class="btn sm alt" data-act="prac" data-arg="' + k + '">' + TOPIC[k] + '</button>'; }).join('') + '</div>' : '') + '</div>';
  if (sess) {
    html += '<div class="card"><h2>Review every question</h2><p class="muted small">Tap a question to see the correct answer, the explanation and your time.</p>';
    sess.parts.forEach(function (part) {
      if (sess.parts.length > 1) html += '<h3 style="margin-top:14px">' + part.name + '</h3>';
      part.items.forEach(function (it, i) {
        var ok = it.chosen === 0, o = it.over == null ? null : Math.round(it.over);
        html += '<details class="rv' + (ok ? '' : ' bad') + '"><summary><span class="mk">' + (ok ? '✓' : '✗') + '</span><span>' + (i + 1) + '. ' + snippet(it.q.q) + '</span>' + (o != null ? '<span class="tm ' + (o > 0 ? 'r' : 'g') + '">' + Math.round(it.time / 1000) + 's' + (o > 0 ? ' +' + o : '') + '</span>' : '') + '</summary><div>' +
          (it.q.p ? '<p class="muted small">Passage: ' + PASSAGES[it.q.p].title + '</p>' : '') + '<div class="qt">' + it.q.q + '</div>' + choiceHtml(it, true, false) + feedbackHtml(it).replace(' id="fb"', '') + '</div></details>';
      });
    });
    html += '</div>';
  }
  html += '<div class="row">' + (sess && sess.back ? '<button class="btn" data-act="lesson" data-arg="' + sess.back + '">Back to the lesson</button>' : '') + '<button class="btn' + (sess && sess.back ? ' alt' : '') + '" data-act="home">Home</button><button class="btn alt" data-act="history">See my progress</button></div>';
  view(html);
}

/* ---------- home & other screens ---------- */
function ofType(t) { return store.attempts.filter(function (a) { return a.type === t; }); }
function lastPill(t) {
  var a = ofType(t); if (!a.length) return '<span class="pill gray">Not taken yet</span>';
  var l = a[a.length - 1]; return '<span class="pill">Last: ' + pct(l.correct, l.total) + '%</span> <span class="pill gray">Best: ' + Math.max.apply(null, a.map(function (x) { return pct(x.correct, x.total); })) + '%</span>';
}
function home() {
  S = null; stopTimer(); pending = null;
  var nm = Object.keys(store.missed).length;
  view('<div class="card hero"><h1>' + (store.name ? 'Kaya mo ’yan, ' + esc(store.name) + '!' : 'FEUCAT Reviewer') + '</h1><p>Practice for the FEU College Admission Test: English, Math, Science and Mental Ability. Every question shows the correct answer and why.</p>' +
    '<input id="name" placeholder="Type your name" maxlength="30" value="' + esc(store.name) + '" aria-label="Your name"></div>' +
    '<div class="grid">' +
    '<button class="tile feature" data-act="learn"><b>Basic Reviewer</b><span class="muted">Learn first: formulas, diagrams and interactive explainers for every topic, each with its own practice set.</span></button>' +
    '<button class="tile" data-act="assessment"><b>1. Assessment Test</b><span class="muted">Find your level: speed math, reading, abstract reasoning and more. About 45 minutes.</span><br>' + lastPill('assessment') + '</button>' +
    '<button class="tile" data-act="mock"><b>2. Mock Exam</b><span class="muted">Full timed simulation, about 100 items in 95 minutes. New questions each time.</span><br>' + lastPill('mock') + '</button>' +
    '<button class="tile" data-act="practice"><b>3. Practice by Topic</b><span class="muted">Untimed drills with instant explanations. Pick the topic you need.</span></button>' +
    '<button class="tile" data-act="mistakes"><b>4. Retry My Mistakes</b><span class="muted">Questions you got wrong come back until you get them right.</span><br><span class="pill ' + (nm ? '' : 'gray') + '">' + nm + ' to review</span></button>' +
    '</div><div class="card">' + levelSlider() + '</div><div class="row"><button class="btn alt" data-act="history">My progress</button><button class="btn alt" data-act="settings">Settings</button><button class="btn alt" data-act="tips">Exam tips &amp; study plan</button></div>');
}
function practiceMenu() {
  var groups = [['english', ['grammar', 'vocab', 'reading']], ['math', ['speed', 'arithmetic', 'algebra', 'geometry', 'trig', 'stats', 'seq']], ['science', ['bio', 'chem', 'physics', 'earth']], ['reasoning', ['figure', 'series', 'coded', 'verbal']]];
  view('<div class="card"><h1>Practice by Topic</h1><p class="muted">The answer and explanation appear right after each question. The per-question timer uses your practice pace from Settings (' + secs(practicePace()) + ').</p>' + levelSlider() + '</div>' +
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

/* ---------- basic reviewer (lessons in learn-*.js) ---------- */
function lessonList() { return window.LESSONS || []; }
function findLesson(id) { return lessonList().filter(function (l) { return l.id === id; })[0]; }
function learnMenu() {
  S = null; stopTimer();
  var order = ['math', 'science', 'english', 'reasoning'];
  view('<div class="card"><h1>Basic Reviewer</h1><p class="muted">Short lessons with diagrams, formulas and things you can play with. Every section ends with a practice set whose problems change each time.</p>' + levelSlider('The practice sets use this difficulty.') + '</div>' +
    order.map(function (sec) {
      var ls = lessonList().filter(function (l) { return l.sec === sec; });
      if (!ls.length) return '';
      return '<div class="card"><h2>' + SEC[sec] + '</h2><div class="lgrid">' + ls.map(function (l) {
        return '<button class="ltile" data-act="lesson" data-arg="' + l.id + '"><span class="lico">' + (l.icon || '') + '</span><span><b>' + l.title + '</b><span class="muted small">' + l.blurb + '</span></span></button>';
      }).join('') + '</div></div>';
    }).join('') + '<button class="btn alt" data-act="home">Back</button>');
}
function lessonView(id) {
  S = null; stopTimer();
  var l = findLesson(id); if (!l) { learnMenu(); return; }
  var body = (typeof l.html === 'function' ? l.html() : l.html).replace(/\{\{p(\d+)\}\}/g, function (_, k) {
    var s = l.sets[+k]; return s ? '<div class="pbtn"><button class="btn" data-act="lprac" data-arg="' + l.id + ':' + k + '">▶ Practice: ' + s.name + '</button></div>' : '';
  });
  view('<div class="card lhead"><div class="tag">' + SEC[l.sec] + ' · Basic reviewer</div><h1>' + l.title + '</h1><p class="muted">' + l.blurb + '</p>' +
    '<div class="row">' + l.sets.map(function (s, k) { return '<button class="btn sm alt" data-act="lprac" data-arg="' + l.id + ':' + k + '">Practice: ' + s.name + '</button>'; }).join('') + '</div></div>' +
    '<div class="lesson">' + body + '</div><div class="card">' + levelSlider('Applies to the practice buttons on this page.') + '</div>' +
    '<div class="row"><button class="btn alt" data-act="learn">All lessons</button><button class="btn alt" data-act="home">Home</button></div>');
  if (l.init) try { l.init(app); } catch (e) { if (window.console) console.error(e); }
}
function lessonPractice(arg) {
  var parts = String(arg).split(':'), l = findLesson(parts[0]), s = l && l.sets[+parts[1]];
  if (!s) return;
  var qs = s.many ? s.many(10, lv()) : s.bank ? fromBank(s.bank[0], s.bank[1], 10) : genSet(s.gen, 10);
  begin({ type: 'practice', title: 'Practice: ' + s.name, back: l.id, parts: [{ name: s.name, time: 0, qs: qs }] }, true);
}

/* ---------- settings ---------- */
function settings() {
  S = null; stopTimer();
  var st = store.settings;
  view('<div class="card"><h1>Settings</h1>' + levelSlider() + '</div>' +
    '<div class="card"><h2>Per-question timer</h2>' +
    '<label class="opt"><input type="checkbox" id="set-qtimer"' + (st.qtimer ? ' checked' : '') + '><span><b>Show an ideal-time timer on every question</b><br><span class="muted small">Counts down the ideal time for the question: <span class="qtimer g">green</span> while you have plenty of time, <span class="qtimer y">yellow</span> when time is running low, and <span class="qtimer r">red</span> once the ideal time has passed — then it keeps counting how far over you are.</span></span></label>' +
    '<label class="opt"><input type="checkbox" id="set-debt"' + (st.debt ? ' checked' : '') + '><span><b>Carry over time debt</b><br><span class="muted small">If you go over the ideal time, the extra seconds are taken from the next question. Example: ideal 48 s, you take 51 s → the next question starts at 45 s. Finishing early pays your debt back. Debt shows in <span class="debt">red</span>.</span></span></label>' +
    '<h3>Practice pace</h3><p class="small muted">Timed exams use their own section time ÷ number of items. Untimed practice uses this target:</p>' +
    '<div class="pace"><label>Exam length <input type="number" id="set-paceMin" min="5" max="600" value="' + st.paceMin + '"> min</label><label>Items <input type="number" id="set-paceItems" min="5" max="500" value="' + st.paceItems + '"></label><span>= <b id="paceOut">' + secs(practicePace()) + '</b> per question</span></div></div>' +
    '<div class="card"><h2>Background</h2><p class="small muted">Strength of the animated background (the floating tamaraws and shapes). On phones it is automatically shown 25% stronger so it stays visible on small screens.</p>' +
    '<div class="lvl"><div class="lvlhead"><span>Visibility</span><b id="bgOut">' + st.bg + '%</b></div><input type="range" id="set-bg" min="0" max="200" step="10" value="' + st.bg + '" aria-label="Background visibility"></div></div>' +
    '<button class="btn alt" data-act="home">Back</button>');
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
    html += '<details class="rv"><summary><span class="mk" style="color:inherit">' + pct(a.correct, a.total) + '%</span><span>' + esc(a.title) + ' — ' + a.correct + '/' + a.total + '<br><span class="muted small">' + d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + fmt(a.secs) + ' · ' + LVNAME[a.level || 1] + (a.timed ? ' · ' + a.onPace + '/' + a.timed + ' on pace' : '') + '</span></span></summary><div>' +
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
    '<li>Past takers and review centers describe a <b>multiple-choice aptitude test</b> covering <b>English, Mathematics, Science and Mental Ability</b>. Math is reported as algebra, geometry, basic trigonometry and statistics with <b>no calculator</b>; science at roughly <b>Grade 7–10</b> level.</li>' +
    '<li>Mental Ability reviewers emphasize <b>figure series</b> (fixed-angle rotations, dots moving around a square, alternating shading), <b>word analogies</b>, and <b>letter/number analogies</b> (alphabet positions, skipped letters, reversed words, ×k and digit-sum patterns, letters turned into numbers). The <b>Real exam</b> difficulty and the Letter &amp; Number Analogies topic train exactly these.</li>' +
    '<li>You book your slot in FEU’s admissions portal; past announcements asked examinees to bring a valid ID (school ID preferred) and two pencils. Results are reported about two weeks after the test. Always follow the instructions on your own test permit.</li></ul>' +
    '<h3>Difficulty levels in this app</h3><ul class="tight"><li><b>Easy</b> – the original practice items. Start here.</li><li><b>Mixed</b> – half easy, half real-exam level.</li><li><b>Real exam</b> – multi-step problems, traps and two-rule patterns, closer to what full reviewers and past takers describe.</li></ul>' +
    '<h3>One-week plan</h3><ul class="tight">' +
    '<li><b>Day 1:</b> Take the Assessment Test on Easy. Note your two weakest topics, then read their Basic Reviewer lessons.</li>' +
    '<li><b>Days 2–3:</b> Practice by Topic on the weakest areas (2–3 sets each). Do one Speed Math set daily with the per-question timer on.</li>' +
    '<li><b>Day 4:</b> First Mock Exam on Mixed, under real conditions (answers hidden until the end).</li>' +
    '<li><b>Day 5:</b> Retry My Mistakes, then drill Abstract Figures, Series and Letter &amp; Number Analogies on Real exam.</li>' +
    '<li><b>Day 6:</b> Second Mock Exam on Real exam with time debt turned on. Compare with Day 4 in My Progress.</li>' +
    '<li><b>Day 7:</b> Light review only. Prepare ID, pencils, permit. Sleep early.</li></ul>' +
    '<h3>During the test</h3><ul class="tight">' +
    '<li>Know your pace: total minutes × 60 ÷ items. For 2 hours and 150 items that is 48 seconds per item.</li>' +
    '<li>Don’t get stuck. If an item takes more than double your pace, make your best guess, mark it, and move on.</li>' +
    '<li>Answer every item unless the instructions say wrong answers are penalized.</li>' +
    '<li>Reading: skim the questions first, then read the passage looking for those answers.</li>' +
    '<li>Math: estimate first to eliminate choices; plug the choices back into the problem when solving is slow.</li>' +
    '<li>Figures: check one thing at a time — rotation, count, shading, position. If two things change, track them separately.</li>' +
    '<li>Series: look at the differences between terms; if they are irregular, check for two alternating series or multiplication.</li></ul>' +
    '<p class="small muted">Research sources: <a href="https://supertutor.ph/resources/blog/entrance-exams/feucat-overview/" target="_blank" rel="noopener">Super Tutor FEU-CAT overview</a>, <a href="https://supertutor.ph/resources/exams/feucat/abstract-reasoning/abstract-reasoning-question-types/cheat-sheet/" target="_blank" rel="noopener">Super Tutor abstract reasoning cheat sheet</a>, <a href="https://thepost.net.ph/?p=60628" target="_blank" rel="noopener">The POST</a>, <a href="https://new.feuadvocate.net/feu-administers-october-feucat-offers-multiple-test-dates/" target="_blank" rel="noopener">FEU Advocate</a>. Questions in this app are original practice items, not actual exam questions.</p>' +
    '<button class="btn alt" data-act="home">Back</button></div>');
}

/* ---------- events ---------- */
var acts = {
  home: home, history: history, tips: tips, practice: practiceMenu, mistakes: mistakes, learn: learnMenu, settings: settings,
  lesson: function (id) { lessonView(id); }, lprac: lessonPractice,
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
  resetData: function () { if (confirm('Erase ALL saved scores on this device? This cannot be undone.')) { var st = store.settings; store = blank(); store.settings = st; save(); history(); } }
};
var GUARDED = { home: 1, history: 1, tips: 1, learn: 1, settings: 1 };
document.addEventListener('click', function (e) {
  var b = e.target.closest ? e.target.closest('[data-act]') : null;
  if (!b || !acts[b.dataset.act]) return;
  if (S && GUARDED[b.dataset.act] && !confirm('Leave this session? Your progress in it will not be saved.')) return;
  acts[b.dataset.act](b.dataset.arg);
});
document.addEventListener('input', function (e) {
  var id = e.target.id;
  if (id === 'lvl') {
    var L = +e.target.value; store.settings.level = L; save();
    var nm = document.getElementById('lvlName'), ds = document.getElementById('lvlDesc');
    if (nm) { nm.textContent = LVNAME[L]; nm.className = 'lv' + L; }
    if (ds) ds.textContent = LVDESC[L];
    if (pending && !S && pendingType) pending = pendingType === 'mock' ? buildMock() : buildAssessment();
  }
  if (id === 'set-bg') { store.settings.bg = +e.target.value; save(); applyBg(); var o = document.getElementById('bgOut'); if (o) o.textContent = store.settings.bg + '%'; }
  if (id === 'set-paceMin' || id === 'set-paceItems') {
    var v = parseInt(e.target.value, 10);
    if (v > 0) { store.settings[id === 'set-paceMin' ? 'paceMin' : 'paceItems'] = Math.min(600, v); save(); var po = document.getElementById('paceOut'); if (po) po.textContent = secs(practicePace()); }
  }
});
document.addEventListener('change', function (e) {
  if (e.target.id === 'name') { store.name = e.target.value.trim(); save(); home(); }
  if (e.target.id === 'set-qtimer') { store.settings.qtimer = e.target.checked; save(); }
  if (e.target.id === 'set-debt') { store.settings.debt = e.target.checked; save(); }
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

/* shared helpers for the lesson files */
window.TP = { G: G, numOpts: numOpts, choices: choices, rnd: rnd, pick: pick, shuffle: shuffle, sample: sample, gcd: gcd, neg: neg, sgn: sgn, lv: lv, hardNow: hardNow,
  numSeries: numSeries, letterSeries: letterSeries, figOne: figOne, figSet: figSet, seqQ: seqQ, codedQ: codedQ, speedQ: speedQ, genSet: genSet, fromBank: fromBank, readingSets: readingSets,
  glyph: glyph, dualFig: dualFig, lineFig: lineFig, mShape: mShape, dotFig: dotFig, QM: QM };

home();
})();
