/* Basic Reviewer — Mathematics lessons.
   Each lesson: { id, sec, title, blurb, icon, html, init(root), sets:[{name, gen(L) | bank:[sec,topic] | many(n,L)}] }
   {{pN}} inside html becomes a "Practice" button for sets[N]. */
(function () {
'use strict';
var T = window.TP;
var rnd = T.rnd, pick = T.pick, shuffle = T.shuffle, sample = T.sample, gcd = T.gcd, neg = T.neg, G = T.G, choices = T.choices, numOpts = T.numOpts;
window.LESSONS = window.LESSONS || [];

/* ---------- shared drawing helpers (also used by the other lesson files) ---------- */
var H = window.LH = {};
H.dg = function (w, h, inner, label, style) { return '<svg class="dg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + (label || '') + '"' + (style ? ' style="' + style + '"' : '') + '>' + inner + '</svg>'; };
H.fig = function (svgStr, title, cap) { return '<figure' + (/viewBox="0 0 (2[6-9]\d|[3-9]\d\d)/.test(svgStr) ? ' class="wide"' : '') + '>' + svgStr + '<figcaption><b>' + title + '</b>' + (cap || '') + '</figcaption></figure>'; };
H.fbox = function (t, f, cls) { return '<div class="fbox' + (cls ? ' ' + cls : '') + '"><b>' + t + '</b><span>' + f + '</span></div>'; };
H.table = function (head, rows) { return '<div class="ttable"><table><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr>' + rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div>'; };
H.t = function (x, y, s, cls, anchor) { return '<text x="' + x + '" y="' + y + '"' + (cls ? ' class="' + cls + '"' : '') + ' text-anchor="' + (anchor || 'middle') + '">' + s + '</text>'; };
H.line = function (x1, y1, x2, y2, cls) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + (cls || 'ln') + '"/>'; };
H.card = function (title, body) { return '<div class="card"><h2>' + title + '</h2>' + body + '</div>'; };
var dg = H.dg, fig = H.fig, fbox = H.fbox, txt = H.t, line = H.line, card = H.card;
function fr(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d); n /= g; d /= g; return d === 1 ? neg(n) : neg(n) + '/' + d; }
H.fr = fr;
function sup(n) { return '<sup>' + n + '</sup>'; }

/* angle helpers (math convention: degrees counter-clockwise, y up) */
function P(vx, vy, deg, r) { var a = deg * Math.PI / 180; return [+(vx + r * Math.cos(a)).toFixed(1), +(vy - r * Math.sin(a)).toFixed(1)]; }
function ray(vx, vy, deg, r, cls) { var p = P(vx, vy, deg, r); return line(vx, vy, p[0], p[1], cls || 'ln'); }
function arc(vx, vy, r, a1, a2, cls) { var p = P(vx, vy, a1, r), q = P(vx, vy, a2, r); return '<path d="M' + p + ' A' + r + ' ' + r + ' 0 ' + ((a2 - a1) % 360 > 180 ? 1 : 0) + ' 0 ' + q + '" class="' + (cls || 'go') + '"/>'; }
function rmark(vx, vy, a, s) { var p = P(vx, vy, a, s), q = P(vx, vy, a + 90, s), c = P(p[0], p[1], a + 90, s); return '<path d="M' + p + ' L' + c + ' L' + q + '" class="go" stroke-width="2"/>'; }
H.P = P; H.ray = ray; H.arc = arc;
function angFig(deg, w, h) {
  w = w || 140; h = h || 120; var vx = w / 2, vy = h / 2, s = '';
  s += ray(vx, vy, 0, 50, 'ac') + ray(vx, vy, deg, 50, 'ac') + '<circle cx="' + vx + '" cy="' + vy + '" r="3" class="fi"/>';
  if (deg === 90) s += rmark(vx, vy, 0, 12); else if (deg > 0) s += arc(vx, vy, deg > 180 ? 16 : 22, 0, deg, 'go');
  var lp = P(vx, vy, deg / 2, deg > 180 ? 30 : 36);
  s += txt(lp[0], lp[1] + 4, deg + '°', 'tg');
  return dg(w, h, s, deg + ' degree angle');
}
H.angFig = angFig;

/* ---------- plane-figure and solid drawings (numbers or letters as labels) ---------- */
function shapeSvg(k, L) {
  var s = '';
  switch (k) {
    case 'square': s = '<rect x="45" y="15" width="70" height="70" class="fa"/>' + txt(80, 102, L.s) + txt(130, 54, L.s, '', 'start'); break;
    case 'rect': s = '<rect x="15" y="22" width="130" height="62" class="fa"/>' + txt(80, 101, L.l) + txt(152, 57, L.w, '', 'start'); break;
    case 'tri': s = '<polygon points="15,88 145,88 98,18" class="fa"/>' + line(98, 18, 98, 88, 'dash') + '<path d="M98 80h-8v8" class="lt"/>' + txt(80, 104, L.b) + txt(104, 58, L.h, 'tg', 'start'); break;
    case 'para': s = '<polygon points="15,85 112,85 145,25 48,25" class="fa"/>' + line(48, 25, 48, 85, 'dash') + '<path d="M48 77h8v8" class="lt"/>' + txt(64, 101, L.b) + txt(42, 60, L.h, 'tg', 'end'); break;
    case 'trap': s = '<polygon points="10,85 150,85 112,25 48,25" class="fa"/>' + line(80, 25, 80, 85, 'dash') + txt(80, 19, L.a) + txt(80, 101, L.b) + txt(86, 60, L.h, 'tg', 'start'); break;
    case 'circle': s = '<circle cx="80" cy="55" r="42" class="fa"/>' + line(80, 55, 122, 55, 'go') + '<circle cx="80" cy="55" r="3" class="fi"/>' + txt(101, 50, L.r, 'tg'); break;
    case 'cube': s = '<path d="M30 45h60v60H30zM30 45l28-24h60L90 45M118 21v60l-28 24" class="fa"/>' + '<path d="M30 105l28-24h60M58 81V21" class="dash"/>' + txt(60, 118, L.s); break;
    case 'prism': s = '<path d="M15 50h90v55H15zM15 50l30-26h90l-30 26M135 24v55l-30 26" class="fa"/>' + '<path d="M15 105l30-26h90M45 79V24" class="dash"/>' + txt(60, 118, L.l) + txt(130, 100, L.w, '', 'start') + txt(8, 82, L.h, '', 'end'); break;
    case 'cyl': s = '<path d="M40 25v70a40 11 0 0 0 80 0V25" class="fa"/><ellipse cx="80" cy="25" rx="40" ry="11" class="fa"/><path d="M40 95a40 11 0 0 1 80 0" class="dash"/>' + line(80, 25, 120, 25, 'go') + txt(100, 20, L.r, 'tg') + txt(128, 64, L.h, '', 'start'); break;
    case 'cone': s = '<path d="M80 12L35 95a45 11 0 0 0 90 0z" class="fa"/><path d="M35 95a45 11 0 0 1 90 0" class="dash"/>' + line(80, 12, 80, 95, 'dash') + line(80, 95, 125, 95, 'go') + txt(102, 110, L.r, 'tg') + txt(74, 60, L.h, '', 'end') + (L.l ? txt(110, 50, L.l, 'tb', 'start') : ''); break;
    case 'sphere': s = '<circle cx="80" cy="60" r="46" class="fa"/><path d="M34 60a46 12 0 0 0 92 0" class="ln" stroke-width="1.5"/><path d="M34 60a46 12 0 0 1 92 0" class="dash"/>' + line(80, 60, 126, 60, 'go') + txt(103, 55, L.r, 'tg'); break;
    case 'pyr': s = '<path d="M25 100h85l25-22M25 100l57-85 53 63M110 100L82 15" class="fa" fill-opacity=".5"/><path d="M25 100l25-22h85M50 78l32-63" class="dash"/>' + line(82, 15, 80, 89, 'dash') + txt(68, 114, L.b) + txt(86, 60, L.h, 'tg', 'start'); break;
  }
  return dg(160, k === 'cube' || k === 'prism' || k === 'cyl' || k === 'cone' || k === 'sphere' || k === 'pyr' ? 122 : 110, s, k);
}
H.shapeSvg = shapeSvg;
function qfig(s) { return '<div class="qfig">' + s.replace('class="dg"', 'class="dg" style="max-width:200px;margin:8px 0"') + '</div>'; }

/* ====================================================================== */
/* NUMBER SENSE                                                            */
/* ====================================================================== */
function factorTree() {
  var s = '', n = function (x, y, v, leaf) { return '<circle cx="' + x + '" cy="' + y + '" r="15" class="' + (leaf ? 'fg' : 'fa') + '"/>' + txt(x, y + 4, v, leaf ? 'tg' : ''); };
  s += line(120, 25, 75, 70) + line(120, 25, 165, 70) + line(75, 70, 45, 115) + line(75, 70, 105, 115) + line(165, 70, 140, 115) + line(165, 70, 190, 115) + line(105, 115, 80, 160) + line(105, 115, 130, 160);
  s += n(120, 25, 72) + n(75, 70, 8) + n(165, 70, 9) + n(45, 115, 2, 1) + n(105, 115, 4) + n(140, 115, 3, 1) + n(190, 115, 3, 1) + n(80, 160, 2, 1) + n(130, 160, 2, 1);
  return dg(240, 185, s, 'factor tree of 72');
}
function venn() {
  return dg(300, 170, '<circle cx="115" cy="85" r="68" class="fa"/><circle cx="185" cy="85" r="68" class="fg"/>' +
    txt(90, 22, '12 = 2·2·3', 'ta') + txt(212, 22, '18 = 2·3·3', 'tg') + txt(80, 92, '2', '', 'middle') + txt(150, 82, '2 · 3', '') + txt(150, 100, 'shared', 'sm') + txt(222, 92, '3', '') +
    txt(150, 160, 'GCF = 2·3 = 6   ·   LCM = 2·2·3·3 = 36', 'sm'), 'Venn diagram of the prime factors of 12 and 18');
}
function genNumber(L) {
  var h = T.hardNow(L), a, b, k, g, t = rnd(h ? 10 : 6);
  switch (t) {
    case 0: g = pick([4, 6, 8, 9, 12, 14, 15, 18]); a = g * pick([2, 3, 5]); b = g * pick([7, 4, 3]); if (gcd(a, b) !== g) b = g * 7;
      return G('math', 'arithmetic', 'What is the GCF of ' + a + ' and ' + b + '?', choices(gcd(a, b), [gcd(a, b) / 2, a * b / gcd(a, b), Math.min(a, b)], gcd(a, b)), 'List or factor: the greatest number that divides both ' + a + ' and ' + b + ' is ' + gcd(a, b) + '.');
    case 1: a = pick([4, 6, 8, 9, 10, 12, 14, 15]); b = pick([6, 9, 10, 12, 16, 18, 20]); if (a === b) b += 4; k = a * b / gcd(a, b);
      return G('math', 'arithmetic', 'What is the LCM of ' + a + ' and ' + b + '?', choices(k, [a * b, gcd(a, b), k * 2], k), 'LCM = (' + a + ' × ' + b + ') ÷ GCF = ' + (a * b) + ' ÷ ' + gcd(a, b) + ' = ' + k + '.');
    case 2: var d = pick([3, 4, 6, 9]), good = d * (rnd(80) + 21), bad = [good + 1, good + 2, good - 1].filter(function (x) { return x % d; });
      var rule = { 3: 'its digit sum is divisible by 3', 4: 'its last two digits form a number divisible by 4', 6: 'it is even AND divisible by 3', 9: 'its digit sum is divisible by 9' }[d];
      return G('math', 'arithmetic', 'Which number is divisible by ' + d + '?', choices(good, bad, good), good + ' works because ' + rule + '.');
    case 3: a = rnd(8) + 2; b = rnd(5) + 2; k = rnd(4) + 2; var v = a * a - b * k + 12 / pick([1, 2, 3]);
      var dv = pick([2, 3, 4, 6]), e = a + ' + ' + b + ' × (' + k + ' + ' + dv + ')² ÷ ' + (k + dv), ans = a + b * (k + dv);
      return G('math', 'arithmetic', 'Simplify: ' + e, choices(ans, [(a + b) * (k + dv), a + b * (k + dv) * (k + dv), ans + k], ans), 'Parentheses: ' + (k + dv) + '. Exponent: ' + ((k + dv) * (k + dv)) + '. Then × and ÷ left to right: ' + b + ' × ' + ((k + dv) * (k + dv)) + ' ÷ ' + (k + dv) + ' = ' + (b * (k + dv)) + '. Finally add ' + a + ': ' + ans + '.');
    case 4: a = rnd(9) + 1; b = rnd(9); k = rnd(6) + 3; var small = rnd(2);
      var num = small ? '0.' + '0'.repeat(k - 1) + a + b : String(a) + b + '0'.repeat(k - 1);
      return G('math', 'arithmetic', 'Write ' + num + ' in scientific notation.', [a + '.' + b + ' × 10' + sup(small ? '−' + k : k), a + '.' + b + ' × 10' + sup(small ? '−' + (k - 1) : k - 1), a + '.' + b + ' × 10' + sup(small ? k : '−' + k), a + b + ' × 10' + sup(small ? '−' + (k + 1) : k - 1)],
        'Move the decimal point so there is one nonzero digit in front: ' + a + '.' + b + '. You moved it ' + k + ' places ' + (small ? 'right, so the exponent is negative (−' + k + ').' : 'left, so the exponent is +' + k + '.'));
    case 5: var pr = pick([31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]), comp = sample([51, 57, 87, 91, 69, 77, 93, 81, 63, 49], 3);
      return G('math', 'arithmetic', 'Which of these is a prime number?', [String(pr)].concat(comp.map(String)), pr + ' has no divisors other than 1 and itself. The others factor: ' + comp.map(function (c) { for (var f = 3; f < c; f += 2) if (c % f === 0) return c + ' = ' + f + ' × ' + (c / f); return c; }).join('; ') + '.');
    case 6: var F = pick([[2, 3, 1], [2, 2, 2], [3, 1, 2], [4, 2, 0], [2, 1, 1], [3, 2, 1]]), n = Math.pow(2, F[0]) * Math.pow(3, F[1]) * Math.pow(5, F[2]), nd = (F[0] + 1) * (F[1] + 1) * (F[2] + 1);
      return G('math', 'arithmetic', 'How many positive divisors does ' + n + ' have?', numOpts(nd, [1, -1, 2, -2, 4]), n + ' = ' + ['2' + sup(F[0]), F[1] ? '3' + sup(F[1]) : '', F[2] ? '5' + sup(F[2]) : ''].filter(Boolean).join(' × ') + '. Add 1 to each exponent and multiply: ' + [F[0] + 1, F[1] + 1, F[2] + 1].filter(function (x, i) { return i === 0 || F[i]; }).join(' × ') + ' = ' + nd + '.');
    case 7: b = pick([2, 3, 7, 8]); k = rnd(30) + 10; var cyc = { 2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 7: [7, 9, 3, 1], 8: [8, 4, 2, 6] }[b], ld = cyc[(k - 1) % 4];
      return G('math', 'arithmetic', 'What is the last digit of ' + b + sup(k) + '?', choices(ld, cyc.concat([0, 5]), ld), 'Last digits of powers of ' + b + ' repeat in a cycle of 4: ' + cyc.join(', ') + '. ' + k + ' ÷ 4 leaves remainder ' + (k % 4) + ', so the last digit is ' + ld + '.');
    case 8: a = -(rnd(9) + 2); b = -(rnd(6) + 2); k = (rnd(5) + 2) * 4; var ans8 = a * b - k / -4;
      return G('math', 'arithmetic', '(' + neg(a) + ') × (' + neg(b) + ') − ' + k + ' ÷ (−4) = ?', choices(ans8, [a * b + k / -4, -a * b - k / 4, a * b - k], ans8), 'Negative × negative = positive: ' + (a * b) + '. Then ' + k + ' ÷ (−4) = ' + neg(-k / 4) + ', and subtracting a negative adds: ' + (a * b) + ' + ' + (k / 4) + ' = ' + ans8 + '.');
    default: var x = (rnd(9000) + 1000) / 1000, pl = pick([['tenth', 1], ['hundredth', 2]]), r = x.toFixed(pl[1]);
      return G('math', 'arithmetic', 'Round ' + x.toFixed(3) + ' to the nearest ' + pl[0] + '.', choices(r, [(+r + Math.pow(10, -pl[1])).toFixed(pl[1]), (+r - Math.pow(10, -pl[1])).toFixed(pl[1]), x.toFixed(pl[1] === 1 ? 2 : 1)]), 'Look at the digit just after the ' + pl[0] + 's place: 5 or more rounds up, 4 or less stays. Answer: ' + r + '.');
  }
}
LESSONS.push({ id: 'number', sec: 'math', title: 'Number Sense', icon: '#', blurb: 'Divisibility, primes, GCF and LCM, order of operations, signed numbers and scientific notation.',
  sets: [{ name: 'Number sense', gen: genNumber }],
  html: card('Divisibility rules', H.table(['A number is divisible by…', 'if…', 'Example'], [
    ['2', 'the last digit is even', '3,58<b>6</b>'], ['3', 'the sum of its digits is divisible by 3', '471 → 4+7+1 = 12 ✓'], ['4', 'the last two digits are divisible by 4', '7,3<b>16</b> → 16 ✓'],
    ['5', 'it ends in 0 or 5', '1,24<b>5</b>'], ['6', 'it is divisible by both 2 and 3', '522 → even, 5+2+2 = 9 ✓'], ['8', 'the last three digits are divisible by 8', '5,<b>120</b> → 120 ÷ 8 = 15 ✓'],
    ['9', 'the sum of its digits is divisible by 9', '3,987 → 27 ✓'], ['10', 'it ends in 0', '4,93<b>0</b>'], ['11', 'alternating digit sum (+ − + …) is 0 or divisible by 11', '918,082 → 9−1+8−0+8−2 = 22 ✓']])) +
    card('Primes, factor trees, GCF and LCM', '<p>A <b>prime</b> has exactly two factors: 1 and itself (2, 3, 5, 7, 11, 13 …). 1 is <i>not</i> prime, and 2 is the only even prime. Break any number into primes with a factor tree:</p>' +
      '<div class="figs">' + fig(factorTree(), '72 = 2³ × 3²', 'Keep splitting until every branch ends in a prime (gold).') + fig(venn(), 'GCF and LCM with a Venn diagram', 'Shared primes → GCF. Everything in both circles → LCM.') + '</div>' +
      '<div class="fgrid">' + fbox('GCF', 'product of SHARED primes') + fbox('LCM', 'product of ALL primes (highest powers)') + fbox('Shortcut', 'GCF × LCM = a × b', 'gold') + fbox('Number of divisors', '2ᵃ3ᵇ5ᶜ → (a+1)(b+1)(c+1)', 'gold') + '</div>' +
      '<p class="small muted">Word clues: “largest equal groups / cut into the longest pieces” → GCF. “When will they happen together again” → LCM.</p>') +
    card('Order of operations (PEMDAS)', '<div class="fgrid">' + fbox('1. P', 'Parentheses ( ) [ ]') + fbox('2. E', 'Exponents and roots') + fbox('3. MD', 'Multiply / divide, left → right', 'gold') + fbox('4. AS', 'Add / subtract, left → right', 'gold') + '</div>' +
      '<div class="note">M and D are a tie: do whichever comes first from the left. 12 ÷ 3 × 2 = 4 × 2 = <b>8</b>, not 12 ÷ 6 = 2.</div>') +
    card('Signed numbers and scientific notation', '<div class="fgrid">' + fbox('(+)(+) and (−)(−)', 'positive') + fbox('(+)(−)', 'negative') + fbox('a − (−b)', 'a + b') + fbox('−3² vs (−3)²', '−9 vs 9', 'red') + '</div>' +
      '<p><b>Scientific notation</b> writes a number as <b>a × 10ⁿ</b> with 1 ≤ a < 10. Big numbers get a positive exponent (45,000 = 4.5 × 10⁴); small numbers a negative one (0.0032 = 3.2 × 10⁻³).</p>' +
      '<p><b>Last digit of powers</b> repeats every 4: 2 → 2, 4, 8, 6; 3 → 3, 9, 7, 1; 7 → 7, 9, 3, 1.</p>{{p0}}')
});

/* ====================================================================== */
/* FRACTIONS, RATIOS & PERCENT                                             */
/* ====================================================================== */
var EQ = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6], [1, 8], [3, 8], [5, 8], [7, 8], [1, 10], [3, 10], [7, 10], [9, 10], [1, 20], [3, 20], [1, 25], [7, 25], [1, 50]];
var SPECIALP = { '1/3': '33⅓%', '2/3': '66⅔%', '1/6': '16⅔%', '5/6': '83⅓%' }, SPECIALD = { '1/3': '0.333…', '2/3': '0.666…', '1/6': '0.1666…', '5/6': '0.8333…' };
function pctOf(e) { var k = e[0] + '/' + e[1]; return SPECIALP[k] || neg(Math.round(e[0] / e[1] * 10000) / 100) + '%'; }
function decOf(e) { var k = e[0] + '/' + e[1]; return SPECIALD[k] || neg(Math.round(e[0] / e[1] * 10000) / 10000); }
function near(e, n) { return EQ.filter(function (x) { return x !== e; }).sort(function (a, b) { return Math.abs(a[0] / a[1] - e[0] / e[1]) - Math.abs(b[0] / b[1] - e[0] / e[1]); }).slice(0, n); }
function genFrac(L) {
  var h = T.hardNow(L), e = pick(EQ), t = rnd(h ? 7 : 4), w;
  switch (t) {
    case 0: return G('math', 'arithmetic', 'Write ' + e[0] + '/' + e[1] + ' as a percent.', [pctOf(e)].concat(near(e, 3).map(pctOf)), 'Divide and multiply by 100: ' + e[0] + ' ÷ ' + e[1] + ' = ' + decOf(e) + ' → ' + pctOf(e) + '.');
    case 1: return G('math', 'arithmetic', 'Write ' + pctOf(e) + ' as a fraction in lowest terms.', [e[0] + '/' + e[1]].concat(near(e, 3).map(function (x) { return x[0] + '/' + x[1]; })), pctOf(e) + ' = ' + pctOf(e).replace('%', '') + '/100, which simplifies to ' + e[0] + '/' + e[1] + '.');
    case 2: return G('math', 'arithmetic', 'Which fraction equals ' + decOf(e) + '?', [e[0] + '/' + e[1]].concat(near(e, 3).map(function (x) { return x[0] + '/' + x[1]; })), decOf(e) + ' = ' + e[0] + '/' + e[1] + '. Memorize the common equivalents in the table.');
    case 3: var m = rnd(4) + 2; return G('math', 'arithmetic', 'Which fraction is equivalent to ' + (e[0] * m) + '/' + (e[1] * m) + '?', [e[0] + '/' + e[1], (e[0] * m) + '/' + e[1], e[0] + '/' + (e[1] * m), (e[0] + 1) + '/' + (e[1] + 1)], 'Divide the numerator and denominator by their GCF, ' + m + ': ' + (e[0] * m) + '/' + (e[1] * m) + ' = ' + e[0] + '/' + e[1] + '.');
    case 4: var set = sample(EQ, 4), vals = set.map(function (x) { return x[0] / x[1]; });
      if (new Set(vals).size < 4) set = [[3, 5], [5, 8], [7, 10], [2, 3]];
      var forms = set.map(function (x, i) { return [x, [x[0] + '/' + x[1], decOf(x), pctOf(x)][i % 3]]; }), best = forms.slice().sort(function (a, b) { return b[0][0] / b[0][1] - a[0][0] / a[0][1]; })[0];
      return G('math', 'arithmetic', 'Which is the GREATEST?', [best[1]].concat(forms.filter(function (f) { return f !== best; }).map(function (f) { return f[1]; })), 'Convert all to decimals: ' + forms.map(function (f) { return f[1] + ' = ' + (Math.round(f[0][0] / f[0][1] * 1000) / 1000); }).join(', ') + '. The largest is ' + best[1] + '.');
    case 5: w = rnd(3) + 1; var ee = pick([[1, 4], [3, 4], [1, 2], [3, 8], [1, 5], [2, 5], [1, 8]]), p = w * 100 + ee[0] / ee[1] * 100;
      return G('math', 'arithmetic', 'Write ' + w + ' ' + ee[0] + '/' + ee[1] + ' as a percent.', choices(neg(p) + '%', [neg(w + ee[0] / ee[1] * 100) + '%', neg(p / 10) + '%', neg(p + 100) + '%']), w + ' whole = ' + (w * 100) + '%, and ' + ee[0] + '/' + ee[1] + ' = ' + neg(ee[0] / ee[1] * 100) + '%. Total ' + neg(p) + '%. Percents above 100% are normal for mixed numbers.');
    default: var R = pick([['0.111…', '1/9'], ['0.222…', '2/9'], ['0.444…', '4/9'], ['0.1666…', '1/6'], ['0.8333…', '5/6'], ['0.2727…', '3/11'], ['0.0909…', '1/11'], ['0.0833…', '1/12'], ['0.333…', '1/3'], ['0.142857…', '1/7']]);
      var wr = ['1/9', '2/9', '4/9', '1/6', '5/6', '3/11', '1/11', '1/12', '1/3', '1/7', '3/10', '1/8'].filter(function (x) { return x !== R[1]; });
      return G('math', 'arithmetic', 'Which fraction equals the repeating decimal ' + R[0] + '?', [R[1]].concat(sample(wr, 3)), 'Useful facts: 0.111… = 1/9 (so 0.ddd… = d/9), 0.0909… = 1/11, 0.1666… = 1/6, 0.142857… = 1/7. So ' + R[0] + ' = ' + R[1] + '.');
  }
}
function genRatio(L) {
  var h = T.hardNow(L), a, b, c, k, t = rnd(h ? 8 : 4), tot;
  do { a = rnd(5) + 1; b = rnd(6) + 2; } while (gcd(a, b) !== 1 || a === b);
  switch (t) {
    case 0: k = rnd(8) + 2;
      if (h) { c = rnd(4) + 1; tot = (a + b + c) * k; return G('math', 'arithmetic', '₱' + tot + ' is shared among three friends in the ratio ' + a + ' : ' + b + ' : ' + c + '. How much does the second friend get?', choices('₱' + (b * k), ['₱' + (a * k), '₱' + (c * k), '₱' + Math.round(tot / 3)]), 'Total parts = ' + (a + b + c) + '. One part = ' + tot + ' ÷ ' + (a + b + c) + ' = ' + k + '. Second share = ' + b + ' × ' + k + ' = ₱' + (b * k) + '.'); }
      tot = (a + b) * k; return G('math', 'arithmetic', 'Divide ' + tot + ' in the ratio ' + a + ' : ' + b + '. What is the smaller part?', choices(Math.min(a, b) * k, [Math.max(a, b) * k, Math.round(tot / 2), Math.min(a, b) * k + k], Math.min(a, b) * k), a + ' + ' + b + ' = ' + (a + b) + ' parts. One part = ' + tot + ' ÷ ' + (a + b) + ' = ' + k + '. Smaller part = ' + Math.min(a, b) + ' × ' + k + ' = ' + (Math.min(a, b) * k) + '.');
    case 1: k = rnd(8) + 3; return G('math', 'arithmetic', 'Simplify the ratio ' + (a * k) + ' : ' + (b * k) + '.', [a + ' : ' + b, b + ' : ' + a, (a * k / (k > 3 ? 1 : 1)) + ' : ' + (b * k - 1), (a + 1) + ' : ' + (b + 1)], 'Divide both terms by their GCF, ' + k + '.');
    case 2: k = rnd(6) + 2; c = b * k; return G('math', 'arithmetic', 'Solve the proportion: ' + a + '/' + b + ' = <i>x</i>/' + c, choices(a * k, [a + c - b, c - a, a * k + 1], a * k), 'Cross-multiply: ' + b + '<i>x</i> = ' + a + ' × ' + c + ' = ' + (a * c) + ', so <i>x</i> = ' + (a * k) + '. (Or notice ' + b + ' × ' + k + ' = ' + c + ', so multiply the top by ' + k + ' too.)');
    case 3: return G('math', 'arithmetic', 'The ratio of boys to girls in a club is ' + a + ' : ' + b + '. What fraction of the club are boys?', [fr(a, a + b), fr(a, b), fr(b, a + b), fr(a, a + b + 1)].filter(function (v, i, s) { return s.indexOf(v) === i; }).concat(['1/2']).slice(0, 4), 'Boys are ' + a + ' out of every ' + a + ' + ' + b + ' = ' + (a + b) + ' members, so the fraction is ' + fr(a, a + b) + '. (' + a + '/' + b + ' compares boys to girls, not boys to everyone.)');
    case 4: var sc = pick([2, 5, 10, 25, 50]), d = (rnd(12) + 3) / 2; return G('math', 'arithmetic', 'On a map, 1 cm represents ' + sc + ' km. Two towns are ' + d + ' cm apart on the map. What is the actual distance?', choices(neg(d * sc) + ' km', [neg(d + sc) + ' km', neg(d * sc / 10) + ' km', neg(d * sc * 2) + ' km']), 'Multiply: ' + d + ' × ' + sc + ' = ' + neg(d * sc) + ' km.');
    case 5: k = rnd(5) + 2; var add = k * (b - a); if (a > b) { var tmp = a; a = b; b = tmp; add = k * (b - a); }
      return G('math', 'arithmetic', 'In a class the ratio of boys to girls is ' + a + ' : ' + b + '. After ' + add + ' more boys join, the numbers of boys and girls become equal. How many students were there originally?', choices((a + b) * k, [(a + b) * k + add, b * k, add * 2], (a + b) * k), 'Let boys = ' + a + 'k and girls = ' + b + 'k. Then ' + a + 'k + ' + add + ' = ' + b + 'k → ' + (b - a) + 'k = ' + add + ' → k = ' + k + '. Original total = ' + (a + b) + 'k = ' + ((a + b) * k) + '.');
    case 6: var p = rnd(4) + 1, q = p + rnd(3) + 1, r = rnd(4) + 2, s = rnd(4) + 1, A = p * r, C = q * s, g = gcd(A, C);
      return G('math', 'arithmetic', 'If a : b = ' + p + ' : ' + q + ' and b : c = ' + r + ' : ' + s + ', what is a : c?', choices((A / g) + ' : ' + (C / g), [p + ' : ' + s, (p * s) + ' : ' + (q * r), (p + r) + ' : ' + (q + s)]), 'Make the b-terms equal: a : b = ' + (p * r) + ' : ' + (q * r) + ' and b : c = ' + (q * r) + ' : ' + (q * s) + '. So a : c = ' + A + ' : ' + C + (g > 1 ? ' = ' + (A / g) + ' : ' + (C / g) : '') + '.');
    default: var w1 = pick([4, 6, 8, 10, 12]), d1 = pick([6, 9, 12, 15]), w2 = pick([2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18]);
      while ((w1 * d1) % w2 || w2 === w1) w2 = pick([2, 3, 4, 6, 12, 18, 36]);
      return G('math', 'arithmetic', w1 + ' painters can finish a job in ' + d1 + ' days. How many days would ' + w2 + ' painters need at the same rate?', choices(w1 * d1 / w2, [d1 * w2 / w1, d1 + w1 - w2, w1 * d1], w1 * d1 / w2), 'This is INVERSE variation: total work = ' + w1 + ' × ' + d1 + ' = ' + (w1 * d1) + ' painter-days. ' + (w1 * d1) + ' ÷ ' + w2 + ' = ' + neg(w1 * d1 / w2) + ' days.');
  }
}
function genPercent(L) {
  var h = T.hardNow(L), t = rnd(h ? 7 : 4), a, b, p, n, o;
  switch (t) {
    case 0: p = pick([5, 10, 15, 20, 25, 30, 40, 60, 75]); n = (rnd(15) + 2) * 20; return G('math', 'arithmetic', 'What is ' + p + '% of ' + n + '?', numOpts(p * n / 100, [5, -5, 10, -10, n / 10]), p + '% of ' + n + ' = ' + p + '/100 × ' + n + ' = ' + (p * n / 100) + '.');
    case 1: b = pick([20, 40, 50, 80, 200, 250, 400]); p = pick([5, 10, 15, 20, 25, 30, 40, 45, 60, 75]); a = p * b / 100;
      return G('math', 'arithmetic', a + ' is what percent of ' + b + '?', choices(p + '%', [(b / a) + '%', (p / 2) + '%', (p + 10) + '%']), 'Percent = part ÷ whole × 100 = ' + a + ' ÷ ' + b + ' × 100 = ' + p + '%.');
    case 2: o = pick([40, 50, 80, 120, 200, 250, 400, 500]); p = pick([10, 20, 25, 30, 40, 50, 60, 75]); var up = rnd(2) === 1; n = o * (1 + (up ? p : -p) / 100);
      return G('math', 'arithmetic', 'A price changes from ₱' + o + ' to ₱' + n + '. What is the percent ' + (up ? 'increase' : 'decrease') + '?', choices(p + '%', [neg(Math.round(Math.abs(n - o) / n * 1000) / 10) + '%', Math.abs(n - o) + '%', (100 - p) + '%']), 'Percent change = change ÷ ORIGINAL × 100 = ' + Math.abs(n - o) + ' ÷ ' + o + ' × 100 = ' + p + '%. Dividing by the new price is the common error.');
    case 3: o = pick([400, 500, 800, 1200, 1500, 2000]); p = pick([10, 15, 20, 25, 30]);
      return G('math', 'arithmetic', 'A ₱' + o + ' bag is on sale at ' + p + '% off. What is the sale price?', choices('₱' + (o * (100 - p) / 100), ['₱' + (o * p / 100), '₱' + (o - p), '₱' + (o * (100 + p) / 100)]), 'Sale price = ' + (100 - p) + '% of ' + o + ' = ₱' + (o * (100 - p) / 100) + '. (₱' + (o * p / 100) + ' is the discount.)');
    case 4: var C = pick([[20, 20, -4], [10, 10, -1], [25, 20, 0], [50, 20, 20], [20, 25, -10], [30, 10, 17], [10, 20, -12], [40, 50, -30]]);
      return G('math', 'arithmetic', 'A price is increased by ' + C[0] + '% and then decreased by ' + C[1] + '%. What is the overall change?', choices(C[2] === 0 ? 'No change' : (C[2] > 0 ? C[2] + '% increase' : (-C[2]) + '% decrease'), [(C[0] - C[1] === 0 ? 'No change' : Math.abs(C[0] - C[1]) + '% ' + (C[0] > C[1] ? 'increase' : 'decrease')), (Math.abs(C[2]) + 2) + '% decrease', (C[0] + C[1]) + '% decrease']),
        'Use multipliers: ' + (1 + C[0] / 100) + ' × ' + (1 - C[1] / 100) + ' = ' + (Math.round((1 + C[0] / 100) * (1 - C[1] / 100) * 100) / 100) + '. Compare with 1: ' + (C[2] === 0 ? 'no change.' : Math.abs(C[2]) + '% ' + (C[2] > 0 ? 'increase.' : 'decrease.')) + ' You cannot simply add and subtract the percents.');
    case 5: o = pick([400, 500, 600, 800, 1200, 1500]); p = pick([10, 20, 25, 50]); n = o * (100 + p) / 100;
      return G('math', 'arithmetic', 'After a ' + p + '% increase, a phone costs ₱' + n + '. What was the original price?', choices('₱' + o, ['₱' + Math.round(n * (100 - p) / 100), '₱' + (n - p), '₱' + Math.round(n / (1 + p / 50))]), 'New = ' + (100 + p) + '% of original, so original = ' + n + ' ÷ ' + (1 + p / 100) + ' = ₱' + o + '. Taking ' + p + '% off the new price gives the wrong answer ₱' + Math.round(n * (100 - p) / 100) + '.');
    default: a = pick([10, 20, 25, 50]); b = pick([20, 30, 40, 60]); n = pick([200, 400, 500, 1000]);
      return G('math', 'arithmetic', 'What is ' + a + '% of ' + b + '% of ' + n + '?', numOpts(a * b * n / 10000, [5, -5, 10, -10, 20]), b + '% of ' + n + ' = ' + (b * n / 100) + '. Then ' + a + '% of that = ' + (a * b * n / 10000) + '.');
  }
}
function pieWidget() {
  return '<div class="widget" id="pieW"><b>🥧 Cut the pie</b><p class="small muted">Choose how many equal pieces to cut, then tap pieces to take them out. Watch the same amount written four ways.</p>' +
    '<div class="wrow"><label>Pieces: <b id="pieN">8</b><input type="range" id="pieRange" min="1" max="12" value="8"></label></div>' +
    '<div id="pieSvg"></div><div class="wout" id="pieOut"></div><div class="row" style="margin-top:8px"><button class="btn sm alt" id="pieAll">Take all</button><button class="btn sm alt" id="pieNone">Put back</button><button class="btn sm alt" id="pieHalf">Show 1/2</button><button class="btn sm alt" id="pieQ">Show 3/4</button></div></div>';
}
function pieInit(root) {
  var n = 8, on = [true, true, true, false, false, false, false, false];
  function draw() {
    var s = '', cx = 110, cy = 105, r = 85, k = on.filter(Boolean).length;
    for (var i = 0; i < n; i++) {
      var a1 = -90 + 360 * i / n, a2 = -90 + 360 * (i + 1) / n, mid = (a1 + a2) / 2 * Math.PI / 180, off = on[i] ? 10 : 0;
      var dx = (off * Math.cos(mid)).toFixed(1), dy = (off * Math.sin(mid)).toFixed(1);
      var p1 = [cx + r * Math.cos(a1 * Math.PI / 180), cy + r * Math.sin(a1 * Math.PI / 180)], p2 = [cx + r * Math.cos(a2 * Math.PI / 180), cy + r * Math.sin(a2 * Math.PI / 180)];
      var d = n === 1 ? 'M' + cx + ' ' + (cy - r) + 'a' + r + ' ' + r + ' 0 1 1 0 ' + (2 * r) + 'a' + r + ' ' + r + ' 0 1 1 0 ' + (-2 * r) + 'z' : 'M' + cx + ' ' + cy + 'L' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + 'A' + r + ' ' + r + ' 0 ' + (360 / n > 180 ? 1 : 0) + ' 1 ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) + 'z';
      s += '<path d="' + d + '" class="slice ' + (on[i] ? 'fg' : 'fa') + '" data-i="' + i + '" transform="translate(' + dx + ' ' + dy + ')" style="fill-opacity:' + (on[i] ? '.85' : '.15') + '"/>';
    }
    var bw = 200 / n, bar = '';
    for (i = 0; i < n; i++) bar += '<rect x="' + (10 + i * bw).toFixed(1) + '" y="215" width="' + bw.toFixed(1) + '" height="20" class="' + (on[i] ? 'fg' : 'fa') + '" style="fill-opacity:' + (on[i] ? '.85' : '.12') + '"/>';
    root.querySelector('#pieSvg').innerHTML = dg(220, 245, s + bar + txt(110, 210, 'same amount as a fraction bar', 'sm'), 'pie with ' + k + ' of ' + n + ' pieces taken', 'max-width:260px');
    var g = gcd(k, n), simp = k === 0 ? '0' : fr(k, n), dec = Math.round(k / n * 1000) / 1000, pc = Math.round(k / n * 1000) / 10;
    var exact = (n / g) === 3 || (n / g) === 6 || (n / g) === 7 || (n / g) === 9 || (n / g) === 11 || (n / g) === 12;
    root.querySelector('#pieOut').innerHTML = '<div><b>' + k + '/' + n + '</b><span>fraction' + (g > 1 && k ? ' = ' + simp : '') + '</span></div><div><b>' + (exact && k && k !== n ? '≈' : '') + dec + '</b><span>decimal</span></div><div><b>' + (exact && k && k !== n ? '≈' : '') + pc + '%</b><span>percent</span></div><div><b>' + (k / g) + ' : ' + ((n - k) / g) + '</b><span>ratio taken : left</span></div><div><b>' + Math.round(k / n * 3600) / 10 + '°</b><span>of the 360° circle</span></div>';
    root.querySelector('#pieN').textContent = n;
  }
  root.querySelector('#pieSvg').addEventListener('click', function (e) { var i = e.target.getAttribute && e.target.getAttribute('data-i'); if (i != null) { on[+i] = !on[+i]; draw(); } });
  root.querySelector('#pieRange').addEventListener('input', function (e) { n = +e.target.value; on = []; for (var i = 0; i < n; i++) on.push(i < Math.round(n / 3)); draw(); });
  function setFrac(a, b) { n = b; root.querySelector('#pieRange').value = b; on = []; for (var i = 0; i < n; i++) on.push(i < a); draw(); }
  root.querySelector('#pieAll').onclick = function () { on = on.map(function () { return true; }); draw(); };
  root.querySelector('#pieNone').onclick = function () { on = on.map(function () { return false; }); draw(); };
  root.querySelector('#pieHalf').onclick = function () { setFrac(4, 8); };
  root.querySelector('#pieQ').onclick = function () { setFrac(3, 4); };
  draw();
}
function barModel() {
  var s = '', u = 26;
  for (var i = 0; i < 3; i++) s += '<rect x="' + (70 + i * u) + '" y="15" width="' + u + '" height="26" class="fb"/>' + txt(70 + i * u + u / 2, 33, '5', 'sm');
  for (i = 0; i < 5; i++) s += '<rect x="' + (70 + i * u) + '" y="55" width="' + u + '" height="26" class="fg"/>' + txt(70 + i * u + u / 2, 73, '5', 'sm');
  s += txt(62, 33, 'Boys', 'tb', 'end') + txt(62, 73, 'Girls', 'tg', 'end') + txt(156, 33, '= 15', 'tb', 'start') + txt(208, 73, '= 25', 'tg', 'start') + '<path d="M70 92h130" class="dash"/>' + txt(135, 108, '8 equal parts = 40 students → 1 part = 5', 'sm');
  return dg(260, 115, s, 'bar model for the ratio 3 to 5');
}
LESSONS.push({ id: 'fractions', sec: 'math', title: 'Fractions, Ratios & Percent', icon: '%', blurb: 'One amount, four names: fraction, decimal, percent and ratio — with a pie you can cut.',
  sets: [{ name: 'Fraction ↔ decimal ↔ percent', gen: genFrac }, { name: 'Ratios & proportions', gen: genRatio }, { name: 'Percent problems', gen: genPercent }],
  html: function () {
    return card('One amount, many names', pieWidget() + '<p>A <b>fraction</b> a/b means a parts out of b equal parts. A <b>decimal</b> is a ÷ b. A <b>percent</b> is “per hundred”: multiply the decimal by 100. A <b>ratio</b> a : b compares two parts with each other (taken : left), while a fraction compares a part with the whole.</p>' +
      H.table(['Fraction', 'Decimal', 'Percent', 'Fraction', 'Decimal', 'Percent'], [
        ['1/2', '0.5', '50%', '1/8', '0.125', '12.5%'], ['1/3', '0.333…', '33⅓%', '3/8', '0.375', '37.5%'], ['2/3', '0.666…', '66⅔%', '5/8', '0.625', '62.5%'], ['1/4', '0.25', '25%', '7/8', '0.875', '87.5%'],
        ['3/4', '0.75', '75%', '1/10', '0.1', '10%'], ['1/5', '0.2', '20%', '1/20', '0.05', '5%'], ['2/5', '0.4', '40%', '1/25', '0.04', '4%'], ['1/6', '0.1666…', '16⅔%', '1/9', '0.111…', '11.1%']]) +
      '<div class="fgrid">' + fbox('Fraction → decimal', 'divide top by bottom') + fbox('Decimal → percent', '× 100 (move point 2 right)') + fbox('Percent → fraction', 'put over 100, simplify') + fbox('Add/subtract fractions', 'common denominator first', 'red') + fbox('Multiply fractions', 'top × top, bottom × bottom', 'gold') + fbox('Divide fractions', 'keep, change, flip', 'gold') + '</div>{{p0}}') +
    card('Ratios and proportions', '<p>A ratio splits a total into equal <b>parts</b>. Example: boys to girls = 3 : 5 in a class of 40.</p>' + barModel() +
      '<div class="fgrid">' + fbox('Share of a total', 'part = (its ratio ÷ sum of ratios) × total') + fbox('Proportion', 'a/b = c/d ⇔ ad = bc') + fbox('Direct variation', 'y = kx (both grow)', 'gold') + fbox('Inverse variation', 'xy = k (more workers, fewer days)', 'gold') + '</div>' +
      '<div class="note">Combining ratios: if a : b = 2 : 3 and b : c = 4 : 5, rewrite so <b>b</b> matches (12): a : b : c = 8 : 12 : 15.</div>{{p1}}') +
    card('Percent problems', '<div class="fgrid">' + fbox('Part', '% × whole') + fbox('Percent', 'part ÷ whole × 100') + fbox('Whole', 'part ÷ %') + fbox('% change', '(new − old) ÷ OLD × 100', 'gold') + fbox('Discount d%', 'price × (1 − d)', 'gold') + fbox('Successive changes', 'multiply the factors', 'red') + '</div>' +
      '<p><b>Mental shortcuts:</b> 10% = move the decimal one place left; 5% = half of 10%; 1% = move two places; 25% = ÷4; 50% = ÷2. Also, a% of b = b% of a (8% of 50 = 50% of 8 = 4).</p>' +
      '<div class="note warn"><b>Trap:</b> +20% then −20% is NOT zero change. 100 → 120 → 96, a 4% decrease. Multiply: 1.2 × 0.8 = 0.96.</div>{{p2}}');
  },
  init: pieInit
});

/* ====================================================================== */
/* ALGEBRA                                                                 */
/* ====================================================================== */
function genAlgebra(L) {
  var h = T.hardNow(L), t = rnd(h ? 10 : 6), a, b, c, x, y, p, q;
  switch (t) {
    case 0: x = rnd(15) - 5; a = rnd(6) + 2; b = rnd(15) + 1; c = a * x + b;
      return G('math', 'algebra', 'Solve: ' + a + '<i>x</i> + ' + b + ' = ' + neg(c), numOpts(x, [1, -1, 2, -2, -2 * x], true), 'Subtract ' + b + ': ' + a + '<i>x</i> = ' + neg(c - b) + '. Divide by ' + a + ': <i>x</i> = ' + neg(x) + '.');
    case 1: a = rnd(6) + 2; b = rnd(6) + 2; var k = pick(['mul', 'pow', 'div']);
      if (k === 'mul') return G('math', 'algebra', 'Simplify: <i>x</i>' + sup(a) + ' · <i>x</i>' + sup(b), ['<i>x</i>' + sup(a + b), '<i>x</i>' + sup(a * b), '2<i>x</i>' + sup(a + b), '<i>x</i>' + sup(Math.abs(a - b) || 1)], 'Same base, multiplying → ADD the exponents: ' + a + ' + ' + b + ' = ' + (a + b) + '.');
      if (k === 'pow') return G('math', 'algebra', 'Simplify: (<i>x</i>' + sup(a) + ')' + sup(b), ['<i>x</i>' + sup(a * b), '<i>x</i>' + sup(a + b), '<i>x</i>' + sup(Math.pow(a, b) > 999 ? a + b + 1 : Math.pow(a, b)), b + '<i>x</i>' + sup(a)], 'Power of a power → MULTIPLY the exponents: ' + a + ' × ' + b + ' = ' + (a * b) + '.');
      a += b; return G('math', 'algebra', 'Simplify: <i>x</i>' + sup(a) + ' ÷ <i>x</i>' + sup(b), ['<i>x</i>' + sup(a - b), '<i>x</i>' + sup(a + b), '<i>x</i>' + sup(Math.round(a / b * 10) / 10 === a - b ? a - b + 1 : Math.round(a / b * 10) / 10), '1'], 'Same base, dividing → SUBTRACT the exponents: ' + a + ' − ' + b + ' = ' + (a - b) + '.');
    case 2: var E = pick(h ? [['27' + sup('2/3'), '9', ['18', '6', '81'], 'Cube root of 27 is 3; then square: 3² = 9.'], ['8' + sup('−2/3'), '1/4', ['−4', '4', '−1/4'], 'Cube root of 8 is 2; squared is 4; the negative exponent flips it: 1/4.'], ['16' + sup('3/4'), '8', ['12', '4', '64'], 'Fourth root of 16 is 2; 2³ = 8.'], ['(−2)' + sup('5'), '−32', ['32', '−10', '10'], 'An odd power of a negative number is negative: −32.']] :
      [['2' + sup('−3'), '1/8', ['−8', '−6', '1/6'], 'A negative exponent means a reciprocal: 2⁻³ = 1/2³ = 1/8.'], ['5' + sup('0'), '1', ['0', '5', '50'], 'Any nonzero number to the power 0 equals 1.'], ['(−3)' + sup('2'), '9', ['−9', '6', '−6'], 'The negative is inside the parentheses, so it is squared too: (−3)(−3) = 9.'], ['−3' + sup('2'), '−9', ['9', '6', '−6'], 'Only the 3 is squared: −(3²) = −9.'], ['16' + sup('1/2'), '4', ['8', '32', '1/4'], 'An exponent of 1/2 means square root: √16 = 4.']]);
      return G('math', 'algebra', 'Evaluate: ' + E[0], [E[1]].concat(E[2]), E[3]);
    case 3: x = rnd(9) - 4; y = rnd(9) - 4; var dx = pick([1, 2, 3, 4, -2]), m = pick([1, 2, 3, -1, -2, -3]), x2 = x + dx, y2 = y + m * dx;
      return G('math', 'algebra', 'What is the slope of the line through (' + neg(x) + ', ' + neg(y) + ') and (' + neg(x2) + ', ' + neg(y2) + ')?', choices(m, [-m, fr(dx, m * dx), m * 2], m), 'slope = (y₂ − y₁) ÷ (x₂ − x₁) = (' + neg(y2) + ' − ' + neg(y) + ') ÷ (' + neg(x2) + ' − ' + neg(x) + ') = ' + neg(m * dx) + ' ÷ ' + neg(dx) + ' = ' + neg(m) + '.');
    case 4: do { p = rnd(13) - 6; q = rnd(13) - 6; } while (!p || !q || p === q || p === -q);
      var bb = -(p + q), cc = p * q, poly = '<i>x</i>²' + (bb ? T.sgn(bb) + '<i>x</i>' : '') + T.sgn(cc);
      return G('math', 'algebra', 'Solve: ' + poly + ' = 0', [neg(p) + ' and ' + neg(q), neg(-p) + ' and ' + neg(-q), neg(p) + ' and ' + neg(-q), neg(-p) + ' and ' + neg(q)], 'Find two numbers that multiply to ' + neg(cc) + ' and add to ' + neg(bb) + ': ' + neg(-p) + ' and ' + neg(-q) + '. So (<i>x</i>' + T.sgn(-p) + ')(<i>x</i>' + T.sgn(-q) + ') = 0, giving <i>x</i> = ' + neg(p) + ' or ' + neg(q) + '.');
    case 5: x = rnd(12) + 2; y = rnd(x - 1) + 1; return G('math', 'algebra', 'If <i>x</i> + <i>y</i> = ' + (x + y) + ' and <i>x</i> − <i>y</i> = ' + (x - y) + ', what is <i>x</i>?', numOpts(x, [-1, 1, y - x, 2]), 'Add the equations: 2<i>x</i> = ' + (2 * x) + ', so <i>x</i> = ' + x + ' (and <i>y</i> = ' + y + ').');
    case 6: a = rnd(9) - 4 || 3; b = rnd(9) - 4 || -2; var mid = a + b, end = a * b, f = function (u, v) { return '<i>x</i>²' + (u ? T.sgn(u) + '<i>x</i>' : '') + (v ? T.sgn(v) : ''); };
      return G('math', 'algebra', 'Expand: (<i>x</i>' + T.sgn(a) + ')(<i>x</i>' + T.sgn(b) + ')', [f(mid, end), f(mid, -end || 1), f(end, mid || 1), f(-mid || 2, end)].filter(function (v, i, s) { return s.indexOf(v) === i; }).concat([f(mid + 1, end), f(mid, end + 1)]).slice(0, 4), 'FOIL: <i>x</i>·<i>x</i> = <i>x</i>²; outer + inner = (' + neg(a) + ' + ' + neg(b) + ')<i>x</i> = ' + neg(mid) + '<i>x</i>; last = (' + neg(a) + ')(' + neg(b) + ') = ' + neg(end) + '.');
    case 7: if (rnd(2)) { a = pick([101, 102, 98, 51, 49, 103, 997]); b = a > 100 ? 200 - a : a < 60 ? 100 - a : 2000 - a; var cen = (a + b) / 2, df = Math.abs(a - cen);
        return G('math', 'algebra', 'Use a special product to compute ' + a + ' × ' + b + '.', choices(a * b, [cen * cen + df * df, a * b + 1, a * b - 100], a * b), '(' + cen + ' + ' + df + ')(' + cen + ' − ' + df + ') = ' + cen + '² − ' + df + '² = ' + (cen * cen) + ' − ' + (df * df) + ' = ' + (a * b) + '.'); }
      x = rnd(8) + 5; y = rnd(x - 2) + 1; return G('math', 'algebra', 'If <i>x</i>² − <i>y</i>² = ' + (x * x - y * y) + ' and <i>x</i> + <i>y</i> = ' + (x + y) + ', what is <i>x</i> − <i>y</i>?', numOpts(x - y, [1, -1, 2, x + y - (x - y)]), '<i>x</i>² − <i>y</i>² = (<i>x</i> + <i>y</i>)(<i>x</i> − <i>y</i>). So ' + (x * x - y * y) + ' = ' + (x + y) + '(<i>x</i> − <i>y</i>) and <i>x</i> − <i>y</i> = ' + (x - y) + '.');
    case 8: a = rnd(3) + 1; b = rnd(11) - 5; c = rnd(9) - 4; var D = b * b - 4 * a * c, kind = D > 0 ? 'two distinct real roots' : D === 0 ? 'exactly one real root' : 'no real roots';
      return G('math', 'algebra', 'How many real roots does ' + (a > 1 ? a : '') + '<i>x</i>²' + (b ? T.sgn(b) + '<i>x</i>' : '') + (c ? T.sgn(c) : '') + ' = 0 have?', [kind].concat(['two distinct real roots', 'exactly one real root', 'no real roots', 'infinitely many roots'].filter(function (s) { return s !== kind; })).slice(0, 4), 'Discriminant b² − 4ac = (' + neg(b) + ')² − 4(' + a + ')(' + neg(c) + ') = ' + neg(D) + '. Positive → two roots; zero → one root; negative → no real roots.');
    default: var s = rnd(30) + 30, cnt = pick([3, 3, 4]); var first = Math.round((s - cnt * (cnt - 1) / 2) / cnt); s = first * cnt + cnt * (cnt - 1) / 2;
      return G('math', 'algebra', 'The sum of ' + (cnt === 3 ? 'three' : 'four') + ' consecutive integers is ' + s + '. What is the smallest?', numOpts(first, [1, -1, 2, -2]), 'Let them be n, n+1' + (cnt === 4 ? ', n+2, n+3' : ', n+2') + '. Sum = ' + cnt + 'n + ' + (cnt * (cnt - 1) / 2) + ' = ' + s + ' → n = ' + first + '.');
  }
}
function lineWidget() {
  return '<div class="widget" id="lineW"><b>📈 Play with y = mx + b</b><div class="wrow"><label>slope m = <b id="mOut">1</b><input type="range" id="mR" min="-3" max="3" step="0.5" value="1"></label><label>y-intercept b = <b id="bOut">2</b><input type="range" id="bR" min="-5" max="5" step="1" value="2"></label></div><div id="lineSvg"></div><p class="small" id="lineTxt"></p></div>';
}
function lineInit(root) {
  var mR = root.querySelector('#mR'), bR = root.querySelector('#bR');
  function draw() {
    var m = +mR.value, b = +bR.value, u = 16, O = 120, s = '';
    for (var i = -7; i <= 7; i++) s += line(O + i * u, 8, O + i * u, 232, 'lt') + line(8, O + i * u, 232, O + i * u, 'lt');
    s += line(8, O, 232, O, 'ln') + line(O, 8, O, 232, 'ln') + txt(228, O - 6, 'x', 'sm') + txt(O + 8, 16, 'y', 'sm');
    var X1 = -7.5, X2 = 7.5, y1 = m * X1 + b, y2 = m * X2 + b;
    s += '<clipPath id="clp"><rect x="8" y="8" width="224" height="224"/></clipPath><g clip-path="url(#clp)">' + line(O + X1 * u, O - y1 * u, O + X2 * u, O - y2 * u, 'ac') + '</g>';
    s += '<circle cx="' + O + '" cy="' + (O - b * u) + '" r="5" class="fgo"/>';
    if (m) { s += '<path d="M' + O + ' ' + (O - b * u) + 'h' + (2 * u) + 'v' + (-2 * m * u) + '" class="go" stroke-dasharray="4 3"/>' + txt(O + u, O - b * u + 14, 'run 2', 'sm') + txt(O + 2 * u + 4, O - b * u - m * u, 'rise ' + neg(2 * m), 'sm tg', 'start'); }
    root.querySelector('#lineSvg').innerHTML = dg(240, 240, s, 'line graph', 'max-width:280px');
    root.querySelector('#mOut').textContent = neg(m); root.querySelector('#bOut').textContent = neg(b);
    root.querySelector('#lineTxt').innerHTML = '<b>y = ' + (m === 0 ? '' : (m === 1 ? '' : m === -1 ? '−' : neg(m)) + 'x') + (b ? (m ? T.sgn(b) : neg(b)) : (m ? '' : '0')) + '</b> — ' + (m > 0 ? 'rises to the right' : m < 0 ? 'falls to the right' : 'horizontal (slope 0)') + '; crosses the y-axis at (0, ' + neg(b) + ')' + (m ? '; x-intercept at (' + neg(Math.round(-b / m * 100) / 100) + ', 0)' : '') + '.';
  }
  mR.oninput = bR.oninput = draw; draw();
}
LESSONS.push({ id: 'algebra', sec: 'math', title: 'Algebra Essentials', icon: 'x²', blurb: 'Laws of exponents, special products, factoring, the quadratic formula and lines on a graph.',
  sets: [{ name: 'Algebra', gen: genAlgebra }],
  html: card('Laws of exponents', '<div class="fgrid">' + fbox('Product', 'aᵐ · aⁿ = aᵐ⁺ⁿ') + fbox('Quotient', 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ') + fbox('Power of a power', '(aᵐ)ⁿ = aᵐⁿ') + fbox('Zero exponent', 'a⁰ = 1') + fbox('Negative exponent', 'a⁻ⁿ = 1/aⁿ', 'gold') + fbox('Fractional exponent', 'a^(m/n) = (ⁿ√a)ᵐ', 'gold') + fbox('Product power', '(ab)ⁿ = aⁿbⁿ') + fbox('Careful!', '−3² = −9 but (−3)² = 9', 'red') + '</div>') +
    card('Special products and factoring', '<div class="fgrid">' + fbox('FOIL', '(x + a)(x + b) = x² + (a+b)x + ab') + fbox('Square of a sum', '(a + b)² = a² + 2ab + b²') + fbox('Square of a difference', '(a − b)² = a² − 2ab + b²') + fbox('Difference of squares', 'a² − b² = (a + b)(a − b)', 'gold') + fbox('Sum of cubes', 'a³ + b³ = (a + b)(a² − ab + b²)') + fbox('Difference of cubes', 'a³ − b³ = (a − b)(a² + ab + b²)') + '</div>' +
      '<p><b>Factoring x² + bx + c:</b> find two numbers that MULTIPLY to c and ADD to b. x² − 5x + 6 → −2 and −3 → (x − 2)(x − 3).</p><div class="note">Mental trick: 49 × 51 = (50 − 1)(50 + 1) = 2500 − 1 = 2499.</div>') +
    card('Quadratic equations', '<div class="fgrid">' + fbox('Quadratic formula', 'x = [−b ± √(b² − 4ac)] ÷ 2a') + fbox('Discriminant D', 'b² − 4ac', 'gold') + fbox('Sum of roots', '−b/a') + fbox('Product of roots', 'c/a') + '</div>' +
      H.table(['D = b² − 4ac', 'Roots'], [['D > 0', 'two different real roots'], ['D = 0', 'one real (repeated) root'], ['D < 0', 'no real roots']])) +
    card('Lines and slope', lineWidget() + '<div class="fgrid">' + fbox('Slope', 'm = (y₂ − y₁)/(x₂ − x₁) = rise/run') + fbox('Slope-intercept', 'y = mx + b') + fbox('Point-slope', 'y − y₁ = m(x − x₁)') + fbox('Parallel lines', 'same slope', 'gold') + fbox('Perpendicular lines', 'slopes multiply to −1', 'gold') + fbox('Distance', '√[(x₂−x₁)² + (y₂−y₁)²]') + fbox('Midpoint', '((x₁+x₂)/2, (y₁+y₂)/2)') + '</div>{{p0}}'),
  init: lineInit
});

/* ====================================================================== */
/* GEOMETRY                                                                */
/* ====================================================================== */
function genArea(L) {
  var h = T.hardNow(L), t = rnd(h ? 9 : 6), a, b, c, s;
  switch (t) {
    case 0: s = rnd(12) + 3; if (rnd(2)) return G('math', 'geometry', 'Find the area of the square.' + qfig(shapeSvg('square', { s: s + ' cm' })), choices(s * s + ' cm²', [4 * s + ' cm²', 2 * s + ' cm²', (s * s + s) + ' cm²']), 'A = s² = ' + s + ' × ' + s + ' = ' + (s * s) + ' cm².');
      return G('math', 'geometry', 'Find the perimeter of the square.' + qfig(shapeSvg('square', { s: s + ' cm' })), choices(4 * s + ' cm', [s * s + ' cm', 2 * s + ' cm', 3 * s + ' cm']), 'P = 4s = 4 × ' + s + ' = ' + (4 * s) + ' cm.');
    case 1: a = rnd(12) + 5; b = rnd(a - 2) + 2; if (rnd(2)) return G('math', 'geometry', 'Find the area of the rectangle.' + qfig(shapeSvg('rect', { l: a + ' m', w: b + ' m' })), choices(a * b + ' m²', [2 * (a + b) + ' m²', (a + b) + ' m²', a * b * 2 + ' m²']), 'A = l × w = ' + a + ' × ' + b + ' = ' + (a * b) + ' m².');
      return G('math', 'geometry', 'Find the perimeter of the rectangle.' + qfig(shapeSvg('rect', { l: a + ' m', w: b + ' m' })), choices(2 * (a + b) + ' m', [a * b + ' m', (a + b) + ' m', (2 * a + b) + ' m']), 'P = 2(l + w) = 2(' + a + ' + ' + b + ') = ' + (2 * (a + b)) + ' m.');
    case 2: a = (rnd(8) + 2) * 2; b = rnd(10) + 3; return G('math', 'geometry', 'Find the area of the triangle.' + qfig(shapeSvg('tri', { b: a + ' cm', h: b + ' cm' })), choices(a * b / 2 + ' cm²', [a * b + ' cm²', (a + b) + ' cm²', a * b / 4 + ' cm²']), 'A = ½ × base × height = ½ × ' + a + ' × ' + b + ' = ' + (a * b / 2) + ' cm². Forgetting the ½ gives ' + (a * b) + '.');
    case 3: a = rnd(10) + 4; b = rnd(8) + 3; return G('math', 'geometry', 'Find the area of the parallelogram.' + qfig(shapeSvg('para', { b: a + ' cm', h: b + ' cm' })), choices(a * b + ' cm²', [a * b / 2 + ' cm²', 2 * (a + b) + ' cm²', (a * b + b) + ' cm²']), 'A = base × height = ' + a + ' × ' + b + ' = ' + (a * b) + ' cm². Use the perpendicular height, not the slanted side.');
    case 4: a = rnd(6) + 3; b = a + rnd(8) + 2; c = (rnd(4) + 1) * 2; return G('math', 'geometry', 'Find the area of the trapezoid.' + qfig(shapeSvg('trap', { a: a + ' cm', b: b + ' cm', h: c + ' cm' })), choices((a + b) * c / 2 + ' cm²', [(a + b) * c + ' cm²', a * b * c / 2 + ' cm²', (a + b + c) + ' cm²']), 'A = ½(b₁ + b₂)h = ½(' + a + ' + ' + b + ')(' + c + ') = ' + ((a + b) * c / 2) + ' cm².');
    case 5: a = rnd(9) + 2; if (rnd(2)) return G('math', 'geometry', 'Find the area of the circle.' + qfig(shapeSvg('circle', { r: 'r = ' + a })), [a * a + 'π', 2 * a + 'π', 4 * a * a + 'π', a + 'π'], 'A = πr² = π × ' + a + '² = ' + (a * a) + 'π.');
      return G('math', 'geometry', 'Find the circumference of the circle.' + qfig(shapeSvg('circle', { r: 'r = ' + a })), [2 * a + 'π', a * a + 'π', a + 'π', 4 * a + 'π'], 'C = 2πr = 2 × π × ' + a + ' = ' + (2 * a) + 'π.');
    case 6: s = (rnd(8) + 3) * 4; return G('math', 'geometry', 'A square has a perimeter of ' + s + ' cm. What is its area?', choices(s * s / 16 + ' cm²', [s * s / 4 + ' cm²', s + ' cm²', (s / 4) + ' cm²']), 'Side = ' + s + ' ÷ 4 = ' + (s / 4) + ' cm. Area = ' + (s / 4) + '² = ' + (s * s / 16) + ' cm².');
    case 7: a = (rnd(6) + 2) * 2; return G('math', 'geometry', 'A circle has circumference ' + a + 'π. What is its area?', [a * a / 4 + 'π', a * a + 'π', a / 2 + 'π', a * a / 2 + 'π'], 'C = 2πr = ' + a + 'π → r = ' + (a / 2) + '. Area = π(' + (a / 2) + ')² = ' + (a * a / 4) + 'π.');
    default: s = (rnd(4) + 2) * 2; return G('math', 'geometry', 'A circle is cut out of a square of side ' + s + ' cm; the circle just touches all four sides. What area of the square is left?', [s * s + ' − ' + (s * s / 4) + 'π cm²', s * s + ' − ' + (s * s) + 'π cm²', (s * s / 4) + 'π cm²', s * s + ' − ' + (s / 2) + 'π cm²'], 'The circle’s diameter is ' + s + ', so r = ' + (s / 2) + ' and its area is ' + (s * s / 4) + 'π. Remaining = ' + (s * s) + ' − ' + (s * s / 4) + 'π.');
  }
}
var CONES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15]];
function genVolume(L) {
  var h = T.hardNow(L), t = rnd(h ? 9 : 6), a, b, c;
  switch (t) {
    case 0: a = rnd(8) + 2; if (rnd(2)) return G('math', 'geometry', 'Find the volume of the cube.' + qfig(shapeSvg('cube', { s: a + ' cm' })), choices(a * a * a + ' cm³', [a * a + ' cm³', 6 * a * a + ' cm³', 3 * a + ' cm³']), 'V = s³ = ' + a + ' × ' + a + ' × ' + a + ' = ' + (a * a * a) + ' cm³.');
      return G('math', 'geometry', 'Find the total surface area of the cube.' + qfig(shapeSvg('cube', { s: a + ' cm' })), choices(6 * a * a + ' cm²', [a * a * a + ' cm²', 4 * a * a + ' cm²', a * a + ' cm²']), 'A cube has 6 square faces: SA = 6s² = 6 × ' + (a * a) + ' = ' + (6 * a * a) + ' cm².');
    case 1: a = rnd(8) + 3; b = rnd(5) + 2; c = rnd(6) + 2; if (rnd(2)) return G('math', 'geometry', 'Find the volume of the rectangular prism.' + qfig(shapeSvg('prism', { l: a, w: b, h: c })), choices(a * b * c, [2 * (a * b + a * c + b * c), a + b + c, a * b + c], a * b * c), 'V = l × w × h = ' + a + ' × ' + b + ' × ' + c + ' = ' + (a * b * c) + ' cubic units.');
      return G('math', 'geometry', 'Find the surface area of the rectangular prism.' + qfig(shapeSvg('prism', { l: a, w: b, h: c })), choices(2 * (a * b + a * c + b * c), [a * b * c, a * b + a * c + b * c, 4 * (a + b + c)], 2 * (a * b + a * c + b * c)), 'SA = 2(lw + lh + wh) = 2(' + (a * b) + ' + ' + (a * c) + ' + ' + (b * c) + ') = ' + (2 * (a * b + a * c + b * c)) + ' square units.');
    case 2: a = rnd(5) + 2; b = rnd(8) + 2; if (rnd(2)) return G('math', 'geometry', 'Find the volume of the cylinder.' + qfig(shapeSvg('cyl', { r: 'r=' + a, h: 'h=' + b })), [a * a * b + 'π', 2 * a * b + 'π', a * b + 'π', a * a * b * 2 + 'π'], 'V = πr²h = π × ' + (a * a) + ' × ' + b + ' = ' + (a * a * b) + 'π.');
      return G('math', 'geometry', 'Find the total surface area of the cylinder.' + qfig(shapeSvg('cyl', { r: 'r=' + a, h: 'h=' + b })), [2 * a * (a + b) + 'π', 2 * a * b + 'π', a * a * b + 'π', (a * a + 2 * a * b) + 'π'], 'SA = 2πr² + 2πrh (two circles + the curved side) = ' + (2 * a * a) + 'π + ' + (2 * a * b) + 'π = ' + (2 * a * (a + b)) + 'π.');
    case 3: c = pick(CONES); if (rnd(2)) return G('math', 'geometry', 'Find the volume of the cone.' + qfig(shapeSvg('cone', { r: 'r=' + c[0], h: 'h=' + c[1] })), [c[0] * c[0] * c[1] / 3 + 'π', c[0] * c[0] * c[1] + 'π', c[0] * c[1] + 'π', c[0] * c[0] * c[1] / 2 + 'π'], 'V = ⅓πr²h = ⅓ × π × ' + (c[0] * c[0]) + ' × ' + c[1] + ' = ' + (c[0] * c[0] * c[1] / 3) + 'π. A cone holds exactly one-third of the cylinder with the same base and height.');
      return G('math', 'geometry', 'Find the total surface area of the cone (slant height ' + c[2] + ').' + qfig(shapeSvg('cone', { r: 'r=' + c[0], h: 'h=' + c[1], l: 'l=' + c[2] })), [c[0] * (c[0] + c[2]) + 'π', c[0] * c[2] + 'π', c[0] * (c[0] + c[1]) + 'π', c[0] * c[0] * c[1] / 3 + 'π'], 'SA = πr² + πrl = π(' + (c[0] * c[0]) + ') + π(' + c[0] + ')(' + c[2] + ') = ' + (c[0] * (c[0] + c[2])) + 'π. Use the SLANT height, not the vertical height.');
    case 4: a = pick([3, 6]); if (rnd(2)) return G('math', 'geometry', 'Find the volume of a sphere of radius ' + a + '.' + qfig(shapeSvg('sphere', { r: 'r=' + a })), [4 * a * a * a / 3 + 'π', 4 * a * a + 'π', a * a * a + 'π', 4 * a * a * a + 'π'], 'V = ⁴⁄₃πr³ = ⁴⁄₃ × π × ' + (a * a * a) + ' = ' + (4 * a * a * a / 3) + 'π.');
      a = rnd(6) + 2; return G('math', 'geometry', 'Find the surface area of a sphere of radius ' + a + '.' + qfig(shapeSvg('sphere', { r: 'r=' + a })), [4 * a * a + 'π', a * a + 'π', 2 * a * a + 'π', 4 * a * a * a / 3 + 'π'], 'SA = 4πr² = 4 × π × ' + (a * a) + ' = ' + (4 * a * a) + 'π.');
    case 5: a = rnd(6) + 3; b = (rnd(4) + 1) * 3; return G('math', 'geometry', 'A pyramid has a square base of side ' + a + ' m and a height of ' + b + ' m. What is its volume?' + qfig(shapeSvg('pyr', { b: a + ' m', h: b + ' m' })), choices(a * a * b / 3 + ' m³', [a * a * b + ' m³', a * a * b / 2 + ' m³', a * b + ' m³']), 'V = ⅓ × base area × height = ⅓ × ' + (a * a) + ' × ' + b + ' = ' + (a * a * b / 3) + ' m³.');
    case 6: a = rnd(3) + 2; b = rnd(3) + 2; c = rnd(3) + 2; return G('math', 'geometry', 'How many 2-cm cubes fit exactly inside a box that measures ' + 2 * a + ' cm × ' + 2 * b + ' cm × ' + 2 * c + ' cm?', choices(a * b * c, [8 * a * b * c, 2 * a * b * c, 4 * a * b * c], a * b * c), 'Along each edge: ' + a + ', ' + b + ' and ' + c + ' cubes. ' + a + ' × ' + b + ' × ' + c + ' = ' + (a * b * c) + '. (Dividing the box volume ' + (8 * a * b * c) + ' by the cube volume 8 gives the same.)');
    case 7: a = pick([2, 3]); return G('math', 'geometry', 'If the radius of a sphere is multiplied by ' + a + ', its volume is multiplied by:', choices(a * a * a, [a * a, a, 2 * a * a], a * a * a), 'Volume depends on r³, so it is multiplied by ' + a + '³ = ' + (a * a * a) + '. (Surface area would be multiplied by ' + a + '² = ' + (a * a) + '.)');
    default: a = pick([50, 40, 30, 60]); b = pick([20, 30, 40]); c = pick([25, 50, 30]); return G('math', 'geometry', 'How many liters of water can a ' + a + ' cm × ' + b + ' cm × ' + c + ' cm tank hold? (1 L = 1,000 cm³)', choices(a * b * c / 1000 + ' L', [a * b * c / 100 + ' L', a * b * c + ' L', (a + b + c) + ' L']), 'Volume = ' + a + ' × ' + b + ' × ' + c + ' = ' + (a * b * c).toLocaleString() + ' cm³ = ' + (a * b * c / 1000) + ' L.');
  }
}
var TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29], [12, 16, 20]];
function genPyth(L) {
  var h = T.hardNow(L), t = rnd(h ? 8 : 5), tr = pick(TRIPLES), k = h ? rnd(3) + 1 : 1, a = tr[0] * k, b = tr[1] * k, c = tr[2] * k;
  var sq = function (x, y, z) { return dg(160, 110, '<polygon points="20,95 140,95 20,20" class="fa"/><path d="M20 85h10v10" class="lt"/>' + txt(80, 108, y) + txt(12, 60, x, '', 'end') + txt(90, 52, z, 'tg', 'start')); };
  switch (t) {
    case 0: return G('math', 'geometry', 'Find the hypotenuse.' + qfig(sq(a, b, '?')), choices(c, [a + b, c + 1, Math.round(Math.sqrt(a * a + b * b) * 1.4)], c), 'c² = a² + b² = ' + (a * a) + ' + ' + (b * b) + ' = ' + (c * c) + ', so c = ' + c + '.');
    case 1: return G('math', 'geometry', 'Find the missing leg.' + qfig(sq('?', b, c)), choices(a, [c - b, Math.round(Math.sqrt(c * c + b * b)), a + 1], a), 'a² = c² − b² = ' + (c * c) + ' − ' + (b * b) + ' = ' + (a * a) + ', so a = ' + a + '.');
    case 2: var good = tr.map(function (x) { return x * k; }).join(', ');
      return G('math', 'geometry', 'Which set of side lengths forms a RIGHT triangle?', [good, [a, b, c + 1].join(', '), [a + 1, b, c].join(', '), [a, a, c].join(', ')], 'Test a² + b² = c² with the longest side as c: ' + (a * a) + ' + ' + (b * b) + ' = ' + (c * c) + ' ✓ for ' + good + '.');
    case 3: return G('math', 'geometry', 'A rectangle is ' + b + ' m long and ' + a + ' m wide. How long is its diagonal?', choices(c + ' m', [(a + b) + ' m', (c + 2) + ' m', Math.round((a + b) / 2) + ' m']), 'The diagonal is the hypotenuse of a right triangle with legs ' + a + ' and ' + b + ': √(' + (a * a) + ' + ' + (b * b) + ') = ' + c + ' m.');
    case 4: return G('math', 'geometry', 'A ' + c + '-m ladder leans against a wall. Its foot is ' + a + ' m from the wall. How high up the wall does it reach?', choices(b + ' m', [(c - a) + ' m', (c + a) + ' m', (b + 1) + ' m']), 'Height² = ' + c + '² − ' + a + '² = ' + (c * c) + ' − ' + (a * a) + ' = ' + (b * b) + ', so the height is ' + b + ' m.');
    case 5: var x1 = rnd(7) - 3, y1 = rnd(7) - 3, sx = pick([1, -1]), sy = pick([1, -1]), x2 = x1 + sx * tr[0], y2 = y1 + sy * tr[1];
      return G('math', 'geometry', 'What is the distance between (' + neg(x1) + ', ' + neg(y1) + ') and (' + neg(x2) + ', ' + neg(y2) + ')?', choices(tr[2], [tr[0] + tr[1], tr[2] + 1, Math.abs(x2 - x1)], tr[2]), 'Horizontal change ' + tr[0] + ', vertical change ' + tr[1] + '. d = √(' + (tr[0] * tr[0]) + ' + ' + (tr[1] * tr[1]) + ') = ' + tr[2] + '.');
    case 6: var B = pick([[2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [3, 4, 12, 13], [1, 2, 2, 3], [2, 10, 11, 15]]);
      return G('math', 'geometry', 'A box measures ' + B[0] + ' × ' + B[1] + ' × ' + B[2] + '. How long is the longest straight rod that fits inside (corner to opposite corner)?', choices(B[3], [B[0] + B[1] + B[2], B[3] + 1, B[2] + 1], B[3]), 'Space diagonal = √(l² + w² + h²) = √(' + (B[0] * B[0]) + ' + ' + (B[1] * B[1]) + ' + ' + (B[2] * B[2]) + ') = √' + (B[3] * B[3]) + ' = ' + B[3] + '.');
    default: var s2 = rnd(8) + 2; if (rnd(2)) return G('math', 'geometry', 'What is the length of the diagonal of a square with side ' + s2 + '?', [s2 + '√2', s2 * 2 + '', s2 + '√3', 2 * s2 + '√2'], 'd = √(s² + s²) = s√2 = ' + s2 + '√2. (A 45-45-90 triangle.)');
      return G('math', 'geometry', 'What is the height of an equilateral triangle with side ' + 2 * s2 + '?', [s2 + '√3', 2 * s2 + '√3', s2 + '', s2 + '√2'], 'The height splits it into two 30-60-90 triangles with short leg ' + s2 + ' and hypotenuse ' + (2 * s2) + '. Height = ' + s2 + '√3.');
  }
}
function pythSquares() {
  var s = '<rect x="48" y="128" width="42" height="42" class="fb"/><rect x="90" y="170" width="56" height="56" class="fg"/><polygon points="90,128 146,170 188,114 132,72" class="fa"/><polygon points="90,170 146,170 90,128" class="ln" style="fill:var(--card)"/><path d="M90 162h8v8" class="lt"/>';
  for (var i = 1; i < 3; i++) s += line(48 + 14 * i, 128, 48 + 14 * i, 170, 'lt') + line(48, 128 + 14 * i, 90, 128 + 14 * i, 'lt');
  for (i = 1; i < 4; i++) s += line(90 + 14 * i, 170, 90 + 14 * i, 226, 'lt') + line(90, 170 + 14 * i, 146, 170 + 14 * i, 'lt');
  s += txt(69, 153, '9', 'tb') + txt(118, 202, '16', 'tg') + txt(139, 124, '25', 'ta') + txt(82, 153, 'a', 'sm', 'end') + txt(118, 166, 'b', 'sm') + txt(112, 144, 'c', 'sm');
  return dg(220, 200, '<g transform="translate(-30 -60)">' + s + '</g>', 'squares on the sides of a 3-4-5 triangle');
}
function pythWidget() { return '<div class="widget"><b>📐 Pythagoras machine</b><div class="wrow"><label>leg a = <b id="paO">3</b><input type="range" id="pa" min="1" max="15" value="3"></label><label>leg b = <b id="pbO">4</b><input type="range" id="pb" min="1" max="15" value="4"></label></div><div id="pSvg"></div><p id="pTxt"></p></div>'; }
function pythInit(root) {
  var A = root.querySelector('#pa'), B = root.querySelector('#pb');
  function draw() {
    var a = +A.value, b = +B.value, c2 = a * a + b * b, c = Math.sqrt(c2), sc = Math.min(150 / b, 100 / a), W = b * sc, Hh = a * sc;
    root.querySelector('#pSvg').innerHTML = dg(200, 130, '<polygon points="25,' + (115) + ' ' + (25 + W) + ',115 25,' + (115 - Hh) + '" class="fa"/><path d="M25 105h10v10" class="lt"/>' + txt(25 + W / 2, 128, 'b = ' + b, 'sm') + txt(20, 115 - Hh / 2, 'a = ' + a, 'sm', 'end') + txt(30 + W / 2, 110 - Hh / 2, 'c', 'tg', 'start'), 'right triangle', 'max-width:240px');
    var exact = Math.round(c) === c;
    root.querySelector('#pTxt').innerHTML = 'a² + b² = c² → ' + (a * a) + ' + ' + (b * b) + ' = <b>' + c2 + '</b>, so c = ' + (exact ? '<b>' + c + '</b> 🎉 a whole-number triple!' : '√' + c2 + ' ≈ <b>' + c.toFixed(2) + '</b>');
    root.querySelector('#paO').textContent = a; root.querySelector('#pbO').textContent = b;
  }
  A.oninput = B.oninput = draw; draw();
}
LESSONS.push({ id: 'geometry', sec: 'math', title: 'Geometry Formulas', icon: '△', blurb: 'Perimeter, area, volume, surface area, circles and the Pythagorean theorem — every formula with a picture.',
  sets: [{ name: 'Perimeter & area', gen: genArea }, { name: 'Volume & surface area', gen: genVolume }, { name: 'Pythagorean theorem', gen: genPyth }],
  html: function () {
    var S = shapeSvg;
    return card('Perimeter and area of plane figures', '<p><b>Perimeter</b> is the distance around a figure (units: cm). <b>Area</b> is the space inside it (units: cm²).</p><div class="figs">' +
      fig(S('square', { s: 's' }), 'Square', 'P = 4s<br>A = s²') + fig(S('rect', { l: 'l', w: 'w' }), 'Rectangle', 'P = 2(l + w)<br>A = lw') + fig(S('tri', { b: 'b', h: 'h' }), 'Triangle', 'P = a + b + c<br>A = ½bh') +
      fig(S('para', { b: 'b', h: 'h' }), 'Parallelogram', 'A = bh (h is perpendicular)') + fig(S('trap', { a: 'b₁', b: 'b₂', h: 'h' }), 'Trapezoid', 'A = ½(b₁ + b₂)h') + fig(S('circle', { r: 'r' }), 'Circle', 'C = 2πr = πd<br>A = πr²') + '</div>' +
      '<div class="fgrid">' + fbox('Rhombus', 'A = ½ d₁d₂') + fbox('Triangle (Heron)', 'A = √[s(s−a)(s−b)(s−c)]') + fbox('Sector', 'A = (θ/360°) πr²', 'gold') + fbox('Arc length', '(θ/360°) 2πr', 'gold') + fbox('Interior angle sum', '(n − 2) × 180°') + fbox('Each exterior angle (regular)', '360° ÷ n') + '</div>{{p0}}') +
    card('Volume and surface area of solids', '<p><b>Volume</b> = space inside (cm³). <b>Surface area</b> = total area of all faces (cm²) — imagine wrapping the solid in paper.</p><div class="figs">' +
      fig(S('cube', { s: 's' }), 'Cube', 'V = s³<br>SA = 6s²') + fig(S('prism', { l: 'l', w: 'w', h: 'h' }), 'Rectangular prism', 'V = lwh<br>SA = 2(lw + lh + wh)') + fig(S('cyl', { r: 'r', h: 'h' }), 'Cylinder', 'V = πr²h<br>SA = 2πr² + 2πrh') +
      fig(S('cone', { r: 'r', h: 'h', l: 'l' }), 'Cone', 'V = ⅓πr²h<br>SA = πr² + πrl') + fig(S('sphere', { r: 'r' }), 'Sphere', 'V = ⁴⁄₃πr³<br>SA = 4πr²') + fig(S('pyr', { b: 'b', h: 'h' }), 'Square pyramid', 'V = ⅓b²h') + '</div>' +
      '<div class="note">Pattern: “pointy” solids (cone, pyramid) hold <b>⅓</b> of the prism or cylinder with the same base and height. When every length is multiplied by k, area is multiplied by k² and volume by k³.</div>{{p1}}') +
    card('The Pythagorean theorem', '<div class="figs">' + fig(pythSquares(), 'a² + b² = c²', '9 + 16 = 25: the two small squares fill the big one.') + '</div>' + pythWidget() +
      '<p><b>Common triples</b> (and their multiples): 3-4-5, 5-12-13, 8-15-17, 7-24-25, 20-21-29. 6-8-10 and 9-12-15 are just 3-4-5 scaled.</p>' +
      '<div class="fgrid">' + fbox('45°-45°-90°', 'sides 1 : 1 : √2') + fbox('30°-60°-90°', 'sides 1 : √3 : 2') + fbox('Square diagonal', 's√2', 'gold') + fbox('Box diagonal', '√(l² + w² + h²)', 'gold') + '</div>{{p2}}');
  },
  init: pythInit
});

/* ====================================================================== */
/* ANGLES & TRIGONOMETRY                                                   */
/* ====================================================================== */
function angleType(d) { return d === 0 ? 'zero' : d < 90 ? 'acute' : d === 90 ? 'right' : d < 180 ? 'obtuse' : d === 180 ? 'straight' : d < 360 ? 'reflex' : 'full rotation'; }
function genAngles(L) {
  var h = T.hardNow(L), t = rnd(h ? 9 : 6), x, a, b, p, q, r, s, n;
  switch (t) {
    case 0: x = pick([rnd(88) + 1, 90, rnd(88) + 91, 180, rnd(178) + 181]); var ty = angleType(x);
      return G('math', 'trig', 'An angle measures ' + x + '°. What kind of angle is it?' + qfig(angFig(x)), [ty[0].toUpperCase() + ty.slice(1)].concat(['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex'].filter(function (k) { return k.toLowerCase() !== ty; }).slice(0, 3)), 'Acute < 90° · right = 90° · obtuse between 90° and 180° · straight = 180° · reflex between 180° and 360°. So ' + x + '° is ' + ty + '.');
    case 1: x = rnd(80) + 5; return G('math', 'trig', 'What is the COMPLEMENT of a ' + x + '° angle?', choices((90 - x) + '°', [(180 - x) + '°', (360 - x) + '°', (90 + x) + '°']), 'Complementary angles add up to 90°: 90° − ' + x + '° = ' + (90 - x) + '°. (Memory aid: C comes before S, and 90 comes before 180.)');
    case 2: x = rnd(160) + 10; return G('math', 'trig', 'What is the SUPPLEMENT of a ' + x + '° angle?', choices((180 - x) + '°', [Math.abs(90 - x) + '°', (360 - x) + '°', (180 + x) + '°']), 'Supplementary angles add up to 180°: 180° − ' + x + '° = ' + (180 - x) + '°.');
    case 3: a = rnd(60) + 30; b = rnd(70) + 30; return G('math', 'trig', 'Two angles of a triangle measure ' + a + '° and ' + b + '°. What is the third angle?', choices((180 - a - b) + '°', [(360 - a - b) + '°', (90 - Math.abs(a - b)) + '°', (180 - a) + '°']), 'The angles of a triangle add up to 180°: 180° − ' + a + '° − ' + b + '° = ' + (180 - a - b) + '°.');
    case 4: x = rnd(140) + 20; var which = pick(['vertical', 'linear']);
      return G('math', 'trig', 'Two lines cross. One of the angles formed is ' + x + '°. What is the angle ' + (which === 'vertical' ? 'directly opposite (vertical to) it' : 'next to it (forming a straight line with it)') + '?', choices((which === 'vertical' ? x : 180 - x) + '°', [(which === 'vertical' ? 180 - x : x) + '°', (360 - x) + '°', Math.abs(90 - x) + '°']), which === 'vertical' ? 'Vertical angles are always equal: ' + x + '°.' : 'Angles on a straight line (a linear pair) add to 180°: ' + (180 - x) + '°.');
    case 5: x = rnd(130) + 25; var rel = pick([['corresponding', x], ['alternate interior', x], ['same-side interior', 180 - x]]);
      return G('math', 'trig', 'Two parallel lines are cut by a transversal. One angle is ' + x + '°. What is its ' + rel[0] + ' angle?', choices(rel[1] + '°', [(rel[1] === x ? 180 - x : x) + '°', (360 - x) + '°', Math.abs(90 - x) + '°']), 'With parallel lines, corresponding and alternate interior angles are EQUAL; same-side (consecutive) interior angles are SUPPLEMENTARY (add to 180°). Answer: ' + rel[1] + '°.');
    case 6: var tot = pick([90, 180]); x = rnd(15) + 10; p = rnd(3) + 2; q = rnd(3) + 1; r = rnd(20) - 5; s = tot - (p + q) * x - r;
      if (p * x + r <= 0 || q * x + s <= 0) { r = 5; s = tot - (p + q) * x - 5; }
      if (q * x + s <= 0) { p = 2; q = 1; x = tot === 90 ? 20 : 40; r = 10; s = tot - 3 * x - 10; }
      return G('math', 'trig', 'Two angles are ' + (tot === 90 ? 'complementary' : 'supplementary') + '. One measures (' + p + '<i>x</i>' + T.sgn(r) + ')° and the other (' + (q === 1 ? '' : q) + '<i>x</i>' + T.sgn(s) + ')°. Find <i>x</i>.', numOpts(x, [1, -1, 2, -2, 5, 10]), 'Set the sum equal to ' + tot + '°: ' + (p + q) + '<i>x</i>' + T.sgn(r + s) + ' = ' + tot + ' → ' + (p + q) + '<i>x</i> = ' + (tot - r - s) + ' → <i>x</i> = ' + x + '.');
    case 7: n = pick([5, 6, 8, 9, 10, 12]); if (rnd(2)) return G('math', 'trig', 'What is the sum of the interior angles of a ' + n + '-sided polygon?', choices(((n - 2) * 180) + '°', [(n * 180) + '°', ((n - 1) * 180) + '°', '360°']), 'Sum = (n − 2) × 180° = ' + (n - 2) + ' × 180° = ' + ((n - 2) * 180) + '°. (A polygon splits into n − 2 triangles from one corner.)');
      return G('math', 'trig', 'What is each interior angle of a regular polygon with ' + n + ' sides?', choices(((n - 2) * 180 / n) + '°', [(360 / n) + '°', ((n - 2) * 180) + '°', (180 - (n - 2) * 180 / n + 90) + '°']), 'Each exterior angle = 360° ÷ ' + n + ' = ' + (360 / n) + '°, so each interior angle = 180° − ' + (360 / n) + '° = ' + ((n - 2) * 180 / n) + '°.');
    default: var hr = rnd(12) + 1, mn = pick([0, 10, 20, 30, 40, 50]), ang = Math.abs(30 * (hr % 12) - 5.5 * mn); if (ang > 180) ang = 360 - ang;
      return G('math', 'trig', 'What is the smaller angle between the hands of a clock at ' + hr + ':' + (mn < 10 ? '0' : '') + mn + '?', choices(neg(ang) + '°', [neg(Math.abs(30 * (hr % 12) - 6 * mn) > 180 ? 360 - Math.abs(30 * (hr % 12) - 6 * mn) : Math.abs(30 * (hr % 12) - 6 * mn)) + '°', neg(360 - ang) + '°', neg(Math.abs(ang - 15)) + '°']), 'Angle = |30H − 5.5M| = |30(' + (hr % 12) + ') − 5.5(' + mn + ')| = ' + neg(Math.abs(30 * (hr % 12) - 5.5 * mn)) + '°' + (Math.abs(30 * (hr % 12) - 5.5 * mn) > 180 ? ', and the smaller angle is 360° minus that = ' + neg(ang) + '°' : '') + '. The hour hand moves 0.5° every minute, which is why it is 5.5M and not 6M.');
  }
}
function triSvg(o, a, hy, theta) {
  return dg(200, 130, '<polygon points="20,110 170,110 170,25" class="fa"/><path d="M160 110v-10h10" class="lt"/>' + arc(20, 110, 24, 0, 29.5, 'go') + txt(52, 104, theta || 'θ', 'tg') +
    txt(95, 126, a, 'tb') + txt(178, 72, o, 'tb', 'start') + txt(86, 60, hy, 'ta', 'end'), 'right triangle with sides labeled');
}
function genSOH(L) {
  var h = T.hardNow(L), t = rnd(h ? 7 : 4), tr = pick(TRIPLES.slice(0, 6)), o = tr[0], a = tr[1], c = tr[2], fn;
  if (rnd(2)) { o = tr[1]; a = tr[0]; }
  var R = { sin: [o, c], cos: [a, c], tan: [o, a] };
  switch (t) {
    case 0: fn = pick(['sin', 'cos', 'tan']); return G('math', 'trig', 'Find ' + fn + ' θ.' + qfig(triSvg(o, a, c)), [fr(R[fn][0], R[fn][1])].concat(['sin', 'cos', 'tan'].filter(function (f) { return f !== fn; }).map(function (f) { return fr(R[f][0], R[f][1]); }), [fr(R[fn][1], R[fn][0])]).filter(function (v, i, s) { return s.indexOf(v) === i; }).slice(0, 4), 'SOH CAH TOA: ' + { sin: 'sin = Opposite/Hypotenuse = ' + o + '/' + c, cos: 'cos = Adjacent/Hypotenuse = ' + a + '/' + c, tan: 'tan = Opposite/Adjacent = ' + o + '/' + a }[fn] + (gcd(R[fn][0], R[fn][1]) > 1 ? ' = ' + fr(R[fn][0], R[fn][1]) : '') + '.');
    case 1: fn = pick(['Opposite ÷ Hypotenuse', 'Adjacent ÷ Hypotenuse', 'Opposite ÷ Adjacent']); var ans = { 'Opposite ÷ Hypotenuse': 'sine', 'Adjacent ÷ Hypotenuse': 'cosine', 'Opposite ÷ Adjacent': 'tangent' }[fn];
      return G('math', 'trig', 'In a right triangle, the ratio ' + fn + ' for angle θ is called the:', [ans].concat(['sine', 'cosine', 'tangent', 'secant'].filter(function (x) { return x !== ans; })).slice(0, 4), 'SOH: Sine = O/H. CAH: Cosine = A/H. TOA: Tangent = O/A.');
    case 2: var ang = pick([30, 60]), hyp = (rnd(8) + 2) * 2, what = pick(['opp', 'adj']), sin30 = { 30: 'opp', 60: 'adj' }[ang] === what;
      return G('math', 'trig', 'A right triangle has hypotenuse ' + hyp + ' and an angle of ' + ang + '°. How long is the side ' + (what === 'opp' ? 'OPPOSITE' : 'ADJACENT to') + ' the ' + ang + '° angle?', sin30 ? [String(hyp / 2), (hyp / 2) + '√3', String(hyp * 2), hyp + '√3'] : [(hyp / 2) + '√3', String(hyp / 2), hyp + '√2', String(hyp)],
        (what === 'opp' ? 'Opposite = hyp × sin ' + ang + '°' : 'Adjacent = hyp × cos ' + ang + '°') + ' = ' + hyp + ' × ' + (sin30 ? '1/2 = ' + (hyp / 2) : '√3/2 = ' + (hyp / 2) + '√3') + '.');
    case 3: var g = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]), f1 = pick(['sin', 'cos']);
      return G('math', 'trig', 'If ' + f1 + ' θ = ' + g[0] + '/' + g[2] + ' and θ is acute, what is ' + (f1 === 'sin' ? 'cos' : 'sin') + ' θ?', [g[1] + '/' + g[2], g[0] + '/' + g[1], g[2] + '/' + g[1], g[1] + '/' + g[0]], 'Draw the triangle: ' + (f1 === 'sin' ? 'opposite' : 'adjacent') + ' ' + g[0] + ', hypotenuse ' + g[2] + '. The third side is √(' + (g[2] * g[2]) + ' − ' + (g[0] * g[0]) + ') = ' + g[1] + '. So the answer is ' + g[1] + '/' + g[2] + '.');
    case 4: var d = (rnd(6) + 2) * 5, e = pick([30, 45, 60]), ht = { 30: [d + '√3/3', d + '√3', String(d), d + '√2'], 45: [String(d), d + '√2', d + '√3', String(d * 2)], 60: [d + '√3', d + '√3/3', String(d * 2), d + '√2'] }[e];
      return G('math', 'trig', 'From a point ' + d + ' m from the foot of a tower, the angle of elevation to the top is ' + e + '°. How tall is the tower?', ht, 'tan ' + e + '° = height ÷ ' + d + ', so height = ' + d + ' × tan ' + e + '° = ' + d + ' × ' + { 30: '√3/3', 45: '1', 60: '√3' }[e] + ' = ' + ht[0] + ' m.');
    case 5: var g2 = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17]]), f2 = pick(['sec', 'csc', 'cot']), val = { sec: g2[2] + '/' + g2[1], csc: g2[2] + '/' + g2[0], cot: g2[1] + '/' + g2[0] }[f2];
      return G('math', 'trig', 'If sin θ = ' + g2[0] + '/' + g2[2] + ' (θ acute), what is ' + f2 + ' θ?', [val].concat([g2[2] + '/' + g2[1], g2[2] + '/' + g2[0], g2[1] + '/' + g2[0], g2[0] + '/' + g2[1]].filter(function (v) { return v !== val; }).slice(0, 3)), 'Sides: opposite ' + g2[0] + ', adjacent ' + g2[1] + ', hypotenuse ' + g2[2] + '. sec = 1/cos = H/A; csc = 1/sin = H/O; cot = 1/tan = A/O. So ' + f2 + ' θ = ' + val + '.');
    default: var L2 = (rnd(8) + 3) * 2; return G('math', 'trig', 'A kite string ' + L2 + ' m long makes a 30° angle with the ground. How high is the kite (string pulled straight)?', [String(L2 / 2) + ' m', (L2 / 2) + '√3 m', L2 + '√3 m', String(L2 * 2) + ' m'], 'Height is opposite the 30° angle: ' + L2 + ' × sin 30° = ' + L2 + ' × ½ = ' + (L2 / 2) + ' m.');
  }
}
var SPV = { sin: { 0: '0', 30: '1/2', 45: '√2/2', 60: '√3/2', 90: '1' }, cos: { 0: '1', 30: '√3/2', 45: '√2/2', 60: '1/2', 90: '0' }, tan: { 0: '0', 30: '√3/3', 45: '1', 60: '√3', 90: 'undefined' } };
function genSpecial(L) {
  var h = T.hardNow(L), t = rnd(h ? 5 : 3);
  if (t === 0) { var f = pick(['sin', 'cos', 'tan']), d = pick([0, 30, 45, 60, 90]); if (f === 'tan' && d === 90) d = 60; var v = SPV[f][d];
    var pool = ['0', '1', '1/2', '√2/2', '√3/2', '√3', '√3/3'].filter(function (x) { return x !== v; });
    return G('math', 'trig', f + ' ' + d + '° = ?', [v].concat(sample(pool, 3)), 'From the special-angle table: ' + f + ' ' + d + '° = ' + v + '. Tip: sin goes √0/2, √1/2, √2/2, √3/2, √4/2 for 0°, 30°, 45°, 60°, 90° — cos is the same list backwards.'); }
  if (t === 1) { var X = pick([['sin² 30° + cos² 30°', '1', ['1/2', '3/4', '√3'], 'Pythagorean identity: sin²θ + cos²θ = 1 for any angle.'], ['2 sin 30°', '1', ['1/2', '√3', '2'], '2 × 1/2 = 1.'], ['sin 30° · cos 60°', '1/4', ['1', '1/2', '√3/4'], '1/2 × 1/2 = 1/4.'], ['tan 45° + cos 60°', '3/2', ['1', '2', '√3'], '1 + 1/2 = 3/2.'], ['sin 60° ÷ cos 60°', '√3', ['1', '√3/3', '1/2'], 'sin/cos = tan, and tan 60° = √3.'], ['cos² 45°', '1/2', ['√2/2', '1', '1/4'], '(√2/2)² = 2/4 = 1/2.'], ['sin 90° − cos 0°', '0', ['1', '2', '−1'], '1 − 1 = 0.']]);
    return G('math', 'trig', 'Evaluate: ' + X[0], [X[1]].concat(X[2]), X[3]); }
  if (t === 2) { var I = pick([['sin²θ + cos²θ', '1', ['0', 'tan²θ', 'sec²θ']], ['tan θ', 'sin θ / cos θ', ['cos θ / sin θ', '1 / sin θ', 'sin θ · cos θ']], ['1 + tan²θ', 'sec²θ', ['csc²θ', '1', 'cot²θ']], ['csc θ', '1 / sin θ', ['1 / cos θ', '1 / tan θ', 'cos θ / sin θ']], ['sec θ', '1 / cos θ', ['1 / sin θ', 'sin θ / cos θ', '1 / tan θ']], ['1 + cot²θ', 'csc²θ', ['sec²θ', 'tan²θ', '1']], ['cot θ', 'cos θ / sin θ', ['sin θ / cos θ', '1 / cos θ', 'tan θ']]]);
    return G('math', 'trig', 'Which is equal to ' + I[0] + '?', [I[1]].concat(I[2]), I[0] + ' = ' + I[1] + '. See the identities box in the lesson.'); }
  if (t === 3) { var C = pick([['sin(90° − θ)', 'cos θ', ['sin θ', '−cos θ', 'tan θ']], ['cos(90° − θ)', 'sin θ', ['cos θ', '−sin θ', 'cot θ']], ['tan(90° − θ)', 'cot θ', ['tan θ', 'sec θ', '1/tan θ²']], ['sin 70° ÷ cos 20°', '1', ['tan 50°', 'sin 50°', '0']]]);
    return G('math', 'trig', 'Simplify: ' + C[0], [C[1]].concat(C[2]), 'Cofunction identities: sin(90° − θ) = cos θ, cos(90° − θ) = sin θ, tan(90° − θ) = cot θ.'); }
  var Rd = pick([['π/6', '30°'], ['π/4', '45°'], ['π/3', '60°'], ['π/2', '90°'], ['2π/3', '120°'], ['3π/4', '135°'], ['5π/6', '150°'], ['3π/2', '270°'], ['5π/4', '225°']]);
  var other = ['30°', '45°', '60°', '90°', '120°', '135°', '150°', '225°', '270°'].filter(function (x) { return x !== Rd[1]; });
  return G('math', 'trig', 'Convert ' + Rd[0] + ' radians to degrees.', [Rd[1]].concat(sample(other, 3)), 'Replace π with 180°: ' + Rd[0].replace('π', '(180°)') + ' = ' + Rd[1] + '.');
}
function anglePairs() {
  var vx = 30, vy = 85, comp = ray(vx, vy, 0, 110, 'ac') + ray(vx, vy, 90, 75, 'ac') + ray(vx, vy, 35, 100, 'bl') + arc(vx, vy, 28, 0, 35) + arc(vx, vy, 40, 35, 90, 'bl') + txt(72, 76, '35°', 'tg') + txt(52, 42, '55°', 'tb') + '<path d="M' + (vx + 10) + ' ' + vy + 'v-10h-10" class="lt"/>';
  var sx = 80, sy = 80, supp = line(10, sy, 150, sy, 'ac') + ray(sx, sy, 120, 65, 'bl') + arc(sx, sy, 22, 0, 120) + arc(sx, sy, 32, 120, 180, 'bl') + txt(104, 62, '120°', 'tg') + txt(36, 64, '60°', 'tb');
  var cx = 80, cy = 55, vert = ray(cx, cy, 30, 70, 'ac') + ray(cx, cy, 210, 70, 'ac') + ray(cx, cy, 150, 70, 'bl') + ray(cx, cy, 330, 70, 'bl') + arc(cx, cy, 20, 330, 390) + arc(cx, cy, 20, 150, 210) + txt(112, 60, 'x', 'tg') + txt(48, 60, 'x', 'tg') + txt(80, 30, 'y', 'tb') + txt(80, 88, 'y', 'tb');
  return '<div class="figs">' + fig(dg(160, 100, comp), 'Complementary', 'add up to 90°') + fig(dg(160, 100, supp), 'Supplementary', 'add up to 180° (a linear pair)') + fig(dg(160, 110, vert), 'Vertical angles', 'opposite angles are equal: x = x, y = y, and x + y = 180°') + '</div>';
}
function transversal() {
  var s = line(15, 40, 305, 40, 'ac') + line(15, 110, 305, 110, 'ac') + line(110, 150, 220, 0, 'ln'), t = txt;
  var A = [190.7, 40], B = [139.3, 110];
  [[A, ['1', '2', '3', '4']], [B, ['5', '6', '7', '8']]].forEach(function (g) { var p = g[0], n = g[1]; s += t(p[0] - 18, p[1] - 7, n[0], 'tb') + t(p[0] + 16, p[1] - 7, n[1], 'tb') + t(p[0] - 22, p[1] + 17, n[2], 'tg') + t(p[0] + 12, p[1] + 17, n[3], 'tg'); });
  s += t(300, 33, '∥', 'ta', 'end') + t(300, 103, '∥', 'ta', 'end');
  return dg(320, 150, s, 'two parallel lines cut by a transversal');
}
function triangleSum() { return dg(200, 120, '<polygon points="20,105 180,105 120,15" class="fa"/>' + arc(20, 105, 22, 0, 36.9) + arc(180, 105, 20, 123.7, 180, 'bl') + txt(52, 98, 'a', 'tg') + txt(155, 98, 'b', 'tb') + txt(120, 40, 'c', 'ta') + txt(100, 119, 'a + b + c = 180°', 'sm'), 'triangle angle sum'); }
function angleWidget() { return '<div class="widget"><b>🎯 Angle explorer</b><label>Angle: <b id="agO">50°</b><input type="range" id="ag" min="0" max="360" value="50"></label><div id="agSvg"></div><div class="wout" id="agOut"></div></div>'; }
function unitWidget() { return '<div class="widget"><b>⭕ The unit circle and SOH CAH TOA</b><p class="small muted">The point on a circle of radius 1 is (cos θ, sin θ). The blue leg is cos θ, the gold leg is sin θ.</p><label>θ = <b id="ucO">30°</b><input type="range" id="uc" min="0" max="360" value="30"></label><div id="ucSvg"></div><div class="wout" id="ucOut"></div></div>'; }
function trigInit(root) {
  var ag = root.querySelector('#ag'), uc = root.querySelector('#uc');
  function drawA() {
    var d = +ag.value, ty = angleType(d);
    root.querySelector('#agSvg').innerHTML = angFig(d, 200, 150).replace('class="dg"', 'class="dg" style="max-width:240px"');
    root.querySelector('#agO').textContent = d + '°';
    root.querySelector('#agOut').innerHTML = '<div><b>' + ty + '</b><span>type</span></div><div><b>' + (d <= 90 ? (90 - d) + '°' : '—') + '</b><span>complement</span></div><div><b>' + (d <= 180 ? (180 - d) + '°' : '—') + '</b><span>supplement</span></div><div><b>' + (360 - d) + '°</b><span>to a full turn</span></div>';
  }
  function drawU() {
    var d = +uc.value, R = 70, cx = 100, cy = 95, rad = d * Math.PI / 180, x = Math.cos(rad), y = Math.sin(rad), px = cx + R * x, py = cy - R * y;
    var s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" class="lt"/>' + line(20, cy, 180, cy, 'lt') + line(cx, 15, cx, 175, 'lt') +
      line(cx, cy, px.toFixed(1), cy, 'bl') + line(px.toFixed(1), cy, px.toFixed(1), py.toFixed(1), 'go') + line(cx, cy, px.toFixed(1), py.toFixed(1), 'ac') + (d % 360 ? arc(cx, cy, 16, 0, d, 'ac') : '') + '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="4.5" class="fs"/>' +
      txt(165, 30, 'I', 'sm') + txt(35, 30, 'II', 'sm') + txt(35, 168, 'III', 'sm') + txt(165, 168, 'IV', 'sm');
    root.querySelector('#ucSvg').innerHTML = dg(200, 190, s, 'unit circle', 'max-width:260px');
    root.querySelector('#ucO').textContent = d + '°';
    var ex = function (f) { var ref = d % 90 === 0 || [30, 45, 60].indexOf(d % 180 > 90 ? 180 - d % 180 : d % 180) >= 0; return ''; };
    var fx = function (v) { return Math.abs(v) < 1e-9 ? '0' : (Math.round(v * 1000) / 1000).toString().replace('-', '−'); };
    var tn = Math.abs(x) < 1e-9 ? 'undefined' : fx(y / x), q = d % 90 === 0 ? 'on an axis' : 'Quadrant ' + ['I', 'II', 'III', 'IV'][Math.floor(d / 90) % 4];
    root.querySelector('#ucOut').innerHTML = '<div><b>' + fx(y) + '</b><span>sin θ</span></div><div><b>' + fx(x) + '</b><span>cos θ</span></div><div><b>' + tn + '</b><span>tan θ</span></div><div><b>' + q + '</b><span>where</span></div>';
  }
  ag.oninput = drawA; uc.oninput = drawU; drawA(); drawU();
}
LESSONS.push({ id: 'trig', sec: 'math', title: 'Angles & Trigonometry', icon: '∠', blurb: 'Kinds of angles, angle pairs, parallel lines, SOH CAH TOA, special triangles and the key identities.',
  sets: [{ name: 'Angles & angle pairs', gen: genAngles }, { name: 'SOH CAH TOA & right triangles', gen: genSOH }, { name: 'Special angles & identities', gen: genSpecial }],
  html: function () {
    return card('Kinds of angles', '<div class="figs">' + fig(angFig(50), 'Acute', 'less than 90°') + fig(angFig(90), 'Right', 'exactly 90° (the little square)') + fig(angFig(130), 'Obtuse', 'between 90° and 180°') + fig(angFig(180), 'Straight', 'exactly 180°') + fig(angFig(250), 'Reflex', 'between 180° and 360°') + '</div>' + angleWidget()) +
    card('Angle pairs and parallel lines', anglePairs() + '<div class="figs">' + fig(transversal(), 'Parallel lines and a transversal', 'Corresponding: 1 = 5, 2 = 6, 3 = 7, 4 = 8. Alternate interior: 3 = 6, 4 = 5. Same-side interior: 3 + 5 = 180°, 4 + 6 = 180°.') + fig(triangleSum(), 'Triangle angle sum', 'The three angles always add to 180°. An exterior angle equals the sum of the two remote interior angles.') + '</div>{{p0}}') +
    card('SOH CAH TOA', '<div class="mnemo"><div class="m1"><b>SOH</b><span>sin = Opposite / Hypotenuse</span></div><div class="m2"><b>CAH</b><span>cos = Adjacent / Hypotenuse</span></div><div class="m3"><b>TOA</b><span>tan = Opposite / Adjacent</span></div></div>' +
      '<div class="figs">' + fig(triSvg('Opposite', 'Adjacent', 'Hypotenuse'), 'Name the sides from θ', 'Hypotenuse: always across from the right angle (longest). Opposite: across from θ. Adjacent: touching θ (not the hypotenuse).') + fig(triSvg('3', '4', '5'), 'Example: 3-4-5', 'sin θ = 3/5, cos θ = 4/5, tan θ = 3/4') + '</div>' +
      '<div class="fgrid">' + fbox('csc θ', '1 / sin θ = H/O') + fbox('sec θ', '1 / cos θ = H/A') + fbox('cot θ', '1 / tan θ = A/O') + fbox('Angle of elevation', 'look UP from horizontal', 'gold') + fbox('Angle of depression', 'look DOWN from horizontal', 'gold') + '</div>{{p1}}') +
    card('Special angles, the unit circle and identities', unitWidget() + '<div class="figs">' +
      fig(dg(170, 120, '<polygon points="20,100 140,100 140,20" class="fa"/><path d="M130 100v-10h10" class="lt"/>' + txt(80, 116, '1') + txt(150, 64, '1', '', 'start') + txt(72, 52, '√2', 'tg', 'end') + txt(44, 94, '45°', 'sm') + txt(132, 38, '45°', 'sm', 'end')), '45°-45°-90°', 'legs equal; hypotenuse = leg × √2') +
      fig(dg(170, 120, '<polygon points="20,100 150,100 150,25" class="fa"/><path d="M140 100v-10h10" class="lt"/>' + txt(85, 116, '√3') + txt(158, 66, '1', '', 'start') + txt(76, 56, '2', 'tg', 'end') + txt(46, 94, '30°', 'sm') + txt(142, 44, '60°', 'sm', 'end')), '30°-60°-90°', 'short leg 1 (opposite 30°), long leg √3, hypotenuse 2') +
      fig(dg(170, 120, line(85, 10, 85, 110, 'lt') + line(15, 60, 155, 60, 'lt') + txt(120, 38, 'All +', 'ta') + txt(50, 38, 'Sin +', 'tg') + txt(50, 92, 'Tan +', 'tb') + txt(120, 92, 'Cos +', 'tb') + txt(120, 22, 'I', 'sm') + txt(50, 22, 'II', 'sm') + txt(50, 108, 'III', 'sm') + txt(120, 108, 'IV', 'sm')), 'ASTC', '“All Students Take Calculus” — which functions are positive in each quadrant') + '</div>' +
      H.table(['θ', '0°', '30°', '45°', '60°', '90°'], [['sin θ', '0', '1/2', '√2/2', '√3/2', '1'], ['cos θ', '1', '√3/2', '√2/2', '1/2', '0'], ['tan θ', '0', '√3/3', '1', '√3', 'undefined']]) +
      '<h3>Identities to memorize</h3><div class="fgrid">' + fbox('Pythagorean', 'sin²θ + cos²θ = 1') + fbox('Pythagorean', '1 + tan²θ = sec²θ') + fbox('Pythagorean', '1 + cot²θ = csc²θ') + fbox('Quotient', 'tan θ = sin θ / cos θ', 'gold') + fbox('Quotient', 'cot θ = cos θ / sin θ', 'gold') + fbox('Cofunction', 'sin(90° − θ) = cos θ', 'gold') + fbox('Radians', '180° = π rad', 'red') + fbox('Arc length', 's = rθ (θ in radians)', 'red') + '</div>{{p2}}');
  },
  init: trigInit
});

