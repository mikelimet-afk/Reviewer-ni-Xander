/*! free-llm.js — a drop-in, free AI helper for static web apps (no server, no build step).
 *
 * Shared by Parlons, Reviewer-ni-Xander and ACCtimerDU. Keep the copies identical.
 *
 * Providers (all speak the OpenAI "chat completions" format):
 *   - Pollinations.ai  — free, no signup, no key. Used by default and as the fallback.
 *   - Google Gemini    — free key from aistudio.google.com (best free quality).
 *   - Groq             — free key from console.groq.com (very fast Llama models).
 *   - OpenRouter       — free key from openrouter.ai, use any ":free" model.
 *   - Custom           — any OpenAI-compatible URL (e.g. Ollama on your own PC).
 * Keys are stored only in this browser (localStorage) and sent only to the provider you pick.
 *
 * API:
 *   FreeLLM.init({ app, title, lang, tutor, practice, explain, starters, topics, fab })
 *   FreeLLM.open('chat' | 'practice' | 'settings')
 *   FreeLLM.explain({ question, options, correct, picked, note, ask, shown }) // opens chat with an explanation
 *   FreeLLM.chat(messages, opts) -> Promise<string>                 // raw call
 *   FreeLLM.ask(prompt, system) -> Promise<string>
 *   FreeLLM.json(prompt, system) -> Promise<object>
 */
