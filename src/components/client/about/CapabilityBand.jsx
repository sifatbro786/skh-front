// src/components/client/about/CapabilityBand.jsx
// The dark band: fabric programmes as a line sheet (name · leader · note) and
// the markets we ship to as a node list.
//
// Not numbered — neither list is a sequence. The fabric rows earn the dotted
// leader because the right-hand column carries real information (the scheme the
// fibre is certified under); the markets column uses nodes instead so the two
// halves don't read as the same table twice.
import { SUSTAINABLE_FABRICS, TARGET_MARKETS } from "../../../data/siteContent";
import SectionHeading from "../../ui/SectionHeading";

export default function CapabilityBand() {
    return (
        <section className="bg-surface-dark py-16 sm:py-20" aria-labelledby="capability">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    tone="dark"
                    eyebrow="Capability"
                    title={<span id="capability">What we can put on a costing sheet</span>}
                    subtitle="Fibre programmes run through mills we already book, so a sustainable substitution is a costing question rather than a new supply chain."
                />

                <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20">
                    <div>
                        <h3 className="font-heading text-[10px] font-bold tracking-[0.28em] text-brand-gold uppercase">
                            Fabric programmes
                        </h3>
                        <ul className="mt-5">
                            {SUSTAINABLE_FABRICS.map((fabric) => (
                                <li
                                    key={fabric.name}
                                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border-dark py-3.5 last:border-b-0"
                                >
                                    <span className="text-[14px] font-semibold text-content-inverse">
                                        {fabric.name}
                                    </span>
                                    <span
                                        className="mb-1 hidden min-w-4 flex-1 border-b border-dotted border-white/20 sm:block"
                                        aria-hidden="true"
                                    />
                                    <span className="text-[12.5px] text-content-subtle">
                                        {fabric.note}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-5 text-[12.5px] leading-relaxed text-content-subtle">
                            Transaction certificates and scope certificates are issued per order —
                            ask for them at costing, not after shipment.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-heading text-[10px] font-bold tracking-[0.28em] text-brand-gold uppercase">
                            Markets we ship to
                        </h3>
                        <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3.5 lg:grid-cols-1">
                            {TARGET_MARKETS.map((market) => (
                                <li key={market} className="flex items-center gap-3">
                                    <span
                                        className="h-1.5 w-1.5 shrink-0 bg-brand-gold"
                                        aria-hidden="true"
                                    />
                                    <span className="text-[14px] text-content-inverse">
                                        {market}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-6 text-[12.5px] leading-relaxed text-content-subtle">
                            Documentation is prepared to the destination&rsquo;s requirements — GSP
                            forms, certificates of origin and buyer-specific packing manuals.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
