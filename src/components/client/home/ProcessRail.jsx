// src/components/client/home/ProcessRail.jsx
// The four-step order journey from siteContent.PROCESS.
//
// Numbering is earned here: this is a real sequence and the order carries
// information the buyer needs. The rail itself is the selvedge device scaled up
// — a hairline with a gold node per step, running horizontally on desktop and
// vertically (as a true selvedge edge) on mobile.
//
// The oversized step figure does the work the old uniform columns didn't: it
// gives the eye a rhythm to travel along, so four equal blocks stop reading as
// four equal blocks.
import { PROCESS } from "../../../data/siteContent";
import SectionHeading from "../../ui/SectionHeading";
import Photo from "../../ui/Photo";
import { STOCK_PHOTOS } from "../../../data/stockPhotos";

const LATTICE = {
    backgroundImage:
        "repeating-linear-gradient(90deg, rgba(197,160,89,0.10) 0 1px, transparent 1px 76px)," +
        "repeating-linear-gradient(0deg, rgba(197,160,89,0.07) 0 1px, transparent 1px 76px)",
};

export default function ProcessRail() {
    return (
        <section className="relative overflow-hidden bg-surface-dark py-20 sm:py-24">
            {/* Photographic ground, pushed well back — the band was flat navy and
                sat between two light sections with nothing to hold the eye. */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <Photo src={STOCK_PHOTOS.qualityDetail} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-r from-brand-dark via-brand-dark/96 to-brand-dark/88" />
                <div className="absolute inset-0 opacity-[0.06]" style={LATTICE} />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    tone="dark"
                    eyebrow="How an order runs"
                    title="Four stages, one owner"
                    subtitle="Your merchandiser stays the same from the first costing to the final carton audit — there is no handoff between departments to chase."
                />

                <ol className="mt-8 grid gap-10 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4">
                    {PROCESS.map(({ step, title, body }) => (
                        <li
                            key={step}
                            className="group relative pt-0 pl-6 transition-colors duration-300 lg:pt-7 lg:pl-0"
                        >
                            <div className="flex items-baseline gap-3">
                                <span className="font-heading text-3xl leading-none font-extrabold text-white/12 tabular-nums transition-colors duration-300 group-hover:text-brand-gold/35">
                                    {step}
                                </span>
                                <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
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
