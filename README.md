# The Modeling Lab

An interactive, browser-based course that teaches **domain modeling** by doing — the skill of mapping any product into **entities, attributes, and relationships**, then turning that into an ER diagram and a database schema (CSV-ready).

Built for 100xEngineers Cohort 7, in the 100x design language (white canvas, coral accent, Space Grotesk / DM Sans). No install, no server, no account — **just double-click `index.html`.** Works for the code track and the no-code track alike.

## How to run it

- **Easiest:** double-click `index.html` → opens in your browser.
- Or: `open index.html` (macOS) / `xdg-open index.html` (Linux).

Progress and your schemas are saved automatically in the browser. Use **Reset progress** in the sidebar to start over.

## How it's built pedagogically

Minimal theory, maximum doing. The flow is a **linear lesson player** — one concept per screen (headline · subtitle · one short body), and quick checks that present **one question at a time** to keep cognitive load low. Then a practice gym.

**Lessons**
1. **Start here** — a 30-second "your app forgets" hook, then straight into modeling.
2. **Entities** — the nouns + the CRUD test (is it its own thing?).
3. **Attributes** — what describes an entity, and the entity-vs-attribute boundary.
4. **Relationships** — one-to-one, one-to-many, many-to-many, the join/associative table, and *where in-between data (grade, quantity) belongs*.
5. **Keys & ER** — primary keys, foreign keys (on the many side), and how the model maps to ER + CSV sheets.

**The Arena** — 10 graded modeling exercises across 3 tiers:

| Tier | Exercises (skill) |
|------|-------------------|
| Beginner | Library (1:N) · Pet Clinic (1:N) · Bakery (junction table) · Music Library (entity vs attribute) |
| Intermediate | Online Learning (M:N) · University Grades (attribute on junction) · Car Rental (contract entity) · Hospital Assignments (historical records) |
| Advanced | LinkedIn Automation (lifecycle + analytics) · Food Delivery (marketplace + assignment) |

For each: read the brief → build tables (columns, PK/FK, references) → **Submit**. A forgiving-but-strict grader checks your entities, attributes, keys and relationships and gives specific feedback. It's lenient on naming (plurals + synonyms) but **won't pass** a model that misses the exercise's core lesson (e.g. no join table, or the grade on the wrong table). View it as an **ER diagram**, preview the **CSV sheets**, or **download the CSVs**.

## Files

```
index.html       → app shell (sidebar + lesson player + arena)
css/tokens.css   → 100xEngineers design tokens (colors, type, spacing) — drop-in brand sheet
css/app.css      → app-specific components, built on the tokens
js/data.js       → lesson content + the 10 exercise rubrics
js/grader.js     → the schema-grading engine
js/app.js        → linear player, schema builder, Arena, ER/CSV export
```

To add an exercise, copy an object in `CHALLENGES` (in `js/data.js`) and describe its `rubric`. Mark an attribute `critical: true` to make missing it block a pass (use it for the exercise's teaching point). No other changes needed.

## Design

Implements the **100xEngineers design system** (`css/tokens.css` is the brand's drop-in token sheet): white canvas, coral `#F96846` as the single accent, generous whitespace, borders over heavy shadows, Space Grotesk + DM Sans + JetBrains Mono, and subtle 150–200ms motion. Icons are [Lucide](https://lucide.dev) (outline), loaded via CDN.
