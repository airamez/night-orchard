import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ROUND_LIMIT } from "@/game/map";

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
    <main className="mx-auto max-w-2xl space-y-6 px-5 py-12">
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

      <Section title="You can only see your own room">
        <p>
          This is the heart of the game. Each player sees only the room they stand in: its exits, its clues, and
          who is there with them. The clues you need are scattered across different rooms, so <b>nobody can win
          alone</b>.
        </p>
        <p>Use the team chat to read your room aloud and share what you find.</p>
        <Example>
          <p>
            Mina stands in the Fountain Court and reads: <i>"The big key is under the bell."</i> She types it in
            the chat. Theo, who started on the Bell Lawn, picks up the iron key — he never would have known it
            mattered without her message.
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
          The path between the Hedge Knot and the Rose Walk is woven shut. It opens only while at least one
          player chooses <b>Hold</b> at the Sun Stone or the Rose Walk that same round. The holder gives up
          their own move so teammates can pass.
        </p>
        <Example>
          <p>
            Ana is at the Hedge Knot and wants to go north to the Rose Walk. Bo is standing on the Sun Stone.
            Both lock in: Bo chooses <b>Hold</b>, Ana chooses <b>North</b>. The hedge opens and Ana walks
            through. If Bo had done anything else, the hedge would have stayed shut and Ana would have wasted
            the round.
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
            The groundskeeper is heading to the Fountain Court, where Mina needs to stay one more round. She
            locks <b>Distract the groundskeeper</b>. He arrives, she keeps him talking, and nobody is delayed —
            but she gave up her whole round to do it.
          </p>
        </Example>
      </Section>

      <Section title="How to win, step by step">
        <ol className="list-decimal space-y-2 pl-6">
          <li><b>Read your room aloud in the chat.</b> Every clue matters to someone else.</li>
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
      </Section>

      <Section title="Tips">
        <ul className="list-disc space-y-2 pl-6">
          <li>Plan the next round in chat <i>before</i> locking. A locked action can be changed until everyone has locked.</li>
          <li>Count the groundskeeper's steps. His route repeats, so you can always know where he goes next.</li>
          <li>Holding and distracting feel like doing nothing — they are often the most valuable moves in the game. The end screen remembers who helped.</li>
          <li>Don't all rush the same corridor. Spread out, read rooms, and report back.</li>
        </ul>
      </Section>

      <div className="flex justify-center pt-2">
        <Link to="/"><Button size="lg" className="lantern-glow">Back to the garden gate</Button></Link>
      </div>
    </main>
  );
}
