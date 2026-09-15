import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  eventCover,
  fetchEventBySlug,
  fetchModels,
  formatKsh,
  modelPortrait,
  siteContentQuery,
  votePrice,
  type EventRow,
  type ModelRow,
} from "@/lib/site-data";

export const Route = createFileRoute("/events/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      meta: [
        { title: `${name} — Vote at Westgate Arena` },
        {
          name: "description",
          content: `Meet the finalists of ${name} at Westgate Arena, Nairobi, and cast your votes live.`,
        },
        { property: "og:title", content: `${name} — Vote at Westgate Arena` },
        {
          property: "og:description",
          content: `Meet every contestant and vote live in ${name}.`,
        },
      ],
    };
  },
  component: EventDetail,
});

function EventDetail() {
  const { slug } = Route.useParams();
  const { data: content } = useQuery(siteContentQuery);
  const price = votePrice(content);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", slug],
    queryFn: () => fetchEventBySlug(slug),
  });

  const { data: models } = useQuery({
    queryKey: ["models", event?.id],
    queryFn: () => fetchModels(event!.id),
    enabled: !!event?.id,
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-6 py-24 text-muted-foreground">Loading event…</div>
      </SiteLayout>
    );
  }

  if (!event) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h1 className="text-3xl">Event not found</h1>
          <Link to="/events" className="btn-outline mt-6">
            All events
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const list = models ?? [];
  const totalVotes = list.reduce((sum, m) => sum + m.votes, 0);

  return (
    <SiteLayout>
      <section className="stage-hero">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20 md:flex-row md:items-center">
          <img
            src={eventCover(event)}
            alt={event.title}
            width={1024}
            height={1024}
            className="h-64 w-64 shrink-0 rounded-xl border border-border object-cover shadow-[var(--shadow-card)]"
          />
          <div>
            <span className={event.voting_open ? "pill-live" : "pill-muted"}>
              {event.voting_open ? "Voting open" : "Voting closed"}
            </span>
            <h1 className="mt-5 text-5xl sm:text-6xl">{event.title}</h1>
            <p className="mt-2 text-muted-foreground">
              {[event.date_label, event.time_label, event.venue].filter(Boolean).join(" · ")}
            </p>
            {event.description ? (
              <p className="mt-4 max-w-xl text-muted-foreground">{event.description}</p>
            ) : null}
            <p className="mt-4 text-sm font-medium text-accent">
              {totalVotes.toLocaleString("en-KE")} votes cast · {formatKsh(totalVotes * price)} raised
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker">The contestants</p>
            <h2 className="mt-3 text-4xl">Meet the models</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Each vote costs {formatKsh(price)}. One vote per person.
          </p>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((model, i) => (
            <ModelCard
              key={model.id}
              model={model}
              index={i}
              event={event}
              price={price}
              totalVotes={totalVotes}
            />
          ))}
        </div>

        <Link to="/events" className="btn-outline mt-12">
          ← All events
        </Link>
      </section>
    </SiteLayout>
  );
}

function ModelCard({
  model,
  index,
  event,
  price,
  totalVotes,
}: {
  model: ModelRow;
  index: number;
  event: EventRow;
  price: number;
  totalVotes: number;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "paying" | "done" | "error">("idle");

  const share = totalVotes > 0 ? Math.round((model.votes / totalVotes) * 100) : 0;

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setStatus("paying");
    const { error } = await supabase.from("votes").insert({
      event_id: event.id,
      model_id: model.id,
      quantity,
      amount: quantity * price,
      phone,
    });
    if (error) {
      setStatus("error");
      return;
    }
    setStatus("done");
    await queryClient.invalidateQueries({ queryKey: ["models"] });
  }

  return (
    <article className="feature-card">
      <div className="relative">
      <img
        src={modelPortrait(model, index)}
        alt={model.name}
        loading="lazy"
        width={768}
        height={1024}
        className="aspect-3/4 w-full object-cover"
      />
      <div className="media-fade" />
      {model.number ? (
        <span className="absolute top-4 left-4 flex size-10 items-center justify-center rounded-full border border-primary/40 bg-background/70 font-display text-lg text-primary backdrop-blur">
          {model.number}
        </span>
      ) : null}
      </div>
      <div className="space-y-3 p-6">
        <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
          {[model.number ? `No. ${model.number}` : null, model.city].filter(Boolean).join(" · ")}
        </p>
        <h3 className="text-2xl">{model.name}</h3>
        {model.bio ? <p className="text-sm text-muted-foreground">{model.bio}</p> : null}

        <div className="pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{model.votes.toLocaleString("en-KE")} votes</span>
            <span className="text-muted-foreground">{share}%</span>
          </div>
          <div className="vote-track mt-2">
            <span className="vote-fill" style={{ width: `${share}%` }} />
          </div>
        </div>

        {!event.voting_open ? (
          <p className="text-sm text-muted-foreground">Voting is closed for this event.</p>
        ) : !open ? (
          <button className="btn-primary w-full" onClick={() => setOpen(true)}>
            Vote — {formatKsh(price)} each
          </button>
        ) : status === "done" ? (
          <div className="space-y-2">
            <p className="text-sm text-primary">
              {quantity} {quantity === 1 ? "vote" : "votes"} recorded for {model.name}. Thank you!
            </p>
            <button
              className="btn-outline w-full"
              onClick={() => {
                setOpen(false);
                setStatus("idle");
                setQuantity(1);
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={pay} className="space-y-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
            <div>
              <span className="label-xs">Number of votes</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="btn-outline px-3 py-1"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="w-8 text-center">{quantity}</span>
                <button
                  type="button"
                  className="btn-outline px-3 py-1"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
              <p className="mt-2 text-sm text-accent">Total: {formatKsh(quantity * price)}</p>
            </div>
            <div>
              <label className="label-xs" htmlFor={`phone-${model.id}`}>
                M-Pesa phone number
              </label>
              <input
                id={`phone-${model.id}`}
                required
                inputMode="tel"
                placeholder="07XX XXX XXX"
                className="field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={status === "paying"}>
              {status === "paying" ? "Processing…" : `Pay ${formatKsh(quantity * price)} with M-Pesa`}
            </button>
            {status === "error" ? (
              <p className="text-sm text-destructive">Vote failed. Please try again.</p>
            ) : null}
          </form>
        )}
      </div>
    </article>
  );
}
