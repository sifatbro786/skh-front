// src/components/client/home/StatsBand.jsx
// A raised card straddling the hero's bottom edge — the structural seam between
// the dark hero and the light page. Values come from GET /api/stats (upsert-on-
// read, so it never 404s or returns null); labels come from STAT_CARDS.
import { statsApi, STAT_CARDS } from "../../../services/statsApi";
import { useAsync } from "../../../hooks/useAsync";
import StatCounter from "../../ui/StatCounter";
import { SITE } from "../../../data/siteContent";

export default function StatsBand() {
    const { data, error } = useAsync(() => statsApi.get(), []);
    const stats = data?.stats;

    // Counters animate 0 → value. Before the response lands the target is 0, and
    // StatCounter re-runs its animation when `value` changes — so the numbers
    // simply count up whenever the data arrives. No skeleton needed, no shift.
    const year = new Date().getFullYear();
    const years = stats?.yearsInBusiness || Math.max(year - SITE.established, 0);

    if (error && !stats) return null; // quiet degradation — never a broken band

    return (
        <section
            // Negative margin pulls the card up over the hero's bottom padding
            // (pb-28 / sm:pb-36); the padding below restores the rhythm for the
            // section that follows, which the negative margin would otherwise eat.
            className="relative z-10 -mt-20 pb-16 sm:-mt-24 sm:pb-20"
            aria-labelledby="stats-heading"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.55)] sm:p-9">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                        <h2
                            id="stats-heading"
                            className="font-heading text-[11px] font-bold tracking-[0.26em] text-content-muted uppercase"
                        >
                            By the numbers
                        </h2>
                        <p className="text-[12px] text-content-subtle">
                            Sourcing from Bangladesh since {SITE.established} ·{" "}
                            <span className="tabular-nums">{years}</span> years
                        </p>
                    </div>

                    {/* A <dl> would be the tempting semantic here, but its only valid
                        children are dt/dd (or divs wrapping them) — StatCounter renders
                        <p>s, so a plain div keeps the markup valid. */}
                    <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-9 lg:grid-cols-4 lg:gap-x-0">
                        {STAT_CARDS.map((card, i) => (
                            <div
                                key={card.key}
                                className={
                                    i > 0 ? "lg:border-l lg:border-border-subtle lg:pl-8" : ""
                                }
                            >
                                <StatCounter
                                    value={stats?.[card.key] ?? 0}
                                    label={card.label}
                                    suffix={card.suffix}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