(function () {
  'use strict';
  if (window.FreeLLM) return;

  var PROVIDERS = {
    pollinations: { name: 'Pollinations (free, no key)', url: 'https://text.pollinations.ai/openai', model: 'openai', key: false, link: 'https://pollinations.ai' },
    gemini: { name: 'Google Gemini (free key)', url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', model: 'gemini-2.5-flash', key: true, link: 'https://aistudio.google.com/apikey' },
    groq: { name: 'Groq (free key)', url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile', key: true, link: 'https://console.groq.com/keys' },
    openrouter: { name: 'OpenRouter (free models)', url: 'https://openrouter.ai/api/v1/chat/completions', model: 'meta-llama/llama-3.3-70b-instruct:free', key: true, link: 'https://openrouter.ai/keys' },
    custom: { name: 'Custom (OpenAI-compatible)', url: 'http://localhost:11434/v1/chat/completions', model: 'llama3.2', key: false, link: '' }
  };
  var SKEY = 'freellm:settings';
  var TIMEOUT = 60000;

  var UI = {
    en: { chat: 'Chat', practice: 'Practice', settings: 'AI settings', send: 'Send', ph: 'Ask anything…', thinking: 'Thinking…', close: 'Close', clear: 'New chat',
      topic: 'Topic', topicPh: 'e.g. past tense, fractions…', gen: 'Generate 5 questions', more: 'More questions', correct: 'Correct!', wrong: 'Not quite. Answer: ',
      prov: 'Provider', key: 'API key', model: 'Model', url: 'Endpoint URL', getKey: 'Get a free key', save: 'Save', test: 'Test', saved: 'Saved.', ok: 'Working: ',
      keyNote: 'Your key stays in this browser and is sent only to the provider above. Leave everything on Pollinations to use AI with no key at all.',
      fail: 'The AI could not be reached. Check your internet connection, or pick another provider in AI settings.', fallback: '(used the free fallback)',
      disclaimer: 'AI answers can be wrong. Double-check important facts.', score: 'Score', explainQ: 'Explain this question to me.' },
    fr: { chat: 'Discussion', practice: 'Exercices', settings: 'Réglages IA', send: 'Envoyer', ph: 'Posez une question…', thinking: 'Réflexion…', close: 'Fermer', clear: 'Nouvelle discussion',
      topic: 'Thème', topicPh: 'ex. passé composé, la nourriture…', gen: 'Créer 5 questions', more: 'Plus de questions', correct: 'Correct !', wrong: 'Pas tout à fait. Réponse : ',
      prov: 'Fournisseur', key: 'Clé API', model: 'Modèle', url: 'URL du service', getKey: 'Obtenir une clé gratuite', save: 'Enregistrer', test: 'Tester', saved: 'Enregistré.', ok: 'Ça marche : ',
      keyNote: 'Votre clé reste dans ce navigateur et n’est envoyée qu’au fournisseur choisi. Laissez Pollinations pour utiliser l’IA sans aucune clé.',
      fail: 'Impossible de joindre l’IA. Vérifiez votre connexion ou choisissez un autre fournisseur dans les réglages IA.', fallback: '(secours gratuit utilisé)',
      disclaimer: 'L’IA peut se tromper. Vérifiez les points importants.', score: 'Score', explainQ: 'Explique-moi cette question.' }
  };

  var cfg = { app: 'app', title: 'AI tutor', lang: 'en', tutor: 'You are a friendly, concise tutor.', practice: '', explain: '', starters: [], topics: [], fab: true };
  var history = [], quiz = [], busy = false, root = null, sh = null, tab = 'chat';

  /* ---------- settings ---------- */
  function loadSettings() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) {}
    s = s && typeof s === 'object' ? s : {};
    if (!PROVIDERS[s.provider]) s.provider = 'pollinations';
    s.keys = s.keys || {}; s.models = s.models || {}; s.urls = s.urls || {};
    return s;
  }
  function saveSettings(s) { try { localStorage.setItem(SKEY, JSON.stringify(s)); } catch (e) {} }
  function lang() { var l = typeof cfg.lang === 'function' ? cfg.lang() : cfg.lang; return UI[l] ? l : 'en'; }
  function T(k) { return UI[lang()][k] || UI.en[k] || k; }

  /* ---------- network ---------- */
  function post(url, headers, body) {
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, TIMEOUT) : null;
    return fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined })
      .then(function (r) {
        return r.text().then(function (txt) {
          if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + txt.slice(0, 200));
          var j; try { j = JSON.parse(txt); } catch (e) { return txt; }
          var c = j && j.choices && j.choices[0];
          var out = c && c.message ? c.message.content : c && c.text;
          if (typeof out !== 'string' || !out.trim()) throw new Error('Empty answer');
          return out;
        });
      })
      .finally(function () { if (timer) clearTimeout(timer); });
  }
  function callProvider(id, messages, opts) {
    var s = loadSettings(), p = PROVIDERS[id];
    var url = (s.urls[id] || p.url).trim(), model = (s.models[id] || p.model).trim(), key = (s.keys[id] || '').trim();
    if (p.key && !key) return Promise.reject(new Error('No API key for ' + p.name));
    var headers = { 'Content-Type': 'application/json' };
    if (key) headers.Authorization = 'Bearer ' + key;
    if (id === 'openrouter') { headers['HTTP-Referer'] = location.origin; headers['X-Title'] = cfg.title; }
    var body = { model: model, messages: messages, temperature: opts.temperature == null ? 0.7 : opts.temperature };
    if (id === 'pollinations') { body.private = true; body.referrer = cfg.app; }
    return post(url, headers, body).catch(function (e) {
      if (id !== 'pollinations') throw e;
      // Second keyless route: the simple GET endpoint.
      var sys = messages.filter(function (m) { return m.role === 'system'; }).map(function (m) { return m.content; }).join('\n');
      var convo = messages.filter(function (m) { return m.role !== 'system'; }).slice(-8)
        .map(function (m) { return (m.role === 'user' ? 'User: ' : 'Assistant: ') + m.content; }).join('\n\n');
      var q = 'https://text.pollinations.ai/' + encodeURIComponent(convo.slice(-6000)) + '?model=openai&private=true&system=' + encodeURIComponent(sys.slice(0, 1500));
      return fetch(q).then(function (r) { if (!r.ok) throw e; return r.text(); });
    });
  }
  function chat(messages, opts) {
    opts = opts || {};
    var id = loadSettings().provider;
    return callProvider(id, messages, opts).catch(function (err) {
      if (id === 'pollinations') throw err;
      if (window.console) console.warn('[FreeLLM] ' + id + ' failed, using free fallback:', err);
      return callProvider('pollinations', messages, opts).then(function (t) { return t + '\n\n_' + T('fallback') + '_'; });
    });
  }
  function ask(prompt, system) {
    return chat([{ role: 'system', content: system || cfg.tutor }, { role: 'user', content: prompt }]);
  }
  function parseJSON(txt) {
    txt = String(txt).replace(/```(?:json)?/gi, '');
    var a = txt.indexOf('{'), b = txt.lastIndexOf('}');
    var a2 = txt.indexOf('['), b2 = txt.lastIndexOf(']');
    if (a2 >= 0 && (a < 0 || a2 < a)) { a = a2; b = b2; }
    if (a < 0 || b <= a) throw new Error('No JSON in answer');
    return JSON.parse(txt.slice(a, b + 1));
  }
  function json(prompt, system) {
    var sys = (system || cfg.tutor) + '\nReply with valid JSON only. No markdown, no commentary.';
    return chat([{ role: 'system', content: sys }, { role: 'user', content: prompt }], { temperature: 0.8 }).then(parseJSON);
  }

  /* ---------- tiny safe markdown ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function inline(s) {
    return s.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, '$1<i>$2</i>').replace(/(^|\W)_([^_\n]+)_(?!\w)/g, '$1<i>$2</i>');
  }
  function md(src) {
    var out = [], list = null;
    esc(src).split('\n').forEach(function (line) {
      var m = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/), h = line.match(/^\s*#{1,4}\s+(.*)$/);
      var kind = m ? (/^\s*\d/.test(line) ? 'ol' : 'ul') : null;
      if (list && list !== kind) { out.push('</' + list + '>'); list = null; }
      if (kind) { if (!list) { out.push('<' + kind + '>'); list = kind; } out.push('<li>' + inline(m[1]) + '</li>'); }
      else if (h) out.push('<p><b>' + inline(h[1]) + '</b></p>');
      else if (line.trim()) out.push('<p>' + inline(line) + '</p>');
    });
    if (list) out.push('</' + list + '>');
    return out.join('');
  }
  function plain(html) { var d = document.createElement('div'); d.innerHTML = String(html == null ? '' : html); return (d.textContent || '').replace(/[ \t\r\f\v\u00a0]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim(); }

  /* ---------- UI (inside a shadow root so app styles never clash) ---------- */
  var CSS = ':host{all:initial}' +
    '.w{--bg:#fff;--fg:#14181f;--mut:#6b7280;--line:rgba(127,127,127,.28);--acc:#3b6cf6;--accfg:#fff;--me:#e8eefe;--ok:#0f8a4b;--bad:#c0392b;--pan:rgba(127,127,127,.08);font:15px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--fg)}' +
    '@media (prefers-color-scheme:dark){.w{--bg:#151a23;--fg:#e7e9ee;--mut:#9aa3b2;--me:#22304d;--acc:#6f95ff;--ok:#38c27a;--bad:#ff6b5b}}' +
    '.fab{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:2147483000;border:0;border-radius:999px;padding:12px 16px;background:var(--acc);color:var(--accfg);font:600 15px system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25);cursor:pointer}' +
    '.fab.hide{display:none}' +
    '.ov{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.35);display:none;align-items:flex-end;justify-content:center}' +
    '.ov.open{display:flex}' +
    '.pn{background:var(--bg);color:var(--fg);width:100%;max-width:560px;height:min(86vh,720px);border-radius:18px 18px 0 0;display:flex;flex-direction:column;box-shadow:0 -10px 40px rgba(0,0,0,.3);overflow:hidden}' +
    '@media (min-width:700px){.ov{align-items:center}.pn{border-radius:18px}}' +
    '.hd{display:flex;align-items:center;gap:6px;padding:10px 12px;border-bottom:1px solid var(--line)}' +
    '.hd b{flex:1;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    'button{font:inherit;color:inherit;cursor:pointer}' +
    '.tb{border:1px solid var(--line);background:var(--pan);border-radius:999px;padding:5px 11px;font-size:13px}' +
    '.tb.on{background:var(--acc);color:var(--accfg);border-color:var(--acc)}' +
    '.x{border:0;background:none;font-size:20px;padding:2px 8px}' +
    '.bd{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px}' +
    '.m{max-width:88%;padding:8px 12px;border-radius:14px;background:var(--pan);border:1px solid var(--line);overflow-wrap:anywhere}' +
    '.m.u{align-self:flex-end;background:var(--me);border-color:transparent}' +
    '.m p{margin:.2em 0}.m ul,.m ol{margin:.2em 0;padding-left:1.3em}.m code{background:var(--pan);padding:0 4px;border-radius:4px}' +
    '.m.err{border-color:var(--bad);color:var(--bad)}.dots{color:var(--mut);font-style:italic}' +
    '.st{display:flex;flex-wrap:wrap;gap:6px}.st button{border:1px solid var(--line);background:none;border-radius:999px;padding:5px 10px;font-size:13px;text-align:left}' +
    '.ft{display:flex;gap:6px;padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line)}' +
    'textarea,input,select{font:inherit;color:inherit;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:8px 10px;box-sizing:border-box;width:100%}' +
    'textarea{resize:none;height:42px;max-height:120px}' +
    '.go{border:0;background:var(--acc);color:var(--accfg);border-radius:10px;padding:8px 14px;font-weight:600;white-space:nowrap}' +
    '.go[disabled]{opacity:.5;cursor:default}.alt{background:var(--pan);color:var(--fg);border:1px solid var(--line)}' +
    '.mut{color:var(--mut);font-size:12.5px}.row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}' +
    'label{display:block;font-size:13px;color:var(--mut);margin:10px 0 4px}' +
    '.q{border:1px solid var(--line);border-radius:14px;padding:10px 12px}.q h4{margin:0 0 8px;font-size:15px}' +
    '.o{display:block;width:100%;text-align:left;margin:5px 0;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:none}' +
    '.o.ok{border-color:var(--ok);background:color-mix(in srgb,var(--ok) 14%,transparent)}.o.bad{border-color:var(--bad);background:color-mix(in srgb,var(--bad) 12%,transparent)}' +
    '.o[disabled]{cursor:default}.why{margin-top:6px;font-size:14px}.why.ok b{color:var(--ok)}.why.bad b{color:var(--bad)}';

  function build() {
    if (root) return;
    root = document.createElement('free-llm');
    sh = root.attachShadow ? root.attachShadow({ mode: 'open' }) : root;
    sh.innerHTML = '<style>' + CSS + '</style><div class="w"><button class="fab' + (cfg.fab ? '' : ' hide') + '" part="fab">✨ AI</button>' +
      '<div class="ov"><div class="pn" role="dialog" aria-modal="true"><div class="hd"><b></b><span class="tabs row"></span><button class="x" aria-label="close">✕</button></div><div class="bd"></div><div class="ft"></div></div></div></div>';
    document.body.appendChild(root);
    var $ = function (s) { return sh.querySelector(s); };
    $('.fab').onclick = function () { open('chat'); };
    $('.x').onclick = close;
    $('.ov').addEventListener('click', function (e) { if (e.target === $('.ov')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('.ov').classList.contains('open')) close(); });
  }
  function $(s) { return sh.querySelector(s); }
  function close() { if (sh) $('.ov').classList.remove('open'); }
  function open(which) {
    build(); tab = which || tab || 'chat';
    $('.ov').classList.add('open');
    $('.hd b').textContent = '✨ ' + cfg.title;
    var tabs = [['chat', T('chat')]];
    if (cfg.practice) tabs.push(['practice', T('practice')]);
    tabs.push(['settings', '⚙']);
    $('.tabs').innerHTML = tabs.map(function (t) { return '<button class="tb' + (t[0] === tab ? ' on' : '') + '" data-t="' + t[0] + '">' + esc(t[1]) + '</button>'; }).join('');
    Array.prototype.forEach.call(sh.querySelectorAll('.tb'), function (b) { b.onclick = function () { open(b.dataset.t); }; });
    ({ chat: renderChat, practice: renderPractice, settings: renderSettings }[tab] || renderChat)();
  }

  /* chat tab */
  function renderChat() {
    var bd = $('.bd'), ft = $('.ft');
    var starters = (typeof cfg.starters === 'function' ? cfg.starters() : cfg.starters) || [];
    bd.innerHTML = (history.length ? '' : '<div class="m">' + md(cfg.greeting ? (typeof cfg.greeting === 'function' ? cfg.greeting() : cfg.greeting) : '👋') + '</div>' +
      (starters.length ? '<div class="st">' + starters.map(function (s) { return '<button>' + esc(s) + '</button>'; }).join('') + '</div>' : '')) +
      history.map(function (m) { return '<div class="m' + (m.role === 'user' ? ' u' : '') + '">' + (m.role === 'user' ? esc(m.shown || m.content).replace(/\n/g, '<br>') : md(m.content)) + '</div>'; }).join('') +
      (busy ? '<div class="m dots">' + T('thinking') + '</div>' : '') + '<p class="mut">' + esc(T('disclaimer')) + '</p>';
    Array.prototype.forEach.call(bd.querySelectorAll('.st button'), function (b) { b.onclick = function () { send(b.textContent); }; });
    ft.innerHTML = '<textarea placeholder="' + esc(T('ph')) + '" rows="1"></textarea><button class="go"' + (busy ? ' disabled' : '') + '>' + esc(T('send')) + '</button>' +
      (history.length ? '<button class="go alt" title="' + esc(T('clear')) + '">↺</button>' : '');
    var ta = ft.querySelector('textarea');
    ft.querySelector('.go').onclick = function () { send(ta.value); };
    var clr = ft.querySelector('.alt'); if (clr) clr.onclick = function () { history = []; renderChat(); };
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(ta.value); } });
    ta.addEventListener('input', function () { ta.style.height = 'auto'; ta.style.height = Math.min(120, ta.scrollHeight) + 'px'; });
    bd.scrollTop = bd.scrollHeight;
    if (!busy && window.matchMedia && matchMedia('(pointer:fine)').matches) ta.focus();
  }
  function send(text, shown) {
    text = String(text || '').trim();
    if (!text || busy) return;
    history.push({ role: 'user', content: text, shown: shown });
    busy = true; if (tab === 'chat') renderChat();
    var sys = (typeof cfg.tutor === 'function' ? cfg.tutor() : cfg.tutor) + (lang() === 'fr' ? '\nThe learner reads the app in French.' : '');
    var msgs = [{ role: 'system', content: sys }].concat(history.slice(-12).map(function (m) { return { role: m.role, content: m.content }; }));
    chat(msgs).then(function (t) { history.push({ role: 'assistant', content: t.trim() }); })
      .catch(function (e) { history.push({ role: 'assistant', content: '⚠️ ' + T('fail') + '\n\n`' + String(e.message || e).slice(0, 160) + '`' }); })
      .then(function () { busy = false; if (sh && tab === 'chat' && $('.ov').classList.contains('open')) renderChat(); });
  }
  function explain(d) {
    d = d || {};
    var lines = ['Question: ' + plain(d.question)];
    if (d.options && d.options.length) lines.push('Choices: ' + d.options.map(function (o, i) { return String.fromCharCode(65 + i) + ') ' + plain(o); }).join(' | '));
    if (d.correct != null) lines.push('Correct answer: ' + plain(d.correct));
    if (d.picked != null && d.picked !== '') lines.push('My answer: ' + plain(d.picked) + (plain(d.picked) === plain(d.correct) ? ' (correct)' : ' (wrong)'));
    if (d.note) lines.push('Notes from the app: ' + plain(d.note));
    var extra = typeof cfg.explain === 'function' ? cfg.explain() : cfg.explain;
    lines.push(d.ask || extra || 'Explain step by step why the correct answer is right' + (d.picked != null ? ' and why my answer is or is not' : '') + '. Keep it short, then give one similar example.');
    history = [];
    open('chat');
    send(lines.join('\n'), d.shown || '💡 ' + T('explainQ') + '\n' + plain(d.question).slice(0, 160));
  }

  /* practice tab */
  function renderPractice() {
    var bd = $('.bd'), ft = $('.ft');
    var topics = (typeof cfg.topics === 'function' ? cfg.topics() : cfg.topics) || [];
    var score = quiz.filter(function (q) { return !q.err && q.pick != null; }), right = score.filter(function (q) { return q.pick === q.answer; }).length;
    bd.innerHTML = (quiz.length ? '' : (topics.length ? '<div class="st">' + topics.map(function (s) { return '<button>' + esc(s) + '</button>'; }).join('') + '</div>' : '')) +
      quiz.map(function (q, qi) {
        if (q.err) return '<div class="m err">⚠️ ' + esc(T('fail')) + '<br><code>' + esc(q.err) + '</code></div>';
        var done = q.pick != null;
        return '<div class="q"><h4>' + (qi + 1) + '. ' + md(q.q).replace(/^<p>|<\/p>$/g, '') + '</h4>' + q.options.map(function (o, i) {
          var c = done ? (i === q.answer ? ' ok' : i === q.pick ? ' bad' : '') : '';
          return '<button class="o' + c + '" data-q="' + qi + '" data-i="' + i + '"' + (done ? ' disabled' : '') + '>' + String.fromCharCode(65 + i) + ') ' + esc(o) + '</button>';
        }).join('') + (done ? '<div class="why ' + (q.pick === q.answer ? 'ok' : 'bad') + '"><b>' + esc(q.pick === q.answer ? T('correct') : T('wrong') + String.fromCharCode(65 + q.answer)) + '</b> ' + md(q.why || '') + '</div>' : '') + '</div>';
      }).join('') + (busy ? '<div class="m dots">' + T('thinking') + '</div>' : '') +
      (quiz.length ? '<p class="mut">' + T('score') + ': ' + right + '/' + score.length + ' · ' + esc(T('disclaimer')) + '</p>' : '<p class="mut">' + esc(T('disclaimer')) + '</p>');
    Array.prototype.forEach.call(bd.querySelectorAll('.st button'), function (b) { b.onclick = function () { generate(b.textContent); }; });
    Array.prototype.forEach.call(bd.querySelectorAll('.o'), function (b) {
      b.onclick = function () { var q = quiz[+b.dataset.q]; if (q.pick == null) { q.pick = +b.dataset.i; if (cfg.onAnswer) try { cfg.onAnswer(q.pick === q.answer, q); } catch (e) {} renderPractice(); } };
    });
    ft.innerHTML = '<input placeholder="' + esc(T('topicPh')) + '" aria-label="' + esc(T('topic')) + '" value="' + esc(quiz.topic || '') + '"><button class="go"' + (busy ? ' disabled' : '') + '>' + esc(quiz.length ? T('more') : T('gen')) + '</button>';
    var inp = ft.querySelector('input');
    ft.querySelector('.go').onclick = function () { generate(inp.value); };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') generate(inp.value); });
  }
  function generate(topic) {
    topic = String(topic || '').trim() || (quiz.topic || 'a mix of topics');
    if (busy) return;
    if (topic !== quiz.topic) { quiz = []; quiz.topic = topic; }
    busy = true; renderPractice();
    quiz = quiz.filter(function (q) { return !q.err; }).concat([]); quiz.topic = topic;
    var seen = quiz.map(function (q) { return q.q; }).slice(-15).join(' | ');
    var sys = typeof cfg.practice === 'function' ? cfg.practice() : cfg.practice;
    var prompt = 'Write 5 new multiple-choice questions about: ' + topic + '.\n' +
      'Return JSON exactly like {"questions":[{"q":"question","options":["A","B","C","D"],"answer":0,"why":"one-sentence explanation"}]}. ' +
      '"answer" is the 0-based index of the correct option. Exactly 4 options, one clearly correct. Vary which position is correct.' +
      (seen ? '\nDo not repeat these: ' + seen : '');
    json(prompt, sys).then(function (j) {
      var qs = (Array.isArray(j) ? j : j.questions || []).filter(function (q) {
        return q && q.q && Array.isArray(q.options) && q.options.length >= 2 && +q.answer >= 0 && +q.answer < q.options.length;
      }).map(function (q) { return { q: String(q.q), options: q.options.map(String), answer: +q.answer, why: String(q.why || '') }; });
      if (!qs.length) throw new Error('No usable questions');
      quiz.push.apply(quiz, qs);
    }).catch(function (e) {
      quiz.push({ err: String(e.message || e).slice(0, 160) });
    }).then(function () { busy = false; if (sh && tab === 'practice') renderPractice(); });
  }

  /* settings tab */
  function renderSettings() {
    var s = loadSettings(), bd = $('.bd'), ft = $('.ft');
    var draw = function () {
      var id = sel.value, p = PROVIDERS[id];
      box.innerHTML = (id === 'pollinations' ? '' :
        (p.key || id === 'custom' ? '<label>' + T('key') + (id === 'custom' ? ' (optional)' : '') + '</label><input type="password" autocomplete="off" class="k" value="' + esc(s.keys[id] || '') + '">' : '') +
        (p.link ? '<p class="mut"><a href="' + p.link + '" target="_blank" rel="noopener">' + T('getKey') + ' ↗</a></p>' : '')) +
        '<label>' + T('model') + '</label><input class="md" value="' + esc(s.models[id] || p.model) + '">' +
        (id === 'custom' ? '<label>' + T('url') + '</label><input class="u" value="' + esc(s.urls[id] || p.url) + '">' : '');
    };
    bd.innerHTML = '<div><label>' + T('prov') + '</label><select>' + Object.keys(PROVIDERS).map(function (k) { return '<option value="' + k + '"' + (k === s.provider ? ' selected' : '') + '>' + esc(PROVIDERS[k].name) + '</option>'; }).join('') + '</select>' +
      '<div class="box"></div><p class="mut">' + esc(T('keyNote')) + '</p><p class="res mut"></p></div>';
    var sel = bd.querySelector('select'), box = bd.querySelector('.box'), res = bd.querySelector('.res');
    sel.onchange = draw; draw();
    var store = function () {
      var id = sel.value, k = box.querySelector('.k'), m = box.querySelector('.md'), u = box.querySelector('.u');
      s.provider = id;
      if (k) s.keys[id] = k.value.trim();
      if (m) { if (m.value.trim() && m.value.trim() !== PROVIDERS[id].model) s.models[id] = m.value.trim(); else delete s.models[id]; }
      if (u) s.urls[id] = u.value.trim();
      saveSettings(s);
    };
    ft.innerHTML = '<button class="go">' + esc(T('save')) + '</button><button class="go alt">' + esc(T('test')) + '</button>';
    ft.querySelector('.go').onclick = function () { store(); res.textContent = T('saved'); };
    ft.querySelector('.alt').onclick = function () {
      store(); res.textContent = T('thinking');
      callProvider(sel.value, [{ role: 'user', content: 'Reply with just: OK, it works!' }], { temperature: 0 })
        .then(function (t) { res.textContent = T('ok') + t.trim().slice(0, 80); })
        .catch(function (e) { res.textContent = '⚠️ ' + String(e.message || e).slice(0, 200); });
    };
  }

  function init(o) {
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) cfg[k] = o[k];
    var go = function () { build(); };
    if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
  }
  function showFab(on) { build(); $('.fab').classList.toggle('hide', !on); }

  window.FreeLLM = { init: init, open: open, close: close, explain: explain, chat: chat, ask: ask, json: json, showFab: showFab, providers: PROVIDERS, settings: loadSettings };
})();
