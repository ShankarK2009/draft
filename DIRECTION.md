# Draft / Design direction

## Brief

Brief authored from the repository; the user delegated the visual choice. Draft is a private, offline, single-page text comparison tool for writers and anyone reviewing two versions of text. The first ten seconds should make it clear where to paste the drafts and how to compare them. Feel: thoughtful, precise, open. Reference objects: a proofreader's desk, a studio mixing console, an annotated sketchbook. No paid imagery or new runtime dependencies.

## Current

One page, plain HTML/CSS/JavaScript. Green buttons, generic small sans headline, nested grey and white panels. Functional diff engine and robust bounded browser history. No assets, remote fonts, analytics, or preloaded drafts. Snapshot: `design/before.html`; before screenshots live in the external review artifact folder.

Keep contract:
- [x] Name and slash wordmark.
- [x] Empty original/revised inputs, desktop columns and phone stacking.
- [x] Swap, compare, close/reopen editor, cancel edits, clear texts.
- [x] Exact inline additions/deletions, word counts, no-change and large-text states.
- [x] History restore, delete, clear, deduplication, limits, cross-tab synchronization and storage warnings.
- [x] Local-only operation, no external requests, no build step, offline use.
- [x] Existing regression tests, accessible labels, status announcements and keyboard focus.

Lose: nested panels, rounded card styling, competing green/red highlights, repeated privacy copy, default-sized title. No page or feature removal, name change, or navigation destination change is planned.

## Category default refused

Common diff-tool defaults: equal-width bordered editors, red/green blocks, and a toolbar above a technical result. These are visual conventions rather than a researched ranking of competitors. Refuse the generic dashboard, a marketing landing page before the tool, and the paper-and-serif template with italic accent words and pills. This is a writing tool; the document is the visual evidence.

## Three concepts

| | Concept | Source | Ground | Type | Accent | Richness | Shell | Motion |
|---|---|---|---|---|---|---|---|---|
| A | Draft is a proofreader's desk. | object | light | serif | blue | data | split | Changed phrases settle into a document |
| B | Draft is a studio mixing console. | place | dark | condensed | yellow | shape | topbar | Revision meter bars assemble |
| C | Draft is an annotated sketchbook. | printed | colour-field | rounded | pink | illustration | canvas | Pencil makes a correction |

The first obvious associations (red proofreading marks, terminal diff, paper sheets) were rejected in favor of a cool desk, a studio instrument, and a drawn canvas. Explorations: `design/explore/{a,b,c}.html`. All contain an explicitly illustrative comparison; production inputs remain empty.

Winner: A, after rendering all three at 390 and 1440. The writing feels central and the cool palette separates it from the usual warm editorial page. B lost because its technical costume distracts from reading prose. C lost because illustration takes too much of the phone's first screen. A's phone layout will be compressed so the action and both inputs are reached sooner. The initial exploration scan flagged Unicode diagonal arrows as emoji; these have been removed. B was clean. The existing page was mechanically clean, so the goal is composition and usability, not invented defects.

History check passed: `app|object|light|serif|blue|data|split`, versus both the stored portfolio direction and the previous `app|printed|light|grotesque|green|shape|topbar` classification (four differences).

## Direction card and tokens

```text
Ratio      1.2
Body       16px / 1.6 / measure 66ch
Display    clamp(3rem, 7vw, 6rem) / 0.98 / weight 400 / -0.045em
Grid       12 cols, gutter 24px, margin clamp(24px, 5.5vw, 80px)
Unit       8px
Paper      #F0F3F7  Ink #1B3047  Muted #53647A  Rule #CBD3DE
Accent     #2454CE, under 5% of pixels, primary action and additions
Signature  Changed phrases settle into the reading view, 800ms, once
Motion off Final text visible immediately; no movement
```

Surface #FCFDFF; addition tint #E4ECFF with #1945AD ink. Deletions use secondary ink and strikethrough so change is never conveyed by color alone. Focus uses accent, with an offset outline. Dark mode deliberately declined: this tool presents a daylight reading desk; forced-colors still works. No automatic theme inversion.

Georgia for display and drafts: a built-in text serif with generous counters and a recognizably literary voice, already used in the existing reader. Arial for controls: compact, plain labels that stay quiet beside the document. Fallbacks include Times New Roman/Liberation Serif and Helvetica/Liberation Sans. No font downloads or font swaps, preserving the self-contained offline file. Scale: 13, 16, 19.2, 23, 28, 40, 96px; fluid display on smaller screens. Tabular figures for counts. Sharp document surfaces, 2px control corners; no shadows. Max width 1440px. Intro and editor use 7+5 columns. The result document hangs 24px into its margin: the sole intentional grid break. The upper-right part of the first desktop viewport keeps a generous quiet area.

## Shell and richness

A single workspace, with three steps: enter two drafts, read the comparison, revisit history. No dashboard sidebar, marketing sections or extra routes. On phone, shorter fields and a compact intro preserve both editable versions and the compare action. History is a normal disclosure after the document, not a competing surface. The real diff provides richness in use; a small clearly labelled example shows the markup before the user enters anything. The example button explicitly loads sample drafts and confirms before replacing edits. It never saves a sample automatically.

## Signature storyboard

Technique: proof ink appearing on the document. Trigger: compare the two drafts. Frame 0: unchanged and deleted words are in place; new fragments are at 35% opacity. Frame 400: the addition ink strengthens. Frame 800: final marks at full opacity. Each fragment uses the same timing with no per-word stagger. The planned 8px travel was removed so inline marks retain natural multi-line wrapping and exact text whitespace; only opacity animates. Easing cubic-bezier(.16,1,.3,1). Reduced motion: animation disabled, complete final document. No loop, pointer follower, or scroll motion. Hover feedback is 150ms.

## Voice

A thoughtful copy editor: clear about the task, brief about the tool, protective of the writer's attention.

## Content

- Masthead: `draft/`; `A private text comparison tool`; `On your device. Offline, too.`
- Title: `A closer look at your words.`
- Explanation: `Compare two drafts in one reading view. Every addition and deletion, in context.`
- Illustrative proof: `A small example` / `The best` (deleted) `Good` (added) `writing takes revision.`
- Workspace: `Your drafts`; `Close editor` / `Edit texts`; `Clear texts`.
- Labels: `Original text`, `Revised text`; live `0 words` counts. Placeholders: `Paste the first version here…`, `Paste the next version here…`.
- Actions: `Compare texts`, `Swap texts`, `Cancel`; hint: `Or try an example`.
- Reader: `The comparison`; legend `Deleted`, `Added`, `Unchanged`; exact original/revised word counts; `Ready to compare`, `No changes`, dynamic addition/deletion counts.
- Empty result: `Your revisions will appear here.` / `Paste both versions above, then compare them to read every change in context.` / `Try an example`.
- Sample drafts: `The best writing isn't written all at once. It takes shape one careful revision at a time.` and `Good writing isn't written all at once. It takes shape one thoughtful revision at a time.`
- History: `History (0)`; `Up to 20 recent comparisons, saved on this device. Select one to restore it.`; `No saved comparisons yet. Compare two drafts to save them here.`; `Clear history`; exact local timestamps, draft previews, `Delete`.
- Footer: `A little space for your next draft.` / `Your text stays on this device. No uploads, accounts, or analytics.`
- Existing storage-error, large-text and destructive-confirmation copy retained. No network loading or server permission states exist; comparison is synchronous and local. Zero/one-sided/unchanged/large inputs and unavailable storage are supported states, not simulated routes. URL state is deliberately omitted because drafts are private and must never enter address bars or logs.
