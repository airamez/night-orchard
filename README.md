# Night Orchard

A cooperative browser game for 2–8 people. One team shares a hedge maze and **16 rounds**. Everyone reaches the Outer Lawn before dawn, or the whole team loses.

**Play:** https://night-orchard.lovable.app

The game also has this guide on a page with a live map: https://night-orchard.lovable.app/how-to-play

No account. Each person picks a name of up to 14 characters, so it fits on the map.

## How a game starts

1. One person opens the site, types a name, and presses **Create room**. That person is the host.
2. They copy the room link, or read out the four-letter code (`ABCD`).
3. Everyone else opens the link, or types the code on the home page, and presses **Join the team**.
4. When at least two people are in, the host presses **Start**. Eight is the maximum.
5. After the host starts, the roster is closed. A later arrival sees “This game has already started.”

Each browser window is its own seat. To play more than one character on one computer, open a separate window for each name.

Join order deals a starting room and a lantern. The lantern’s shrine is often a different room from the one you start in. Read the lantern line on your screen: it names the shrine.

| You joined | You start in | Your lantern | Light it at |
| --- | --- | --- | --- |
| 1st or 5th | Fountain Court | Oak | Oak Shrine |
| 2nd or 6th | Bell Lawn | Well | The Well |
| 3rd or 7th | The Well | Bell | Bell Lawn |
| 4th or 8th | Hedge Knot | Moon | Moon Arch |

## What you see

Your panel shows only the room you are standing in: its text, its exits, whether the iron key is here, and who is here with you. The groundskeeper is named when he is in your room.

The rest of the screen:

- **Team map** fills in as anyone visits a room. A neighboring room you have not entered yet shows its real name in gray. **Full map** draws all 13 rooms, with every player’s name and lantern.
- **Event log** posts each room’s text once. Starting rooms appear at the beginning. A newly entered room appears for everyone, with the discoverer’s name and the round.
- **Team chat** is for the plan: who takes the key, who holds the hedge, who speaks. The Event log already shares room text.
- **Roster** shows each player’s room, whether their lantern is lit, who carries the iron key, who is delayed, and who has locked.
- The header shows the round, out of 16, and how many players have locked.

Green lines on the map are ordinary paths. The solid red line is the woven hedge. The dashed red line is the locked door.

## How a round works

Everyone acts at the same time.

1. Choose one action. The buttons are the choices for the room you are standing in.
2. Press **Lock action**. Until every player has locked, press **Locked — change** to pick something else.
3. When the last player locks, every action happens together. Then the groundskeeper takes one step.

Every seat locks, including players already on the Outer Lawn. **Wait** keeps them there. A seat that never locks keeps the round from ending. The host can press **Set Wait** for someone who is still choosing, or **Kick** a seat that has stalled.

If you are **delayed**, the action you lock this round is cancelled. The log says you stumble, and the delay clears.

## What the team has to finish

The game is won when every remaining player is standing on the Outer Lawn. If round 16 ends first, dawn comes and the team loses. Players who get out early should stay in chat. The last person through still needs them.

The Gate, between Rose Walk and the Outer Lawn, is the only way out. Two things have to be true when you walk north through it:

- **Your own lantern is lit.** The Gate turns an unlit lantern back.
- **This game’s password has already been spoken** at the Gate. One correct speak opens it for the whole team, for the rest of the game.

If either is missing, you stay at the Gate and that round is spent. The Event log says which requirement failed.

A practical order:

1. Read the Event log and agree a plan in chat.
2. Take the iron key to the Glass House and unlock the east door.
3. Read the password in the Orchard and say the four words in chat.
4. Each player lights their lantern at their own shrine.
5. Cross the woven hedge, with someone holding it open.
6. Speak the password at the Gate.
7. Each player with a lit lantern walks north onto the Outer Lawn.

Lanterns, the key, and the hedge can overlap. The Orchard is past the locked door, and the Gate is past the hedge, so the key and the hedge come before anyone can speak.

## The garden

The maze is the same every game. Thirteen rooms:

