# Solitaire Royale for iPad

Public page: https://ethan-reinsborough.github.io/solitaire-royale/

Open the page in Safari, tap **Share → Add to Home Screen**, leave **Open as Web App** enabled if shown, then tap **Add**. Launch that icon to play without Safari's address bar. Landscape gives the largest playing table. Visit online once before taking it offline.

The page includes Pyramid, Golf, Klondike, Canfield, Corners, Calculation, Three Shuffles and a Draw, Reno, Concentration (one or two players), Pairs, and The Wish. The eight-game tour records totals out of 416. Tournament players share identical seeded deals on one device.

Tap a card, then its destination, or drag. In Pyramid, Corners, and Reno the top stock card is already exposed: select it to play it, or tap it again to move it to the waste. Settings includes sound, fast dealing, left-handed layout, larger touch menus, and all ten original card backs plus five sets of face artwork. Help includes undo, hints, game rules, tour progression, and the special Three Shuffles actions. Disk saves locally or exports/imports a JSON game file. Keyboard: Escape closes menus, F1 opens rules, Ctrl/Cmd+Z undoes, and `lilly` wins the current game.

This is a native web recreation, not the original DOS executable. Menu geometry, colours, and lettering follow the supplied reference. The original EGA card artwork was decoded directly from SRCEGA.CDS: 115 sprites, including ten backs, five court-card sets and the shared number cards. The title was decoded from SRT.DAT. Original 72x46 card pixels are displayed at 72x92 to preserve DOS tall-pixel proportions. Original game credits appear under Disk → About. The rules were cross-checked with the [original player's guide](https://mirrors.apple2.org.za/ftp.apple.asimov.net/documentation/games/misc/Solitaire_Royale-Manual.pdf). Artwork source: [the archived 1987 release](https://archive.org/details/msdos_Solitaire_Royale_1987). The data-file SHA-256, palette, dimensions and sprite mapping are recorded in assets/original-art.json. The DOS executable is not run or distributed with this page.

## Develop and publish

- Source: `dist/royale/`.
- Run `node server.js`, then open `http://127.0.0.1:8080/royale/`. Set `PORT` for another port.
- Run `node --test tests/royale.test.js tests/royale-art.test.js` for rule and artwork mapping checks.
- Run `node scripts/build-royale.cjs` after edits. It versions assets and the scoped service-worker cache.
- Copy `dist/royale/` into `github-site/solitaire-royale/` and publish the GitHub Pages repository.
- The manifest and cache use relative paths, so the page can be hosted in another subfolder. The service worker only controls its own folder.

The extraction script `scripts/extract-royale-art.py` rebuilds the lossless atlas and title from the local reference ZIP and verifies every card pixel by converting the decoded colours back to the source bitplanes. Menu font reconstruction is still based on the supplied screenshot.

The game uses its own `solitaire-royale-v1` local-storage key. It does not touch birthday-game saves. Local storage can be cleared by the browser; use Disk → Save to a file for a portable backup.

## Verification

Rule tests cover deterministic deals, all eleven variants, stock passes, pairing restrictions, wraparound ranks, reserve priorities, limited reshuffles, memory turns, and card conservation through thousands of moves. Browser checks cover all eleven layouts, selection and movement, undo across reloads, an eight-game tour, and offline reloading with the preview server stopped. iPad-sized portrait and landscape layouts were checked in Chromium; physical iPad Safari installation needs a device check.
