/* Basic Reviewer — Science lessons (interactive cell, Punnett square, Bohr atom, Earth diagrams …) */
(function () {
'use strict';
var T = window.TP, H = window.LH;
var rnd = T.rnd, pick = T.pick, shuffle = T.shuffle, sample = T.sample, G = T.G, choices = T.choices, numOpts = T.numOpts, neg = T.neg;
var dg = H.dg, fig = H.fig, fbox = H.fbox, txt = H.t, line = H.line, card = H.card, fr = H.fr;
function q4(ans, pool) { return [ans].concat(sample(pool.filter(function (x) { return x !== ans; }), 3)); }

/* ====================================================================== */
/* CELLS                                                                   */
/* ====================================================================== */
var ORG = {
  membrane: ['Cell membrane', 'controls what enters and leaves the cell', 'A thin, flexible layer of lipids and proteins around every cell. It is <b>selectively permeable</b>: it lets some substances through and keeps others out.', 'both'],
  nucleus: ['Nucleus', 'stores DNA and controls the cell’s activities', 'The control center. It holds the DNA (chromosomes) and is wrapped in a double nuclear envelope with pores.', 'both'],
  nucleolus: ['Nucleolus', 'makes ribosomes', 'A dense spot inside the nucleus where ribosome parts are assembled.', 'both'],
  mito: ['Mitochondrion', 'releases energy (ATP) from food by cellular respiration', 'The “powerhouse of the cell”. Its folded inner membrane (cristae) gives lots of surface for respiration. Muscle cells have many.', 'both'],
  ribo: ['Ribosome', 'makes proteins', 'Tiny dots, free in the cytoplasm or stuck on rough ER, that read mRNA and join amino acids into proteins. Ribosomes have no membrane — even bacteria have them.', 'both'],
  er: ['Endoplasmic reticulum', 'transports materials; rough ER makes proteins, smooth ER makes lipids', 'A network of folded membranes. <b>Rough ER</b> is studded with ribosomes; <b>smooth ER</b> makes lipids and breaks down toxins.', 'both'],
  golgi: ['Golgi apparatus', 'packages and ships proteins', 'Stacks of flattened sacs that modify, sort and package proteins into vesicles — the cell’s “post office”.', 'both'],
  lyso: ['Lysosome', 'digests wastes and worn-out parts', 'A small sac of digestive enzymes — the cell’s “clean-up crew”. Mainly in animal cells.', 'animal'],
  centriole: ['Centrioles', 'help organize cell division', 'A pair of small tube bundles that help form the spindle that pulls chromosomes apart during division. Found in animal cells.', 'animal'],
  vacuole: ['Vacuole', 'stores water, food and wastes', 'A storage sac. Animal cells have small ones; plant cells have one <b>large central vacuole</b> that pushes against the wall and keeps the plant firm (turgor).', 'both'],
  chloro: ['Chloroplast', 'carries out photosynthesis', 'Green organelles containing chlorophyll. They capture light energy to make glucose from CO₂ and water. Only in plants and algae.', 'plant'],
  wall: ['Cell wall', 'gives the plant cell support and a fixed shape', 'A rigid layer of cellulose OUTSIDE the cell membrane. Animal cells do not have one.', 'plant'],
  cyto: ['Cytoplasm', 'the jelly-like fluid where organelles sit and many reactions happen', 'Everything inside the membrane except the nucleus. Mostly water with dissolved salts and molecules.', 'both']
};
function P_(k, inner) { return '<g class="part" data-part="' + k + '">' + inner + '</g>'; }
function mito(x, y, rot, s) { s = s || 1; return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + s + ')"><ellipse rx="22" ry="11" fill="#f39c4a" stroke="#b85e12" stroke-width="2"/><path d="M-16 0l5-6 5 12 5-12 5 12 5-12 4 6" fill="none" stroke="#8a4210" stroke-width="1.6"/></g>'; }
function chloro(x, y, rot) { return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')"><ellipse rx="20" ry="11" fill="#3cb371" stroke="#1f7a46" stroke-width="2"/><path d="M-12 -4v8M-6 -5v10M0 -5v10M6 -5v10M12 -4v8" stroke="#135c32" stroke-width="2.4"/></g>'; }
function ribos(pts) { return pts.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.3" fill="#5b4a7a"/>'; }).join(''); }
function cellSvg(type, hl) {
  var s;
  if (type === 'animal') {
    s = P_('membrane', '<ellipse cx="150" cy="112" rx="138" ry="98" fill="rgba(111,183,232,.16)" stroke="#4f9fd0" stroke-width="4"/>') +
      P_('cyto', '<text x="248" y="196" font-size="10" style="fill:#4f9fd0">cytoplasm</text>') +
      P_('er', '<path d="M170 68q12 10 0 20t0 20 0 20 0 20" fill="none" stroke="#e48ab5" stroke-width="5" stroke-linecap="round"/><path d="M182 72q12 12 0 24t0 24 0 24" fill="none" stroke="#e48ab5" stroke-width="5" stroke-linecap="round"/>' + ribos([[177, 78], [165, 98], [177, 118], [165, 138], [189, 86], [189, 110], [189, 134]])) +
      P_('nucleus', '<circle cx="128" cy="108" r="34" fill="#b9a4e6" stroke="#6e52c2" stroke-width="3"/>') + P_('nucleolus', '<circle cx="136" cy="102" r="11" fill="#5d3fae"/>') +
      P_('golgi', '<path d="M196 160q22-14 44 0M200 169q18-11 36 0M204 178q14-8 28 0M198 151q24-16 48 0" fill="none" stroke="#d29a00" stroke-width="5" stroke-linecap="round"/>') +
      P_('mito', mito(62, 70, -25) + mito(84, 160, 15) + mito(232, 74, 30)) +
      P_('lyso', '<circle cx="150" cy="180" r="9" fill="#e05a4f" stroke="#a2302a" stroke-width="2"/><circle cx="262" cy="125" r="7" fill="#e05a4f" stroke="#a2302a" stroke-width="2"/>') +
      P_('centriole', '<g transform="translate(240 112)"><rect x="-12" y="-4" width="24" height="8" rx="3" fill="#7a7a7a"/><rect x="-4" y="-12" width="8" height="24" rx="3" fill="#9a9a9a"/></g>') +
      P_('vacuole', '<circle cx="50" cy="118" r="14" fill="#a9dcf5" stroke="#4f9fd0" stroke-width="2"/>') +
      P_('ribo', ribos([[90, 60], [105, 168], [60, 150], [212, 48], [118, 52], [260, 92], [44, 90], [178, 188]]));
  } else {
    s = P_('wall', '<rect x="8" y="8" width="284" height="204" rx="16" fill="none" stroke="#2e8b57" stroke-width="8"/>') +
      P_('membrane', '<rect x="19" y="19" width="262" height="182" rx="10" fill="rgba(111,183,232,.14)" stroke="#4f9fd0" stroke-width="2.5"/>') +
      P_('cyto', '<text x="30" y="194" font-size="10" style="fill:#4f9fd0">cytoplasm</text>') +
      P_('vacuole', '<path d="M128 40h128a16 16 0 0 1 16 16v100a16 16 0 0 1-16 16H136a16 16 0 0 1-16-16V56a16 16 0 0 1 8-16z" fill="#bfe6fa" stroke="#4f9fd0" stroke-width="2.5"/><text x="196" y="110" text-anchor="middle" font-size="11" style="fill:#2f7fae">central vacuole</text>') +
      P_('nucleus', '<circle cx="68" cy="66" r="28" fill="#b9a4e6" stroke="#6e52c2" stroke-width="3"/>') + P_('nucleolus', '<circle cx="74" cy="60" r="9" fill="#5d3fae"/>') +
      P_('er', '<path d="M100 48q10 8 0 16t0 16 0 16" fill="none" stroke="#e48ab5" stroke-width="4.5" stroke-linecap="round"/>' + ribos([[106, 54], [95, 72], [106, 88]])) +
      P_('chloro', chloro(48, 120, 20) + chloro(92, 170, -10) + chloro(160, 186, 5) + chloro(250, 186, -5) + chloro(42, 172, 70)) +
      P_('mito', mito(96, 128, -40, .85)) +
      P_('golgi', '<path d="M30 92q16-10 32 0M33 100q13-8 26 0M36 108q10-6 20 0" fill="none" stroke="#d29a00" stroke-width="4" stroke-linecap="round"/>') +
      P_('ribo', ribos([[110, 110], [60, 145], [118, 160], [200, 30], [140, 28], [30, 140], [120, 190]]));
  }
  if (hl) s = s.replace(/<g class="part" data-part="([a-z]+)">/g, function (m, k) { return k === hl ? '<g class="part" data-part="' + k + '" style="filter:drop-shadow(0 0 4px #f2b705) drop-shadow(0 0 2px #f2b705)">' : '<g class="part" data-part="' + k + '" style="opacity:.35">'; });
  return dg(300, 220, s, type + ' cell diagram', hl ? 'max-width:300px' : '');
}
function cellWidget(type) {
  var keys = Object.keys(ORG).filter(function (k) { return ORG[k][3] === 'both' || ORG[k][3] === type; });
  return '<div class="widget cellw" data-type="' + type + '"><b>' + (type === 'animal' ? '🧫 Animal cell' : '🌿 Plant cell') + ' — tap any part</b>' + cellSvg(type) +
    '<div class="chips">' + keys.map(function (k) { return '<button class="chip" data-org="' + k + '">' + ORG[k][0] + '</button>'; }).join('') + '</div><div class="info"><span class="muted small">Tap a part of the cell or a name above to learn what it does.</span></div></div>';
}
function cellInit(root) {
  [].forEach.call(root.querySelectorAll('.cellw'), function (w) {
    function show(k) {
      if (!ORG[k]) return;
      [].forEach.call(w.querySelectorAll('.part'), function (p) { p.classList.toggle('hl', p.getAttribute('data-part') === k); });
      [].forEach.call(w.querySelectorAll('.chip'), function (c) { c.classList.toggle('on', c.getAttribute('data-org') === k); });
      var o = ORG[k]; w.querySelector('.info').innerHTML = '<b>' + o[0] + '</b> — ' + o[1] + '.<br><span class="small">' + o[2] + '</span><br><span class="small muted">Found in: ' + (o[3] === 'both' ? 'plant and animal cells' : o[3] + ' cells') + '</span>';
    }
    w.addEventListener('click', function (e) { var p = e.target.closest('[data-part]') || e.target.closest('[data-org]'); if (p) show(p.getAttribute('data-part') || p.getAttribute('data-org')); });
  });
}
function genCell(L) {
  var h = T.hardNow(L), keys = Object.keys(ORG).filter(function (k) { return k !== 'cyto'; }), k = pick(keys), o = ORG[k], t = rnd(h ? 6 : 4);
  var names = keys.map(function (x) { return ORG[x][0]; }), fns = keys.map(function (x) { return ORG[x][1]; });
  if (t === 0) return G('science', 'bio', 'Which cell part ' + o[1] + '?', q4(o[0], names), o[0] + ': ' + o[2].replace(/<[^>]+>/g, ''));
  if (t === 1) return G('science', 'bio', 'What is the main job of the ' + o[0].toLowerCase() + '?', q4(o[1], fns), o[2].replace(/<[^>]+>/g, ''));
  if (t === 2) { var type = o[3] === 'plant' ? 'plant' : o[3] === 'animal' ? 'animal' : pick(['plant', 'animal']); if (k === 'centriole' || k === 'lyso') type = 'animal'; if (k === 'chloro' || k === 'wall') type = 'plant';
    var pool = keys.filter(function (x) { return ORG[x][3] === 'both' || ORG[x][3] === type; }).map(function (x) { return ORG[x][0]; });
    return G('science', 'bio', 'Name the highlighted structure in this ' + type + ' cell.' + cellSvg(type, k), q4(o[0], pool), 'The glowing part is the ' + o[0].toLowerCase() + ', which ' + o[1] + '.'); }
  if (t === 3) { var pl = pick(['Cell wall', 'Chloroplast', 'Large central vacuole']); return G('science', 'bio', 'Which is found in PLANT cells but not in animal cells?', [pl].concat(sample(['Nucleus', 'Mitochondrion', 'Ribosome', 'Cell membrane', 'Golgi apparatus'], 3)), 'Plant cells have a cell wall, chloroplasts and a large central vacuole. Both kinds of cells have a nucleus, mitochondria, ribosomes and a cell membrane.'); }
  var F = pick([
    ['Which cells have NO nucleus?', 'Prokaryotic cells (bacteria)', ['Plant cells', 'Animal cells', 'Fungal cells'], 'Prokaryotes keep their DNA loose in the cytoplasm (nucleoid region). Eukaryotes — plants, animals, fungi, protists — have a nucleus.'],
    ['Meiosis produces:', 'four cells with half the chromosome number', ['two identical cells', 'four identical body cells', 'two cells with double the chromosomes'], 'Meiosis makes sex cells (gametes): 4 genetically different cells, each with half the chromosomes (46 → 23 in humans).'],
    ['In which phase of mitosis do sister chromatids separate and move to opposite poles?', 'Anaphase', ['Prophase', 'Metaphase', 'Telophase'], 'PMAT: Prophase, Metaphase (middle), Anaphase (apart), Telophase (two nuclei).'],
    ['Which structure is the “control center” of a eukaryotic cell?', 'Nucleus', ['Mitochondrion', 'Ribosome', 'Cell membrane'], 'The nucleus holds DNA, which directs all cell activities.'],
    ['Water enters a plant root cell by:', 'osmosis', ['active transport only', 'photosynthesis', 'phagocytosis'], 'Osmosis is the diffusion of water across a membrane from a dilute to a more concentrated solution.'],
    ['Which organelle would be most numerous in a cell that makes and exports many proteins?', 'Ribosomes (and rough ER)', ['Chloroplasts', 'Lysosomes', 'Centrioles'], 'Proteins are built on ribosomes, many of them attached to the rough ER, then shipped by the Golgi.']]);
  return G('science', 'bio', F[0], [F[1]].concat(F[2]), F[3]);
}
LESSONS.push({ id: 'cell', sec: 'science', title: 'The Cell', icon: '🧫', blurb: 'Tap through an animal cell and a plant cell to learn every organelle and what it does.',
  sets: [{ name: 'Cell parts & functions', gen: genCell }, { name: 'Biology mixed', bank: ['science', 'bio'] }],
  html: function () {
    return card('Inside a cell', '<p>Every living thing is made of cells. <b>Eukaryotic</b> cells (plants, animals, fungi) keep their DNA in a nucleus and have membrane-bound organelles; <b>prokaryotic</b> cells (bacteria) do not.</p>' + cellWidget('animal') + cellWidget('plant')) +
      card('Plant vs. animal cells', H.table(['Feature', 'Plant cell', 'Animal cell'], [['Cell wall', '✔ (cellulose)', '✘'], ['Chloroplasts', '✔', '✘'], ['Vacuole', 'one large central vacuole', 'small, many or none'], ['Shape', 'fixed, boxy', 'flexible, rounded'], ['Centrioles', 'usually ✘', '✔'], ['Lysosomes', 'rare', '✔'], ['Stores energy as', 'starch', 'glycogen']]) +
      '<h3>Cell division</h3>' + H.table(['', 'Mitosis', 'Meiosis'], [['Purpose', 'growth and repair', 'making sex cells (gametes)'], ['Divisions', '1', '2'], ['Cells produced', '2 identical', '4 different'], ['Chromosomes', 'same as parent (46)', 'half (23)']]) +
      '<div class="note">PMAT: <b>P</b>rophase — chromosomes condense · <b>M</b>etaphase — line up in the Middle · <b>A</b>naphase — pulled Apart · <b>T</b>elophase — Two nuclei form.</div>{{p0}}{{p1}}');
  },
  init: cellInit
});

/* ====================================================================== */
/* GENETICS & LIFE PROCESSES                                               */
/* ====================================================================== */
var TRAITS = [['T', 'tall', 'short', 'pea plants'], ['P', 'purple flowers', 'white flowers', 'pea plants'], ['R', 'round seeds', 'wrinkled seeds', 'pea plants'], ['B', 'brown fur', 'white fur', 'guinea pigs']];
function cross(p1, p2) { var out = []; p1.split('').forEach(function (a) { p2.split('').forEach(function (b) { out.push(a < b ? a + b : b + a); }); }); return out.map(function (g) { return g[0] === g[0].toUpperCase() && g[1] !== g[1].toUpperCase() ? g : g.split('').sort(function (x, y) { return x === x.toUpperCase() ? -1 : 1; }).join(''); }); }
function punnettWidget() {
  var o = function (id, v) { return '<select id="' + id + '">' + ['AA', 'Aa', 'aa'].map(function (g) { return '<option' + (g === v ? ' selected' : '') + '>' + g + '</option>'; }).join('') + '</select>'; };
  return '<div class="widget"><b>🧬 Punnett square</b><div class="wrow"><label>Trait <select id="ptr">' + TRAITS.map(function (t, i) { return '<option value="' + i + '">' + t[1] + ' (' + t[0] + ') vs ' + t[2] + ' (' + t[0].toLowerCase() + ')</option>'; }).join('') + '</select></label></div>' +
    '<div class="wrow"><label>Parent 1 ' + o('pp1', 'Aa') + '</label><label>Parent 2 ' + o('pp2', 'Aa') + '</label></div><div id="pnSvg"></div><div class="wout" id="pnOut"></div></div>';
}
function punnettInit(root) {
  var a = root.querySelector('#pp1'), b = root.querySelector('#pp2'), tr = root.querySelector('#ptr');
  function draw() {
    var t = TRAITS[+tr.value], L = t[0], l = L.toLowerCase(), m = function (g) { return g.replace(/A/g, L).replace(/a/g, l); };
    var g1 = m(a.value), g2 = m(b.value), s = '', kids = [], u = 54, x0 = 60, y0 = 40;
    s += txt(x0 + u / 2, y0 - 10, g2[0], 'tb') + txt(x0 + 1.5 * u, y0 - 10, g2[1], 'tb') + txt(x0 - 14, y0 + u / 2 + 5, g1[0], 'tg') + txt(x0 - 14, y0 + 1.5 * u + 5, g1[1], 'tg');
    for (var r = 0; r < 2; r++) for (var c = 0; c < 2; c++) {
      var k = [g1[r], g2[c]].sort(function (x, y) { return (x === L ? 0 : 1) - (y === L ? 0 : 1); }).join(''); kids.push(k);
      var dom = k.indexOf(L) >= 0;
      s += '<rect x="' + (x0 + c * u) + '" y="' + (y0 + r * u) + '" width="' + u + '" height="' + u + '" class="' + (dom ? 'fa' : 'fg') + '"/>' + txt(x0 + c * u + u / 2, y0 + r * u + u / 2 + 6, k, '');
    }
    root.querySelector('#pnSvg').innerHTML = dg(200, 160, s + txt(30, 22, 'P1 ↓  P2 →', 'sm', 'start'), 'Punnett square', 'max-width:220px');
    var cnt = {}; kids.forEach(function (k) { cnt[k] = (cnt[k] || 0) + 1; });
    var dom = kids.filter(function (k) { return k.indexOf(L) >= 0; }).length;
    root.querySelector('#pnOut').innerHTML = '<div><b>' + Object.keys(cnt).map(function (k) { return cnt[k] + ' ' + k; }).join(' : ') + '</b><span>genotype ratio</span></div><div><b>' + dom + ' : ' + (4 - dom) + '</b><span>' + t[1] + ' : ' + t[2] + '</span></div><div><b>' + (dom * 25) + '%</b><span>show ' + t[1] + '</span></div><div><b>' + ((4 - dom) * 25) + '%</b><span>show ' + t[2] + '</span></div>';
  }
  a.onchange = b.onchange = tr.onchange = draw; draw();
}
function genGenetics(L) {
  var h = T.hardNow(L), t = TRAITS[rnd(TRAITS.length)], A = t[0], a = A.toLowerCase(), G3 = [A + A, A + a, a + a];
  if (h && rnd(3) === 0) {
    var D = pick([['AaBb × AaBb', '9 : 3 : 3 : 1', ['3 : 1', '1 : 2 : 1', '1 : 1 : 1 : 1'], 'A dihybrid cross of two double heterozygotes gives 9 dominant-dominant : 3 : 3 : 1 recessive-recessive.'], ['AaBb × AaBb — probability of aabb', '1/16', ['1/4', '9/16', '3/16'], 'P(aa) = 1/4 and P(bb) = 1/4. Independent traits multiply: 1/4 × 1/4 = 1/16.'], ['AaBb × aabb', '1 : 1 : 1 : 1', ['9 : 3 : 3 : 1', '3 : 1', '1 : 2 : 1'], 'A dihybrid test cross gives four phenotypes in equal numbers.']]);
    return G('science', 'bio', 'In a cross ' + D[0].split(' — ')[0] + (D[0].indexOf('—') > 0 ? ', what is the ' + D[0].split(' — ')[1] + '?' : ', what phenotype ratio is expected?'), [D[1]].concat(D[2]), D[3]);
  }
  var p1 = pick(G3), p2 = pick(G3), kids = [];
  p1.split('').forEach(function (x) { p2.split('').forEach(function (y) { kids.push(x + y); }); });
  var rec = kids.filter(function (k) { return k === a + a; }).length, het = kids.filter(function (k) { return k.indexOf(A) >= 0 && k.indexOf(a) >= 0; }).length;
  var ask = pick(['rec', 'dom', 'het']), val = ask === 'rec' ? rec : ask === 'dom' ? 4 - rec : het;
  var lab = ask === 'rec' ? 'show ' + t[2] : ask === 'dom' ? 'show ' + t[1] : 'be heterozygous (' + A + a + ')';
  var opts = ['0', '1/4', '1/2', '3/4', '1'], ans = val === 0 ? '0' : fr(val, 4);
  return G('science', 'bio', 'In ' + t[3] + ', ' + t[1] + ' (' + A + ') is dominant over ' + t[2] + ' (' + a + '). A ' + p1 + ' parent is crossed with a ' + p2 + ' parent. What fraction of the offspring is expected to ' + lab + '?', [ans].concat(sample(opts.filter(function (o) { return o !== ans; }), 3)),
    'Punnett square: ' + kids.map(function (k) { return k[0] === a && k[1] === A ? A + a : k; }).join(', ') + '. ' + val + ' of 4 ' + (val === 1 ? 'box matches' : 'boxes match') + ' → ' + ans + '.');
}
var SYS = [['Digestive', 'breaks down food and absorbs nutrients', 'stomach, small intestine'], ['Circulatory', 'transports blood, oxygen and nutrients', 'heart, blood vessels'], ['Respiratory', 'exchanges oxygen and carbon dioxide', 'lungs, trachea'], ['Nervous', 'sends signals and controls the body', 'brain, spinal cord, nerves'], ['Skeletal', 'supports and protects the body; makes blood cells', 'bones'], ['Muscular', 'moves the body', 'muscles, tendons'], ['Excretory', 'removes liquid wastes from the blood', 'kidneys, bladder'], ['Endocrine', 'controls the body with hormones', 'glands like the thyroid and pancreas'], ['Immune', 'defends against disease', 'white blood cells, lymph nodes'], ['Reproductive', 'produces offspring', 'ovaries, testes']];
function genLife(L) {
  var h = T.hardNow(L), t = rnd(h ? 5 : 3), s = pick(SYS);
  if (t === 0) return G('science', 'bio', 'Which body system ' + s[1] + '?', q4(s[0] + ' system', SYS.map(function (x) { return x[0] + ' system'; })), 'The ' + s[0].toLowerCase() + ' system (' + s[2] + ') ' + s[1] + '.');
  if (t === 1) return G('science', 'bio', 'The ' + s[2] + ' belong to which body system?', q4(s[0] + ' system', SYS.map(function (x) { return x[0] + ' system'; })), s[2][0].toUpperCase() + s[2].slice(1) + ' are part of the ' + s[0].toLowerCase() + ' system, which ' + s[1] + '.');
  var F = pick([
    ['Which are the RAW MATERIALS (reactants) of photosynthesis?', 'carbon dioxide and water', ['glucose and oxygen', 'oxygen and water', 'glucose and carbon dioxide'], '6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Respiration is the reverse.'],
    ['Which is the correct order of organization from simplest to most complex?', 'cell → tissue → organ → organ system → organism', ['tissue → cell → organ → organism → organ system', 'organ → tissue → cell → organism → organ system', 'cell → organ → tissue → organ system → organism'], 'Cells form tissues, tissues form organs, organs work together in systems, and systems make up the organism.'],
    ['In a food chain grass → grasshopper → frog → snake, the frog is a:', 'secondary consumer', ['producer', 'primary consumer', 'decomposer'], 'Grass is the producer, the grasshopper eats plants (primary), the frog eats the grasshopper (secondary), the snake is tertiary.'],
    ['About what percent of energy passes from one trophic level to the next?', '10%', ['50%', '90%', '100%'], 'The 10% rule: most energy is used for life processes or lost as heat.'],
    ['Cellular respiration releases energy and produces:', 'carbon dioxide and water', ['oxygen and glucose', 'only oxygen', 'starch and water'], 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy (ATP), mostly in the mitochondria.'],
    ['Organisms that break down dead matter and return nutrients to the soil are called:', 'decomposers', ['producers', 'herbivores', 'predators'], 'Bacteria and fungi are decomposers.'],
    ['Which gas exchange happens in the alveoli of the lungs?', 'oxygen enters the blood; carbon dioxide leaves it', ['carbon dioxide enters the blood; oxygen leaves it', 'nitrogen is absorbed', 'food is absorbed'], 'Alveoli are tiny air sacs surrounded by capillaries where O₂ diffuses in and CO₂ diffuses out.']]);
  return G('science', 'bio', F[0], [F[1]].concat(F[2]), F[3]);
}
function leafDiagram() {
  var s = '<circle cx="35" cy="32" r="18" class="fgo"/>' + [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { var p = H.P(35, 32, a, 24), q = H.P(35, 32, a, 31); return line(p[0], p[1], q[0], q[1], 'go'); }).join('') +
    '<path d="M110 120C110 60 170 35 230 45c-5 60-55 90-120 75z" fill="#3cb371" stroke="#1f7a46" stroke-width="2.5"/><path d="M112 118L222 50" stroke="#1f7a46" stroke-width="2"/>' +
    '<path d="M60 48L120 78" class="go" marker-end="url(#ah)"/>' + '<path d="M40 100h62" class="bl" marker-end="url(#ah)"/>' + '<path d="M165 150v-30" class="bl" marker-end="url(#ah)"/>' + '<path d="M235 80h45" class="ac" marker-end="url(#ah)"/>' + '<path d="M200 110l40 30" class="ac" marker-end="url(#ah)"/>' +
    txt(70, 75, 'light', 'tg') + txt(40, 94, 'CO₂ in (air)', 'sm tb', 'start') + txt(170, 165, 'H₂O in (roots)', 'sm tb') + txt(282, 76, 'O₂ out', 'sm ta', 'end') + txt(250, 152, 'glucose (sugar)', 'sm ta') +
    '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>';
  return dg(290, 170, s, 'photosynthesis in a leaf');
}
function pyramid() {
  var L = [['Tertiary consumers', '10 kJ', '#e05a4f'], ['Secondary consumers', '100 kJ', '#f39c4a'], ['Primary consumers', '1,000 kJ', '#f2b705'], ['Producers', '10,000 kJ', '#3cb371']], s = '';
  L.forEach(function (l, i) { var y = 15 + i * 34, w1 = 40 + i * 60, w2 = 100 + i * 60; s += '<polygon points="' + (150 - w1 / 2) + ',' + y + ' ' + (150 + w1 / 2) + ',' + y + ' ' + (150 + w2 / 2) + ',' + (y + 32) + ' ' + (150 - w2 / 2) + ',' + (y + 32) + '" fill="' + l[2] + '" fill-opacity=".8"/>' + txt(150, y + 20, l[1], '') + txt(150 + w2 / 2 + 6, y + 20, l[0], 'sm', 'start'); });
  return dg(360, 155, s, 'energy pyramid');
}
LESSONS.push({ id: 'life', sec: 'science', title: 'Genetics & Life Processes', icon: '🧬', blurb: 'Punnett squares, photosynthesis vs. respiration, food chains, energy pyramids and body systems.',
  sets: [{ name: 'Genetics', gen: genGenetics }, { name: 'Body systems & ecology', gen: genLife }],
  html: function () {
    return card('Heredity and Punnett squares', '<p>Each parent passes ONE allele of a gene. A capital letter is <b>dominant</b>, lowercase is <b>recessive</b>. <b>Homozygous</b>: two of the same (TT, tt). <b>Heterozygous</b>: one of each (Tt). <b>Genotype</b> = the letters; <b>phenotype</b> = what you see.</p>' + punnettWidget() +
      '<div class="fgrid">' + fbox('Tt × Tt', '3 : 1 phenotype, 1 : 2 : 1 genotype') + fbox('Tt × tt (test cross)', '1 : 1') + fbox('TT × tt', 'all Tt (all dominant)') + fbox('AaBb × AaBb', '9 : 3 : 3 : 1', 'gold') + fbox('Blood types', 'Iᴬ, Iᴮ codominant; i recessive', 'gold') + fbox('Sex', 'XX female, XY male — father decides', 'red') + '</div>{{p0}}') +
    card('Photosynthesis and respiration', leafDiagram() + '<div class="fgrid">' + fbox('Photosynthesis (chloroplast)', '6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂') + fbox('Respiration (mitochondria)', 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP', 'gold') + '</div><p class="small">They are opposites: plants make sugar and release oxygen; all living things (plants too!) burn sugar with oxygen to get energy.</p>') +
    card('Ecology and body systems', pyramid() + '<p class="small">Only about <b>10%</b> of the energy at one level is passed to the next, which is why there are far fewer top predators than plants.</p>' +
      '<p><b>Levels of organization:</b> cell → tissue → organ → organ system → organism → population → community → ecosystem → biosphere.</p>' +
      H.table(['System', 'Main job', 'Key organs'], SYS.map(function (s) { return [s[0], s[1], s[2]]; })) + '{{p1}}');
  },
  init: punnettInit
});

/* ====================================================================== */
/* CHEMISTRY                                                               */
/* ====================================================================== */
var EL = [['H', 'Hydrogen', 1, 1, 'nonmetal'], ['He', 'Helium', 4, 18, 'noble gas'], ['Li', 'Lithium', 7, 1, 'alkali metal'], ['Be', 'Beryllium', 9, 2, 'alkaline earth metal'], ['B', 'Boron', 11, 13, 'metalloid'], ['C', 'Carbon', 12, 14, 'nonmetal'], ['N', 'Nitrogen', 14, 15, 'nonmetal'], ['O', 'Oxygen', 16, 16, 'nonmetal'], ['F', 'Fluorine', 19, 17, 'halogen'], ['Ne', 'Neon', 20, 18, 'noble gas'],
  ['Na', 'Sodium', 23, 1, 'alkali metal'], ['Mg', 'Magnesium', 24, 2, 'alkaline earth metal'], ['Al', 'Aluminum', 27, 13, 'metal'], ['Si', 'Silicon', 28, 14, 'metalloid'], ['P', 'Phosphorus', 31, 15, 'nonmetal'], ['S', 'Sulfur', 32, 16, 'nonmetal'], ['Cl', 'Chlorine', 35, 17, 'halogen'], ['Ar', 'Argon', 40, 18, 'noble gas'], ['K', 'Potassium', 39, 1, 'alkali metal'], ['Ca', 'Calcium', 40, 2, 'alkaline earth metal']];
var FAMC = { 'nonmetal': '#6fb7e8', 'noble gas': '#b9a4e6', 'alkali metal': '#f39c4a', 'alkaline earth metal': '#f2c94c', 'metalloid': '#7fd1a8', 'halogen': '#e48ab5', 'metal': '#b0b8c0' };
function shells(z) { var s = [], cap = [2, 8, 8, 2]; for (var i = 0; z > 0; i++) { var n = Math.min(z, cap[i]); s.push(n); z -= n; } return s; }
function atomSvg(z) {
  var e = EL[z - 1], sh = shells(z), s = '<circle cx="110" cy="110" r="22" fill="#f39c4a" fill-opacity=".85"/>' + txt(110, 106, e[2] - z + ' n', 'sm') + txt(110, 120, z + ' p⁺', 'sm');
  sh.forEach(function (n, i) { var r = 40 + i * 22; s += '<circle cx="110" cy="110" r="' + r + '" class="lt"/>'; for (var k = 0; k < n; k++) { var p = H.P(110, 110, 90 + 360 * k / n + i * 13, r); s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="#2f6fde"/>'; } });
  return dg(220, 220, s, 'Bohr model of ' + e[1], 'max-width:250px');
}
function atomWidget() {
  var cols = { 1: 0, 2: 1, 13: 2, 14: 3, 15: 4, 16: 5, 17: 6, 18: 7 }, cells = '';
  EL.forEach(function (e, i) { var z = i + 1, per = z <= 2 ? 1 : z <= 10 ? 2 : z <= 18 ? 3 : 4; cells += '<button class="pt" data-z="' + z + '" style="grid-column:' + (cols[e[3]] + 1) + ';grid-row:' + per + ';background:' + FAMC[e[4]] + '"><small>' + z + '</small>' + e[0] + '</button>'; });
  return '<div class="widget"><b>⚛️ Build an atom (elements 1–20)</b><label>Atomic number Z = <b id="azO">6</b><input type="range" id="az" min="1" max="20" value="6"></label><div class="atomrow"><div id="atSvg"></div><div class="wout" id="atOut"></div></div>' +
    '<p class="small muted" style="margin-top:8px">Mini periodic table (tap an element):</p><div class="ptable">' + cells + '</div><div class="chips">' + Object.keys(FAMC).map(function (f) { return '<span class="chip" style="border-color:' + FAMC[f] + '">' + f + '</span>'; }).join('') + '</div></div>';
}
function atomInit(root) {
  var az = root.querySelector('#az');
  function draw() {
    var z = +az.value, e = EL[z - 1], sh = shells(z);
    root.querySelector('#atSvg').innerHTML = atomSvg(z);
    root.querySelector('#azO').textContent = z;
    root.querySelector('#atOut').innerHTML = '<div><b>' + e[0] + '</b><span>' + e[1] + '</span></div><div><b>' + z + '</b><span>protons</span></div><div><b>' + z + '</b><span>electrons (neutral)</span></div><div><b>' + (e[2] - z) + '</b><span>neutrons (' + e[2] + ' − ' + z + ')</span></div><div><b>' + sh.join(', ') + '</b><span>electron shells</span></div><div><b>' + sh[sh.length - 1] + '</b><span>valence electrons</span></div><div><b>' + e[3] + '</b><span>group</span></div><div><b style="font-size:.9rem">' + e[4] + '</b><span>family</span></div>';
    [].forEach.call(root.querySelectorAll('.pt'), function (b) { b.classList.toggle('on', +b.getAttribute('data-z') === z); });
  }
  az.oninput = draw;
  root.querySelector('.ptable').addEventListener('click', function (ev) { var b = ev.target.closest('.pt'); if (b) { az.value = b.getAttribute('data-z'); draw(); } });
  draw();
}
function genAtom(L) {
  var h = T.hardNow(L), z = rnd(20) + 1, e = EL[z - 1], t = rnd(h ? 7 : 4), sh = shells(z), n = e[2] - z;
  switch (t) {
    case 0: return G('science', 'chem', 'How many protons does an atom of ' + e[1].toLowerCase() + ' (' + e[0] + ', atomic number ' + z + ') have?', numOpts(z, [1, -1, n - z || 2, e[2] - z]), 'The atomic number IS the number of protons: ' + z + '.');
    case 1: return G('science', 'chem', 'An atom of ' + e[1].toLowerCase() + ' has atomic number ' + z + ' and mass number ' + e[2] + '. How many neutrons does it have?', choices(n, [e[2], z, e[2] + z], n), 'Neutrons = mass number − atomic number = ' + e[2] + ' − ' + z + ' = ' + n + '.');
    case 2: return G('science', 'chem', 'How many valence (outer-shell) electrons does ' + e[1].toLowerCase() + ' (Z = ' + z + ') have?', choices(sh[sh.length - 1], [z, sh.length, 8 - sh[sh.length - 1] || 1], sh[sh.length - 1]), 'Fill shells 2, 8, 8, 2: ' + e[1] + ' is ' + sh.join(', ') + '. The last shell holds ' + sh[sh.length - 1] + '.');
    case 3: var fam = e[4], pool = ['alkali metal', 'alkaline earth metal', 'halogen', 'noble gas', 'metalloid', 'nonmetal', 'metal'];
      return G('science', 'chem', e[1] + ' (' + e[0] + ') belongs to which family?', q4(fam, pool), e[1] + ' is in group ' + e[3] + ': ' + fam + '. Group 1 = alkali metals, 2 = alkaline earth, 17 = halogens, 18 = noble gases.');
    case 4: var ion = pick([['Na', 11, 1], ['Mg', 12, 2], ['Al', 13, 3], ['Cl', 17, -1], ['O', 8, -2], ['F', 9, -1], ['K', 19, 1], ['Ca', 20, 2], ['S', 16, -2]]), el = ion[2] > 0 ? ion[1] - ion[2] : ion[1] - ion[2];
      return G('science', 'chem', 'How many electrons does the ion ' + ion[0] + (Math.abs(ion[2]) > 1 ? Math.abs(ion[2]) : '') + (ion[2] > 0 ? '⁺' : '⁻') + ' have? (' + ion[0] + ' has Z = ' + ion[1] + ')', choices(el, [ion[1], ion[1] + ion[2], 8], el), (ion[2] > 0 ? 'A positive ion has LOST ' + ion[2] : 'A negative ion has GAINED ' + (-ion[2])) + ' electron' + (Math.abs(ion[2]) > 1 ? 's' : '') + ': ' + ion[1] + (ion[2] > 0 ? ' − ' + ion[2] : ' + ' + (-ion[2])) + ' = ' + el + '.');
    case 5: var iso = pick([['carbon-14', 6, 14], ['carbon-12', 6, 12], ['uranium-235', 92, 235], ['hydrogen-3 (tritium)', 1, 3], ['oxygen-18', 8, 18], ['chlorine-37', 17, 37]]);
      return G('science', 'chem', 'How many neutrons are in ' + iso[0] + '? (atomic number ' + iso[1] + ')', choices(iso[2] - iso[1], [iso[2], iso[1], iso[2] + iso[1]], iso[2] - iso[1]), 'The number after the name is the mass number. Neutrons = ' + iso[2] + ' − ' + iso[1] + ' = ' + (iso[2] - iso[1]) + '. Isotopes have the same protons but different neutrons.');
    default: var M = pick([['H₂O', 18, '2(1) + 16'], ['CO₂', 44, '12 + 2(16)'], ['NaCl', 58, '23 + 35'], ['CH₄', 16, '12 + 4(1)'], ['O₂', 32, '2(16)'], ['NH₃', 17, '14 + 3(1)'], ['CaCO₃', 100, '40 + 12 + 3(16)'], ['MgO', 40, '24 + 16']]);
      return G('science', 'chem', 'What is the molar mass of ' + M[0] + '? (H = 1, C = 12, N = 14, O = 16, Na = 23, Mg = 24, Cl = 35, Ca = 40)', choices(M[1] + ' g/mol', [(M[1] + 16) + ' g/mol', (M[1] - 2) + ' g/mol', (M[1] * 2) + ' g/mol']), 'Add the atomic masses: ' + M[2] + ' = ' + M[1] + ' g/mol.');
  }
}
function genMatter(L) {
  var h = T.hardNow(L), t = rnd(h ? 6 : 4);
  if (t === 0) { var ph = pick([[2, 'acidic', 'lemon juice'], [3, 'acidic', 'vinegar'], [7, 'neutral', 'pure water'], [8, 'slightly basic', 'baking soda solution'], [10, 'basic', 'soap'], [12, 'strongly basic', 'bleach'], [1, 'strongly acidic', 'stomach acid'], [5, 'slightly acidic', 'coffee']]);
    var ans = ph[1].indexOf('acid') >= 0 ? 'acidic' : ph[1] === 'neutral' ? 'neutral' : 'basic';
    return G('science', 'chem', 'A substance (like ' + ph[2] + ') has a pH of about ' + ph[0] + '. It is:', [ans].concat(['acidic', 'neutral', 'basic', 'a salt'].filter(function (x) { return x !== ans; })).slice(0, 4), 'pH below 7 = acidic, 7 = neutral, above 7 = basic (alkaline). Each step is 10× stronger.'); }
  if (t === 1) { var C = pick([['solid → liquid', 'melting'], ['liquid → solid', 'freezing'], ['liquid → gas', 'evaporation (boiling)'], ['gas → liquid', 'condensation'], ['solid → gas', 'sublimation'], ['gas → solid', 'deposition']]);
    return G('science', 'chem', 'What is the change of state ' + C[0] + ' called?', q4(C[1], ['melting', 'freezing', 'evaporation (boiling)', 'condensation', 'sublimation', 'deposition']), C[0] + ' is ' + C[1] + '. Example of sublimation: dry ice; of deposition: frost.'); }
  if (t === 2) { var ch = pick([['burning wood', 'chemical'], ['rusting of a nail', 'chemical'], ['cooking an egg', 'chemical'], ['souring of milk', 'chemical'], ['baking a cake', 'chemical'], ['melting ice', 'physical'], ['dissolving salt in water', 'physical'], ['tearing paper', 'physical'], ['boiling water', 'physical'], ['crushing a can', 'physical']]);
    return G('science', 'chem', '“' + ch[0][0].toUpperCase() + ch[0].slice(1) + '” is an example of a:', [ch[1] + ' change', (ch[1] === 'chemical' ? 'physical' : 'chemical') + ' change', 'nuclear change', 'neither, it is a mixture'], ch[1] === 'chemical' ? 'A new substance forms (signs: color change, gas, heat or light, a precipitate) — a chemical change.' : 'Only the form or state changes; no new substance is made — a physical change.'); }
  if (t === 3) { var P = pick([['proton', 'positive', 'nucleus'], ['neutron', 'no charge (neutral)', 'nucleus'], ['electron', 'negative', 'outside the nucleus, in shells']]);
    return G('science', 'chem', 'What charge does a(n) ' + P[0] + ' have?', [P[1]].concat(['positive', 'negative', 'no charge (neutral)', 'it changes'].filter(function (x) { return x !== P[1]; })).slice(0, 4), 'A ' + P[0] + ' has ' + P[1] + ' charge and is found ' + (P[2] === 'nucleus' ? 'in the nucleus' : P[2]) + '.'); }
  var F = pick([
    ['Which type of bond forms when atoms SHARE electrons?', 'covalent', ['ionic', 'metallic', 'magnetic'], 'Covalent bonds share electrons (usually between nonmetals, like H₂O). Ionic bonds transfer electrons (metal + nonmetal, like NaCl).'],
    ['Balance the equation: __N₂ + __H₂ → __NH₃', '1, 3, 2', ['1, 1, 2', '2, 3, 2', '1, 3, 1'], 'N₂ + 3H₂ → 2NH₃: 2 N and 6 H on each side.'],
    ['According to Charles’s law, if the temperature (in kelvin) of a gas doubles at constant pressure, its volume:', 'doubles', ['halves', 'stays the same', 'quadruples'], 'V/T is constant, so V is directly proportional to T.'],
    ['A solution with pH 2 compared to one with pH 4 is:', '100 times more acidic', ['2 times more acidic', '10 times more acidic', '100 times less acidic'], 'Each pH unit is a factor of 10; two units = 100.'],
    ['Which is a homogeneous mixture?', 'salt water', ['sand and water', 'oil and water', 'a salad'], 'A homogeneous mixture (solution) looks the same throughout.'],
    ['When an acid reacts with a base, the products are usually:', 'a salt and water', ['only hydrogen gas', 'oxygen and a metal', 'another acid'], 'This is neutralization: HCl + NaOH → NaCl + H₂O.']]);
  return G('science', 'chem', F[0], [F[1]].concat(F[2]), F[3]);
}
function statesDiagram() {
  var box = function (x, pts, lab, cap) { var s = '<rect x="' + x + '" y="15" width="80" height="80" rx="6" class="lt"/>'; pts.forEach(function (p) { s += '<circle cx="' + (x + p[0]) + '" cy="' + (15 + p[1]) + '" r="6" fill="#2f6fde" fill-opacity=".8"/>'; }); return s + txt(x + 40, 112, lab, 'ta') + txt(x + 40, 126, cap, 'sm'); };
  var solid = [], liq = [[14, 66], [28, 70], [42, 64], [56, 69], [70, 62], [20, 52], [36, 50], [52, 54], [66, 48], [28, 37]], gas = [[15, 20], [60, 14], [40, 45], [12, 66], [68, 58], [34, 74]];
  for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) solid.push([16 + c * 16, 16 + r * 16]);
  return dg(330, 135, box(10, solid, 'Solid', 'fixed shape & volume') + box(125, liq, 'Liquid', 'fixed volume, flows') + box(240, gas, 'Gas', 'fills its container'), 'particles in solids, liquids and gases');
}
function phScale() {
  var cols = ['#d7191c', '#e8452c', '#f07c3a', '#f7a84a', '#fdd25e', '#e9ea6a', '#b8e07a', '#7fd18a', '#4fbf9a', '#3aa5b5', '#3b82c4', '#4b62bf', '#5b48b0', '#6a35a0', '#6f2a90'], s = '';
  cols.forEach(function (c, i) { s += '<rect x="' + (10 + i * 22) + '" y="20" width="22" height="26" fill="' + c + '"/>' + txt(21 + i * 22, 60, i, 'sm'); });
  s += txt(10, 14, '◀ more acidic', 'sm', 'start') + txt(340, 14, 'more basic ▶', 'sm', 'end') + txt(164, 14, 'neutral', 'sm') +
    txt(32, 78, 'stomach acid', 'sm') + txt(76, 92, 'lemon, vinegar', 'sm') + txt(164, 78, 'pure water', 'sm') + txt(230, 92, 'soap', 'sm') + txt(296, 78, 'bleach, lye', 'sm');
  return dg(350, 98, s, 'pH scale');
}
LESSONS.push({ id: 'chem', sec: 'science', title: 'Atoms & Chemistry', icon: '⚛', blurb: 'Build atoms with a slider, explore a mini periodic table, states of matter, pH, bonds and changes.',
  sets: [{ name: 'Atoms & the periodic table', gen: genAtom }, { name: 'Matter, pH & reactions', gen: genMatter }],
  html: function () {
    return card('Atoms', atomWidget() + H.table(['Particle', 'Charge', 'Where', 'Mass'], [['Proton', '+1', 'nucleus', '≈ 1 u'], ['Neutron', '0', 'nucleus', '≈ 1 u'], ['Electron', '−1', 'shells around the nucleus', '≈ 1/1836 u']]) +
      '<div class="fgrid">' + fbox('Atomic number Z', '= protons (= electrons if neutral)') + fbox('Mass number A', '= protons + neutrons') + fbox('Neutrons', 'A − Z') + fbox('Ion', 'lost e⁻ → +, gained e⁻ → −', 'gold') + fbox('Isotopes', 'same Z, different neutrons', 'gold') + fbox('Shell capacity', '2, 8, 8 … (first 20 elements)', 'red') + '</div>{{p0}}') +
    card('Matter and its changes', statesDiagram() + '<div class="fgrid">' + fbox('Melting / freezing', 'solid ⇄ liquid') + fbox('Evaporation / condensation', 'liquid ⇄ gas') + fbox('Sublimation / deposition', 'solid ⇄ gas') + fbox('Physical change', 'same substance (melting, cutting, dissolving)', 'gold') + fbox('Chemical change', 'new substance (burning, rusting, cooking)', 'red') + '</div>' +
      '<h3>The pH scale</h3>' + phScale() +
      '<h3>Bonds, reactions and gas laws</h3><div class="fgrid">' + fbox('Ionic bond', 'metal gives e⁻ to nonmetal (NaCl)') + fbox('Covalent bond', 'nonmetals share e⁻ (H₂O, CO₂)') + fbox('Law of conservation of mass', 'atoms in = atoms out → balance equations') + fbox('Neutralization', 'acid + base → salt + water', 'gold') + fbox('Boyle', 'P₁V₁ = P₂V₂ (T constant)', 'gold') + fbox('Charles', 'V₁/T₁ = V₂/T₂ (kelvin)', 'gold') + fbox('Moles', 'n = mass ÷ molar mass', 'red') + '</div>{{p1}}');
  },
  init: atomInit
});

/* ====================================================================== */
/* PHYSICS                                                                 */
/* ====================================================================== */
function genPhysics(L) {
  var h = T.hardNow(L), t = rnd(h ? 13 : 7), a, b, c;
  switch (t) {
    case 0: a = (rnd(9) + 2) * 10; b = rnd(5) + 2; return G('science', 'physics', 'A bus travels ' + a * b + ' km in ' + b + ' hours. What is its average speed?', choices(a + ' km/h', [a * b * b + ' km/h', (a * b + b) + ' km/h', (a / 2) + ' km/h']), 'speed = distance ÷ time = ' + (a * b) + ' ÷ ' + b + ' = ' + a + ' km/h.');
    case 1: a = rnd(20) + 5; b = rnd(5) + 2; return G('science', 'physics', 'What net force accelerates a ' + a + '-kg cart at ' + b + ' m/s²?', choices(a * b + ' N', [(a + b) + ' N', neg(Math.round(a / b * 10) / 10) + ' N', a * b * 10 + ' N']), 'Newton’s 2nd law: F = ma = ' + a + ' × ' + b + ' = ' + (a * b) + ' N.');
    case 2: a = rnd(40) + 10; b = rnd(9) + 2; return G('science', 'physics', 'How much work is done pushing a box with ' + a + ' N of force through ' + b + ' m?', choices(a * b + ' J', [(a + b) + ' J', neg(Math.round(a / b * 10) / 10) + ' J', a * b + ' W']), 'W = F × d = ' + a + ' × ' + b + ' = ' + (a * b) + ' J (joules).');
    case 3: a = (rnd(9) + 1) * 2; b = rnd(5) + 2; return G('science', 'physics', 'What is the weight of a ' + a + '-kg object on Earth? (g = 10 m/s²)', choices(a * 10 + ' N', [a + ' N', a + ' kg', (a * 10) + ' kg']), 'Weight = mg = ' + a + ' × 10 = ' + (a * 10) + ' N. Mass (kg) stays the same everywhere; weight (N) depends on gravity.');
    case 4: a = rnd(9) + 2; b = rnd(5) + 2; return G('science', 'physics', 'A current of ' + b + ' A flows through a ' + a + ' Ω resistor. What is the voltage across it?', choices(a * b + ' V', [(a + b) + ' V', neg(Math.round(a / b * 10) / 10) + ' V', a * b * 2 + ' V']), 'Ohm’s law: V = IR = ' + b + ' × ' + a + ' = ' + (a * b) + ' V.');
    case 5: a = rnd(9) + 2; b = (rnd(5) + 1) * 2; return G('science', 'physics', 'A block has a mass of ' + a * b + ' g and a volume of ' + b + ' cm³. What is its density?', choices(a + ' g/cm³', [a * b * b + ' g/cm³', (a * b + b) + ' g/cm³', neg(b / (a * b)) + ' g/cm³']), 'Density = mass ÷ volume = ' + (a * b) + ' ÷ ' + b + ' = ' + a + ' g/cm³. (Water is 1 g/cm³; things denser than 1 sink.)');
    case 6: a = pick([2, 4, 5, 10, 20, 25, 50]); b = pick([2, 3, 4, 5, 10]); return G('science', 'physics', 'A wave has a frequency of ' + a + ' Hz and a wavelength of ' + b + ' m. What is its speed?', choices(a * b + ' m/s', [(a + b) + ' m/s', neg(a / b) + ' m/s', a * b * 2 + ' m/s']), 'v = fλ = ' + a + ' × ' + b + ' = ' + (a * b) + ' m/s.');
    case 7: a = pick([2, 4, 6, 10]); b = pick([2, 3, 4, 5, 6]); return G('science', 'physics', 'What is the kinetic energy of a ' + a + '-kg ball moving at ' + b + ' m/s?', choices(a * b * b / 2 + ' J', [a * b + ' J', a * b * b + ' J', a * b / 2 + ' J']), 'KE = ½mv² = ½ × ' + a + ' × ' + (b * b) + ' = ' + (a * b * b / 2) + ' J. Remember to square the speed.');
    case 8: a = rnd(9) + 2; b = rnd(9) + 2; return G('science', 'physics', 'A ' + a + '-kg rock sits on a ledge ' + b + ' m high. What is its potential energy? (g = 10 m/s²)', choices(a * b * 10 + ' J', [a * b + ' J', a * b * 5 + ' J', (a + b) * 10 + ' J']), 'PE = mgh = ' + a + ' × 10 × ' + b + ' = ' + (a * b * 10) + ' J.');
    case 9: var R = pick([[6, 3, 2], [12, 6, 4], [20, 5, 4], [10, 15, 6], [4, 12, 3], [8, 8, 4], [30, 6, 5]]), ser = rnd(2) === 1;
      return G('science', 'physics', 'Resistors of ' + R[0] + ' Ω and ' + R[1] + ' Ω are connected in ' + (ser ? 'SERIES' : 'PARALLEL') + '. What is the total resistance?', choices((ser ? R[0] + R[1] : R[2]) + ' Ω', [(ser ? R[2] : R[0] + R[1]) + ' Ω', Math.abs(R[0] - R[1]) + ' Ω', (R[0] * R[1]) + ' Ω']), ser ? 'Series: add them: ' + R[0] + ' + ' + R[1] + ' = ' + (R[0] + R[1]) + ' Ω.' : 'Parallel: R = (R₁ × R₂) ÷ (R₁ + R₂) = ' + (R[0] * R[1]) + ' ÷ ' + (R[0] + R[1]) + ' = ' + R[2] + ' Ω. It is always smaller than the smallest resistor.');
    case 10: a = rnd(15) + 5; b = rnd(4) + 2; c = a + 2 * b * (rnd(3) + 1); var tt = (c - a) / b; return G('science', 'physics', 'A cyclist speeds up from ' + a + ' m/s to ' + c + ' m/s in ' + tt + ' s. What is the acceleration?', choices(b + ' m/s²', [neg(c / tt) + ' m/s²', (c - a) + ' m/s²', neg(Math.round((c + a) / tt * 10) / 10) + ' m/s²']), 'a = (v_f − v_i) ÷ t = (' + c + ' − ' + a + ') ÷ ' + tt + ' = ' + b + ' m/s².');
    case 11: a = pick([2, 3, 4, 5]); return G('science', 'physics', 'An object is dropped from rest. Ignoring air resistance, how far does it fall in ' + a + ' s? (g = 10 m/s²)', choices(5 * a * a + ' m', [10 * a + ' m', 10 * a * a + ' m', 5 * a + ' m']), 'd = ½gt² = ½ × 10 × ' + (a * a) + ' = ' + (5 * a * a) + ' m. (Its speed then is gt = ' + (10 * a) + ' m/s — a tempting wrong choice.)');
    default: var F = pick([
      ['A book rests on a table. By Newton’s third law, the reaction to the book pushing down on the table is:', 'the table pushing up on the book', ['gravity pulling the book down', 'the book’s inertia', 'friction on the book'], 'Action–reaction pairs act on DIFFERENT objects: book on table ↔ table on book.'],
      ['Which electromagnetic wave has the highest frequency?', 'gamma rays', ['radio waves', 'visible light', 'infrared'], 'Order from low to high frequency: radio, microwave, infrared, visible, ultraviolet, X-ray, gamma.'],
      ['A passenger lurches forward when a jeepney stops suddenly. This is explained by:', 'inertia (Newton’s first law)', ['Newton’s third law', 'gravity', 'friction from the seat'], 'A body in motion tends to stay in motion; the passenger keeps moving forward when the vehicle stops.'],
      ['Sound cannot travel through:', 'a vacuum', ['water', 'steel', 'air'], 'Sound is a mechanical wave and needs particles (a medium) to travel.'],
      ['Which material is the best electrical conductor?', 'copper', ['rubber', 'glass', 'wood'], 'Metals like copper have free electrons that carry current; rubber, glass and wood are insulators.']]);
      return G('science', 'physics', F[0], [F[1]].concat(F[2]), F[3]);
  }
}
function speedTriangle() { return dg(170, 120, '<polygon points="85,10 160,110 10,110" class="fa"/>' + line(37, 72, 133, 72, 'ln') + line(85, 72, 85, 110, 'ln') + txt(85, 58, 'd', 'ta') + txt(55, 98, 's', 'tb') + txt(115, 98, 't', 'tg'), 'formula triangle'); }
function fbd() {
  var ar = function (x1, y1, x2, y2, cls, lab, lx, ly) { return '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" class="' + cls + '" marker-end="url(#ah2)"/>' + txt(lx, ly, lab, 'sm'); };
  return dg(220, 160, '<defs><marker id="ah2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>' + line(10, 110, 210, 110, 'ln') + '<rect x="80" y="70" width="60" height="40" class="fg"/>' +
    ar(110, 70, 110, 18, 'ac', 'Normal force', 110, 12) + ar(110, 110, 110, 152, 'bl', 'Weight (mg)', 150, 150) + ar(140, 90, 200, 90, 'go', 'Push', 186, 82) + ar(80, 90, 30, 90, 'ln', 'Friction', 40, 82), 'free-body diagram');
}
function waveDiagram() {
  var d = 'M10 60'; for (var x = 10; x <= 330; x += 4) d += 'L' + x + ' ' + (60 - 35 * Math.sin((x - 10) / 160 * 2 * Math.PI)).toFixed(1);
  return dg(340, 120, line(10, 60, 330, 60, 'lt') + '<path d="' + d + '" class="ac"/>' + '<path d="M50 18H210" class="go"/>' + txt(130, 13, 'wavelength λ', 'tg') + line(50, 25, 50, 60, 'bl') + txt(56, 45, 'amplitude', 'sm tb', 'start') + txt(50, 105, 'crest', 'sm') + txt(130, 110, 'trough', 'sm'), 'transverse wave');
}
function circuits() {
  var bat = function (x, y) { return line(x, y - 10, x, y + 10, 'ln') + line(x + 7, y - 5, x + 7, y + 5, 'ln') + txt(x + 3, y - 14, '+ −', 'sm'); };
  var res = function (x, y, v) { var p = 'M' + x + ' ' + y; for (var i = 0; i < 6; i++) p += 'l4 ' + (i % 2 ? 7 : -7); return '<path d="' + p + 'l4 0" class="go"/>' + (v ? '' : ''); };
  var ser = line(20, 20, 150, 20) + line(150, 20, 150, 90) + line(20, 90, 150, 90) + line(20, 20, 20, 50) + line(20, 60, 20, 90) + bat(14, 55).replace(/x/g, 'x') + '<rect x="60" y="13" width="28" height="14" class="fg"/><rect x="100" y="83" width="28" height="14" class="fg"/>' + txt(85, 112, 'Series: one path', 'sm');
  var par = line(20, 20, 150, 20) + line(20, 90, 150, 90) + line(20, 20, 20, 50) + line(20, 60, 20, 90) + line(90, 20, 90, 90) + line(150, 20, 150, 90) + '<rect x="83" y="42" width="14" height="28" class="fg"/><rect x="143" y="42" width="14" height="28" class="fg"/>' + txt(85, 112, 'Parallel: several paths', 'sm');
  return '<div class="figs">' + fig(dg(170, 118, ser + line(14, 50, 26, 50, 'ln') + line(17, 60, 23, 60, 'ln')), 'Series circuit', 'R_total = R₁ + R₂; same current everywhere; one bulb out → all out') + fig(dg(170, 118, par + line(14, 50, 26, 50, 'ln') + line(17, 60, 23, 60, 'ln')), 'Parallel circuit', '1/R = 1/R₁ + 1/R₂; same voltage on each branch; used in homes') + '</div>';
}
LESSONS.push({ id: 'physics', sec: 'science', title: 'Physics Formulas', icon: '⚡', blurb: 'Motion, forces, energy, waves and electricity — with the formula triangle, a free-body diagram and circuits.',
  sets: [{ name: 'Physics calculations', gen: genPhysics }, { name: 'Physics mixed', bank: ['science', 'physics'] }],
  html: function () {
    return card('Motion and forces', '<div class="figs">' + fig(speedTriangle(), 'The formula triangle', 'Cover what you want: d = s × t, s = d ÷ t, t = d ÷ s. Works for F = ma, V = IR and W = Fd too.') + fig(fbd(), 'Free-body diagram', 'Arrows show every force on the object. Balanced forces → no acceleration.') + '</div>' +
      H.table(['Quantity', 'Formula', 'Unit'], [['Speed', 'v = d / t', 'm/s'], ['Acceleration', 'a = (v_f − v_i) / t', 'm/s²'], ['Force (Newton’s 2nd law)', 'F = ma', 'newton (N)'], ['Weight', 'W = mg (g ≈ 9.8 or 10 m/s²)', 'N'], ['Momentum', 'p = mv', 'kg·m/s'], ['Free fall from rest', 'v = gt, d = ½gt²', 'm/s, m'], ['Pressure', 'P = F / A', 'pascal (Pa)'], ['Density', 'ρ = m / V', 'g/cm³ or kg/m³']]) +
      '<div class="fgrid">' + fbox('1st law (inertia)', 'objects keep doing what they are doing unless a net force acts') + fbox('2nd law', 'F = ma') + fbox('3rd law', 'every action has an equal and opposite reaction') + fbox('Gravity', 'F ∝ m₁m₂ / d² (double d → ¼ force)', 'gold') + '</div>') +
    card('Energy, work and power', '<div class="fgrid">' + fbox('Work', 'W = F × d (J)') + fbox('Power', 'P = W / t (watts)') + fbox('Kinetic energy', 'KE = ½mv²') + fbox('Potential energy', 'PE = mgh') + fbox('Conservation', 'energy is not created or destroyed, only changed', 'gold') + fbox('Electric energy', 'E = P × t (kWh)', 'gold') + '</div>') +
    card('Waves and electricity', waveDiagram() + '<div class="fgrid">' + fbox('Wave speed', 'v = fλ') + fbox('Period', 'T = 1 / f') + fbox('Ohm’s law', 'V = IR') + fbox('Electric power', 'P = VI') + '</div>' + circuits() +
      '<p class="small"><b>Electromagnetic spectrum</b> (low → high frequency): radio · microwave · infrared · visible (ROYGBIV) · ultraviolet · X-ray · gamma. Sound needs a medium; light does not.</p>{{p0}}{{p1}}');
  }
});

/* ====================================================================== */
/* EARTH & SPACE                                                           */
/* ====================================================================== */
var EARTH_FACTS = [
  ['Which is the thinnest layer of Earth?', 'Crust', ['Mantle', 'Outer core', 'Inner core']],
  ['Which layer of Earth is liquid?', 'Outer core', ['Inner core', 'Crust', 'Lithosphere']],
  ['Which layer of Earth is the thickest?', 'Mantle', ['Crust', 'Outer core', 'Inner core']],
  ['In which atmospheric layer does almost all weather happen?', 'Troposphere', ['Stratosphere', 'Mesosphere', 'Thermosphere']],
  ['In which atmospheric layer do most meteors burn up?', 'Mesosphere', ['Troposphere', 'Stratosphere', 'Exosphere']],
  ['Which layer of the atmosphere contains the ozone layer?', 'Stratosphere', ['Troposphere', 'Mesosphere', 'Thermosphere']],
  ['Which planet is the largest?', 'Jupiter', ['Saturn', 'Neptune', 'Earth']],
  ['Which planet is the hottest, because of its thick CO₂ atmosphere?', 'Venus', ['Mercury', 'Mars', 'Jupiter']],
  ['Which planet is known as the Red Planet?', 'Mars', ['Venus', 'Jupiter', 'Mercury']],
  ['Which planet is third from the Sun?', 'Earth', ['Venus', 'Mars', 'Mercury']],
  ['Which planet is farthest from the Sun?', 'Neptune', ['Uranus', 'Saturn', 'Pluto']],
  ['Igneous rock forms from:', 'cooled magma or lava', ['layers of compressed sediment', 'heat and pressure on existing rock', 'shells and coral only']],
  ['Which type of rock most often contains fossils?', 'Sedimentary', ['Igneous', 'Metamorphic', 'Volcanic glass']],
  ['Marble is formed when limestone is changed by heat and pressure. Marble is:', 'metamorphic', ['igneous', 'sedimentary', 'a mineral, not a rock']],
  ['At which plate boundary do plates move APART, forming new crust?', 'Divergent', ['Convergent', 'Transform', 'Subduction']],
  ['At which boundary do plates slide PAST each other (like the San Andreas Fault)?', 'Transform', ['Divergent', 'Convergent', 'Subduction']],
  ['The Philippine Trench was formed at a:', 'convergent boundary (subduction)', ['divergent boundary', 'transform boundary', 'hotspot']],
  ['One full rotation of Earth on its axis takes about:', '24 hours (one day)', ['365 days', '29.5 days', '7 days']],
  ['One revolution of Earth around the Sun takes about:', '365¼ days', ['24 hours', '29.5 days', '12 hours']],
  ['A solar eclipse happens when:', 'the Moon is between the Sun and Earth', ['Earth is between the Sun and the Moon', 'the Sun is between Earth and the Moon', 'the Moon is behind the Sun']],
  ['Tides are caused mainly by:', 'the Moon’s gravity', ['Earth’s rotation alone', 'wind', 'the Sun’s heat']],
  ['The point on the surface directly above where an earthquake starts is the:', 'epicenter', ['focus', 'fault', 'magnitude']],
  ['Which instrument records earthquake waves?', 'Seismograph', ['Barometer', 'Anemometer', 'Hygrometer']],
  ['Which is the correct order of the water cycle?', 'evaporation → condensation → precipitation → collection', ['condensation → evaporation → collection → precipitation', 'precipitation → evaporation → collection → condensation', 'collection → condensation → evaporation → precipitation']],
  ['Which gas makes up most of Earth’s atmosphere?', 'Nitrogen (78%)', ['Oxygen (21%)', 'Carbon dioxide', 'Argon']],
  ['Earth has seasons mainly because:', 'its axis is tilted about 23.5°', ['its distance from the Sun changes a lot', 'the Sun’s output changes', 'the Moon blocks sunlight']],
  ['A lunar eclipse can happen only at:', 'full moon', ['new moon', 'first quarter', 'last quarter']],
  ['The Philippines is part of which volcanic and earthquake belt?', 'Pacific Ring of Fire', ['Mid-Atlantic Ridge', 'Alpide belt only', 'Great Rift Valley']]
];
function genEarth(L) { var f = pick(EARTH_FACTS); return G('science', 'earth', f[0], [f[1]].concat(f[2]), 'Answer: ' + f[1] + '. See the diagrams in the Earth & Space lesson.'); }
function earthLayers() {
  var L = [[100, '#f7d08a', 'Crust', '5–70 km, solid rock'], [86, '#e8894a', 'Mantle', '~2,900 km, hot plastic rock'], [56, '#e2b33c', 'Outer core', '~2,200 km, LIQUID iron-nickel'], [28, '#f2d96b', 'Inner core', '~1,200 km radius, SOLID, hottest']], s = '';
  L.forEach(function (l) { s += '<path d="M' + (120 - l[0]) + ' 120A' + l[0] + ' ' + l[0] + ' 0 0 1 ' + (120 + l[0]) + ' 120z" fill="' + l[1] + '" stroke="#8a5a1a" stroke-width="1"/>'; });
  s += line(10, 120, 230, 120, 'ln');
  L.forEach(function (l, i) { var y = 30 + i * 24; s += line(120 + l[0] * 0.55, 120 - l[0] * 0.83, 245, y, 'lt') + txt(250, y + 4, '<tspan font-weight="700">' + l[2] + '</tspan> — ' + l[3], 'sm', 'start'); });
  return dg(440, 130, s, 'layers of the Earth');
}
function atmosphere() {
  var L = [['Exosphere', '600+ km', 'fades into space; satellites', '#2a2f5a'], ['Thermosphere', '85–600 km', 'auroras, ISS; very hot', '#3b4a8a'], ['Mesosphere', '50–85 km', 'meteors burn up; coldest', '#4f69b5'], ['Stratosphere', '12–50 km', 'OZONE layer; jets fly low here', '#6f95d6'], ['Troposphere', '0–12 km', 'all WEATHER, clouds, we live here', '#9cc3ef']], s = '';
  L.forEach(function (l, i) { var y = 8 + i * 30; s += '<rect x="10" y="' + y + '" width="330" height="30" fill="' + l[3] + '"/>' + '<text x="18" y="' + (y + 19) + '" font-size="12" font-weight="700" style="fill:#fff">' + l[0] + '</text><text x="130" y="' + (y + 19) + '" font-size="10" style="fill:#fff">' + l[1] + ' · ' + l[2] + '</text>'; });
  return dg(350, 166, s, 'layers of the atmosphere');
}
function solarSystem() {
  var P = [['Mercury', 3, '#a8a8a8'], ['Venus', 5, '#e8c07a'], ['Earth', 5.4, '#4f9fd0'], ['Mars', 4, '#d0603a'], ['Jupiter', 15, '#d9a36a'], ['Saturn', 12, '#e6cf8f'], ['Uranus', 8, '#8fd3e0'], ['Neptune', 8, '#4a6fd6']], s = '<circle cx="-30" cy="60" r="58" fill="#f2b705"/>', x = 42;
  P.forEach(function (p) { x += p[1] + 6; s += '<circle cx="' + x + '" cy="60" r="' + p[1] + '" fill="' + p[2] + '"/>' + (p[0] === 'Saturn' ? '<ellipse cx="' + x + '" cy="60" rx="' + (p[1] + 7) + '" ry="3" fill="none" stroke="#c9a85a" stroke-width="2"/>' : '') + txt(x, p[1] > 10 ? 96 : 84, p[0], 'sm'); x += p[1] + 8; });
  return dg(x + 10, 105, s + txt(30, 20, 'Sun', 'tg'), 'planets in order from the Sun');
}
function rockCycle() {
  var b = function (x, y, t, c) { return '<rect x="' + (x - 50) + '" y="' + (y - 16) + '" width="100" height="32" rx="10" fill="' + c + '" fill-opacity=".85"/>' + '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="12" font-weight="700" style="fill:#1b1b1b">' + t + '</text>'; };
  var ar = function (d, lab, lx, ly) { return '<path d="' + d + '" class="ln" marker-end="url(#ah3)"/>' + txt(lx, ly, lab, 'sm'); };
  return dg(340, 200, '<defs><marker id="ah3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>' +
    b(170, 25, 'Igneous', '#e8894a') + b(60, 170, 'Sedimentary', '#f2d96b') + b(280, 170, 'Metamorphic', '#b9a4e6') +
    ar('M125 38L70 150', 'weathering, erosion,', 50, 80) + txt(54, 94, 'compaction', 'sm') + ar('M112 172H228', 'heat & pressure', 170, 162) + ar('M268 152L210 42', 'melts → magma', 285, 95) + ar('M220 40L270 150', '', 0, 0) + ar('M120 186Q170 205 230 186', '', 0, 0) + txt(170, 125, 'cools', 'sm') + ar('M180 140V48', '', 0, 0) + txt(170, 105, 'magma', 'sm'), 'the rock cycle');
}
function plates() {
  var p = function (x, l, r, lab, cap) { return '<rect x="' + x + '" y="30" width="56" height="26" fill="#c9a06a"/><rect x="' + (x + 62) + '" y="30" width="56" height="26" fill="#c9a06a"/>' + txt(x + 28, 48, l, '') + txt(x + 90, 48, r, '') + txt(x + 59, 20, lab, 'ta') + txt(x + 59, 74, cap, 'sm'); };
  return dg(390, 82, p(4, '←', '→', 'Divergent', 'ridges, rift valleys') + p(134, '→', '←', 'Convergent', 'trenches, mountains, volcanoes') + p(264, '↑', '↓', 'Transform', 'faults, earthquakes'), 'plate boundaries');
}
function eclipses() {
  var sun = '<circle cx="30" cy="50" r="24" fill="#f2b705"/>', s1 = sun + '<circle cx="130" cy="50" r="6" fill="#9a9a9a"/><circle cx="210" cy="50" r="14" fill="#4f9fd0"/>' + '<path d="M54 40L136 47M54 60L136 53" class="lt"/>' + '<path d="M136 47L198 46M136 53L198 54" stroke="#555" stroke-width="5" opacity=".5"/>' + txt(30, 92, 'Sun', 'sm') + txt(130, 92, 'Moon', 'sm') + txt(210, 92, 'Earth', 'sm');
  var s2 = sun + '<circle cx="130" cy="50" r="14" fill="#4f9fd0"/><circle cx="210" cy="50" r="6" fill="#8a4a3a"/>' + '<path d="M144 44L204 47M144 56L204 53" stroke="#555" stroke-width="7" opacity=".45"/>' + txt(30, 92, 'Sun', 'sm') + txt(130, 92, 'Earth', 'sm') + txt(210, 92, 'Moon', 'sm');
  return '<div class="figs">' + fig(dg(240, 100, s1), 'Solar eclipse', 'Sun – MOON – Earth. The Moon’s shadow falls on Earth. Only at new moon.') + fig(dg(240, 100, s2), 'Lunar eclipse', 'Sun – EARTH – Moon. Earth’s shadow darkens the Moon (it can look red). Only at full moon.') + '</div>';
}
LESSONS.push({ id: 'earth', sec: 'science', title: 'Earth & Space', icon: '🌏', blurb: 'Earth’s layers, the atmosphere, rocks, plate tectonics, the solar system and eclipses — all illustrated.',
  sets: [{ name: 'Earth & space facts', gen: genEarth }, { name: 'Earth & space mixed', bank: ['science', 'earth'] }],
  html: function () {
    return card('Inside the Earth', earthLayers() + '<p class="small">The <b>lithosphere</b> (crust + top of the mantle) is broken into plates that float on the softer <b>asthenosphere</b>. We know the outer core is liquid because S-waves cannot pass through it.</p>' + plates() +
      '<div class="fgrid">' + fbox('Focus', 'where the quake starts underground') + fbox('Epicenter', 'point on the surface above the focus') + fbox('P-waves', 'fastest; travel through solids AND liquids', 'gold') + fbox('S-waves', 'slower; solids only', 'gold') + '</div>') +
      card('Air, water and rock', atmosphere() + '<p class="small">Air is about 78% nitrogen, 21% oxygen, 1% argon and other gases.</p>' + rockCycle() +
      H.table(['Rock type', 'Forms from', 'Examples'], [['Igneous', 'cooled magma (intrusive, big crystals) or lava (extrusive, small crystals)', 'granite, basalt, pumice'], ['Sedimentary', 'layers of sediment pressed and cemented; may hold fossils', 'sandstone, limestone, shale'], ['Metamorphic', 'existing rock changed by heat and pressure', 'marble (from limestone), slate (from shale)']])) +
      card('The solar system', solarSystem() + '<p class="small">Order: <b>My Very Educated Mother Just Served Us Nachos</b> — Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. Inner four are rocky; outer four are gas/ice giants. (Sizes are not to scale.)</p>' + eclipses() +
      '<div class="fgrid">' + fbox('Rotation', 'spinning on its axis → day and night (24 h)') + fbox('Revolution', 'orbiting the Sun → one year (365¼ days)') + fbox('Seasons', 'caused by the 23.5° tilt', 'gold') + fbox('Moon’s cycle', 'about 29.5 days', 'gold') + '</div>{{p0}}{{p1}}');
  }
});
})();
