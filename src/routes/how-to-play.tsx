import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  GK_PATH,
  LANTERNS,
  NAME_MAX,
  PASSWORD_WORD_COUNT,
  ROOMS,
  ROUND_LIMIT,
  SHRINE_OF,
  START_ROOMS,
} from "@/game/map";
import { MapView } from "@/components/game/MapView";

export const Route = createFileRoute("/how-to-play")({
  head: () => ({
    meta: [
      { title: "How to play — Night Orchard" },
      {
        name: "description",
        content:
          "Instructions for Night Orchard: how rounds work, what each action does, and how your team escapes the hedge maze before dawn.",
      },
      { property: "og:title", content: "How to play Night Orchard" },
      {
        property: "og:description",
        content: "Rules, actions, and examples for the cooperative hedge maze.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HowToPlay,
});

const GUIDE = [
  { id: "jobs", label: "The jobs" },
  { id: "start", label: "Where you start" },
  { id: "screen", label: "Your screen" },
  { id: "round", label: "A round" },
  { id: "key", label: "The iron key" },
  { id: "password", label: "The password" },
  { id: "lantern", label: "Your lantern" },
  { id: "hedge", label: "The woven hedge" },
  { id: "keeper", label: "The groundskeeper" },
  { id: "out", label: "Walking out" },
] as const;

const SEATS = START_ROOMS.map((roomId, index) => ({
  joined: `${index + 1} or ${index + 5}`,
  room: ROOMS[roomId].title,
  lantern: LANTERNS[index]!,
  shrine: ROOMS[SHRINE_OF[LANTERNS[index]!]].title,
}));

const PATROL = `${GK_PATH.map((id) => ROOMS[id].title).join(" → ")}, and around again`;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="panel-night scroll-mt-6 space-y-3 p-6">
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
        <nav
          aria-label="Guide sections"
          className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm"
        >
          {GUIDE.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-lantern underline-offset-4 hover:underline"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <Section id="goal" title="The goal">
        <p>
          Your team is locked in a hedge maze at night. To win, <b>every player</b> walks out
          through the Gate onto the Outer Lawn before the end of round {ROUND_LIMIT}. If dawn comes
          first, everyone loses.
        </p>
        <p>The Gate lets you through when both of these are already true:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            Your <b>lantern is lit</b>. Each player lights their own, and only at one shrine.
          </li>
          <li>
            The <b>password has been spoken</b>. It is {PASSWORD_WORD_COUNT} words, carved in the
            Orchard, and it changes every game. One player speaks it at the Gate. That opens the
            Gate for the whole team.
          </li>
        </ul>
        <p>
          If either is missing, you stay at the Gate and that round is spent. The Event log says
          why.
        </p>
      </Section>

      <Section id="jobs" title="The jobs, in an order that works">
        <p>
          Lanterns, the key, and the hedge can happen in parallel. The Gate is past the hedge, and
          the password is past a locked door, so those two come first.
        </p>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            <b>Read the Event log</b> and agree a plan in team chat.
          </li>
          <li>
            <b>Carry the iron key</b> from Bell Lawn to the Glass House and unlock the east door.
          </li>
          <li>
            <b>Read the {PASSWORD_WORD_COUNT} words</b> in the Orchard and say them in chat, in
            order.
          </li>
          <li>
            <b>Light every lantern</b> at its own shrine. Watch the groundskeeper on the way.
          </li>
          <li>
            <b>Cross the woven hedge</b> into the Rose Walk. Someone has to hold it open that round.
          </li>
          <li>
            <b>Speak the password</b> at the Gate. Then each player with a lit lantern walks north
            onto the Outer Lawn.
          </li>
        </ol>
      </Section>

      <Section id="start" title="Where you start">
        <p>
          One person presses <b>Create room</b> and becomes the host. Everyone else joins with the
          link or the four-letter code. When at least two people are in, the host presses{" "}
          <b>Start</b>. The room holds 8. Names are at most {NAME_MAX} characters, so they fit on
          the map.
        </p>
        <p>Join before the host starts. After that, the team is set for the game.</p>
        <p>
          Join order gives you a starting room and a lantern. The shrine that lights your lantern is
          often a different room. The lantern line on your screen names that shrine.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Starting room and lantern by join order</caption>
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="py-2 pr-3 font-medium">You joined</th>
                <th className="py-2 pr-3 font-medium">You start in</th>
                <th className="py-2 pr-3 font-medium">Your lantern</th>
                <th className="py-2 font-medium">Light it at</th>
              </tr>
            </thead>
            <tbody>
              {SEATS.map((seat) => (
                <tr key={seat.joined} className="border-t border-border">
                  <td className="py-2 pr-3">{seat.joined}</td>
                  <td className="py-2 pr-3">{seat.room}</td>
                  <td className="py-2 pr-3">{seat.lantern}</td>
                  <td className="py-2">{seat.shrine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Example>
          <p>
            The second player wakes on Bell Lawn holding a <b>Well</b> lantern. Bell Lawn is the
            Bell shrine, so the Light button is somewhere else: the Well, south of Fountain Court.
            The lantern line says so.
          </p>
        </Example>
      </Section>

      <Section id="screen" title="Your screen">
        <p>
          Your room panel shows the room you stand in: its exits, its clues, who is with you, and
          whether the iron key is here. The clues you need are scattered, so the team explores
          together.
        </p>
        <p>
          The <b>Event log</b> shares those clues. It posts every starting room at the beginning.
          The first time anyone enters a new room, its text appears for <b>everyone</b>, with that
          player’s name and the round. Each room is posted once per game.
        </p>
        <p>
          Use <b>team chat</b> for the plan: who takes the key, who lights a lantern, and who holds
          the hedge.
        </p>
        <Example>
          <p>
            Artur starts in the Fountain Court. The Event log shares its clue:
            <i> "The big key is under the bell."</i> Airamez, on the Bell Lawn, reads it and writes
            in chat:
            <i> "I’ll pick up the key and take it to the Glass House."</i>
          </p>
        </Example>
        <p>
          The maze is <b>fixed</b>. Every game uses the same 13 rooms, paths, shrines, and
          groundskeeper patrol. During play, the team map reveals rooms as anyone visits them. A
          connected room you have not entered yet shows its real name in gray. This picture shows
          the whole layout. The room clues stay in the log.
        </p>
        <figure className="mx-auto w-full">
          <MapView
            state={{
              visited: Object.values(ROOMS).map((room) => room.id),
              players: [],
              doorUnlocked: false,
            }}
            full
          />
          <figcaption className="mt-3 text-sm text-muted-foreground">
            Green lines are ordinary paths. The solid red path between Hedge Knot and Rose Walk
            needs a holder. The dashed red path between Glass House and the Orchard needs the iron
            key. The Gate also needs the password, and each player needs a lit lantern to reach the
            Outer Lawn.
          </figcaption>
        </figure>
      </Section>

      <Section id="round" title="How a round works">
        <ol className="list-decimal space-y-2 pl-6">
          <li>Choose one action. The buttons are the choices for the room you are standing in.</li>
          <li>
            Press <b>Lock action</b>. Press <b>Locked — change</b> until everyone has locked.
          </li>
          <li>
            When the last player locks, the round happens for everyone at once. Then the
            groundskeeper takes one step.
          </li>
        </ol>
        <p>
          There are only {ROUND_LIMIT} rounds, so a spent round is gone. Players already on the
          Outer Lawn still lock each round. <b>Wait</b> keeps them outside. A seat that never locks
          stops the round. The host can press <b>Set Wait</b> for someone still choosing, or{" "}
          <b>Kick</b> a seat that has stalled.
        </p>
        <p>
          If you are <b>delayed</b>, the action you lock this round is cancelled. The log says you
          stumble, and the delay then clears.
        </p>
      </Section>

      <Section id="key" title="The iron key">
        <p>
          One iron key starts on <b>Bell Lawn</b>, in the grass under the bell. Fountain Court says
          the same thing, and that line is in the Event log from round 1.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <b>Pick up the iron key</b> while you stand in its room. One player carries it. If two
            players pick it up in the same round, the one who joined earlier gets it.
          </li>
          <li>
            <b>Drop the iron key</b> leaves it in your current room.
          </li>
          <li>
            <b>Use the iron key on the east door</b>, in the Glass House, opens the Orchard. The key
            is used up. The door stays open, and <b>East to The Orchard</b> appears.
          </li>
        </ul>
        <p>Each of those is a whole round, and so is each step of the walk.</p>
        <Example>
          <p>
            From Bell Lawn the short carry is west to the Hedge Knot, south to Fountain Court, south
            to the Well, and east to the Glass House. That is four walks, plus one round to pick the
            key up and one round to use it. The player who started at the Well is already closer to
            the door.
          </p>
        </Example>
      </Section>

      <Section id="password" title="The password">
        <p>
          The Orchard is through the Glass House’s east door. The bark there names{" "}
          <b>{PASSWORD_WORD_COUNT} words</b> and the order to say them. A new game, and every
          restart, carves a different set.
        </p>
        <p>
          At the Gate, type the words in that order, with spaces between them, and press{" "}
          <b>Speak</b>. Capitals and extra spaces are ignored. The order is the password.
        </p>
        <p>
          A correct speak opens the Gate for the rest of the game. A wrong speak spends the round,
          and the Gate stays silent. Say the words in chat as soon as someone reads the carving. The
          plaque on the Gate sends you to the Orchard for the answer.
        </p>
      </Section>

      <Section id="lantern" title="Your lantern">
        <p>
          Stand in your shrine and press <b>Light your … lantern</b>. The button is offered there
          while your lantern is still dark. A lit lantern stays lit.
        </p>
        <ul className="list-disc space-y-1 pl-6">
          {LANTERNS.map((lantern) => (
            <li key={lantern}>
              <b>{lantern}</b> wakes at {ROOMS[SHRINE_OF[lantern]].title}.
            </li>
          ))}
        </ul>
        <p>The Gate turns an unlit lantern back, even after the password has been spoken.</p>
      </Section>

      <Section id="hedge" title="The woven hedge">
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
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <b>Four hedges meet.</b> South to Fountain Court, west to the Sun Stone, east to Bell
            Lawn, and north to the Rose Walk.
          </li>
          <li>
            <b>The north one is woven shut.</b> The map shows that path as a solid red line.
            Choosing North while it is shut spends the round where you stand. The button is marked{" "}
            <b>(shut hedge)</b>.
          </li>
          <li>
            <b>Someone holds the sun stone.</b> A player on the <b>Sun Stone</b> chooses <b>Hold</b>{" "}
            that round.
          </li>
          <li>
            <b>Or holds the walk beyond it.</b> A player already on the <b>Rose Walk</b> can choose
            Hold instead.
          </li>
        </ul>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            It opens <b>for that round only</b>. Every crossing needs a fresh Hold.
          </li>
          <li>Hold is the holder’s whole action. They stay where they are.</li>
          <li>
            <b>Hold</b> is offered on the Sun Stone and the Rose Walk. The first crossing needs
            someone on the Sun Stone. After that, a player already on the Rose Walk can hold for the
            next teammate.
          </li>
        </ul>
        <p>
          Rose Walk connects to the Hedge Knot and to the Gate. This hedge is the only road to the
          Gate, and every player walks through the Gate to escape.
        </p>
        <Example>
          <p>
            <b>Getting two players through.</b> Round 5: Jose stands on the Sun Stone and locks{" "}
            <b>Hold</b>; Leila at the Hedge Knot locks <b>North</b> and crosses to the Rose Walk.
            Round 6: Leila locks <b>Hold</b>; Jose walks east from the Sun Stone to the Hedge Knot.
            Round 7: Leila locks <b>Hold</b> again; Jose locks <b>North</b> and crosses too. Leila
            can then walk north toward the Gate while Jose stays on the Rose Walk, holding for the
            next teammate.
          </p>
        </Example>
        <Example>
          <p>
            <b>A wasted round.</b> Artur is alone at the Hedge Knot and locks <b>North</b>. Nobody
            holds this round, so the hedge stays shut. The fix was agreed one round earlier in chat:{" "}
            <i>"I need someone on the Sun Stone next round."</i>
          </p>
        </Example>
      </Section>

      <Section id="keeper" title="The groundskeeper">
        <p>
          He walks a fixed patrol, and you can see it on the map. He starts in the Oak Shrine:{" "}
          {PATROL}.
        </p>
        <p>
          If you end a round in the room he walks into, you are <b>delayed</b>: your next locked
          action is cancelled. A teammate in that room can choose <b>Distract the groundskeeper</b>.
          They spend their round, and nobody who ends there is delayed. The Distract button appears
          only in the room he is about to enter, on that round.
        </p>
        <p>
          Ivy Wall is off his patrol. So are the Sun Stone, the Rose Walk, the Gate, the Outer Lawn,
          and the rooms south of Fountain Court.
        </p>
        <Example>
          <p>
            The groundskeeper is heading to the Fountain Court, where Artur needs to stay one more
            round. He locks <b>Distract the groundskeeper</b>. The groundskeeper arrives, Artur
            keeps him talking, and nobody is delayed. Artur gave up his whole round to do it.
          </p>
        </Example>
      </Section>

      <Section id="out" title="Walking out">
        <p>
          From the Gate, with your lantern lit and the password already spoken, choose{" "}
          <b>North to Outer Lawn</b>. The game ends when the <i>last</i> player steps onto the lawn.
          People who got out early should stay in chat, and keep locking <b>Wait</b> so the round
          can finish. Walking south from the lawn puts you back inside the Gate.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Plan the next round in chat before you lock. You can still change a lock until everyone
            has locked.
          </li>
          <li>
            Count the groundskeeper’s steps. His route repeats, so his next room is always knowable.
          </li>
          <li>
            Holding and distracting spend the round in place. They are often the move that lets
            someone else escape. The end screen remembers who helped.
          </li>
          <li>Spread out. The first visit to a room posts its clues for the whole team.</li>
          <li>
            The host can <b>Restart game</b>. Everyone returns to the starting rooms at round 1, and
            a new password is drawn. Team chat and the players stay.
          </li>
        </ul>
        <p>When the game ends, every screen changes to the same end screen, win or lose.</p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Button asChild variant="outline">
            <Link to="/demo/victory" target="_blank" rel="noopener noreferrer">
              See the victory screen
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/demo/defeat" target="_blank" rel="noopener noreferrer">
              See the defeat screen
            </Link>
          </Button>
        </div>
      </Section>

      <div className="flex justify-center pt-2">
        <Link to="/">
          <Button size="lg" className="lantern-glow">
            Back to the garden gate
          </Button>
        </Link>
      </div>
    </main>
  );
}
