// src/components/client/home/ProcessRail.jsx
// The four-step order journey from siteContent.PROCESS.
//
// Numbering is earned here: this is a real sequence and the order carries
// information the buyer needs. The rail itself is the selvedge device scaled up
// — a hairline with a gold node per step, running horizontally on desktop and
// vertically (as a true selvedge edge) on mobile.
import { PROCESS } from "../../../data/siteContent";
import SectionHeading from "../../ui/SectionHeading";

export default function ProcessRail() {
    return (
        <section className="bg-surface-dark py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    tone="dark"
                    eyebrow="How an order runs"
                    title="Four stages, one owner"
                    subtitle="Your merchandiser stays the same from the first costing to the final carton audit — there is no handoff between departments to chase."
                />

                <ol className="mt-14 grid gap-10 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4">
                    {PROCESS.map(({ step, icon: Icon, title, body }) => (
                        <li
                            key={step}
                            className="relative border-l border-white/12 pt-0 pl-6 lg:border-l-0 lg:border-t lg:pt-7 lg:pl-0"
                        >
                            {/* Node sits on the rail: centred on the left border below
                                lg, on the top border from lg up. */}
                            <span
                                className="absolute top-0 left-0 h-2 w-2 -translate-x-1/2 rotate-45 bg-brand-gold lg:top-0 lg:translate-x-0 lg:-translate-y-1/2"
                                aria-hidden="true"
                            />

                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[12px] font-bold tracking-[0.2em] text-brand-gold tabular-nums">
                                    {step}
                                </span>
                                <span className="h-px w-6 bg-white/15" aria-hidden="true" />
                                <Icon className="h-4 w-4 text-white/40" aria-hidden="true" />
                            </div>

                            <h3 className="mt-4 font-heading text-lg font-bold text-content-inverse">
                                {title}
                            </h3>
                            <p className="mt-2.5 text-[14px] leading-relaxed text-content-subtle">
                                {body}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
