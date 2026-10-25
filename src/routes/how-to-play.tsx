import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ROOMS, ROUND_LIMIT } from "@/game/map";
import { MapView } from "@/components/game/MapView";

export const Route = createFileRoute("/how-to-play")({
  head: () => ({
    meta: [
      { title: "How to play — Night Orchard" },
      { name: "description", content: "Instructions for Night Orchard: how rounds work, what each action does, and how your team escapes the hedge maze before dawn." },
      { property: "og:title", content: "How to play Night Orchard" },
      { property: "og:description", content: "Rules, actions, and examples for the cooperative hedge maze." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HowToPlay,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel-night space-y-3 p-6">
      <h2 className="font-serif text-2xl font-semibold text-lantern">{title}</h2>
      <div className="space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}

function Example({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel-parchment p-4 font-serif text-sm leading-relaxed">
      <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Example</p>
      {children}
    </div>
  );
}

function HowToPlay() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-5 py-12">
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-lantern">Instructions</p>
        <h1 className="mt-2 font-serif text-5xl font-semibold">How to play</h1>
        <p className="mt-3 font-serif text-lg text-muted-foreground">
          A cooperative maze for 2 to 8 players. You win together or lose together.
        </p>
      </header>

      <Section title="The goal">
        <p>
          Your team is locked in a hedge maze at night. To win, <b>every player</b> must walk out through the
          Gate onto the Outer Lawn before the end of round {ROUND_LIMIT}. If dawn comes first, everyone loses.
        </p>
        <p>To pass the Gate, a player needs two things:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>A <b>lit lantern</b> — each player lights their own, and only at one specific room.</li>
          <li>The <b>password</b> — one player must speak the right word at the Gate. It is carved somewhere in the maze.</li>
        </ul>
      </Section>

      <Section title="Room clues are shared automatically">
        <p>
          Your room panel shows where you stand: its exits, its clues, and who is there with you.
          The clues you need are scattered across different rooms, so the team needs to explore together.
        </p>
        <p>
          The <b>Event log</b> automatically shares the descriptions and tips from every starting room.
          Whenever anyone reaches a room the team has not visited, its tips appear there for <b>everyone</b>,
          with the discovering player’s name and round. Each room is shared once per game, so waiting or
          returning does not repeat it. Undiscovered room clues stay hidden until someone arrives.
        </p>
        <p>There is no need to copy and paste clues. Use <b>team chat</b> for questions and plans: who takes the key, who lights a lantern, and who holds the hedge.</p>
        <Example>
          <p>
            Artur starts in the Fountain Court. The Event log automatically shares its clue:
            <i> "The big key is under the bell."</i> Airamez, on the Bell Lawn, reads it and writes in chat:
            <i> "I’ll pick up the key and take it to the Glass House."</i>
          </p>
        </Example>
      </Section>

      <Section title="The full maze map">
        <p>
          The maze is <b>fixed, not randomly generated</b>. Every game uses these same 13 rooms, paths,
          shrines, clues, and groundskeeper patrol. Starting rooms and lanterns are assigned in join order,
          repeating after four players.
        </p>
        <p>
          During play, your team’s map reveals rooms as anyone visits them. Connected rooms you have not
          visited yet show their real names in gray. This example reveals the whole layout, but not the room clues.
        </p>
        <figure className="mx-auto w-full">
          <MapView state={{ visited: Object.values(ROOMS).map((room) => room.id), players: [], doorUnlocked: false }} full />
          <figcaption className="mt-3 text-sm text-muted-foreground">
            Green lines are ordinary paths. The solid red path between Hedge Knot and Rose Walk needs a
            holder; the dashed red path between Glass House and the Orchard needs the iron key.
            The Gate also needs the password, and each player needs a lit lantern to reach the Outer Lawn.
          </figcaption>
        </figure>
        <Example>
          <p>
            Jose starts in Fountain Court. To reach the Orchard, he can head south to the Well, east to
            Glass House, then east again — but only after someone unlocks that last door with the iron key.
            Each move takes one round; picking up and using the key take separate rounds too.
          </p>
        </Example>
      </Section>

      <Section title="How a round works">
        <ol className="list-decimal space-y-2 pl-6">
          <li>Everyone chooses one action (move, pick up, light, speak, and so on).</li>
          <li>Press <b>Lock action</b>. You can still change your mind until everyone has locked.</li>
          <li>When all players are locked, the round resolves for everyone at once.</li>
        </ol>
        <p>
          Moves are simultaneous: the whole team moves in the same round. There is no waiting your turn — but
          there are only {ROUND_LIMIT} rounds, so every wasted round counts.
        </p>
      </Section>

      <Section title="The actions">
        <ul className="list-disc space-y-2 pl-6">
          <li><b>Move</b> — walk through an exit. Some paths are blocked (see below).</li>
          <li><b>Pick up / Drop the iron key</b> — the key opens one locked door. Only one player can carry it. If two players try to pick it up in the same round, the one who joined the room earlier gets it.</li>
          <li><b>Use the iron key</b> — unlocks the heavy east door of the Glass House. The key is used up.</li>
          <li><b>Light your lantern</b> — only works at your lantern's shrine. Your room text tells you which shrine wakes your lantern.</li>
          <li><b>Speak</b> — at the Gate, say a word. The right word opens the way for the whole team, permanently.</li>
          <li><b>Hold</b> — at the Sun Stone or the Rose Walk, holding keeps the woven hedge open for that round so others can pass through it.</li>
          <li><b>Distract the groundskeeper</b> — spend your round keeping him busy (see below).</li>
          <li><b>Wait</b> — do nothing. Sometimes the right move is no move.</li>
        </ul>
      </Section>

      <Section title="The woven hedge">
        <p>
          When you stand in the <b>Hedge Knot</b>, your room text reads:
        </p>
        <Example>
          <p>
            <b>Hedge Knot</b>
            <br />
            Four hedges meet. The north one is woven shut.
            <br />
            A sign reads:
            <br />
            <i>It opens while someone holds the sun stone, or holds the walk beyond it.</i>
          </p>
        </Example>
        <p>Here is what each line means:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li><b>"Four hedges meet"</b> — the Hedge Knot is a crossroads with four exits: south to the Fountain Court, west to the Sun Stone, east to the Bell Lawn, and north to the Rose Walk.</li>
          <li><b>"The north one is woven shut"</b> — the north path to the Rose Walk is blocked. Choosing North normally does nothing and wastes your round (the map shows it as a solid red line).</li>
          <li><b>"Someone holds the sun stone"</b> — a player standing on the <b>Sun Stone</b> chooses the <b>Hold</b> action that round.</li>
          <li><b>"Or holds the walk beyond it"</b> — it also opens if a player who is already on the other side, in the <b>Rose Walk</b>, chooses Hold that same round.</li>
        </ul>
        <p>Three rules make it work:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>It opens <b>for that round only</b>. The hedge weaves shut again at the end of every round, so every crossing needs a fresh Hold.</li>
          <li>The holder <b>gives up their move</b> — Hold is all they do that round.</li>
          <li>You <b>cannot</b> choose Hold while standing in the Hedge Knot itself. Only the Sun Stone and the Rose Walk can hold it open. So someone must always help you: a player who stepped aside to the Sun Stone, or one who already crossed.</li>
        </ul>
        <p>
          <b>Why it matters for winning:</b> the Rose Walk connects only to the Hedge Knot (through the hedge) and
          to the Gate. That makes this one hedge <b>the only road to the Gate</b> — and every player must walk
          through the Gate to escape. If the team cannot keep the hedge open, nobody can win, no matter how many
          lanterns are lit.
        </p>
        <Example>
          <p>
            <b>Getting a team through, one round at a time.</b> Round 5: Jose stands on the Sun Stone and locks
            <b> Hold</b>; Leila at the Hedge Knot locks <b>North</b> and crosses to the Rose Walk. Round 6: Leila
            (now beyond the hedge) locks <b>Hold</b>; Jose walks east from the Sun Stone to the Hedge Knot. Round
            7: Leila locks <b>Hold</b> again; Jose locks <b>North</b> and crosses too. Three rounds, two players
            through, and only Leila ever gave up a move. She can then walk north toward the Gate while Jose stays
            on the Rose Walk holding the hedge open for the next teammate.
          </p>
        </Example>
        <Example>
          <p>
            <b>The classic mistake.</b> Artur is alone at the Hedge Knot and locks <b>North</b>. Nobody holds this
            round, so the hedge stays shut and his round is wasted. There was nothing he could have done alone —
            the fix was decided one round earlier in the chat: <i>"I need someone on the Sun Stone next round."</i>
          </p>
        </Example>
      </Section>

      <Section title="The groundskeeper">
        <p>
          The groundskeeper walks a fixed patrol: Oak Shrine → Bell Lawn → Hedge Knot → Fountain Court → Hedge
          Knot → Bell Lawn, and around again. You can see his route on the map.
        </p>
        <p>
          If you end a round in the same room as him, you are <b>delayed</b>: your next locked action is
          cancelled. The only protection is a teammate in that room choosing <b>Distract</b> — they spend their
          round so nobody there gets delayed.
        </p>
        <Example>
          <p>
            The groundskeeper is heading to the Fountain Court, where Artur needs to stay one more round. He
            locks <b>Distract the groundskeeper</b>. The groundskeeper arrives, Artur keeps him talking, and
            nobody is delayed — but he gave up his whole round to do it.
          </p>
        </Example>
      </Section>

      <Section title="How to win, step by step">
        <ol className="list-decimal space-y-2 pl-6">
          <li><b>Read the shared room tips in the Event log.</b> Starting rooms and newly explored rooms appear automatically. Use chat to agree on a plan.</li>
          <li><b>Find the iron key</b> (a clue tells you where) and carry it to the Glass House to unlock the east door.</li>
          <li><b>Find the password</b> — it is carved in the Orchard, past that locked door. Someone must speak it at the Gate.</li>
          <li><b>Light every lantern.</b> Each player must reach their own shrine. Watch the groundskeeper's patrol so you don't get delayed on the way.</li>
          <li><b>Coordinate the hedge.</b> Players heading north through the Rose Walk need a holder on the Sun Stone or the Rose Walk that round.</li>
          <li><b>Everyone walks out the Gate</b> onto the Outer Lawn — with a lit lantern — before round {ROUND_LIMIT} ends.</li>
        </ol>
        <p>
          The game only ends when the <i>last</i> player steps onto the lawn. Players who get out early should
          keep talking: the team still inside needs their eyes and memory.
        </p>
        <p>
          When the game ends, every player's screen changes to the same retro end screen — win or lose.
          Take a peek:
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Button asChild variant="outline">
            <Link to="/demo/victory" target="_blank" rel="noopener noreferrer">See the victory screen</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/demo/defeat" target="_blank" rel="noopener noreferrer">See the defeat screen</Link>
          </Button>
        </div>
      </Section>

      <Section title="Tips">
        <ul className="list-disc space-y-2 pl-6">
          <li>Plan the next round in chat <i>before</i> locking. A locked action can be changed until everyone has locked.</li>
          <li>Count the groundskeeper's steps. His route repeats, so you can always know where he goes next.</li>
          <li>Holding and distracting feel like doing nothing — they are often the most valuable moves in the game. The end screen remembers who helped.</li>
          <li>Don't all rush the same corridor. Spread out to discover rooms; their tips are automatically shared in the Event log.</li>
        </ul>
      </Section>

      <div className="flex justify-center pt-2">
        <Link to="/"><Button size="lg" className="lantern-glow">Back to the garden gate</Button></Link>
      </div>
    </main>
  );
}
