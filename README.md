# Night Orchard

A cooperative, browser-based hedge-maze escape game for 2–8 players. One team, one shared garden, one dawn.

**Play now**: https://night-orchard.lovable.app
**How to play (rules, actions, worked examples)**: https://night-orchard.lovable.app/how-to-play

## The game

The team is locked in a walled garden at night and has **16 rounds** to get everybody out through the gate before dawn. Every player acts at the same time each round, so the puzzle is less about finding the exit and more about coordinating who does what, where, and when.

The garden is a fixed map of **13 rooms** — Fountain Court, Hedge Knot, Sun Stone, Bell Lawn, Ivy Wall, Oak Shrine, Rose Walk, The Gate, Outer Lawn, The Well, Moon Arch, Glass House and The Orchard — connected by paths you can see on the in-game map.

To win, the team has to:

- **Wake the lanterns.** Each player carries one of four lanterns (Oak, Well, Bell, Moon), and it only wakes in its own shrine room. Nobody leaves with an unlit lantern — the gate turns them back.
- **Find the iron key.** It lies under the bell on Bell Lawn, and it is the only thing that opens the locked east door of the Glass House.
- **Hold the woven hedge.** The north hedge at Hedge Knot is woven shut. It opens for one round only, and only while someone chooses *Hold* at Sun Stone or Rose Walk — so somebody has to stand still while the rest of the team walks through.
- **Say the right name at the gate.** The gate asks for the flower that opens after dark. The answer is carved in the bark in the Orchard, so one player has to read it and tell the others.
- **Dodge the groundskeeper.** He walks a fixed patrol. If he steps into your room, you are delayed and lose your next round entirely — the only counter is *Distract*, and it works only the round he walks in.

Everyone escapes, or nobody does: the round ends when the last player reaches the Outer Lawn.

## Actions

Each round every player picks one action, and all of them resolve together:

| Action | What it does |
| --- | --- |
| `move` | Walk to an adjacent room |
| `wait` | Stay put and keep the round free |
| `pickup` / `drop` | Take or leave the iron key |
| `usekey` | Open the Glass House door |
| `light` | Wake your lantern in its shrine room |
| `hold` | Keep the woven hedge open this round |
| `speak` | Say the password at the gate |
| `distract` | Delay the groundskeeper when he is about to step into your room |

## Playing together

- Create a room, share the link, and players join by nickname — **no account or sign-in is needed**.
- Room links look like `https://night-orchard.lovable.app/room/XYJP`.
- The room owner can restart the game for everyone, and any player can leave; the owner can also remove a player so a stalled seat never blocks the team.
- The **Event log** automatically posts each player's room description the first time the team discovers it, so clues travel without anyone copy-pasting. Team chat stays free for planning.
- The **Full map** button shows all 13 rooms with every player's name and lantern at their room.

## Testing solo

God mode is a read-only, live win plan for the room owner: it lists the concrete action for **every player, round by round**, so one person can drive all the seats and reach a win. Open it from the owner's button in the room, or go straight to `https://night-orchard.lovable.app/room/XYJP/god-mode`.

The victory and defeat screens can also be previewed without playing:

- https://night-orchard.lovable.app/demo/victory
- https://night-orchard.lovable.app/demo/defeat

## Tech

TanStack Start (React 19, Vite 7), Tailwind CSS v4, and Lovable Cloud (Supabase) for realtime room state. Game rules live in a pure, tested engine in `src/game/engine.ts`; server functions in `src/game/room.functions.ts` are the only writers, so browsers never resolve a round. Whole-room state is a single realtime row, and seat tokens are kept service-role-only.

```sh
npm i
npm run dev      # local dev server
npm test         # engine, planner, and room-hook tests
npm run lint
```

## Project layout

```
src/game/            engine.ts (rules), map.ts (rooms, patrol, limits),
                     room.functions.ts (server writers), winningPlan.ts (god mode),
                     useRoom.ts (realtime hook), *.test.ts
src/components/game/ MazeMap / MapView (map), LanternIcon (pixel art), EndScreen
src/routes/          index.tsx (lobby), room.$code.tsx (play),
                     room.$code_.god-mode.tsx, how-to-play.tsx,
                     demo.victory.tsx, demo.defeat.tsx
docs/                lovable-build-log.md (full build session)
```

## Build with Lovable

This project was built with [Lovable](https://lovable.dev). Continue developing it in the [Lovable editor](https://lovable.dev/projects/94bbf788-9b6f-4c7c-9be5-7303e828db16).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
