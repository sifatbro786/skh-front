// src/components/client/about/MilestoneLedger.jsx
// The timeline, as a ledger rather than a card row: a single gold spine with a
// node per entry, the year set in mono tabular figures.
//
// Deliberately NOT the ProcessRail treatment — that rail is numbered 01–04
// because the steps are a procedure the buyer will go through. This is history:
// the years are the figures, so no index numbers are added on top of them.
//
// The last row is computed in JS rather than with a `group-last:` variant —
// composed group variants are easy to get subtly wrong, and this has to close
// cleanly (no spine trailing past the final node).
import { MILESTONES } from "../../../data/siteContent";
import SectionHeading from "../../ui/SectionHeading";

export default function MilestoneLedger({ milestones = MILESTONES }) {
    if (!milestones.length) return null;

    return (
        <section className="bg-surface py-14 sm:py-20" aria-labelledby="milestones">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Track record"
                    title={<span id="milestones">How the business grew</span>}
                    subtitle="Each step here was a buyer requirement before it was a plan — the in-house QC team and the Australia office both exist because customers asked for them."
                />

                <ol className="mt-12 max-w-3xl">
                    {milestones.map((milestone, index) => {
                        const isLast = index === milestones.length - 1;

                        return (
                            <li
                                key={milestone.year}
                                className={`relative flex gap-5 sm:gap-8 ${isLast ? "" : "pb-9"}`}
                            >
                                {isLast ? null : (
                                    <span
                                        className="absolute top-3 bottom-0 left-[2.5px] w-px bg-border-strong"
                                        aria-hidden="true"
                                    />
                                )}
                                <span
                                    className="absolute top-2.5 left-0 h-1.5 w-1.5 bg-brand-gold"
                                    aria-hidden="true"
                                />

                                <span className="ml-6 w-12 shrink-0 pt-px font-mono text-[13px] font-semibold text-brand-gold tabular-nums sm:ml-8">
                                    {milestone.year}
                                </span>

                                <div
                                    className={`min-w-0 flex-1 ${
                                        isLast ? "" : "border-b border-border-subtle pb-6"
                                    }`}
                                >
                                    <h3 className="font-heading text-[16px] leading-snug font-bold text-content">
                                        {milestone.title}
                                    </h3>
                                    <p className="mt-1.5 text-[14px] leading-relaxed text-content-muted">
                                        {milestone.body}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}
