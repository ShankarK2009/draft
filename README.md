# draft/

A simple inline text comparison tool. Paste an original and revised draft to see additions, deletions, and unchanged text in one reading view.

## Use

Open `index.html` in a modern browser. No installation, account, server, or build step is needed. The page also works offline once downloaded.

1. Paste text into **Original text** and **Revised text**.
2. Use **Swap texts** to switch the two drafts if needed, then select **Compare texts**.
3. Use **Edit texts** to revise either version, or **Clear texts** to start over.
4. Open **History** to restore a saved comparison, delete an entry, or clear saved history.

The **try an example** action loads a pair of sample drafts only when selected. It asks before replacing current text, keeps saved history, and does not save the example until you compare it. Live word counts follow each editor as you type.

The editors sit side by side on desktop and stack on smaller screens. Consecutive changed words are grouped into a single addition or deletion for easier reading.

Selecting **Compare texts** saves up to 20 distinct, nonempty comparisons in this browser's local storage, newest first, within a total budget of 200,000 text characters. A comparison larger than that budget can still be compared but is not saved. Saved history survives page reloads and can be restored from **History**. **Clear texts** clears the current drafts and keeps history; **Clear history** deletes saved comparisons and keeps the current drafts. Edits are saved only when you compare them.

Your text is never uploaded. This page includes no analytics, external scripts, or preloaded drafts. History belongs to the current browser and site; deleting browser storage also deletes it. History changes are coordinated across tabs using Web Locks. If that API or storage is unavailable, or storage is full, comparisons still work and the page explains that history changes were not saved. Only successfully saved changes appear in History.

For very large comparisons, the changed section is shown as a single replacement to keep the page responsive.

## Checks

No project dependencies are required; Node.js is required to run the diff and history regression tests:

```sh
node --test tests/diff.test.cjs
```

## Hosting

Serve this folder with any static host. The application still works as a standalone `index.html`; the accompanying favicon, touch icons, and social card provide the browser and sharing artwork. No external fonts or image services are used.

## Design

The workspace follows a cool blue proofreader's desk: serif document type, simple controls, a single accent for additions and the compare action, and strikethrough for deletions. The comparison and all controls support reduced motion, keyboard focus, and forced colors.

Design tokens are at the top of the `<style>` block in `index.html`. Use those color, type, and spacing variables for new UI. Keep document text in `--font-document`, control text in `--font-text`, and preserve the accessible labels and status regions when changing the layout. No additional pages are needed for the comparison workflow.

`DIRECTION.md` records the brief, three explored directions, content, and preservation checklist. `design/explore/` contains the first-screen explorations; `design/before.html` preserves the original design for comparison. `og.html` is the source of the social image.

## License

[MIT](LICENSE)
