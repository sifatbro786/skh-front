// src/components/client/compliance/CertificationGrid.jsx
// The certification cards. Server sorts by { order: 1, createdAt: -1 } — this
// renders the array as received and never re-sorts it.
//
// Two states the API forces on us:
//   · a cert may have no logo   -> monogram tile instead of an empty box
//   · a cert may have no PDF    -> the download affordance is replaced, not hidden,
//                                  so the row height stays stable across the grid
//
// `muted` is the fallback pass (COMPLIANCE_STANDARDS instead of live rows): same
// card, no logo, no download, so the page still reads as a real page when the
// collection hasn't been seeded yet.
import { ArrowDownToLine, RotateCw } from "lucide-react";
import { certLogoUrl, certPdfUrl } from "../../../services/certificationApi";
import Skeleton from "../../ui/Skeleton";
import Button from "../../ui/Button";

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

/** "OEKO-TEX® Standard 100" -> "OS". Strips the ® / ™ that most cert names carry. */
const monogram = (title = "") => {
    const words = title
        .replace(/[^A-Za-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
    if (!words.length) return "SKH";
    return words
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
};

function CertificationCard({ cert, muted }) {
    const logo = muted ? null : certLogoUrl(cert);
    const pdf = muted ? null : certPdfUrl(cert);

    return (
        <li className="group relative flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface-raised p-5 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-brand-gold/45 hover:shadow-[0_22px_50px_-38px_rgba(15,23,42,0.65)] motion-reduce:transform-none motion-reduce:transition-none sm:p-6">
            {/* Selvedge: node + hairline that draws on hover. */}
            <span className="absolute top-0 left-0 h-1.5 w-1.5 bg-brand-gold" aria-hidden="true" />
            <span
                className="absolute top-0.5 left-0 h-px w-0 bg-brand-gold transition-[width] duration-500 ease-out group-hover:w-16 motion-reduce:transition-none"
                aria-hidden="true"
            />

            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-border-subtle bg-surface-inset">
                {logo ? (
                    <img
                        src={logo}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="max-h-10 w-auto max-w-13 object-contain opacity-80 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 motion-reduce:transition-none"
                    />
                ) : (
                    <span
                        aria-hidden="true"
                        className="font-heading text-[13px] font-extrabold tracking-widest text-brand-gold"
                    >
                        {monogram(cert.title)}
                    </span>
                )}
            </div>

            <h3 className="mt-5 font-heading text-[15px] leading-snug font-bold text-content">
                {cert.title}
            </h3>
            <p className="mt-1.5 text-[10px] font-bold tracking-[0.22em] text-content-subtle uppercase">
                {cert.issuedBy || (muted ? "Industry standard" : "Certifying body")}
            </p>

            {/* mt-auto keeps the leader row flush at the card foot on every row,
                whatever the title wraps to. */}
            <div className="mt-auto flex items-baseline gap-3 pt-6">
                <span className="text-[10px] font-bold tracking-[0.2em] text-content-muted uppercase">
                    Certificate
                </span>
                <span
                    className="mb-1 min-w-4 flex-1 border-b border-dotted border-border-strong"
                    aria-hidden="true"
                />
                {pdf ? (
                    <a
                        href={pdf}
                        download
                        // Cert assets are served from the public uploads dir, so a
                        // direct link works — no auth blob dance like the tech pack.
                        // `download` is ignored cross-origin (API on its own host),
                        // so target=_blank keeps it out of the SPA either way.
                        target="_blank"
                        rel="noopener"
                        aria-label={`Download the ${cert.title} certificate (PDF)`}
                        className="inline-flex items-center gap-1.5 rounded font-mono text-[11px] font-semibold tracking-widest text-brand-gold uppercase transition-colors hover:text-brand-gold-hover focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                    >
                        PDF
                        <ArrowDownToLine className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                ) : (
                    <span className="font-mono text-[11px] tracking-widest text-content-subtle uppercase">
                        On request
                    </span>
                )}
            </div>
        </li>
    );
}

function CardSkeleton() {
    return (
        <div className="rounded-xl border border-border-subtle bg-surface-raised p-5 sm:p-6">
            <Skeleton className="h-16 w-16" rounded="rounded-lg" />
            <Skeleton className="mt-5 h-4 w-3/4" />
            <Skeleton className="mt-2.5 h-2.5 w-1/3" />
            <Skeleton className="mt-8 h-3 w-full" />
        </div>
    );
}

export default function CertificationGrid({
    items = [],
    loading = false,
    error = null,
    onRetry,
    muted = false,
    skeletonCount = 4,
    className = "",
}) {
    if (loading) {
        return (
            <div className={`${GRID} ${className}`}>
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className={className}>
            {error ? (
                // The list still renders (fallback standards), so this is a notice,
                // not an empty state — say what's stale and offer the retry.
                <div className="mb-6 flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface-inset px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[13px] text-content-muted">
                        The certificate register didn&rsquo;t load. You&rsquo;re seeing the
                        standards we work to, without the downloadable documents.
                    </p>
                    {onRetry ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRetry}
                            leftIcon={RotateCw}
                            className="shrink-0"
                        >
                            Try again
                        </Button>
                    ) : null}
                </div>
            ) : null}

            {items.length ? (
                <ul className={GRID}>
                    {items.map((cert) => (
                        <CertificationCard key={cert._id || cert.title} cert={cert} muted={muted} />
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
