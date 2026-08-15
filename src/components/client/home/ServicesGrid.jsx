// src/components/client/home/ServicesGrid.jsx
// Six capabilities from siteContent.SERVICES. Deliberately NOT numbered — these
// are a set, not a sequence (the numbered treatment belongs to ProcessRail,
// where order actually carries meaning).
//
// Layout is asymmetric on purpose. Six equal boxes in a 3×2 grid gives every
// capability the same weight and lands on the page as a template; the lead
// service instead gets a full photographic panel and the rest run as a tight
// hairline list beside it, which is how a capability page is actually set.
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "../../ui/SectionHeading";
import Photo from "../../ui/Photo";
import { SERVICES } from "../../../data/siteContent";
import { STOCK_PHOTOS } from "../../../data/stockPhotos";

export default function ServicesGrid() {
    const [lead, ...rest] = SERVICES;
    const LeadIcon = lead.icon;

    return (
        <section className="bg-surface-raised py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="What we do"
                    title="A full sourcing desk, not a broker"
                    subtitle="Development, fabric, production, quality and freight handled by one team — so there is a single owner for the order from costing to carton."
                />

                <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-12">
                    {/* Lead capability — the one panel carrying an image. */}
                    {/* No self-start: the panel stretches to the list's height so the
                        two columns bottom out together instead of leaving a gap. */}
                    <article className="group relative overflow-hidden rounded-2xl bg-surface-dark">
                        <Photo
                            src={STOCK_PHOTOS.sewingFloor}
                            className="h-72 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 sm:h-96 lg:h-full"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-brand-dark via-brand-dark/70 to-brand-dark/10" />

                        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-brand-gold backdrop-blur-sm">
                                <LeadIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <h3 className="mt-5 font-heading text-xl font-bold text-content-inverse sm:text-2xl">
                                {lead.title}
                            </h3>
                            <p className="mt-2.5 max-w-md text-[14px] leading-relaxed text-content-subtle">
                                {lead.body}
                            </p>
                        </div>
                    </article>

                    {/* The remaining five, as a line-sheet rather than five more boxes. */}
                    <ul className="lg:pt-2">
                        {rest.map(({ id, icon: Icon, title, body }) => (
                            <li
                                key={id}
                                className="group flex gap-5 border-b border-border-subtle py-6 first:pt-0 last:border-b-0 last:pb-0"
                            >
                                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-surface-inset text-brand-gold transition-colors duration-300 group-hover:border-brand-gold/45 group-hover:bg-brand-gold/10">
                                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                                </span>
                                <div className="min-w-0">
                                    <h3 className="font-heading text-[16px] font-bold text-content transition-colors duration-300 group-hover:text-brand-gold">
                                        {title}
                                    </h3>
                                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-content-muted">
                                        {body}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="mt-10 text-[13px] text-content-muted">
                    Looking for something outside this list?{" "}
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-1 font-semibold text-brand-gold underline-offset-4 hover:underline"
                    >
                        Talk to our merchandising team
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                </p>
            </div>
        </section>
    );
}
