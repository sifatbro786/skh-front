// src/pages/client/CompliancePage.jsx
// Phase 2 · Task 4.
// The certificate register is this page's subject, so the page owns that fetch
// and hands it to two consumers (the grid + the standards cross-reference).
// AuditBand still owns its own /api/stats call — a slow stats response must not
// hold up the documents.
// Fallback rule (same as CertMarquee): an empty or failed list degrades to
// COMPLIANCE_STANDARDS. When that happens the standards register below would be
// the identical list twice, so it's suppressed.
import { Link } from "react-router-dom";
import { FileCheck2 } from "lucide-react";
import { usePageMeta } from "../../hooks/usePageMeta";
import { useAsync } from "../../hooks/useAsync";
import { certificationApi } from "../../services/certificationApi";
import { SITE, COMPLIANCE_STANDARDS } from "../../data/siteContent";
import { openRfq } from "../../lib/rfqBus";
import SectionHeading from "../../components/ui/SectionHeading";
import Button from "../../components/ui/Button";
import { AuditBand, CertificationGrid, StandardsList } from "../../components/client/compliance";

// Same warp/weft lattice as the catalog header — one page-header treatment
// across the client site.
const LATTICE = {
    backgroundImage:
        "repeating-linear-gradient(90deg, rgba(197,160,89,0.09) 0 1px, transparent 1px 76px)," +
        "repeating-linear-gradient(0deg, rgba(197,160,89,0.06) 0 1px, transparent 1px 76px)",
    maskImage: "radial-gradient(120% 120% at 85% 0%, #000 0%, transparent 70%)",
    WebkitMaskImage: "radial-gradient(120% 120% at 85% 0%, #000 0%, transparent 70%)",
};

const pad = (n) => String(n).padStart(2, "0");

function IndexRow({ label, value }) {
    return (
        <div className="flex items-baseline gap-3">
            <dt className="flex flex-1 items-baseline gap-3 text-[12px] text-content-subtle">
                <span>{label}</span>
                <span
                    className="mb-1 min-w-4 flex-1 border-b border-dotted border-white/20"
                    aria-hidden="true"
                />
            </dt>
            <dd className="font-mono text-[13px] text-brand-gold tabular-nums">{value}</dd>
        </div>
    );
}

