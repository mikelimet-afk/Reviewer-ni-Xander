# Tamaraw Prep – FEUCAT Reviewer (unofficial)

A free practice reviewer for the FEU College Admission Test. Runs entirely in the browser; scores are saved on the device (localStorage).

Not affiliated with or endorsed by Far Eastern University. All questions are original practice items.

## What's inside

- **Assessment Test** – ~74 items, 46 min: speed math, vocabulary and grammar, reading comprehension, abstract and logical reasoning, science, problem solving.
- **Mock Exam** – ~100 items, 95 min: English, Mathematics, Science, Mental Ability.
- **Practice by Topic** – untimed drills with instant explanations.
- **Retry My Mistakes** – missed questions come back until answered correctly.
- **My Progress** – score history, trend chart, export/import backup.
- **Basic Reviewer** – 17 illustrated lessons (number sense, fractions/ratios/percent with a cut-the-pie widget, algebra, geometry formulas, angles & trigonometry with SOH CAH TOA and identities, statistics & probability, sequences, the cell, genetics, atoms, physics, Earth & space, grammar, vocabulary, reading, analogies & logic, series & figures). Each section has practice sets whose problems are generated fresh every time.
- **Difficulty slider** – *Easy* (the original question set), *Mixed*, or *Real exam* (harder items modeled on FEUCAT-style reviewers: multi-step math, two-rule figures, letter/number analogies).
- **Per-question timer** – counts down the ideal time per item (section time ÷ items; e.g. 120 min / 150 items = 48 s), turns green → yellow → red, then counts the time over. Optional **time debt** in Settings carries overtime into the next question.

## Put it online with GitHub Pages (no software needed)

1. Sign in at https://github.com (create a free account if needed).
2. Click **+** (top right) → **New repository**. Name it e.g. `feucat-reviewer`, choose **Public**, click **Create repository**.
3. On the new repository page click **uploading an existing file**.
4. Drag in all the `.html`, `.css` and `.js` files from this folder, then click **Commit changes**.
5. Go to **Settings → Pages**. Under **Branch**, pick `main` and `/ (root)`, click **Save**.
6. Wait 1–2 minutes. The site is live at `https://YOUR-USERNAME.github.io/feucat-reviewer/`.

## Adding questions

Open any `q-*.js` file and add a line. The **correct answer always goes first**; the app shuffles the choices.

```js
Q("math", "algebra", "Solve: 2x = 10", ["5", "20", "8", "12"], "Divide both sides by 2.");
```

Questions in `q-english.js`, `q-math.js`, `q-science.js` and `q-reasoning.js` are **Easy**. Real-exam questions live in the `q-real-*.js` files, which start with `D(3);` (everything after it is Real exam level) and end with `D(1);`.

## Free AI tutor

`free-llm.js` adds a free AI tutor (✨ AI in the header, a home tile, and an **Explain with AI** button under every answer explanation):

- **Chat** – ask any FEUCAT question or paste a problem you are stuck on.
- **Practice** – generates brand-new multiple-choice questions on any topic.
- **Explain with AI** – step-by-step explanation of the question you just answered.

It works with no account or key (Pollinations.ai). For smarter answers, add a free **Google Gemini**, **Groq** or **OpenRouter** key in Settings → AI settings; keys are saved only on your device. AI answers can be wrong — the built-in explanations are the reference.

- **On/off:** Settings → ✨ AI Tutor → “Turn on the AI tutor”. Off hides every AI button.
- **Speed:** answers stream in word by word. If nothing arrives within 15 s it switches to a backup route; replies stop after 45 s.
- **Explanations** are written for a learner rebuilding the basics (why the answer looked right, the basic skill, small steps, one practice problem), and each ends with a button to the matching Basic Reviewer lesson.
- The free model (currently gpt-oss-20b) blocks requests from `localhost`, so AI only works on the published site or another real address, not in a local preview.
- This `free-llm.js` is a **local copy** that has split from the version shared with Parlons and ACCtimerDU (see the note at the top of the file).