```
                              Outer Lawn
                                  |
                               The Gate
                                  |
                              Rose Walk
                                  ‖
        Sun Stone ————————— Hedge Knot ————————— Bell Lawn ——— Ivy Wall
                                  |                    |
                           Fountain Court          Oak Shrine
                                  |
                               The Well ————— Glass House · · · The Orchard
                                  |
                              Moon Arch
```

`‖` is the woven hedge. `· · ·` is the locked door. Every other link is one walk.

| Room | Why you go there |
| --- | --- |
| Fountain Court | Start for the Oak lantern. The opening clue says where the key is. South to the Well, north to the Hedge Knot. |
| Bell Lawn | The iron key starts in the grass under the bell. Bell lanterns wake here. |
| Oak Shrine | Oak lanterns wake here. The groundskeeper begins the night in this room. |
| The Well | Well lanterns wake here. East leads to the Glass House. |
| Moon Arch | Moon lanterns wake here. A dead end south of the Well. |
| Glass House | Use the iron key on the east door. |
| The Orchard | The password for this game is carved in the bark. |
| Sun Stone | Choosing **Hold** here opens the hedge for this round. |
| Hedge Knot | The crossroads. North to Rose Walk is woven shut. |
| Rose Walk | The far side of the hedge. **Hold** here also opens it. North is the Gate. |
| The Gate | Speak the password. Then, with a lit lantern, go north. |
| Outer Lawn | You are outside. Wait for the others. |
| Ivy Wall | A dead end east of Bell Lawn. The groundskeeper’s patrol skips it. |

## The iron key

One key. It starts on Bell Lawn. Fountain Court’s text says the same thing, and that text is in the Event log from round 1.

- **Pick up the iron key** while you stand in its room. One player carries it. If two players pick it up in the same round, the one who joined earlier gets it.
- **Drop the iron key** leaves it in your current room for someone else.
- In the Glass House, **Use the iron key on the east door** unlocks the Orchard. The key is used up. The door stays open.

Each of those is its own round, and so is each step of the walk. From Bell Lawn the short carry is west to the Hedge Knot, south to Fountain Court, south to the Well, east to the Glass House: four walks, plus the pickup, plus using the key.

The east door is absent from your buttons while it is locked. After it opens, **East to The Orchard** appears.

## The password

Every start and every restart draws **four words**, in a fresh order. The Orchard shows them in capitals and tells you to speak them at the Gate in that order. The Gate’s own plaque tells you to go read the carving.

At the Gate, type the four words in that order, with spaces between them, and press **Speak**. Capitals and extra spaces are ignored. The order is the password.

A correct speak opens the Gate for everyone. A wrong speak spends the round, and the Gate stays silent. Tell the team the words in chat as soon as someone reads the Orchard. The carving is different in the next game.

## The woven hedge

Rose Walk is the only road to the Gate. The path between Hedge Knot and Rose Walk is woven shut. It opens for the current round when a player chooses **Hold** in one of these rooms:

- **Sun Stone**, west of the Hedge Knot
- **Rose Walk**, on the far side

**Hold** is available only in those two rooms. It is your whole action: you stay where you are. The hedge closes again at the end of the round, so every crossing needs a new Hold.

The north button in the Hedge Knot stays available and is marked **(shut hedge)**. Choosing it while nobody is holding spends the round in the Hedge Knot.

One way to bring two people through:

- Round 5. Jose, on the Sun Stone, locks **Hold**. Leila, in the Hedge Knot, locks **North** and arrives on the Rose Walk.
- Round 6. Leila locks **Hold**. Jose walks east from the Sun Stone to the Hedge Knot.
- Round 7. Leila locks **Hold** again. Jose locks **North** and crosses.

Leila can then walk to the Gate. Jose stays on the Rose Walk and holds for the next teammate. The first crossing needs someone on the Sun Stone. After that, a player who is already on the Rose Walk can hold.

## The groundskeeper

He walks one fixed loop, and the map shows it. He starts in the Oak Shrine. At the end of each round he steps to the next room:

Oak Shrine → Bell Lawn → Hedge Knot → Fountain Court → Hedge Knot → Bell Lawn → Oak Shrine → …