export default function CompliancePage() {
    const { pageMeta } = usePageMeta("compliance");

    const { data, loading, error, retry } = useAsync(() => certificationApi.list(), []);

    const certifications = data?.certifications || [];
    const firstLoad = loading && !data;
    const usingFallback = !loading && certifications.length === 0;

    const items = usingFallback
        ? COMPLIANCE_STANDARDS.map((standard) => ({
              _id: `standard-${standard.name}`,
              title: standard.name,
          }))
        : certifications;

    const withPdf = certifications.filter((cert) => cert.pdfPath).length;

    const title = pageMeta?.metaTitle || `Compliance & Certifications — ${SITE.name}`;
    const description =
        pageMeta?.metaDescription ||
        "Certificates, audit standards and the quality protocol behind every SKH Sourcing shipment — with certificate PDFs available to download.";

    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
            {pageMeta?.metaKeywords ? (
                <meta name="keywords" content={pageMeta.metaKeywords} />
            ) : null}
            {pageMeta?.canonicalUrl ? <link rel="canonical" href={pageMeta.canonicalUrl} /> : null}

            {/* ------------------------------ Header ---------------------------- */}
            <section className="relative overflow-hidden bg-surface-dark pt-10 pb-12 sm:pt-14 sm:pb-16">
                <div
                    className="pointer-events-none absolute inset-0"
                    style={LATTICE}
                    aria-hidden="true"
                />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <nav aria-label="Breadcrumb">
                        <ol className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-white/40 uppercase">
                            <li>
                                <Link to="/" className="transition-colors hover:text-brand-gold">
                                    Home
                                </Link>
                            </li>
                            <li aria-hidden="true">/</li>
                            <li className="text-brand-gold">Compliance</li>
                        </ol>
                    </nav>

                    <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end">
                        <div>
                            <h1 className="font-heading text-4xl leading-[1.08] font-extrabold tracking-[-0.03em] text-content-inverse sm:text-5xl">
                                Documents you can ask for
                            </h1>
                            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-content-subtle">
                                Every certificate we hold is listed here, with the issuing body and
                                a downloadable copy where one exists. Anything not on file, ask and
                                we&rsquo;ll pull it from the mill or the audit house.
                            </p>
                        </div>

                        {/* Register index — the line-sheet device, with real counts. */}
                        <div className="rounded-xl border border-border-dark bg-white/5 p-5 lg:justify-self-end">
                            <h2 className="font-heading text-[10px] font-bold tracking-[0.26em] text-white/45 uppercase">
                                The register
                            </h2>
                            <dl className="mt-4 space-y-2.5">
                                <IndexRow
                                    label="Certificates listed"
                                    value={firstLoad ? "––" : pad(certifications.length)}
                                />
                                <IndexRow
                                    label="Available as PDF"
                                    value={firstLoad ? "––" : pad(withPdf)}
                                />
                                <IndexRow
                                    label="Standards tracked"
                                    value={pad(COMPLIANCE_STANDARDS.length)}
                                />
                            </dl>
                        </div>
                    </div>
                </div>
            </section>

            {/* --------------------------- Certificates ------------------------- */}
            <section className="bg-surface py-14 sm:py-20" aria-labelledby="certificates">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        eyebrow="Certifications"
                        title={<span id="certificates">Held by us and the mills we book</span>}
                        subtitle={
                            usingFallback
                                ? "The standards our partner factories are audited against. Certificate copies are issued per order on request."
                                : "Certificates are issued by the bodies named on each card. Where a copy is on file, it downloads directly — no form in between."
                        }
                    />

                    <CertificationGrid
                        items={items}
                        loading={firstLoad}
                        error={error}
                        onRetry={retry}
                        muted={usingFallback}
                        className="mt-10"
                    />
                </div>
            </section>

            {/* ---------------------------- QC protocol ------------------------- */}
            <AuditBand />

            {/* ------------------------ Standards register ---------------------- */}
            {usingFallback ? null : (
                <section className="bg-surface py-14 sm:py-20" aria-labelledby="standards">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <SectionHeading
                            eyebrow="Standards"
                            title={<span id="standards">What we work to</span>}
                            subtitle="Buyer-mandated social and technical audits we support, and the sustainability schemes our fabric programmes run under."
                        />
                        <StandardsList certifications={certifications} className="mt-8 max-w-4xl" />
                    </div>
                </section>
            )}

            {/* -------------------------------- CTA ----------------------------- */}
            <section className="bg-surface pb-16 sm:pb-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised px-6 py-10 sm:px-10 sm:py-12">
                        <span
                            className="absolute top-0 left-0 h-1.5 w-1.5 bg-brand-gold"
                            aria-hidden="true"
                        />
                        <span
                            className="absolute top-0.5 left-0 h-px w-24 bg-brand-gold"
                            aria-hidden="true"
                        />

                        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-xl">
                                <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.26em] text-content-muted uppercase">
                                    <FileCheck2
                                        className="h-3.5 w-3.5 text-brand-gold"
                                        aria-hidden="true"
                                    />
                                    Documentation
                                </span>
                                <h2 className="mt-4 font-heading text-2xl leading-tight font-extrabold text-content sm:text-3xl">
                                    Need a specific audit report or scope certificate?
                                </h2>
                                <p className="mt-3 text-[15px] leading-relaxed text-content-muted">
                                    Tell us the buyer requirement and the programme &mdash; BSCI,
                                    SMETA, GRS transaction certificates, test reports &mdash; and
                                    we&rsquo;ll come back with what the nominated factory can
                                    provide.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0 lg:flex-col xl:flex-row">
                                <Button size="lg" onClick={() => openRfq({ source: "compliance" })}>
                                    Request documentation
                                </Button>
                                <Button as={Link} to="/contact" variant="outline" size="lg">
                                    Talk to the team
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
