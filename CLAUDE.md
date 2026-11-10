# Consultor U — project guide for Claude Code

## What this is
Single-file pixel-art game (`index.html`, vanilla HTML/CSS/JS, no build) where Manuel (International Business, year 1, Maastricht) studies for his **15 Dec 2026 exams** by playing a consultant/accountant. Subjects: *Economics and Business* (EBC1009, Acemoglu/Laibson/List) and *Accounting and Financial Reporting* (EBC1037-39, Weygandt IFRS 5e).

## Working style (Manuel's preferences)
- Act as a product manager with technical skills: be critical of ideas, but encourage creativity. Be concise (save tokens).
- Chat with Manuel in Spanish. **All in-game text is English.**
- Be honest about limits; do not claim something works until tested.

## Architecture (all in `index.html`, in this order)
- Head: embedded fonts (base64 Press Start 2P, VT323), iPad/PWA meta, inline manifest and icon.
- State: `localStorage` key `consultoru1` = `{m: mastery by concept, c: best scores, career: {unlocked days per track, promoted}, free: {sel, n}}`.
- `QBANK` (125 vetted questions: 64 original + batch 1 from `batch1_questions.json`: `numeric` / `choice` / `multientry`) + `BIZ` (same order, one entry each: `[who, role, text, say]`). `text` may contain `¦` splitting a neutral ask from a review-only suffix. Every number in a question must appear in its `BIZ` text (tested).
- `CASES` (4 old hand-made guided cases), `ACC` account map.
- Desk engine: `mkCase(q)` makes `mode: 'review'` (approve/reject, ~30–35%) or `'mc'` (4 options: `wrongNums`, `mcEntries`). `deskCase`, `settle`, `approve`, `reject`, `signMC`, `deskEnd`. Economy: +€50 correct, first 2 mistakes free, then −€75, need 60% to pass a day.
- `TRACKS`: `book` (Bookkeeping Desk, 3 days) → promotion → `fs` (Senior Accountant, 4 days) + `acc` (Financial Audit) + `econ` (Economics Advisory). `kind:'work'` tracks use generated tasks (`JE` templates, `genTB`, `mkTB/mkIS/mkBS/mkCLS`, `WT` UI+grader, `workStart/workCase/workSubmit`). `RULES` = rulebook cards.
- Typed numbers: inputs are `type=text inputmode=decimal`; always read them with `pn()` (accepts comma decimals and thousands separators). `tolOf(q)` never goes below `TOL_MIN` = ±0.1.
- Free mode: `freeSetup/freeStart/freeEnd` (pick chapters, mixed queue, `WKT` bookkeeping topics).
- Scratch pad: canvas with Pointer Events (pen pressure, palm rejection, eraser, big board), thumbnails of missed cases in reports.
- Calculator: `calcHtml/calcKey/calcEval/calcUse`, rendered inside the pad (under its toolbar, `▸ Calc` toggles, state in `CALC`, open flag in `localStorage` `consultoru_calc`). Own recursive-descent parser, no `eval`. `Use` copies the result into the last focused `inputmode=decimal` box. Tested in `tests/t7.js`.
- Layout: `#app.wide` full width; `#app.fit` fits the viewport without page scroll (>900px). Under 900px it stacks and scrolls.
- Pixel art: procedural portraits (`paint`, seeded), `sfx` WebAudio.

## Tests (jsdom)
`npm i && npm test` runs `tests/t2..t6.js` (each prints `SIN ERRORES` on success). They check: question bank, desk flow with perfect/bad play on all days, work generators (debits = credits, TB balances, A = L + E), free mode, pad, BIZ alignment. `tests/t.js` has 2 known rounding failures from the old guided cases (pre-existing, not a regression). jsdom needs stubs for canvas `getContext` and `scrollIntoView`.

## Content rules (very important)
- Questions came from NotebookLM and **must be audited**: recompute arithmetic, drop "wait, let's recalculate" explanations, drop wrong chapter labels and made-up page numbers, keep to chapters in scope. Accounting in scope: Ch.1–6, 8, 9, 10, 12, 14, 15; not 7, 11, 13.
- Adding a question: append to `QBANK` **and** to `BIZ` at the same index; check units (the numeric `say` text carries its own unit/symbol, `fmtV` is for option labels).
- Exam facts: Econ 40 MC / 120 min (27 correct = 5.5); Accounting 30 MC + 4 open (25.5/40).

## Roadmap / decisions
1. **Shop + persistent wallet** (agreed design): skills (Hint −1 wrong option €30; Calculator: free in the workspace (decided 2026-11-10, not a shop item); extra warning €200; rulebook worked examples €150; review a missed question €50) and office decor by rank. Keep helps scarce so the real exam is not harder; lower pay on mastered chapters; time bonus for under 3:00.
2. More content (via NotebookLM, audited): Econ Ch.13, 14, 19, 26–27; Accounting Ch.8 and more on 10, 12, 14. Several chapters have only 1–5 cases.
3. Idea: client sometimes states the price when the question asks for quantity (practice price vs quantity).
4. Polish: portrait gender does not match client names; recurring clients/story; varied office decor per day.
5. Hosting: **live on GitHub Pages** at https://manuelpedrazab30.github.io/ConsultorSIM/ (deploys on every push to `main`, ~1 min). iPad: Safari → Share → Add to Home Screen, always open from that icon (its `localStorage` is separate from Safari's). `sw.js` is network-first with cache fallback, so it works offline; bump `CACHE` in `sw.js` if you add files to precache. Progress is per device.
6. Remote repo: `manuelpedrazab30/ConsultorSIM` (**public**, needed for free Pages). `scripts/checkpoint.sh "msg"` commits and pushes = deploys.