/* ====================================================================== */
/* STATISTICS & PROBABILITY                                                */
/* ====================================================================== */
function med(a) { var s = a.slice().sort(function (x, y) { return x - y; }), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
function genStatsC(L) {
  var h = T.hardNow(L), n = h ? 7 + rnd(3) : 5 + rnd(2), d = [], i, t = rnd(h ? 7 : 4), sum;
  for (i = 0; i < n; i++) d.push(rnd(25) + 2);
  switch (t) {
    case 0: sum = d.reduce(function (a, b) { return a + b; }, 0); d[n - 1] += (n - sum % n) % n; sum = d.reduce(function (a, b) { return a + b; }, 0);
      return G('math', 'stats', 'Find the mean of: ' + d.join(', '), numOpts(sum / n, [1, -1, 2, -2, 3]), 'Sum = ' + sum + '. Mean = ' + sum + ' ÷ ' + n + ' = ' + (sum / n) + '.');
    case 1: var m = med(d); return G('math', 'stats', 'Find the median of: ' + d.join(', '), choices(m, [d[Math.floor(n / 2)], Math.round(d.reduce(function (a, b) { return a + b; }, 0) / n), m + 1], m), 'Sort first: ' + d.slice().sort(function (a, b) { return a - b; }).join(', ') + '. ' + (n % 2 ? 'The middle value is ' + m + '.' : 'With an even count, average the two middle values: ' + m + '.') + ' Forgetting to sort is the classic mistake.');
    case 2: var mode = d[0]; d = d.filter(function (x) { return x !== mode; }).filter(function (x, i, s) { return s.indexOf(x) === i; }).slice(0, n - 3).concat([mode, mode, mode]); d = shuffle(d);
      return G('math', 'stats', 'Find the mode of: ' + d.join(', '), choices(mode, [med(d), Math.max.apply(null, d), d.filter(function (x) { return x !== mode; })[0]], mode), 'The mode is the value that appears most often: ' + mode + ' appears 3 times.');
    case 3: var mx = Math.max.apply(null, d), mn = Math.min.apply(null, d); return G('math', 'stats', 'Find the range of: ' + d.join(', '), choices(mx - mn, [mx, mx + mn, med(d)], mx - mn), 'Range = highest − lowest = ' + mx + ' − ' + mn + ' = ' + (mx - mn) + '.');
    case 4: var M = rnd(10) + 10, k = 5, known = [M - 3, M + 4, M - 6, M + 2], x = k * M - known.reduce(function (a, b) { return a + b; }, 0);
      return G('math', 'stats', 'The mean of ' + known.join(', ') + ' and <i>x</i> is ' + M + '. Find <i>x</i>.', numOpts(x, [1, -1, 2, -3, 5]), 'Total must be 5 × ' + M + ' = ' + (5 * M) + '. Known values add to ' + known.reduce(function (a, b) { return a + b; }, 0) + ', so <i>x</i> = ' + x + '.');
    case 5: var C = pick([['the mean', 'the median and mode do not move much, but the mean is pulled toward the extreme value']]);
      return G('math', 'stats', 'A data set has one extremely large value (an outlier). Which measure is affected the MOST?', ['the mean', 'the median', 'the mode', 'none of them'], 'The mean uses every value, so one huge number pulls it up. The median only depends on the middle position.');
    default: var nn = pick([4, 5, 6, 8]), M1 = rnd(10) + 12, add = pick([2, 3, 5]);
      return G('math', 'stats', 'The mean of ' + nn + ' numbers is ' + M1 + '. If ' + add + ' is added to EACH number, what is the new mean?', choices(M1 + add, [M1 + add * nn, M1, M1 * add], M1 + add), 'Adding the same amount to every value adds it to the mean too: ' + M1 + ' + ' + add + ' = ' + (M1 + add) + '.');
  }
}
function genProb(L) {
  var h = T.hardNow(L), t = rnd(h ? 6 : 3), r, b, g, tot;
  switch (t) {
    case 0: var E = pick([['an even number', 3], ['a number greater than 4', 2], ['a prime number', 3], ['a multiple of 3', 2], ['a number less than 3', 2], ['a 6', 1], ['a number from 1 to 5', 5]]);
      return G('math', 'stats', 'A fair die is rolled. What is the probability of getting ' + E[0] + '?', [fr(E[1], 6)].concat([fr(E[1], 5), fr(6 - E[1], 6), fr(E[1] + 1, 6), fr(1, E[1] + 1)].filter(function (v) { return v !== fr(E[1], 6); }).filter(function (v, i, s) { return s.indexOf(v) === i; }).slice(0, 3)), 'There are ' + E[1] + ' favorable outcomes out of 6: P = ' + E[1] + '/6' + (gcd(E[1], 6) > 1 ? ' = ' + fr(E[1], 6) : '') + '.');
    case 1: r = rnd(6) + 2; b = rnd(6) + 2; g = rnd(5) + 1; tot = r + b + g; var not = h && rnd(2);
      return G('math', 'stats', 'A bag has ' + r + ' red, ' + b + ' blue and ' + g + ' green marbles. One is drawn at random. What is P(' + (not ? 'NOT red' : 'blue') + ')?', not ? [fr(b + g, tot), fr(r, tot), fr(b + g, r), fr(1, 3)] : [fr(b, tot), fr(b, r + g), fr(r + g, tot), fr(1, 3)], not ? 'P(not red) = 1 − P(red) = 1 − ' + r + '/' + tot + ' = ' + fr(b + g, tot) + '.' : 'P(blue) = ' + b + ' blue out of ' + tot + ' total = ' + fr(b, tot) + '.');
    case 2: var c = pick([2, 3, 4]); return G('math', 'stats', 'A fair coin is tossed ' + c + ' times. What is the probability of getting at least one head?', [fr(Math.pow(2, c) - 1, Math.pow(2, c)), fr(1, Math.pow(2, c)), '1/2', fr(c, Math.pow(2, c))], 'Complement: P(no heads) = (1/2)' + sup(c) + ' = 1/' + Math.pow(2, c) + '. So P(at least one) = 1 − 1/' + Math.pow(2, c) + ' = ' + fr(Math.pow(2, c) - 1, Math.pow(2, c)) + '.');
    case 3: var s = rnd(11) + 2, cnt = 6 - Math.abs(s - 7); return G('math', 'stats', 'Two fair dice are rolled. What is the probability that the sum is ' + s + '?', [fr(cnt, 36), fr(cnt + 1, 36), fr(1, 11), fr(s, 36)].filter(function (v, i, a) { return a.indexOf(v) === i; }).concat(['1/6', '1/9']).slice(0, 4), 'Of the 36 equally likely pairs, ' + cnt + ' give a sum of ' + s + ' (see the dice grid). P = ' + cnt + '/36' + (gcd(cnt, 36) > 1 ? ' = ' + fr(cnt, 36) : '') + '.');
    case 4: r = rnd(4) + 3; b = rnd(5) + 3; tot = r + b; return G('math', 'stats', 'A box has ' + r + ' red and ' + b + ' blue pens. Two are taken without replacement. What is the probability both are red?', [fr(r * (r - 1), tot * (tot - 1)), fr(r * r, tot * tot), fr(r, tot), fr(r - 1, tot)].filter(function (v, i, a) { return a.indexOf(v) === i; }).concat(['1/2']).slice(0, 4), 'First red: ' + r + '/' + tot + '. Second red: ' + (r - 1) + '/' + (tot - 1) + '. Multiply: ' + (r * (r - 1)) + '/' + (tot * (tot - 1)) + ' = ' + fr(r * (r - 1), tot * (tot - 1)) + '.');
    default: var K = pick([['a king', '1/13', '4 kings out of 52 = 4/52'], ['a heart', '1/4', '13 hearts out of 52'], ['a red face card', '3/26', '6 red face cards (J, Q, K of hearts and diamonds) out of 52'], ['a heart or a king', '4/13', '13 hearts + 4 kings − 1 (king of hearts counted twice) = 16; 16/52'], ['an ace or a spade', '4/13', '4 aces + 13 spades − 1 (ace of spades) = 16; 16/52']]);
      return G('math', 'stats', 'A card is drawn from a standard 52-card deck. What is the probability of drawing ' + K[0] + '?', [K[1]].concat(['1/13', '1/4', '3/26', '4/13', '17/52', '1/52'].filter(function (v) { return v !== K[1]; }).slice(0, 3)), K[2] + ' = ' + K[1] + '. For “or”, add and then subtract the overlap.');
  }
}
function genCount(L) {
  var h = T.hardNow(L), t = rnd(h ? 8 : 4), n, r, a, b, c;
  var fact = function (k) { var p = 1; for (var i = 2; i <= k; i++) p *= i; return p; };
  switch (t) {
    case 0: a = rnd(4) + 2; b = rnd(4) + 2; c = rnd(3) + 2; return G('math', 'stats', 'You have ' + a + ' shirts, ' + b + ' pants and ' + c + ' pairs of shoes. How many different outfits can you make?', choices(a * b * c, [a + b + c, a * b + c, a * b], a * b * c), 'Fundamental counting principle: multiply the choices: ' + a + ' × ' + b + ' × ' + c + ' = ' + (a * b * c) + '.');
    case 1: n = rnd(5) + 5; r = pick([2, 3]); var P = fact(n) / fact(n - r); return G('math', 'stats', 'In how many ways can 1st' + (r === 3 ? ', 2nd and 3rd' : ' and 2nd') + ' place be awarded among ' + n + ' runners?', choices(P, [P / fact(r), Math.pow(n, r), n * r], P), 'Order matters (permutation): ' + n + 'P' + r + ' = ' + Array.from({ length: r }, function (_, i) { return n - i; }).join(' × ') + ' = ' + P + '.');
    case 2: n = rnd(5) + 5; r = pick([2, 3]); var Cc = fact(n) / fact(n - r) / fact(r); return G('math', 'stats', 'How many ways can a ' + r + '-member group be chosen from ' + n + ' students?', choices(Cc, [Cc * fact(r), n * r, Math.pow(2, n)], Cc), 'Order does NOT matter (combination): ' + n + 'C' + r + ' = ' + n + 'P' + r + ' ÷ ' + r + '! = ' + (Cc * fact(r)) + ' ÷ ' + fact(r) + ' = ' + Cc + '.');
    case 3: var W = pick(['MATH', 'PLANE', 'BRICK', 'CLOUD', 'FRIEND', 'STORY']); n = W.length; return G('math', 'stats', 'How many different arrangements of the letters of ' + W + ' are possible?', choices(fact(n), [fact(n - 1), n * n, fact(n) / 2], fact(n)), 'All ' + n + ' letters are different, so there are ' + n + '! = ' + fact(n) + ' arrangements.');
    case 4: var R = pick([['BOOK', 12, '4! ÷ 2! (two O’s)'], ['LEVEL', 30, '5! ÷ (2! × 2!) (two L’s, two E’s)'], ['BANANA', 60, '6! ÷ (3! × 2!) (three A’s, two N’s)'], ['APPLE', 60, '5! ÷ 2! (two P’s)'], ['COFFEE', 180, '6! ÷ (2! × 2!) (two F’s, two E’s)'], ['PEPPER', 60, '6! ÷ (3! × 2!) (three P’s, two E’s)']]);
      return G('math', 'stats', 'How many distinct arrangements can be made from the letters of ' + R[0] + '?', choices(R[1], [fact(R[0].length), R[1] * 2, R[1] / 2], R[1]), 'Divide by the factorial of each repeat count: ' + R[2] + ' = ' + R[1] + '.');
    case 5: n = rnd(10) + 6; return G('math', 'stats', n + ' people each shake hands once with every other person. How many handshakes are there?', choices(n * (n - 1) / 2, [n * (n - 1), n * n, n * 2], n * (n - 1) / 2), 'Each handshake is a pair: ' + n + 'C2 = ' + n + ' × ' + (n - 1) + ' ÷ 2 = ' + (n * (n - 1) / 2) + '.');
    case 6: n = rnd(4) + 4; return G('math', 'stats', 'In how many ways can ' + n + ' people sit around a round table?', choices(fact(n - 1), [fact(n), fact(n) / 2, n * n], fact(n - 1)), 'In a circle, rotations are the same seating, so fix one person: (n − 1)! = ' + (n - 1) + '! = ' + fact(n - 1) + '.');
    default: var rep = rnd(2) === 1; return G('math', 'stats', 'How many 3-digit numbers can be formed from the digits 1, 2, 3, 4, 5 if digits ' + (rep ? 'CAN' : 'CANNOT') + ' be repeated?', choices(rep ? 125 : 60, [rep ? 60 : 125, 10, 15], rep ? 125 : 60), rep ? '5 choices for each of the 3 places: 5 × 5 × 5 = 125.' : '5 choices, then 4, then 3: 5 × 4 × 3 = 60.');
  }
}
function statWidget() { return '<div class="widget"><b>📊 Mean vs. median</b><p class="small muted">Each dot is a score. The green ▲ marks the mean, the gold ▲ the median. Add an outlier and watch which one moves.</p><div id="stSvg"></div><div class="wout" id="stOut"></div><div class="row" style="margin-top:8px"><button class="btn sm alt" id="stNew">New data</button><button class="btn sm alt" id="stOut1">Add an outlier (20)</button><button class="btn sm alt" id="stLow">Add a low score (1)</button></div></div>'; }
function statInit(root) {
  var data;
  function fresh() { data = []; for (var i = 0; i < 9; i++) data.push(rnd(7) + 4); draw(); }
  function draw() {
    var s = '', cnt = {}, u = 11, base = 100, X = function (v) { return 15 + v * u; };
    s += line(10, base, 250, base, 'ln');
    for (var v = 0; v <= 21; v++) { s += line(X(v), base, X(v), base + 4, 'lt'); if (v % 5 === 0) s += txt(X(v), base + 16, v, 'sm'); }
    data.forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; s += '<circle cx="' + X(x) + '" cy="' + (base - 6 - (cnt[x] - 1) * 10) + '" r="4.5" class="fb"/>'; });
    var sum = data.reduce(function (a, b) { return a + b; }, 0), mean = sum / data.length, md = med(data), mx = 0, mode = [];
    Object.keys(cnt).forEach(function (k) { if (cnt[k] > mx) { mx = cnt[k]; mode = [k]; } else if (cnt[k] === mx) mode.push(k); });
    s += '<path d="M' + X(mean) + ' ' + (base + 20) + 'l-6 10h12z" class="fs"/><path d="M' + X(md) + ' ' + (base + 20) + 'l-6 10h12z" class="fgo"/>';
    root.querySelector('#stSvg').innerHTML = dg(260, 135, s, 'dot plot', 'max-width:420px');
    root.querySelector('#stOut').innerHTML = '<div><b>' + (Math.round(mean * 100) / 100) + '</b><span>mean (sum ' + sum + ' ÷ ' + data.length + ')</span></div><div><b>' + md + '</b><span>median</span></div><div><b>' + (mode.length > 3 ? 'none' : mode.join(', ')) + '</b><span>mode</span></div><div><b>' + (Math.max.apply(null, data) - Math.min.apply(null, data)) + '</b><span>range</span></div>';
  }
  root.querySelector('#stNew').onclick = fresh;
  root.querySelector('#stOut1').onclick = function () { data.push(20); draw(); };
  root.querySelector('#stLow').onclick = function () { data.push(1); draw(); };
  fresh();
}
function diceGrid() {
  var s = '', u = 22, x0 = 30, y0 = 22;
  for (var i = 1; i <= 6; i++) { s += txt(x0 + (i - 0.5) * u, y0 - 6, i, 'sm') + txt(x0 - 8, y0 + (i - 0.5) * u + 4, i, 'sm'); }
  for (var r = 1; r <= 6; r++) for (var c = 1; c <= 6; c++) { var hot = r + c === 7; s += '<rect x="' + (x0 + (c - 1) * u) + '" y="' + (y0 + (r - 1) * u) + '" width="' + u + '" height="' + u + '" class="' + (hot ? 'fg' : 'lt') + '"/>' + txt(x0 + (c - 0.5) * u, y0 + (r - 0.5) * u + 4, r + c, 'sm' + (hot ? ' tg' : '')); }
  return dg(170, 160, s + txt(96, 158, 'sum of 7: 6 of 36 = 1/6', 'sm'), 'grid of all 36 outcomes of two dice');
}
function coinTree() {
  var s = line(20, 60, 70, 30) + line(20, 60, 70, 90) + line(80, 30, 130, 15) + line(80, 30, 130, 45) + line(80, 90, 130, 75) + line(80, 90, 130, 105);
  s += txt(75, 34, 'H', 'ta') + txt(75, 94, 'T', 'tb') + txt(136, 19, 'H → HH', 'sm', 'start') + txt(136, 49, 'T → HT', 'sm', 'start') + txt(136, 79, 'H → TH', 'sm', 'start') + txt(136, 109, 'T → TT', 'sm', 'start');
  return dg(200, 115, s, 'tree diagram of two coin tosses');
}
LESSONS.push({ id: 'stats', sec: 'math', title: 'Statistics & Probability', icon: 'σ', blurb: 'Mean, median, mode and range; probability with dice, coins and cards; permutations and combinations.',
  sets: [{ name: 'Mean, median, mode, range', gen: genStatsC }, { name: 'Probability', gen: genProb }, { name: 'Counting', gen: genCount }],
  html: card('Describing data', '<div class="fgrid">' + fbox('Mean (average)', 'sum ÷ number of values') + fbox('Median', 'middle value after SORTING') + fbox('Mode', 'most frequent value') + fbox('Range', 'highest − lowest') + fbox('Missing value', 'needed total = mean × count', 'gold') + fbox('Weighted mean', 'Σ(value × weight) ÷ Σweights', 'gold') + '</div>' + statWidget() +
      '<div class="note">For an even number of values, the median is the average of the two middle values. Adding the same number to every value shifts the mean, median and mode by that number but does not change the range or standard deviation.</div>{{p0}}') +
    card('Probability', '<div class="fgrid">' + fbox('P(event)', 'favorable outcomes ÷ total outcomes') + fbox('Range', '0 (impossible) to 1 (certain)') + fbox('Complement', 'P(not A) = 1 − P(A)') + fbox('A AND B (independent)', 'P(A) × P(B)', 'gold') + fbox('A OR B', 'P(A) + P(B) − P(A and B)', 'gold') + fbox('Without replacement', 'the total drops by 1 each draw', 'red') + '</div>' +
      '<div class="figs">' + fig(diceGrid(), 'Two dice: 36 outcomes', 'Sum of 7 is most likely (6 ways). Sums 2 and 12 have only 1 way each.') + fig(coinTree(), 'Tree diagram', 'Two coins: 4 outcomes. P(one head, one tail) = 2/4 = 1/2.') + '</div>' +
      '<p class="small"><b>A deck of cards:</b> 52 cards, 4 suits (♥ ♦ red, ♣ ♠ black) of 13 cards each (A, 2–10, J, Q, K). 12 face cards.</p>{{p1}}') +
    card('Counting: permutations and combinations', '<div class="fgrid">' + fbox('Counting principle', 'multiply the choices at each step') + fbox('n!', 'n × (n−1) × … × 1') + fbox('Permutation (order matters)', 'nPr = n! ÷ (n − r)!', 'gold') + fbox('Combination (order doesn’t)', 'nCr = n! ÷ [r!(n − r)!]', 'gold') + fbox('Repeated letters', 'n! ÷ (a! b! …)') + fbox('Circular seating', '(n − 1)!') + '</div>' +
      '<div class="note"><b>Order matters?</b> Ranks, positions, passwords, arrangements → permutation. Teams, committees, handfuls, pairs → combination.</div>{{p2}}'),
  init: statInit
});

