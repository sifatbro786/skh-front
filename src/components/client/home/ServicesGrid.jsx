// src/components/client/home/ServicesGrid.jsx
// Six capabilities from siteContent.SERVICES. Deliberately NOT numbered — these
// are a set, not a sequence (the numbered treatment belongs to ProcessRail,
// where order actually carries meaning).
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "../../ui/SectionHeading";
import { SERVICES } from "../../../data/siteContent";

export default function ServicesGrid() {
    return (
        <section className="bg-surface-raised py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="What we do"
                    title="A full sourcing desk, not a broker"
                    subtitle="Development, fabric, production, quality and freight handled by one team — so there is a single owner for the order from costing to carton."
                />

                <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border-subtle bg-border-subtle sm:grid-cols-2 lg:grid-cols-3">
                    {SERVICES.map(({ id, icon: Icon, title, body }) => (
                        <article
                            key={id}
                            className="group relative bg-surface-raised p-7 transition-colors duration-300 hover:bg-brand-gold/4"
                        >
                            {/* Gold rule that draws in on hover — the one moving part. */}
                            <span
                                className="absolute top-0 left-0 h-0.5 w-0 bg-brand-gold transition-all duration-500 ease-out group-hover:w-full motion-reduce:transition-none"
                                aria-hidden="true"
                            />
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border-subtle bg-surface-inset text-brand-gold transition-colors duration-300 group-hover:border-brand-gold/40 group-hover:bg-brand-gold/10">
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <h3 className="mt-5 font-heading text-[17px] font-bold text-content">
                                {title}
                            </h3>
                            <p className="mt-2.5 text-[14px] leading-relaxed text-content-muted">
                                {body}
                            </p>
                        </article>
                    ))}
                </div>

                <p className="mt-8 text-[13px] text-content-muted">
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
