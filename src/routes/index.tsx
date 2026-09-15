import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/SiteLayout";
import { EventCard } from "@/components/EventCard";
import {
  eventsQuery,
  fetchAllModels,
  formatKsh,
  modelPortrait,
  siteContentQuery,
  votePrice,
} from "@/lib/site-data";
import heroImage from "@/assets/event-runway.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Westgate Arena — Live Modelling Competition Voting" },
      {
        name: "description",
        content:
          "Vote for your favourite model at Westgate Arena, Nairobi. Browse live competitions, meet every contestant and cast your votes from KSh 10.",
      },
      { property: "og:title", content: "Westgate Arena — Live Modelling Competition Voting" },
      {
        property: "og:description",
        content: "Live modelling competitions and audience voting in Nairobi, Kenya.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: content } = useQuery(siteContentQuery);
  const { data: events } = useQuery(eventsQuery);
  const { data: models } = useQuery({ queryKey: ["models", "all"], queryFn: fetchAllModels });
  const price = votePrice(content);

  const allModels = models ?? [];
  const totalVotes = allModels.reduce((sum, m) => sum + m.votes, 0);
  const openEvents = (events ?? []).filter((e) => e.voting_open).length;
  const leaders = [...allModels].sort((a, b) => b.votes - a.votes).slice(0, 3);

  return (
    <SiteLayout>
      <section className="stage-hero">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-25 mask-l-from-10% lg:block"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-28">
          <p className="kicker">
            <span className="inline-block size-1.5 rounded-full bg-live" />
            {content?.["hero_kicker"] ?? "LIVE VOTING"}
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl sm:text-7xl">
            {content?.["hero_title"] ?? "Vote for your favourite model"}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            {content?.["hero_subtitle"] ??
              "Choose a competition below, meet every contestant, and cast your votes."}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link to="/events" className="btn-primary">
              Browse events
            </Link>
            <Link to="/about" className="btn-outline">
              How it works
            </Link>
            <span className="text-sm text-muted-foreground">
              Each vote costs <span className="text-primary">{formatKsh(price)}</span>
            </span>
          </div>

          <dl className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-border pt-8">
            <div>
              <dt className="label-xs">Votes cast</dt>
              <dd className="stat-value">{totalVotes.toLocaleString("en-KE")}</dd>
            </div>
            <div>
              <dt className="label-xs">Contestants</dt>
              <dd className="stat-value">{allModels.length}</dd>
            </div>
            <div>
              <dt className="label-xs">Open events</dt>
              <dd className="stat-value">{openEvents}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">The line-up</p>
            <h2 className="mt-3 text-4xl">Voting events</h2>
          </div>
          <Link to="/events" className="text-sm text-primary hover:underline">
            View all events →
          </Link>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {(events ?? []).map((event) => (
            <EventCard key={event.id} event={event} models={allModels} />
          ))}
        </div>
      </section>

      {leaders.length > 0 ? (
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className="kicker">Right now</p>
            <h2 className="mt-3 text-4xl">Leading the vote</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {leaders.map((model, i) => (
                <div key={model.id} className="feature-card flex items-center gap-4 p-4">
                  <img
                    src={modelPortrait(model, i)}
                    alt={model.name}
                    loading="lazy"
                    width={160}
                    height={160}
                    className="size-20 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-display text-3xl text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="text-base">{model.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {model.votes.toLocaleString("en-KE")} votes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </SiteLayout>
  );
}
