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
- Game rules live in pure `src/game/engine.ts` (tested); server functions in `src/game/room.functions.ts` are the only writers — browsers never resolve rounds.
- Generate shared room-tip log entries in the pure engine at start and first team discovery, using room definitions and visited state, so every player receives the same tips without browser-generated duplicates.
- Whole room state is one realtime `rooms` row; seat tokens live in `room_seats` (service-role only); `resolve_round` RPC is the round-guarded write.
- Store player seats in per-window session storage so separate windows can play independently; refresh the roster before activating a newly joined seat and reject older room snapshots so delayed reads cannot look like player removal.
- Render explored, documentation, and full-dialog maps through shared MapView/MazeMap using room definitions and live room state; derive room box heights, connector endpoints, row spacing, and framing from visible rooms and occupant counts so names fit without wasted space.
