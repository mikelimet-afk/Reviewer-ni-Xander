/* Basic Reviewer — English and Mental Ability lessons */
(function () {
'use strict';
var T = window.TP, H = window.LH;
var rnd = T.rnd, pick = T.pick, shuffle = T.shuffle, sample = T.sample, G = T.G, choices = T.choices, neg = T.neg;
var dg = H.dg, fig = H.fig, fbox = H.fbox, txt = H.t, line = H.line, card = H.card;
function q4(ans, pool) { return [ans].concat(sample(pool.filter(function (x) { return x !== ans; }), 3)); }

/* ====================================================================== */
/* GRAMMAR                                                                 */
/* ====================================================================== */
var CONF = [
  ['The dog wagged ___ tail.', 'its', ['it’s', 'its’', 'it is'], '<i>Its</i> (no apostrophe) shows possession. <i>It’s</i> always means “it is” or “it has”.'],
  ['___ going to the library after class.', 'They’re', ['Their', 'There', 'Theirs'], '<i>They’re</i> = they are. <i>Their</i> = belonging to them. <i>There</i> = a place.'],
  ['The cold weather did not ___ the harvest.', 'affect', ['effect', 'effects', 'affection'], '<i>Affect</i> is usually the verb (to influence); <i>effect</i> is usually the noun (the result).'],
  ['The new rule had a big ___ on the students.', 'effect', ['affect', 'affects', 'infect'], 'After “a big”, you need a noun: <i>effect</i> (result).'],
  ['She is taller ___ her brother.', 'than', ['then', 'that', 'as'], '<i>Than</i> compares; <i>then</i> tells time or sequence.'],
  ['Finish your homework; ___ you can play.', 'then', ['than', 'thus', 'that'], '<i>Then</i> = after that.'],
  ['___ book is this on my desk?', 'Whose', ['Who’s', 'Whom', 'Who'], '<i>Whose</i> shows possession; <i>who’s</i> = who is.'],
  ['There are ___ students in class today than yesterday.', 'fewer', ['less', 'lesser', 'little'], 'Use <i>fewer</i> with things you can count (students); <i>less</i> with amounts (less water).'],
  ['Everyone ___ Mark passed the quiz.', 'except', ['accept', 'expect', 'excepting'], '<i>Except</i> = but, excluding. <i>Accept</i> = to receive.'],
  ['Please ___ my apology.', 'accept', ['except', 'expect', 'access'], '<i>Accept</i> = to receive or agree to.'],
  ['The ___ of our school gave a speech.', 'principal', ['principle', 'principles', 'principality'], 'The principal is a person (your “pal”); a principle is a rule or belief.'],
  ['Honesty is an important ___.', 'principle', ['principal', 'principally', 'prince'], 'A principle is a rule or belief.'],
  ['___ late again for the flag ceremony!', 'You’re', ['Your', 'Yours', 'You'], '<i>You’re</i> = you are.'],
  ['Don’t ___ your school ID.', 'lose', ['loose', 'loss', 'lost'], '<i>Lose</i> = to misplace; <i>loose</i> = not tight.'],
  ['My teacher paid me a ___ on my essay.', 'compliment', ['complement', 'complimentary', 'complete'], 'A <i>compliment</i> is praise; a <i>complement</i> completes something.'],
  ['The bus remained ___ at the red light.', 'stationary', ['stationery', 'station', 'stationed'], '<i>Stationary</i> = not moving; <i>stationery</i> = paper and envelopes (e for envelope).'],
  ['I ___ you to start reviewing early.', 'advise', ['advice', 'advices', 'advising'], '<i>Advise</i> is the verb; <i>advice</i> is the noun.'],
  ['___ did you invite to the party?', 'Whom', ['Who', 'Whose', 'Who’s'], 'The pronoun is the object of “invite” (you invited <i>him</i>), so use <i>whom</i>.'],
  ['Divide the candies ___ the three children.', 'among', ['between', 'within', 'amongst them'], 'Use <i>between</i> for two, <i>among</i> for three or more.'],
  ['We walked ___ the park.', 'through', ['threw', 'thorough', 'though'], '<i>Through</i> = from one side to the other; <i>threw</i> = past of throw; <i>thorough</i> = complete.'],
  ['Neither of the twins ___ the answer.', 'knows', ['know', 'are knowing', 'have known'], '<i>Neither</i> (of) is singular → <i>knows</i>.'],
  ['The list of requirements ___ on the bulletin board.', 'is', ['are', 'were', 'have been'], 'The subject is <i>list</i> (singular), not <i>requirements</i>. Ignore the “of …” phrase.'],
  ['Each of the boys ___ a uniform.', 'has', ['have', 'are having', 'were having'], '<i>Each</i> is singular.'],
  ['By next year, she ___ here for ten years.', 'will have worked', ['will work', 'has worked', 'worked'], 'Future perfect: an action completed before a point in the future.']
];
function genGrammar(L) { var c = pick(CONF); return G('english', 'grammar', 'Choose the correct word: ' + c[0], [c[1]].concat(c[2]), c[3]); }
function tenseTimeline() {
  var s = '<path d="M10 60H330" class="ln" marker-end="url(#ah4)"/><defs><marker id="ah4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>';
  s += '<circle cx="60" cy="60" r="6" class="fb"/><circle cx="170" cy="60" r="7" class="fs"/><circle cx="280" cy="60" r="6" class="fgo"/>' + txt(60, 85, 'PAST', 'tb') + txt(170, 85, 'NOW', 'ta') + txt(280, 85, 'FUTURE', 'tg');
  s += txt(60, 30, 'I studied', 'sm') + txt(60, 44, 'had studied (earlier)', 'sm') + txt(170, 30, 'I study / am studying', 'sm') + txt(170, 44, 'have studied (up to now)', 'sm') + txt(280, 30, 'I will study', 'sm') + txt(280, 44, 'will have studied', 'sm');
  return dg(340, 95, s, 'tense timeline');
}
LESSONS.push({ id: 'grammar', sec: 'english', title: 'Grammar Essentials', icon: 'Aa', blurb: 'Parts of speech, subject–verb agreement, tenses, pronouns and the most commonly confused words.',
  sets: [{ name: 'Confused words & agreement', gen: genGrammar }, { name: 'Grammar & usage (bank)', bank: ['english', 'grammar'] }],
  html: card('Parts of speech', H.table(['Part', 'Job', 'Examples'], [['Noun', 'names a person, place, thing or idea', 'teacher, Manila, freedom'], ['Pronoun', 'takes the place of a noun', 'she, they, it, whom'], ['Verb', 'shows action or being', 'run, is, seem'], ['Adjective', 'describes a noun', 'tall, blue, three'], ['Adverb', 'describes a verb, adjective or adverb', 'quickly, very, often'], ['Preposition', 'shows relationship / position', 'in, under, between'], ['Conjunction', 'joins words or clauses', 'and, but, because (FANBOYS: for, and, nor, but, or, yet, so)'], ['Interjection', 'shows emotion', 'Wow! Oops!']])) +
    card('Subject–verb agreement', '<div class="fgrid">' + fbox('Singular subject', 'singular verb: The boy runs.') + fbox('Ignore phrases in between', 'The box of crayons IS…') + fbox('Each, every, everyone, neither', 'singular') + fbox('Either/neither … or/nor', 'verb agrees with the NEARER subject', 'gold') + fbox('“The number of”', 'singular · “A number of” → plural', 'gold') + fbox('Collective nouns (team, class)', 'usually singular', 'gold') + fbox('Mathematics, news, physics', 'singular', 'red') + fbox('Scissors, pants, glasses', 'plural', 'red') + '</div>') +
    card('Tenses', tenseTimeline() + H.table(['', 'Simple', 'Progressive', 'Perfect'], [['Past', 'walked', 'was walking', 'had walked'], ['Present', 'walk / walks', 'am / is walking', 'has / have walked'], ['Future', 'will walk', 'will be walking', 'will have walked']]) +
      '<div class="note">Conditionals: <b>If I study, I will pass</b> (real). <b>If I studied, I would pass</b> (unreal present — use <i>were</i>: If I were you…). <b>If I had studied, I would have passed</b> (unreal past).</div>') +
    card('Pronouns and confused words', H.table(['Subject', 'Object', 'Possessive'], [['I', 'me', 'my / mine'], ['he / she', 'him / her', 'his / her / hers'], ['we', 'us', 'our / ours'], ['they', 'them', 'their / theirs'], ['who', 'whom', 'whose']]) +
      '<p class="small"><b>Test:</b> drop the other person. “Between you and <b>me</b>” (between me). “She and <b>I</b> went” (I went). Who/whom: if you can answer with <i>him</i>, use <i>whom</i>.</p>' +
      H.table(['Pair', 'Remember'], [['its / it’s', 'it’s = it is'], ['their / there / they’re', 'their = owned; there = place; they’re = they are'], ['affect / effect', 'Affect = Action (verb); Effect = End result (noun)'], ['than / then', 'than compares; then = time'], ['fewer / less', 'fewer for countable things'], ['lie / lay', 'lie = rest (lay, lain); lay = put (laid, laid)'], ['between / among', 'two vs. three or more']]) + '{{p0}}{{p1}}')
});

/* ====================================================================== */
/* VOCABULARY                                                              */
/* ====================================================================== */
var ROOTS = [['bene', 'good, well', 'benefit, benevolent'], ['mal', 'bad', 'malfunction, malicious'], ['chron', 'time', 'chronology, synchronize'], ['bio', 'life', 'biology, biography'], ['geo', 'earth', 'geography, geology'], ['graph', 'write, draw', 'autograph, paragraph'], ['photo', 'light', 'photograph, photosynthesis'], ['tele', 'far', 'telephone, telescope'], ['scrib / script', 'write', 'describe, manuscript'], ['spect', 'look, see', 'inspect, spectator'], ['port', 'carry', 'transport, portable'], ['dict', 'say, speak', 'predict, contradict'], ['aud', 'hear', 'audience, audible'], ['vid / vis', 'see', 'video, visible'], ['hydr / aqua', 'water', 'hydrate, aquarium'], ['terr', 'land, earth', 'territory, terrain'], ['phil', 'love', 'philosophy, philanthropist'], ['phob', 'fear', 'claustrophobia, phobia'], ['micro', 'small', 'microscope, microbe'], ['magn', 'great, large', 'magnify, magnitude'], ['omni', 'all', 'omnivore, omniscient'], ['ped / pod', 'foot', 'pedestrian, tripod'], ['manu', 'hand', 'manual, manuscript'], ['voc / vok', 'call, voice', 'vocal, invoke'], ['cred', 'believe', 'credible, incredible'], ['morph', 'shape, form', 'metamorphosis, amorphous'], ['path', 'feeling, disease', 'empathy, pathology'], ['ject', 'throw', 'reject, projectile'], ['mort', 'death', 'mortal, mortality'], ['loqu / log', 'speak, word', 'eloquent, dialogue']];
var PREF = [['un-, in-, im-, dis-', 'not, opposite of', 'unhappy, impossible'], ['re-', 'again, back', 'rewrite, return'], ['pre-', 'before', 'preview, prehistoric'], ['post-', 'after', 'postwar, postpone'], ['sub-', 'under, below', 'submarine, subway'], ['super-, hyper-', 'over, above', 'supervise, hyperactive'], ['anti-', 'against', 'antibiotic, antisocial'], ['inter-', 'between', 'international, interact'], ['trans-', 'across', 'transport, translate'], ['mis-', 'wrongly', 'misspell, misunderstand'], ['co-, con-, com-', 'with, together', 'cooperate, connect'], ['mono-', 'one', 'monologue, monotone'], ['bi-', 'two', 'bicycle, bilingual'], ['poly-', 'many', 'polygon, polyglot'], ['semi-', 'half', 'semicircle, semifinal']];
var SUF = [['-ology', 'study of'], ['-less', 'without'], ['-ful', 'full of'], ['-able, -ible', 'can be done'], ['-cide', 'killing'], ['-ist, -er, -or', 'one who'], ['-itis', 'inflammation'], ['-ous', 'full of, having']];
var RWORDS = [['benevolent', 'bene', 'kind and well-meaning'], ['chronological', 'chron', 'arranged in order of time'], ['inaudible', 'aud', 'cannot be heard'], ['incredible', 'cred', 'hard to believe'], ['malnourished', 'mal', 'badly fed'], ['omnivore', 'omni', 'an animal that eats all kinds of food'], ['pedestrian', 'ped', 'a person traveling on foot'], ['hydrophobia', 'phob', 'fear of water'], ['manuscript', 'manu', 'a document written by hand'], ['invisible', 'vis', 'cannot be seen'], ['eloquent', 'loqu', 'fluent and persuasive in speaking'], ['immortal', 'mort', 'living forever'], ['telescope', 'tele', 'an instrument for seeing far things'], ['transport', 'port', 'to carry across'], ['philanthropist', 'phil', 'a person who loves and helps humanity']];
function genRoots(L) {
  var t = rnd(4);
  if (t === 0) { var r = pick(ROOTS); return G('english', 'vocab', 'The root <b>' + r[0] + '</b> (as in <i>' + r[2] + '</i>) means:', q4(r[1], ROOTS.map(function (x) { return x[1]; })), r[0] + ' = ' + r[1] + '. Examples: ' + r[2] + '.'); }
  if (t === 1) { var p = pick(PREF); return G('english', 'vocab', 'The prefix <b>' + p[0] + '</b> means:', q4(p[1], PREF.map(function (x) { return x[1]; })), p[0] + ' = ' + p[1] + ' (' + p[2] + ').'); }
  if (t === 2) { var w = pick(RWORDS); return G('english', 'vocab', 'Using word parts, <b>' + w[0].toUpperCase() + '</b> most likely means:', q4(w[2], RWORDS.map(function (x) { return x[2]; })), 'Break it apart: the root <i>' + w[1] + '</i> gives the core meaning → ' + w[2] + '.'); }
  var s = pick(SUF), target = pick(ROOTS);
  return G('english', 'vocab', 'The suffix <b>' + s[0] + '</b> means:', q4(s[1], SUF.map(function (x) { return x[1]; })), s[0] + ' = ' + s[1] + '. Example: ' + (s[0] === '-ology' ? 'biology = study of life' : s[0] === '-less' ? 'fearless = without fear' : s[0] === '-cide' ? 'pesticide = kills pests' : s[0] === '-itis' ? 'tonsillitis = inflamed tonsils' : 'see the table') + '.');
}
LESSONS.push({ id: 'vocab', sec: 'english', title: 'Vocabulary Builder', icon: 'Ab', blurb: 'Decode unfamiliar words with roots, prefixes and suffixes, and use context clues.',
  sets: [{ name: 'Roots, prefixes & suffixes', gen: genRoots }, { name: 'Vocabulary (bank)', bank: ['english', 'vocab'] }],
  html: card('Word roots', '<p>Most hard words on entrance exams come from Latin and Greek. Learn the parts and you can guess words you have never seen: <b>in</b> (not) + <b>cred</b> (believe) + <b>ible</b> (can be) = <i>incredible</i>, “cannot be believed”.</p>' + H.table(['Root', 'Meaning', 'Examples'], ROOTS)) +
    card('Prefixes and suffixes', H.table(['Prefix', 'Meaning', 'Examples'], PREF) + '<div class="fgrid">' + SUF.map(function (s) { return fbox(s[0], s[1]); }).join('') + '</div>{{p0}}') +
    card('Context clues', H.table(['Clue type', 'Signal words', 'Example'], [['Definition', 'is, means, refers to', 'A <i>nocturnal</i> animal, one that is active at night, …'], ['Synonym / restatement', 'or, that is, in other words', 'She was <i>elated</i>, or overjoyed.'], ['Contrast (antonym)', 'but, however, despite, unlike', 'Unlike his <i>gregarious</i> sister, Ben was shy. → gregarious = sociable'], ['Example', 'such as, for example, including', '<i>Legumes</i> such as beans and peas…'], ['Cause / effect', 'because, so, therefore', 'Because he was <i>frugal</i>, he saved most of his allowance.']]) +
      '<div class="note">On sentence-completion items, find the signal word first. “Despite” or “although” means the blank is the OPPOSITE of the clue; “and” or “because” means it AGREES.</div>{{p1}}')
});

/* ====================================================================== */
/* READING                                                                 */
/* ====================================================================== */
var FOS = [['The classroom was a zoo after the bell rang.', 'metaphor', 'compares directly without like/as'], ['Her smile was as bright as the sun.', 'simile', 'compares using like or as'], ['The wind whispered through the trees.', 'personification', 'gives human qualities to a non-human thing'], ['I have told you a million times!', 'hyperbole', 'deliberate exaggeration'], ['The bacon sizzled in the pan.', 'onomatopoeia', 'a word that imitates a sound'], ['Peter Piper picked a peck of pickled peppers.', 'alliteration', 'repeats the first consonant sound'], ['The fire station burned down.', 'irony', 'the opposite of what is expected'], ['It was a deafening silence.', 'oxymoron', 'puts two contradictory words together'], ['Time is a thief.', 'metaphor', 'compares directly without like/as'], ['He ran like the wind.', 'simile', 'compares using like or as'], ['The old car coughed and groaned up the hill.', 'personification', 'gives human qualities to a non-human thing'], ['This bag weighs a ton.', 'hyperbole', 'deliberate exaggeration']];
function genFOS(L) { var f = pick(FOS), types = ['metaphor', 'simile', 'personification', 'hyperbole', 'onomatopoeia', 'alliteration', 'irony', 'oxymoron']; return G('english', 'reading', '“' + f[0] + '” is an example of:', q4(f[1], types), 'This is ' + f[1] + ': it ' + f[2] + '.'); }
function umbrella() {
  return dg(320, 150, '<path d="M30 70Q160 -20 290 70Z" class="fa"/><path d="M30 70q32-14 65 0q32-14 65 0q32-14 65 0q32-14 65 0" class="ac"/>' + line(160, 70, 160, 132, 'ln') + '<path d="M160 132q0 12-12 12" class="ln"/>' +
    txt(160, 50, 'MAIN IDEA', 'ta') + txt(160, 64, 'what the whole passage is about', 'sm') + '<rect x="18" y="98" width="80" height="26" rx="6" class="fg"/><rect x="222" y="98" width="80" height="26" rx="6" class="fg"/><rect x="176" y="125" width="74" height="22" rx="6" class="fg"/><rect x="70" y="125" width="74" height="22" rx="6" class="fg"/>' +
    txt(58, 115, 'detail', 'sm') + txt(262, 115, 'example', 'sm') + txt(107, 140, 'fact', 'sm') + txt(213, 140, 'reason', 'sm'), 'main idea umbrella');
}
LESSONS.push({ id: 'reading', sec: 'english', title: 'Reading Comprehension', icon: '📖', blurb: 'A step-by-step method, the main question types, tone words and figures of speech.',
  sets: [{ name: 'Reading passages', many: function (n) { return T.readingSets(2); } }, { name: 'Figures of speech', gen: genFOS }],
  html: card('A method that works', '<ol class="tight"><li><b>Preview the questions</b> (not the choices) so you know what to look for.</li><li><b>Read actively:</b> after each paragraph, say its point in five words.</li><li><b>Answer from the text</b>, not from what you already believe. The right answer is usually a paraphrase.</li><li><b>Eliminate</b> choices that are too extreme (always, never, all), off-topic or only partly true.</li></ol>' + umbrella() +
      '<p class="small">The <b>main idea</b> covers every paragraph — not just one detail. If a choice describes only one paragraph, it is a supporting detail.</p>') +
    card('Question types', H.table(['Type', 'Looks like', 'How to answer'], [['Main idea / title', '“best title”, “mainly about”', 'Pick the choice that covers ALL paragraphs.'], ['Detail', '“according to the passage”', 'Find the line; match the paraphrase.'], ['Vocabulary in context', '“as used in the passage, X means”', 'Replace the word with each choice; pick the one that fits THAT sentence.'], ['Inference', '“it can be inferred”, “suggests”', 'Must be strongly supported, one small step beyond the text.'], ['Author’s purpose', '“in order to”, “mainly serves to”', 'Inform, persuade, entertain, describe, qualify (limit) a claim.'], ['Tone / attitude', '“the author’s tone”', 'Look at word choice: hopeful, critical, nostalgic, objective…']]) +
      '<div class="chips">' + ['objective', 'hopeful', 'nostalgic', 'critical', 'sarcastic', 'admiring', 'humorous', 'concerned', 'indifferent', 'skeptical', 'enthusiastic', 'somber'].map(function (w) { return '<span class="chip">' + w + '</span>'; }).join('') + '</div>{{p0}}') +
    card('Figures of speech', H.table(['Figure', 'What it does', 'Example'], [['Simile', 'compares with <i>like</i> or <i>as</i>', 'as brave as a lion'], ['Metaphor', 'compares directly', 'Life is a journey.'], ['Personification', 'human traits for non-human things', 'The sun smiled.'], ['Hyperbole', 'exaggeration', 'I’m so hungry I could eat a horse.'], ['Onomatopoeia', 'sound words', 'buzz, sizzle, boom'], ['Alliteration', 'repeated first sounds', 'silly snakes slither'], ['Irony', 'opposite of what is expected', 'a traffic cop gets a parking ticket'], ['Oxymoron', 'contradictory pair', 'jumbo shrimp, bittersweet']]) + '{{p1}}')
});

/* ====================================================================== */
/* ANALOGIES & LOGIC                                                       */
/* ====================================================================== */
var NOUNS = ['doctors', 'artists', 'singers', 'dancers', 'teachers', 'athletes', 'poets', 'pilots', 'farmers', 'students', 'readers', 'swimmers'];
function genLogic(L) {
  var h = T.hardNow(L), t = rnd(h ? 7 : 5), n = sample(NOUNS, 3), A = n[0], B = n[1], C = n[2], cap = function (s) { return s[0].toUpperCase() + s.slice(1); };
  var NC = 'No definite conclusion can be drawn.';
  switch (t) {
    case 0: return G('reasoning', 'verbal', 'All ' + A + ' are ' + B + '. All ' + B + ' are ' + C + '. Which conclusion follows?', ['All ' + A + ' are ' + C + '.', 'All ' + C + ' are ' + A + '.', 'No ' + A + ' are ' + C + '.', 'Some ' + C + ' are not ' + B + '.'], 'Circle ' + A + ' sits inside ' + B + ', which sits inside ' + C + ', so every ' + A.slice(0, -1) + ' is inside ' + C + '. The reverse (all ' + C + ' are ' + A + ') does not follow.');
    case 1: return G('reasoning', 'verbal', 'All ' + A + ' are ' + B + '. Some ' + B + ' are ' + C + '. Which conclusion follows?', [NC, 'Some ' + A + ' are ' + C + '.', 'All ' + A + ' are ' + C + '.', 'No ' + A + ' are ' + C + '.'], 'The ' + B + ' who are ' + C + ' might be outside the ' + A + ' circle — or inside it. Since both drawings are possible, nothing definite follows about ' + A + ' and ' + C + '.');
    case 2: return G('reasoning', 'verbal', 'No ' + A + ' are ' + B + '. All ' + C + ' are ' + A + '. Which conclusion follows?', ['No ' + C + ' are ' + B + '.', 'Some ' + C + ' are ' + B + '.', 'All ' + B + ' are ' + C + '.', NC], C + ' lies entirely inside ' + A + ', and ' + A + ' shares nothing with ' + B + ', so ' + C + ' shares nothing with ' + B + ' either.');
    case 3: return G('reasoning', 'verbal', 'Some ' + A + ' are ' + B + '. All ' + B + ' are ' + C + '. Which conclusion follows?', ['Some ' + A + ' are ' + C + '.', 'All ' + A + ' are ' + C + '.', 'No ' + A + ' are ' + C + '.', 'All ' + C + ' are ' + A + '.'], 'The ' + A + ' who are ' + B + ' are also ' + C + ' (because every ' + B.slice(0, -1) + ' is). So at least some ' + A + ' are ' + C + '.');
    case 4: var P = pick([['it rains', 'the ground gets wet'], ['you study', 'you pass'], ['the alarm rings', 'the students leave'], ['a shape is a square', 'it has four sides']]);
      var which = pick(['contra', 'converse']);
      if (which === 'contra') return G('reasoning', 'verbal', '“If ' + P[0] + ', then ' + P[1] + '.” Which statement MUST also be true?', ['If not (' + P[1] + '), then not (' + P[0] + ').', 'If ' + P[1] + ', then ' + P[0] + '.', 'If not (' + P[0] + '), then not (' + P[1] + ').', 'Only if ' + P[0] + ', ' + P[1] + '.'], 'Only the CONTRAPOSITIVE (flip and negate both parts) is always equivalent. The converse and the inverse can be false: e.g. a rectangle has four sides but is not a square.');
      return G('reasoning', 'verbal', '“If ' + P[0] + ', then ' + P[1] + '.” We know that ' + P[1] + '. What can we conclude?', ['Nothing certain about whether ' + P[0] + '.', 'It is certain that ' + P[0] + '.', 'It is certain that not (' + P[0] + ').', 'The statement is false.'], 'Affirming the result does not prove the cause — something else may have caused it. This is the fallacy of “affirming the consequent”.');
    case 5: var tr = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15]]), c = rnd(5) + 2, a = tr[1] + c, dirs = ['north', 'east', 'south', 'west'], s0 = rnd(4), turn = pick(['right', 'left']), step = turn === 'right' ? 1 : 3;
      var d1 = dirs[s0], d2 = dirs[(s0 + step) % 4];
      return G('reasoning', 'verbal', 'Rina walks ' + a + ' km ' + d1 + ', turns ' + turn + ' and walks ' + tr[0] + ' km, then turns ' + turn + ' again and walks ' + c + ' km. How far is she now from her starting point (in a straight line)?', choices(tr[2] + ' km', [(a + tr[0] + c) + ' km', (tr[0] + tr[1]) + ' km', (a - c) + ' km']), 'She goes ' + a + ' km ' + d1 + ', ' + tr[0] + ' km ' + d2 + ', then ' + c + ' km back toward the start (' + dirs[(s0 + 2) % 4] + '). Net: ' + tr[1] + ' km ' + d1 + ' and ' + tr[0] + ' km ' + d2 + '. Distance = √(' + (tr[1] * tr[1]) + ' + ' + (tr[0] * tr[0]) + ') = ' + tr[2] + ' km.');
    default: var R = pick([
      ['Pointing to a photo, Ben says, “Her father is my father’s only son.” How is the girl related to Ben?', 'She is his daughter.', ['She is his sister.', 'She is his niece.', 'She is his cousin.'], 'Ben’s father’s only son is Ben himself, so the girl’s father is Ben: she is his daughter.'],
      ['A is the brother of B. B is the sister of C. C is the son of D. How is A related to D?', 'A is D’s son.', ['A is D’s brother.', 'A is D’s nephew.', 'A is D’s father.'], 'A, B and C are siblings and all children of D. A is male (a brother), so A is D’s son.'],
      ['In a row of students, Mara is 7th from the left and 12th from the right. How many students are in the row?', '18', ['19', '17', '20'], 'Total = 7 + 12 − 1 = 18 (Mara is counted twice).'],
      ['If the day after tomorrow is Saturday, what day was yesterday?', 'Wednesday', ['Thursday', 'Tuesday', 'Friday'], 'Day after tomorrow = Saturday → today is Thursday → yesterday was Wednesday.'],
      ['Five friends are ranked by height: Ana is taller than Bea but shorter than Cy. Dan is shortest. Eli is taller than Cy. Who is in the middle?', 'Ana', ['Bea', 'Cy', 'Eli'], 'Order: Eli > Cy > Ana > Bea > Dan. Ana is third (middle).']]);
      return G('reasoning', 'verbal', R[0], [R[1]].concat(R[2]), R[3]);
  }
}
function vennLogic() {
  var a = dg(150, 110, '<circle cx="75" cy="55" r="48" class="fa"/><circle cx="75" cy="62" r="24" class="fg"/>' + txt(75, 24, 'B', 'ta') + txt(75, 66, 'A', 'tg'), 'All A are B');
  var b = dg(150, 110, '<circle cx="55" cy="55" r="38" class="fg"/><circle cx="98" cy="55" r="38" class="fa"/>' + txt(40, 60, 'A', 'tg') + txt(112, 60, 'B', 'ta') + txt(76, 60, '✦', 'tb'), 'Some A are B');
  var c = dg(150, 110, '<circle cx="40" cy="55" r="30" class="fg"/><circle cx="112" cy="55" r="30" class="fa"/>' + txt(40, 60, 'A', 'tg') + txt(112, 60, 'B', 'ta'), 'No A are B');
  return '<div class="figs">' + fig(a, 'All A are B', 'A is inside B') + fig(b, 'Some A are B', 'the circles overlap (✦ is certain to exist)') + fig(c, 'No A are B', 'separate circles') + '</div>';
}
function compass() { return dg(160, 160, '<circle cx="80" cy="80" r="56" class="lt"/>' + line(80, 18, 80, 142, 'ln') + line(18, 80, 142, 80, 'ln') + txt(80, 14, 'N', 'ta') + txt(80, 156, 'S', 'ta') + txt(150, 84, 'E', 'ta') + txt(10, 84, 'W', 'ta') + txt(124, 36, 'NE', 'sm') + txt(36, 36, 'NW', 'sm') + txt(124, 130, 'SE', 'sm') + txt(36, 130, 'SW', 'sm') + '<path d="M80 80l30-30" class="go"/>' + txt(112, 66, 'right turn', 'sm tg', 'start'), 'compass'); }
LESSONS.push({ id: 'verbal', sec: 'reasoning', title: 'Analogies & Logic', icon: '⇄', blurb: 'Analogy relationship types, syllogisms with Venn diagrams, if–then logic, directions, ranking and family puzzles.',
  sets: [{ name: 'Syllogisms & logic puzzles', gen: genLogic }, { name: 'Word analogies (bank)', bank: ['reasoning', 'verbal'] }, { name: 'Letter & number analogies', gen: T.codedQ }],
  html: card('Word analogies', '<p>Turn the first pair into a sentence (“A <b>doctor</b> works in a <b>hospital</b>”), then test each choice in the same sentence.</p>' + H.table(['Relationship', 'Example'], [['Synonyms', 'HAPPY : JOYFUL'], ['Antonyms', 'GENEROUS : STINGY'], ['Part : whole', 'PETAL : FLOWER'], ['Worker : tool', 'CARPENTER : HAMMER'], ['Worker : workplace', 'TEACHER : SCHOOL'], ['Worker : product', 'CARTOGRAPHER : MAP'], ['Cause : effect', 'VIRUS : ILLNESS'], ['Young : adult', 'TADPOLE : FROG'], ['Instrument : measures', 'BAROMETER : PRESSURE'], ['Degree / intensity', 'WARM : HOT'], ['Category : member', 'GAS : OXYGEN']]) +
      '<div class="note">Letter &amp; number analogies (very common in reviewers): convert letters to positions (A=1 … Z=26), check skips (AC : EG skips one letter), reversals (STAR : RATS), ×k (3 : 21 as 5 : 35) and digit sums (48 : 12).</div>{{p1}}{{p2}}') +
    card('Syllogisms with Venn diagrams', vennLogic() + '<p>Draw the circles for each statement. A conclusion is valid only if it is true in <b>every</b> possible drawing. If you can draw one picture where it fails, choose “no definite conclusion”.</p>' +
      H.table(['Statement', 'Equivalent (always true)', 'NOT equivalent'], [['If P, then Q', 'If not Q, then not P (contrapositive)', 'If Q then P (converse); If not P then not Q (inverse)'], ['All A are B', 'No A are outside B', 'All B are A'], ['No A are B', 'No B are A', '—']])) +
    card('Directions, ranking and relations', '<div class="figs">' + fig(compass(), 'Directions', 'Facing north, a RIGHT turn faces east; a LEFT turn faces west. Two rights = U-turn.') + '</div>' +
      '<div class="fgrid">' + fbox('Position in a row', 'total = left rank + right rank − 1') + fbox('Distance', 'use Pythagoras on the net N–S and E–W moves') + fbox('Days', '7 days repeat; use the remainder ÷ 7', 'gold') + fbox('Clock angle', '|30H − 5.5M|', 'gold') + fbox('Family tree', 'draw it: = marriage, | children', 'red') + '</div>{{p0}}')
});