/* ====================================================================== */
/* SEQUENCES                                                               */
/* ====================================================================== */
function stairs(vals, lab, cls) {
  var s = '', w = 34, mx = Math.max.apply(null, vals), sc = 90 / mx;
  vals.forEach(function (v, i) { var hh = v * sc; s += '<rect x="' + (12 + i * (w + 8)) + '" y="' + (105 - hh) + '" width="' + w + '" height="' + hh + '" class="' + cls + '"/>' + txt(12 + i * (w + 8) + w / 2, 100 - hh, v, 'sm'); if (i) s += txt(12 + i * (w + 8) - 4, 122, lab, 'sm tg'); });
  return dg(12 + vals.length * (w + 8), 128, s, 'bar picture of a sequence');
}
function diffTable() {
  var r1 = [2, 5, 10, 17, 26, '?'], r2 = [3, 5, 7, 9, 11], r3 = [2, 2, 2, 2], s = '';
  r1.forEach(function (v, i) { s += txt(25 + i * 45, 22, v, v === '?' ? 'tg' : ''); });
  r2.forEach(function (v, i) { s += txt(47 + i * 45, 52, v, i === 4 ? 'tg' : 'tb'); s += line(30 + i * 45, 27, 44 + i * 45, 40, 'lt') + line(64 + i * 45, 27, 50 + i * 45, 40, 'lt'); });
  r3.forEach(function (v, i) { s += txt(70 + i * 45, 82, v, 'ta'); });
  s += txt(290, 22, 'terms', 'sm', 'start') + txt(290, 52, '1st differences', 'sm', 'start') + txt(290, 82, '2nd differences', 'sm', 'start') + txt(160, 104, 'next difference 11 → next term 26 + 11 = 37', 'sm tg');
  return dg(380, 112, s, 'difference table');
}
LESSONS.push({ id: 'seq', sec: 'math', title: 'Sequences & Series', icon: '⋯', blurb: 'Arithmetic and geometric sequences, their nth-term and sum formulas, and how to crack any number pattern.',
  sets: [{ name: 'Arithmetic & geometric', gen: T.seqQ }, { name: 'Number patterns', gen: T.numSeries }],
  html: card('Arithmetic sequences — add the same number', '<div class="figs">' + fig(stairs([2, 5, 8, 11, 14], '+3', 'fa'), '2, 5, 8, 11, 14, …', 'common difference d = 3: equal steps') + '</div>' +
      '<div class="fgrid">' + fbox('nth term', 'aₙ = a₁ + (n − 1)d') + fbox('Common difference', 'd = aₙ₊₁ − aₙ') + fbox('Sum of n terms', 'Sₙ = n/2 · (a₁ + aₙ)') + fbox('…or', 'Sₙ = n/2 · [2a₁ + (n − 1)d]') + fbox('Number of terms', 'n = (last − first)/d + 1', 'gold') + fbox('Arithmetic mean', '(a + b)/2', 'gold') + fbox('1 + 2 + … + n', 'n(n + 1)/2', 'red') + fbox('1 + 3 + 5 + … (n terms)', 'n²', 'red') + '</div>') +
    card('Geometric sequences — multiply by the same number', '<div class="figs">' + fig(stairs([1, 2, 4, 8, 16], '×2', 'fg'), '1, 2, 4, 8, 16, …', 'common ratio r = 2: each bar doubles') + fig(stairs([81, 54, 36, 24, 16], '×⅔', 'fb'), '81, 54, 36, 24, 16, …', 'r = 2/3: a ratio between 0 and 1 shrinks') + '</div>' +
      '<div class="fgrid">' + fbox('nth term', 'aₙ = a₁ · rⁿ⁻¹') + fbox('Common ratio', 'r = aₙ₊₁ ÷ aₙ') + fbox('Sum of n terms', 'Sₙ = a₁(rⁿ − 1)/(r − 1)') + fbox('Infinite sum (|r| < 1)', 'S = a₁ / (1 − r)', 'gold') + fbox('Geometric mean', '√(ab)', 'gold') + fbox('Negative r', 'signs alternate: 3, −6, 12, …', 'red') + '</div>{{p0}}') +
    card('Cracking any number pattern', '<p>When the jumps are not equal, build a <b>difference table</b>. If the second row is constant, the pattern is quadratic.</p>' + diffTable() +
      H.table(['Pattern', 'Example', 'Clue'], [['Squares', '1, 4, 9, 16, 25', 'n²'], ['Cubes', '1, 8, 27, 64, 125', 'n³'], ['Triangular', '1, 3, 6, 10, 15', '+2, +3, +4…'], ['Fibonacci-like', '2, 3, 5, 8, 13', 'add the two before'], ['Primes', '2, 3, 5, 7, 11, 13', 'no divisors'], ['Alternating', '3, 20, 5, 18, 7, 16', 'two series take turns'], ['Mixed operations', '2, 4, 7, 14, 17, 34', '×2, +3, ×2, +3'], ['Growing multiplier', '1, 2, 6, 24, 120', '×2, ×3, ×4…']]) +
      '<div class="note">Checklist: (1) differences, (2) ratios, (3) squares/cubes nearby, (4) every other term, (5) combine the two previous terms.</div>{{p1}}')
});
})();
