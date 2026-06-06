# 🧠 The Memory Lab

An interactive, browser-based exercise that teaches **databases & domain modeling** by *doing* — built from the Cohort 7 lecture *"Intro to Databases and Domain Modeling."*

No install, no server, no account. **Just double-click `index.html`.** Works for the code track and the no-code track alike.

## How to run it

- **Easiest:** double-click `index.html` → it opens in your browser.
- Or, from a terminal: `open index.html` (macOS) / `xdg-open index.html` (Linux).

Your progress and your schemas are saved automatically in the browser (localStorage). Use **Reset progress** in the sidebar to start over.

## What you'll do (8 progressive stages)

| # | Stage | You learn by… |
|---|-------|---------------|
| 1 | **The Amnesia Problem** | Chatting with a system that forgets on restart, then watching a "just use a file" answer break at 10,000 users. |
| 2 | **The Storage Ladder** | Placing real scenarios on the right rung: in-memory → file → database. |
| 3 | **$10 or $100,000** | Answering a Fortune-500's "deploy it in our walls" — cloud vs on-prem. |
| 4 | **Spot the Entity** | Sorting things into *entity* vs *attribute* with the CRUD test (drag or click). |
| 5 | **Connect the Dots** | Naming each relationship: one-to-one, one-to-many, many-to-many. |
| 6 | **Follow the Key** | Tracing primary keys & foreign keys through real rows. |
| 7 | **The Schema Studio** | Building the chat app's tables yourself, graded live, exportable to CSV. |
| 8 | **The Arena** | LeetCode-style challenges: design a full schema and submit it for grading. |

## The Arena (the challenge)

Three problems of rising difficulty — **Library** (easy), **Food Delivery** (medium), **Photo Network / Instagram** (hard). For each you:

1. Read the brief.
2. Build tables → add columns → mark **PK**/**FK** → point foreign keys at the right table.
3. Hit **Submit**. A grader checks your entities, attributes, keys and relationships and gives specific, teachy feedback (it's forgiving about naming — plurals & synonyms are fine).
4. **Preview as sheets** or **Download CSVs** — your domain model *is* a set of spreadsheets, which is exactly what maps onto a real DB schema.

Solve all three to complete the lab.

## Files

```
index.html      → the app shell
css/styles.css  → styling
js/data.js      → lecture content + challenge rubrics
js/grader.js    → the schema-grading engine
js/app.js       → stages, the schema builder, CSV export
```

To add your own challenge, copy an object in `CHALLENGES` (in `js/data.js`) and describe its `rubric`. No other changes needed.
