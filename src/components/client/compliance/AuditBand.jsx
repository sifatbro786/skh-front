// src/components/client/compliance/AuditBand.jsx
// The dark band between the certificate grid and the standards register.
//
// Owns its own /api/stats call (same contract as StatsBand): the endpoint is
// upsert-on-read so it never 404s, but it can still fail on the network — in
// which case the protocol rail renders alone rather than the band disappearing.
//
// The protocol IS a sequence (inline -> final -> carton -> report), so it's the
// one thing on this page that gets 01–04 indices.
import { statsApi } from "../../../services/statsApi";
import { useAsync } from "../../../hooks/useAsync";
import SectionHeading from "../../ui/SectionHeading";
import StatCounter from "../../ui/StatCounter";

const PROTOCOL = [
    {
        step: "01",
        title: "Inline inspection",
        body: "Our QC sits on the line during cutting, sewing and finishing — not a single visit at the end.",
    },
    {
        step: "02",
        title: "Final AQL inspection",
        body: "Random sampling against the agreed AQL, run by our own team. Never a self-certified factory report.",
    },
    {
        step: "03",
        title: "Carton & documentation audit",
        body: "Packing, labelling, barcodes and shipping marks checked against the buyer's manual before handover.",
    },
    {
        step: "04",
        title: "Photo-documented report",
        body: "Every inspection closes with a photo report and defect log, issued before the shipment is released.",
    },
];

const STAT_ROWS = [
    { key: "partnerFactories", label: "Partner Factories", suffix: "+" },
    { key: "annualShipments", label: "Annual Shipments", suffix: "+" },
    { key: "countriesServed", label: "Countries Served", suffix: "+" },
];

export default function AuditBand() {
    const { data, error } = useAsync(() => statsApi.get(), []);
    const stats = data?.stats;
    const showNumbers = Boolean(stats) || !error;

    return (
        <section className="bg-surface-dark py-16 sm:py-20" aria-labelledby="qc-protocol">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-16">
                    <div>
                        <SectionHeading
                            eyebrow="Quality protocol"
                            title="Compliance is a process, not a certificate on a wall"
                            subtitle="Documents prove the factory was audited. This is what we do on top of that, on every order, whichever factory it runs in."
                            tone="dark"
                        />

                        <ol id="qc-protocol" className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                            {PROTOCOL.map((item) => (
                                <li key={item.step} className="group relative pl-6">
                                    {/* Selvedge spine — same device as the process rail. */}
                                    <span
                                        className="absolute top-1.5 left-0 h-1.5 w-1.5 bg-brand-gold"
                                        aria-hidden="true"
                                    />
                                    <span
                                        className="absolute top-1.5 bottom-1 left-0.5 w-px bg-border-dark transition-colors duration-300 group-hover:bg-brand-gold/60 motion-reduce:transition-none"
                                        aria-hidden="true"
                                    />
                                    <span className="font-mono text-[11px] tracking-[0.14em] text-brand-gold tabular-nums">
                                        {item.step}
                                    </span>
                                    <h3 className="mt-2 font-heading text-[15px] font-bold text-content-inverse">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-[13.5px] leading-relaxed text-content-subtle">
                                        {item.body}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {showNumbers ? (
                        <div className="rounded-2xl border border-border-dark bg-surface-dark-raised p-6 sm:p-8 lg:self-start">
                            <h3 className="font-heading text-[11px] font-bold tracking-[0.26em] text-content-subtle uppercase">
                                Inspection at scale
                            </h3>
                            <div className="mt-6 space-y-8">
                                {STAT_ROWS.map((row) => (
                                    <StatCounter
                                        key={row.key}
                                        value={stats?.[row.key] ?? 0}
                                        label={row.label}
                                        suffix={row.suffix}
                                        tone="dark"
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
