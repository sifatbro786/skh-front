/* eslint-disable react-hooks/immutability */
// src/components/client/home/SourcingNetwork.jsx
// The supply network behind an order, drawn as a line-sheet register rather
// than a row of identical logo cards.
//
// Placement is deliberate: it sits after ProcessRail ("how an order runs") and
// before the CTA, so the buyer sees *who backs the promise* — overseas fabric &
// trim mills, our own manufacturing units, and the Bangladesh logistics chain —
// right before they are asked to enquire. Source -> make -> move, in order.
//
// Layout is asymmetric on purpose. The overseas mill register (the deep end of
// the chain) takes the wide column; the two Bangladesh registers stack in the
// narrow column. Three equal card-columns would read as a template and flatten
// the source->make->move story into one plane.
//
// Data is static (siteContent.SOURCING_NETWORK) by design — a supplier list
// this stable does not justify a CMS collection. Rows degrade gracefully: an
// entry with no address prints name + specialty only, so the section stays
// honest where addresses are still being collected from the client.
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "../../ui/SectionHeading";
import { indexFigure } from "../../ui/IndexPanel";
import { SOURCING_NETWORK } from "../../../data/siteContent";

function Entry({ index, entry }) {
    const { name, country, specialty, address } = entry;

    return (
        <li className="group relative border-b border-border-subtle py-4 last:border-b-0">
            {/* Selvedge node — the brand mark, drawn only on hover so a long list
                stays quiet until the eye lands on a row. */}
            <span
                className="absolute top-4 -left-3 h-1.5 w-1.5 scale-0 bg-brand-gold transition-transform duration-300 group-hover:scale-100 motion-reduce:transition-none"
                aria-hidden="true"
            />

            <div className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] text-content-subtle tabular-nums">
                    {index}
                </span>
                <h4 className="font-heading text-[15px] font-bold text-content transition-colors duration-300 group-hover:text-brand-gold">
                    {name}
                </h4>
                {/* Dotted leader — the line-sheet device carrying the eye to the
                    origin tag. Hidden on mobile where the row wraps anyway. */}
                <span
                    className="mb-1 hidden min-w-6 flex-1 border-b border-dotted border-border-strong sm:block"
                    aria-hidden="true"
                />
                {country ? (
                    <span className="shrink-0 font-mono text-[10px] font-bold tracking-[0.18em] text-content-muted uppercase">
                        {country}
                    </span>
                ) : null}
            </div>

            {specialty || address ? (
                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 pl-7">
                    {specialty ? (
                        <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-brand-gold uppercase">
                            {specialty}
                        </span>
                    ) : null}
                    {address ? (
                        <span className="text-[13px] leading-relaxed text-content-muted">
                            {address}
                        </span>
                    ) : null}
                </div>
            ) : null}
        </li>
    );
}

function Register({ group, startIndex }) {
    return (
        <div>
            {/* Register head sits on the selvedge rule — gold hairline + node. */}
            <div className="selvedge flex items-baseline justify-between gap-4">
                <div>
                    <h3 className="font-heading text-[11px] font-bold tracking-[0.26em] text-content uppercase">
                        {group.label}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-content-muted">
                        {group.descriptor}
                    </p>
                </div>
                <span className="shrink-0 font-mono text-[13px] text-brand-gold tabular-nums">
                    {indexFigure(group.entries.length)}
                </span>
            </div>

            <ol className="mt-5">
                {group.entries.map((entry, i) => (
                    <Entry
                        key={entry.name}
                        index={String(startIndex + i).padStart(2, "0")}
                        entry={entry}
                    />
                ))}
            </ol>
        </div>
    );
}

export default function SourcingNetwork() {
    // Continuous NN indexing across all registers, so the whole network reads
    // as one numbered directory rather than three lists that restart at 01.
    let cursor = 1;
    const registers = SOURCING_NETWORK.map((group) => {
        const start = cursor;
        cursor += group.entries.length;
        return { group, start };
    });
    const [lead, ...local] = registers;

    return (
        <section className="bg-surface-raised py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Sourcing network"
                    title="The partners behind every shipment"
                    subtitle="Fabric and trims come through vetted overseas mills, production runs through our own manufacturing units, and a Bangladesh logistics chain moves finished goods to port — one accountable desk coordinating all three."
                />

                <div className="mt-12 grid gap-x-12 gap-y-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                    {lead ? <Register group={lead.group} startIndex={lead.start} /> : null}

                    <div className="flex flex-col gap-12">
                        {local.map(({ group, start }) => (
                            <Register key={group.id} group={group} startIndex={start} />
                        ))}
                    </div>
                </div>

                <p className="mt-12 border-t border-border-subtle pt-6 text-[13px] text-content-muted">
                    Supplier and compliance documentation is available to buyers on request.{" "}
                    <Link
                        to="/compliance"
                        className="inline-flex items-center gap-1 font-semibold text-brand-gold underline-offset-4 hover:underline"
                    >
                        See our compliance standards
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                </p>
            </div>
        </section>
    );
}
