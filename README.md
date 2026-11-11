# Tamaraw Prep – FEUCAT Reviewer (unofficial)

A free practice reviewer for the FEU College Admission Test. Runs entirely in the browser; scores are saved on the device (localStorage).

Not affiliated with or endorsed by Far Eastern University. All questions are original practice items.

## What's inside

- **Assessment Test** – ~74 items, 46 min: speed math, vocabulary and grammar, reading comprehension, abstract and logical reasoning, science, problem solving.
- **Mock Exam** – ~100 items, 95 min: English, Mathematics, Science, Mental Ability.
- **Practice by Topic** – untimed drills with instant explanations.
- **Retry My Mistakes** – missed questions come back until answered correctly.
- **My Progress** – score history, trend chart, export/import backup.

## Put it online with GitHub Pages (no software needed)

1. Sign in at https://github.com (create a free account if needed).
2. Click **+** (top right) → **New repository**. Name it e.g. `feucat-reviewer`, choose **Public**, click **Create repository**.
3. On the new repository page click **uploading an existing file**.
4. Drag in these 7 files, then click **Commit changes**:
   `index.html`, `style.css`, `app.js`, `q-english.js`, `q-math.js`, `q-science.js`, `q-reasoning.js`
5. Go to **Settings → Pages**. Under **Branch**, pick `main` and `/ (root)`, click **Save**.
6. Wait 1–2 minutes. The site is live at `https://YOUR-USERNAME.github.io/feucat-reviewer/`.

## Adding questions

Open any `q-*.js` file and add a line. The **correct answer always goes first**; the app shuffles the choices.

```js
Q("math", "algebra", "Solve: 2x = 10", ["5", "20", "8", "12"], "Divide both sides by 2.");
```
