// src/pages/client/AboutPage.jsx
// Phase 2 · Task 5a. Route: /about · slug `about`.
//
// Band rhythm: navy header -> director's note (light) -> capability (navy) ->
// milestones (light) -> closing card (light), so the navy footer still closes
// the page against a light section.
//
// PROMISES is intentionally NOT rendered here — the homepage CtaBand already
// owns that trio, and repeating it verbatim two clicks apart is what makes a
// site feel generated rather than written.
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { usePageMeta } from "../../hooks/usePageMeta";
import { useOffices } from "../../hooks/useOffices";
import { SITE } from "../../data/siteContent";
import { STOCK_PHOTOS } from "../../data/stockPhotos";
import { openRfq } from "../../lib/rfqBus";
import PageHeader from "../../components/client/PageHeader";
import IndexPanel, { indexFigure } from "../../components/ui/IndexPanel";
import Button from "../../components/ui/Button";
import {
    CapabilityBand,
    DirectorNote,
    FloorGallery,
    MilestoneLedger,
} from "../../components/client/about";

export default function AboutPage() {
    const { pageMeta } = usePageMeta("about");
    // Offices aren't rendered here, but /api/stats is one request and the hook
    // already normalises it — the numbers below come from the same payload.
    const { stats, loading } = useOffices();

    const currentYear = new Date().getFullYear();
    const years = stats?.yearsInBusiness || Math.max(currentYear - SITE.established, 0);

    const rows = [
        { label: "Partner factories", value: indexFigure(stats?.partnerFactories ?? 0) },
        { label: "Countries served", value: indexFigure(stats?.countriesServed ?? 0) },
        { label: "Team members", value: indexFigure(stats?.teamMembers ?? 0) },
        { label: "Years sourcing", value: indexFigure(years) },
    ];

    const title = pageMeta?.metaTitle || `About — ${SITE.name}`;
    const description =
        pageMeta?.metaDescription ||
        `${SITE.name} is a Dhaka-based apparel sourcing partner with an in-house QC team, a vetted factory network and offices in Bangladesh and Australia.`;

    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
            {pageMeta?.metaKeywords ? (
                <meta name="keywords" content={pageMeta.metaKeywords} />
            ) : null}
            {pageMeta?.canonicalUrl ? <link rel="canonical" href={pageMeta.canonicalUrl} /> : null}

            <PageHeader
                crumb="About"
                title="A buying house, not a broker"
                intro="We sit between your tech pack and the sewing line — allocating the right factory, checking the goods ourselves, and staying on the order until the cartons are on the truck."
                image={STOCK_PHOTOS.sewingFloor}
                aside={<IndexPanel title="The business" rows={rows} loading={loading && !stats} />}
            />

            <DirectorNote />
            <CapabilityBand packagingUnit={stats?.packagingUnit} />
            <FloorGallery />
            <MilestoneLedger />

            {/* Closing card — navy on the light canvas, so the page still ends
                light into the footer without repeating the Compliance closer. */}
            <section className="bg-surface pb-16 sm:pb-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-2xl bg-surface-dark px-6 py-10 sm:px-10 sm:py-12">
                        <span
                            className="absolute top-0 left-0 h-1.5 w-1.5 bg-brand-gold"
                            aria-hidden="true"
                        />
                        <span
                            className="absolute top-0.5 left-0 h-px w-24 bg-brand-gold"
                            aria-hidden="true"
                        />

                        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-xl">
                                <p className="text-[10px] font-bold tracking-[0.28em] text-brand-gold uppercase">
                                    Working together
                                </p>
                                <h2 className="mt-4 font-heading text-2xl leading-tight font-extrabold text-content-inverse sm:text-3xl">
                                    Start with one style. Judge us on that.
                                </h2>
                                <p className="mt-3 text-[15px] leading-relaxed text-content-subtle">
                                    Most of our buyers began with a single trial order. Send the
                                    spec and we&rsquo;ll come back with factory options, costing and
                                    a realistic delivery window.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                                <Button
                                    size="lg"
                                    rightIcon={ArrowRight}
                                    onClick={() => openRfq({ source: "about" })}
                                >
                                    Request a quote
                                </Button>
                                <Button
                                    as={Link}
                                    to="/products"
                                    variant="outline-inverse"
                                    size="lg"
                                >
                                    Browse the catalog
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