If you finish the round in the room he enters, you are delayed. Your next locked action is cancelled. The warning on your screen appears in the room he is about to enter.

**Distract the groundskeeper** appears only in that room, on that round. The player who distracts spends the round. Nobody who ends in that room is delayed.

Leaving the room before he arrives also keeps you clear. Ivy Wall, Sun Stone, Rose Walk, the Gate, the Outer Lawn, the Well, Moon Arch, the Glass House, and the Orchard are off his loop.

## The buttons

| Button | When it is offered | What you spend the round on |
| --- | --- | --- |
| **North**, **South**, **East**, or **West** to a room | That exit exists. A locked door is hidden. A shut hedge is shown and marked. | Walking there. A shut hedge, or the Gate before you qualify, leaves you where you are. |
| **Wait** | Always | Staying put. |
| **Pick up the iron key** | The key is in your room | Carrying it |
| **Drop the iron key** | You are carrying it | Leaving it here |
| **Use the iron key on the east door** | Glass House, you have the key, the door is still locked | Opening the Orchard. The key is consumed. |
| **Light your … lantern** | You are in your shrine and the lantern is dark | Lighting it for the rest of the game |
| **Hold** | Sun Stone or Rose Walk | Opening the hedge this round. You stay. |
| **Speak** | The Gate, after you type in the box | Saying those words |
| **Distract the groundskeeper** | He steps into your room this round | Keeping everyone here off the delay |

## If you are the host

- **Restart game** puts everyone back in the starting rooms at round 1. Lanterns, the key, the Gate, chosen actions, and the Event log reset, and a new password is drawn. Team chat and the player list stay.
- **Remove**, in the lobby, drops someone before the start.
- **Kick**, during play, drops someone so a stalled seat stops blocking the round. If everyone who remains is already on the Outer Lawn, the team wins.
- **Set Wait** locks **Wait** for a player who is still choosing.
- If the host leaves, the next player becomes host.

Any player can leave. A new player can join only while the room is still a lobby.

## Playing every seat yourself

God mode is a read-only plan for the host. It lists a legal action for every player, round by round. You still press the buttons. It writes nothing.

1. The host opens the room as `/room/ABCD?god-mode`. The **God mode — all players** button appears on that URL.
2. The plan itself is `/room/ABCD/god-mode`. In each player’s window, choose the action it names, then press **Lock action**. It also flags a lock that makes the escape slower or loses it.
3. A player window opened with `?god-mode` pre-chooses that seat’s planned action once per round. You still press **Lock action**, and **Locked — change** still works.

The plan needs at least two players. Restart from the host’s window when you want a fresh password and a fresh plan.

The end screens, with no game behind them:

- https://night-orchard.lovable.app/demo/victory
- https://night-orchard.lovable.app/demo/defeat

## Running the project

TanStack Start (React 19, Vite 7), Tailwind CSS v4, and Lovable Cloud for the realtime room. Rules live in `src/game/engine.ts` and are tested. Server functions in `src/game/room.functions.ts` are the only writers. Browsers send choices. They resolve rounds on the server. The whole room is one realtime row. Seat tokens stay server-side.

Stack, data model, and the round diagram: [architecture.md](architecture.md).

```sh
npm i
npm run dev      # local dev server
npm test         # engine, planner, and room-hook tests
npm run lint
```

```
src/game/              engine.ts (rules), map.ts (rooms, patrol, password list),
                       room.functions.ts (server writers), winningPlan.ts (god mode),
                       useRoom.ts (realtime hook), *.test.ts
src/components/game/   MazeMap / MapView, LanternIcon, EndScreen
src/routes/            index.tsx (home), room.$code.tsx (play),
                       room.$code_.god-mode.tsx, how-to-play.tsx,
                       demo.victory.tsx, demo.defeat.tsx
```

File-based routing conventions are in [src/routes/README.md](src/routes/README.md).

This project is connected to [Lovable](https://lovable.dev). The editor for this repo is the [Lovable project](https://lovable.dev/projects/94bbf788-9b6f-4c7c-9be5-7303e828db16). Changes pushed to the connected branch sync back into that editor. Avoid rewriting published git history.
