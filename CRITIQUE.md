# Design review

One independent design critic reviews both rounds, using the web-designer rubric. Screenshots, timed animation frames and scan reports are kept in the external `draft-review` artifact folder; the application contains no test fixtures or review states.

## Round 1

Four viewport scans and four populated-comparison scans: zero failures or warnings. Platform matrix: 11 available passes clean, Firefox initially unavailable. Browser workflows passed at 390, 768, 1280 and 1440; standalone offline files worked in Chromium and WebKit. Existing regression tests plus new opt-in example and live-count checks: 25/25.

| Rubric | Score | Visible evidence |
|---|---:|---|
| Concept on the page | 4 | Document typography, cool desk surface, and proof marks form a coherent writing environment. |
| Not the category average | 4 | Asymmetric editors and literary reader distinguish it from technical red/green tools. |
| Not a slop face | 4 | No pills, dashboard cards, mono eyebrows, gradients, or fabricated proof. |
| First screen | 3 | Compare disappears below Windows-150 and 320px viewports. |
| Typography | 4 | Strong scale; populated desktop reading lines are too long. |
| Colour | 5 | Cobalt additions and slate deletions are restrained and clear. |
| Richness | 3 | Large illustrative intro continues to dominate after real work exists. |
| Structure and rhythm | 4 | Input, result and history follow the task without nested panels. |
| Craft | 3 | Replacements concatenate visually; Cancel becomes a stranded phone row. |
| Responsive | 3 | Short desktop and narrow phone need better action priority. |
| Everyone's computer | 4 | Available matrix clean; Firefox not yet verified. |
| Signature | 2 | Opacity fade is generic. |
| Screenshot test | 3 | Intro is more memorable than the comparison itself. |
| Fidelity | 4 | All kept controls and states present. |

46/65 on the primary rubric; fidelity 4/5. Seven of 13 at 4 or higher. Not done.

### Changes requested and implemented for round 2

1. Move Compare to the leading editor command row; compact the intro and hide its illustrative proof once a comparison exists. Real DOM order, one primary action, no floating duplicate.
2. Add `.12em` visual spacing at `del + ins` boundaries. Exact underlying text remains unchanged.
3. Replace fragment opacity animation with a single proofreader's margin mark: 12px registration and a short rule scaling into place over 800ms. Inline text stays fully opaque and naturally wrappable; reduced motion is static.
4. Narrow the reader to 64ch including its padding.
5. Give Swap and Cancel an intentional shared row after the fields; remove the detached period after the example hint.

All five accepted. The critic explicitly recommended keeping the quiet areas, palette and lack of extra imagery. Firefox test browser installed to close the remaining engine gap.

## Round 2

The same critic reviewed the four empty screens, full-page slices, four populated comparisons, desktop and phone history, final filmstrip, platform sheet, and short/narrow viewport captures. Empty and populated scans: zero failures and warnings. Eleven available platform checks: zero failures and warnings. Four-width workflows and standalone offline Chromium/WebKit checks pass. 25 regression tests pass.

| Rubric | Score | Visible evidence |
|---|---:|---|
| Concept on the page | 4 | Document, margin mark and cool desk surface express one proofreading environment. |
| Not the category average | 4 | Literary type and blue/slate comparison retain a distinct identity. |
| Not a slop face | 4 | No pills, dashboard cards, ornamental labels or marketing sections. |
| First screen | 4 | Compare is visible in both Windows-150 and 320px captures. |
| Typography | 4 | Narrower reader and compact result headings yield attention to the text. |
| Colour | 5 | One blue accent consistently identifies action and inserted text. |
| Richness | 4 | Real document replaces the illustrative proof once compared. |
| Structure and rhythm | 4 | Compact introduction, result and history follow the work. |
| Craft | 4 | Replacement spacing, hint punctuation and intentional phone controls all improved. |
| Responsive | 4 | Leading action survives short/narrow screens; completed phone comparison fits comfortably. |
| Everyone's computer | 4 | Available matrix clean; Firefox launch remains an environment limitation. |
| Signature | 3 | Registering margin mark is relevant; filmstrip confirms movement without fading text. |
| Screenshot test | 4 | Populated screen is now a composed reading tool. |
| Fidelity | 5 | Every kept workflow present and easier to locate. |

52/65; fidelity 5/5. Twelve of 13 at 4 or higher, none below 3. **Done by the stop rule.**

Fixed after the last round, not rescored: moved the tablet proof mark from 16px to 8px inset, leaving an 8px gutter before the first glyph. The later phone override remains intact. Verified with a populated 768px render, a measured gutter assertion, and the app scan.

Firefox was downloaded successfully, but Playwright's process exits with `Could not find profile folder` on this machine. A retry using `/private/tmp` had the same outcome. The matrix's generic “not installed” skip message does not describe the actual failure. Firefox is **unverified**, not a passing result.

## Six design tests

- Swap: the proof marks and document typography identify a prose comparison tool, rather than a general editor/dashboard.
- Squint: the display identifies the tool initially; once compared, the real document becomes the focus through intro compaction.
- Face: no collection of three traits from any of the four named templates. The cool ground, functional serif reader, real inputs and modest mark are product-specific.
- Specificity: cobalt means compare/addition; slate strikethrough means removal; the 7+5 grid gives the two versions distinct document spaces; 64ch limits reading measure.
- Screenshot: the populated reader is the intended shareable frame; there is no fabricated content or dashboard decoration.
- Subtraction: editor, comparison and history each support a real workflow. No marketing sections were added.

## Verification limits

Platform fonts and Windows scaling are emulated. Real Windows glyph rendering/ClearType, physical devices, assistive technology and hardware performance are not verified by these scans. WebKit is a browser-engine check, not a claim of testing every shipping Safari/iOS version. Manual keyboard focus checks and scripted browser workflows complement the rendered scans.