/* ====================================================================== */
/* PATTERNS: SERIES & ABSTRACT FIGURES                                     */
/* ====================================================================== */
function alphabet() {
  var s = '';
  for (var i = 0; i < 26; i++) { var x = 6 + i * 13; s += txt(x + 6, 16, String.fromCharCode(65 + i), [4, 9, 14, 19, 24].indexOf(i) >= 0 ? 'tg' : '') + txt(x + 6, 30, i + 1, 'sm') + txt(x + 6, 44, 26 - i, 'sm tb'); }
  return dg(350, 52, s + txt(2, 30, '', ''), 'alphabet positions');
}
LESSONS.push({ id: 'patterns', sec: 'reasoning', title: 'Series & Abstract Figures', icon: '◆', blurb: 'How to crack number series, letter series and figure patterns — rotations, mirrors, two-rule series, grids and overlays.',
  sets: [{ name: 'Number series', gen: T.numSeries }, { name: 'Letter series', gen: T.letterSeries }, { name: 'Abstract figures', gen: T.figOne }, { name: 'Letter & number analogies', gen: T.codedQ }],
  html: function () {
    var g = T.glyph;
    return card('Number series', '<p>Check, in this order: (1) the <b>difference</b> between terms, (2) the <b>ratio</b>, (3) <b>squares/cubes</b> nearby, (4) <b>every other term</b> (two series woven together), (5) <b>combining</b> the previous terms. If the differences are not equal, take differences of the differences.</p>' +
      H.table(['Series', 'Rule'], [['4, 9, 16, 25, 36', 'squares (2², 3², …)'], ['3, 5, 9, 17, 33', 'differences double: +2, +4, +8, +16'], ['2, 6, 3, 9, 6, 18', '×3, −3, ×3, −3'], ['1, 1, 2, 4, 7, 13, 24', 'add the previous three'], ['5, 10, 6, 12, 7, 14', '×2, −4 (or two series: 5, 6, 7 and 10, 12, 14)'], ['12, 15, 21, 24, 30', 'add the digit sum (12 + 3, 15 + 6, …)']]) + '{{p0}}') +
    card('Letter series', alphabet() + '<p class="small">Top: letter · middle: position (A = 1) · blue: reverse position (Z = 1). The gold letters <b>E J O T Y</b> sit at 5, 10, 15, 20, 25 — handy landmarks. Opposite pairs add to 27: A–Z, B–Y, M–N.</p>' +
      H.table(['Series', 'Rule'], [['B, E, H, K, ?', '+3 each → N'], ['A, B, D, G, K, ?', 'gaps +1, +2, +3, +4 → +5 → P'], ['AZ, BY, CX, ?', 'first letter forward, second backward → DW'], ['C, Z, E, Y, G, X, ?', 'two series: C, E, G (+2) and Z, Y, X (−1) → I']]) + '{{p1}}') +
    card('Abstract figures', '<p>Look at <b>one feature at a time</b>: position, rotation, size, number of parts, shading, and whether a shape is flipped. Harder items change two features at once.</p>' +
      '<div class="figs">' +
      fig('<div class="frames" style="justify-content:center">' + g('F', 0) + g('F', 90) + g('F', 180) + '</div>', 'Rotation', 'turns the same angle each step (here 90° clockwise)') +
      fig('<div class="frames" style="justify-content:center">' + g('P', 0) + g('P', 0, true) + '</div>', 'Mirror image', 'flipped, not turned — no rotation can make them match') +
      fig('<div class="frames" style="justify-content:center">' + T.dualFig(0, 0) + T.dualFig(90, 2) + T.dualFig(180, 4) + '</div>', 'Two rules at once', 'arrow turns 90°; the dot moves 2 stops clockwise') +
      fig('<div class="frames" style="justify-content:center">' + T.lineFig(1 | 16) + '<span class="rel">+</span>' + T.lineFig(16 | 4) + '<span class="rel">=</span>' + T.lineFig(1 | 4) + '</div>', 'Overlay (cancel)', 'lines in BOTH figures disappear; the rest stay') +
      fig('<div class="frames" style="justify-content:center">' + T.mShape('circle', 0) + T.mShape('tri', 1) + T.mShape('square', 2) + '</div>', 'Grid (Latin square)', 'each row and column has every shape and every shading exactly once') +
      '</div><div class="note">Eliminate: for each rule you find, cross out every choice that breaks it. Usually only one survives.</div>{{p2}}{{p3}}');
  }
});
})();
