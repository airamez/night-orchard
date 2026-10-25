# Roadmap

- [x] Draw each game's gate password from a word list instead of the fixed "nightbloom".
- [x] Fold in follow-up: password is x words chosen from the list per game.
- [x] Expand to 100 themed words, 4 words per game, update guide and tests.
- [x] Verify build, tests, and the live two-player flow after the multi-word password change.
- [x] Fix god mode giving up ("No complete winning plan") when the game drifts from the plan — planner now recovers from delays, deviating locks, stranded holders, and players stuck past the hedge.
- [x] Explain event-log delay messages (R15 stumbles = delayed by the groundskeeper, action cancelled).
- [x] Always append new chat messages (user + assistant) to docs/lovable-build-log.md — standing rule, do it every turn.
- [x] God mode: explain when a position is truly lost (exhaustive check), show spare rounds, and warn about locked actions that cost the escape.
