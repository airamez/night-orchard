# Roadmap

- [x] Diagnose and repair missing location capture; verify retry behavior and privacy.
- [x] Add a shared report/suggestion form with 255-character fields (email draft until sender setup).
- [ ] Enable automatic report emails after the sender domain is configured (waiting on user).
- [x] Verify changes and append this exchange to the build log.

- [x] Resume and complete the dashboard after the credit top-up (2026-10-25).
- [x] Add /dashboard with game, player, outcome, and God mode totals.
- [x] Persist restart-safe activity and approximate locations without IP addresses.
- [x] Verify tracking, dashboard, privacy rules, and record this exchange in the build log (public-IP capture cannot be checked from the local browser).
- [x] Answer “Are you stuck?” and report dashboard completion.

- [x] Draw each game's gate password from a word list instead of the fixed "nightbloom".
- [x] Fold in follow-up: password is x words chosen from the list per game.
- [x] Expand to 100 themed words, 4 words per game, update guide and tests.
- [x] Verify build, tests, and the live two-player flow after the multi-word password change.
- [x] Fix god mode giving up ("No complete winning plan") when the game drifts from the plan — planner now recovers from delays, deviating locks, stranded holders, and players stuck past the hedge.
- [x] Explain event-log delay messages (R15 stumbles = delayed by the groundskeeper, action cancelled).
- [x] Always append new chat messages (user + assistant) to docs/lovable-build-log.md — standing rule, do it every turn.
- [x] God mode: explain when a position is truly lost (exhaustive check), show spare rounds, and warn about locked actions that cost the escape.
- [x] God mode: windows opened with ?god-mode auto-choose that player's planned action each round.
- [x] Restore the lantern icon in the action panel header when the lantern is lit.
- [x] Map: shrines whose lantern has been lit get a glowing gold border.
