// src/components/client/contact/OfficeCards.jsx
// Dual-office cards. No clocks here — the Footer already runs the live office
// time on every page, and two ticking clocks on one screen is noise.
//
// Values arrive pre-merged from useOffices(), so every field is guaranteed
// non-empty even on a cold or half-filled CompanyStats row.
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

const SHORT_LABEL = { bd: "Dhaka HQ", au: "Sydney Hub" };

const mapsUrl = (address) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

function OfficeCard({ office }) {
    const tel = String(office.phone || "").replace(/[^\d+]/g, "");

    return (
        <article className="group relative overflow-hidden rounded-xl border border-border-subtle bg-surface-raised p-5 transition-[border-color,box-shadow] duration-300 hover:border-brand-gold/45 hover:shadow-[0_22px_50px_-40px_rgba(15,23,42,0.6)] sm:p-6">
            <span className="absolute top-0 left-0 h-1.5 w-1.5 bg-brand-gold" aria-hidden="true" />
            <span
                className="absolute top-0.5 left-0 h-px w-0 bg-brand-gold transition-[width] duration-500 ease-out group-hover:w-16 motion-reduce:transition-none"
                aria-hidden="true"
            />

            <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-heading text-[11px] font-bold tracking-[0.26em] text-brand-gold uppercase">
                    {SHORT_LABEL[office.id] || office.label}
                </h3>
                <span className="font-mono text-[11px] tracking-widest text-content-subtle uppercase">
                    {office.country || (office.id === "bd" ? "Bangladesh" : "Australia")}
                </span>
            </div>

            <address className="mt-4 space-y-3 text-sm not-italic">
                <span className="flex gap-2.5 text-content-muted">
                    <MapPin
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold"
                        aria-hidden="true"
                    />
                    <span className="leading-relaxed">{office.address}</span>
                </span>

                <a
                    href={`tel:${tel}`}
                    className="flex items-center gap-2.5 text-content tabular-nums transition-colors hover:text-brand-gold focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                >
                    <Phone className="h-4 w-4 shrink-0 text-brand-gold" aria-hidden="true" />
                    {office.phone}
                </a>

                <a
                    href={`mailto:${office.email}`}
                    className="flex items-center gap-2.5 wrap-break-word text-content transition-colors hover:text-brand-gold focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                >
                    <Mail className="h-4 w-4 shrink-0 text-brand-gold" aria-hidden="true" />
                    {office.email}
                </a>
            </address>

            <a
                href={mapsUrl(office.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 border-t border-border-subtle pt-4 text-[11px] font-bold tracking-[0.18em] text-content-muted uppercase transition-colors hover:text-brand-gold focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
            >
                Open in Maps
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
        </article>
    );
}

export default function OfficeCards({ offices = [], className = "" }) {
    if (!offices.length) return null;

    return (
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-1 ${className}`}>
            {offices.map((office) => (
                <OfficeCard key={office.id} office={office} />
            ))}
        </div>
    );
}
