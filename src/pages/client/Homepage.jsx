// src/pages/client/Homepage.jsx
// Composition only — every section owns its own fetch, so /api/stats,
// /api/products, /api/products/categories and /api/certifications go out in
// parallel and one failure can't blank the page.
import { usePageMeta } from "../../hooks/usePageMeta";
import { SITE } from "../../data/siteContent";
import {
    HeroSection,
    StatsBand,
    TrustStrip,
    ServicesGrid,
    FeaturedProducts,
    ProcessRail,
    SourcingNetwork,
    CtaBand,
} from "../../components/client/home";

export default function Homepage() {
    const { pageMeta } = usePageMeta("home");

    // Fallbacks matter: React 19 hoists these to <head> verbatim, so an
    // unseeded PageMeta row would otherwise ship an empty <title> and a
    // <link rel="canonical" href> with no value.
    const title = pageMeta?.metaTitle || `${SITE.name} — ${SITE.tagline}`;
    const description =
        pageMeta?.metaDescription ||
        "B2B apparel sourcing from Bangladesh: knitwear, woven, denim, outerwear and home textiles, with in-house quality inspection and compliant partner factories.";

    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
            {pageMeta?.metaKeywords ? (
                <meta name="keywords" content={pageMeta.metaKeywords} />
            ) : null}
            {pageMeta?.canonicalUrl ? <link rel="canonical" href={pageMeta.canonicalUrl} /> : null}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />

            <HeroSection />
            <StatsBand />
            <TrustStrip />
            <ServicesGrid />
            <FeaturedProducts />
            <ProcessRail />
            <SourcingNetwork />
            <CtaBand />
        </>
    );
}
