import { Link } from "@tanstack/react-router";

import { eventCover, type EventRow, type ModelRow } from "@/lib/site-data";

export function EventCard({ event, models }: { event: EventRow; models: ModelRow[] }) {
  const entrants = models.filter((m) => m.event_id === event.id);
  const count = entrants.length;
  const votes = entrants.reduce((sum, m) => sum + m.votes, 0);

  return (
    <Link
      to="/events/$slug"
      params={{ slug: event.slug }}
      className="feature-card group block"
    >
      <div className="relative">
        <img
          src={eventCover(event)}
          alt={event.title}
          loading="lazy"
          width={1024}
          height={1024}
          className="aspect-4/3 w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="media-fade" />
        <span className={`absolute top-4 left-4 ${event.voting_open ? "pill-live" : "pill-muted"}`}>
          {event.voting_open ? "Voting open" : "Voting closed"}
        </span>
      </div>
      <div className="space-y-3 p-6">
        <h3 className="text-2xl">{event.title}</h3>
        <p className="text-sm text-muted-foreground">
          {[event.date_label, event.time_label].filter(Boolean).join(" · ")}
          {event.venue ? (
            <>
              <br />
              {event.venue}
            </>
          ) : null}
        </p>
        <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
          <span className="text-muted-foreground">
            {count} {count === 1 ? "contestant" : "contestants"} · {votes.toLocaleString("en-KE")} votes
          </span>
          <span className="font-medium text-primary transition-transform group-hover:translate-x-1">
            Enter →
          </span>
        </div>
      </div>
    </Link>
  );
}
