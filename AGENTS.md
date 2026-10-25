<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Activity is tracked by room-update database triggers using a fresh game ID per start/restart; public dashboard reads only aggregate RPC data. Seat-verified visits capture approximate locations once and mark God mode, keeping transient addresses out of persisted data and logs.
- Generate God mode's read-only, per-player round plan in pure `src/game/winningPlan.ts` using engine legality and resolution: run the fast rule-based plan first and fall back to a budgeted exhaustive search over whole-team rounds only when it fails, so the guide either rescues the position or proves dawn can't be beaten (keeps live recomputes cheap); flag locked actions that make the plan slower or lose; render it on an independent room subpath so the owner can open a live guide without replacing gameplay or writing game state. The God mode button only appears when the owner opens the room URL with a `?god-mode` query suffix — players on the plain room URL never see it, and the guide itself stays reachable at `/room/CODE/god-mode`. A player window opened with `?god-mode` pre-chooses (never locks) that player's planned action once per round via the normal `choose` op, so solo testers only press Lock.
- Game rules live in pure `src/game/engine.ts` (tested); server functions in `src/game/room.functions.ts` are the only writers — browsers never resolve rounds.
- Generate shared room-tip log entries in the pure engine at start and first team discovery, using room definitions and visited state, so every player receives the same tips without browser-generated duplicates.
- Whole room state is one realtime `rooms` row; seat tokens live in `room_seats` (service-role only); `resolve_round` RPC is the round-guarded write.
- The gate password is per-game: `startGame` draws `PASSWORD_WORD_COUNT` words in random order from `PASSWORD_PHRASES` (`src/game/map.ts`) into `state.password`, and the gate check, Orchard clue, god-mode plan, and end screen all read `state.password` — never reintroduce a single hardcoded password constant. Keep list words lowercase, unique, and ≤8 letters so the drawn phrase fits the Speak input.
- Store player seats in per-window session storage so separate windows can play independently; refresh the roster before activating a newly joined seat and reject older room snapshots so delayed reads cannot look like player removal.
- Render explored, documentation, and full-dialog maps through shared MapView/MazeMap using room definitions and live room state; derive room box heights, connector endpoints, row spacing, and framing from visible rooms and occupant counts so names fit without wasted space.
- Lantern/shrine artwork lives in `src/components/game/LanternIcon.tsx` as 12x12 pixel-art grids with palette tokens in `src/styles.css` (`--icon-*`); reuse `LanternPixels` inside SVG maps and `LanternIcon` in HTML so every lantern-room cue stays visually identical. Each icon keeps one fixed color set and is drawn on its own `--icon-plate` badge, so it stays readable on any room-box header (including the lit header) without swapping palettes.
