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
import { STOCK_PHOTOS } from "../../data/stockPhotos";
import { openRfq } from "../../lib/rfqBus";
import PageHeader from "../../components/client/PageHeader";
import SectionHeading from "../../components/ui/SectionHeading";
import IndexPanel, { indexFigure } from "../../components/ui/IndexPanel";
import Button from "../../components/ui/Button";
import { AuditBand, CertificationGrid, StandardsList } from "../../components/client/compliance";

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
            <PageHeader
                crumb="Compliance"
                title="Documents you can ask for"
                intro="Every certificate we hold is listed here, with the issuing body and a downloadable copy where one exists. Anything not on file, ask and we'll pull it from the mill or the audit house."
                image={STOCK_PHOTOS.fabricRolls}
                aside={
                    /* Register index — the line-sheet device, with real counts. */
                    <IndexPanel
                        title="The register"
                        loading={firstLoad}
                        rows={[
                            {
                                label: "Certificates listed",
                                value: indexFigure(certifications.length),
                            },
                            { label: "Available as PDF", value: indexFigure(withPdf) },
                            {
                                label: "Standards tracked",
                                value: indexFigure(COMPLIANCE_STANDARDS.length),
                            },
                        ]}
                    />
                }
            />

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
