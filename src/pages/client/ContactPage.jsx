// src/pages/client/ContactPage.jsx
// Phase 2 · Task 5b. Route: /contact · slug `contact`.
//
// Offices come from useOffices() — one /api/stats call, merged field-by-field
// over OFFICES_FALLBACK, so the cards render instantly and correctly even if the
// request is slow or the CompanyStats row is half-filled. No clocks here: the
// Footer already runs them site-wide.

import { usePageMeta } from "../../hooks/usePageMeta";
import { useOffices } from "../../hooks/useOffices";
import { SITE } from "../../data/siteContent";
import { STOCK_PHOTOS } from "../../data/stockPhotos";
import PageHeader from "../../components/client/PageHeader";
import Photo from "../../components/ui/Photo";
import { ContactForm, OfficeCards } from "../../components/client/contact";

const NEXT_STEPS = [
    {
        step: "01",
        title: "We read it, not a bot",
        body: "A merchandiser reviews the requirement and picks the factories that actually fit your quantity.",
    },
    {
        step: "02",
        title: "Reply within one business day",
        body: "You get factory options, indicative FOB pricing and a realistic lead time — not a brochure.",
    },
    {
        step: "03",
        title: "Sampling on approval",
        body: "Agree the direction and we move to proto and fit samples, with one contact throughout.",
    },
];

export default function ContactPage() {
    const { pageMeta } = usePageMeta("contact");
    const { offices, stats } = useOffices();

    const au = offices.find((office) => office.id === "au") || offices[1];
    const inquiryEmail =
        stats?.contactDetails?.inquiryEmail || au?.email || "inquiry@skhsourcing.com";

    const title = pageMeta?.metaTitle || `Contact — ${SITE.name}`;
    const description =
        pageMeta?.metaDescription ||
        `Talk to ${SITE.name} about apparel sourcing from Bangladesh. Offices in Dhaka and Liverpool NSW — a merchandiser replies within one business day.`;

    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
            {pageMeta?.metaKeywords ? (
                <meta name="keywords" content={pageMeta.metaKeywords} />
            ) : null}
            {pageMeta?.canonicalUrl ? <link rel="canonical" href={pageMeta.canonicalUrl} /> : null}

            <PageHeader
                crumb="Contact"
                title="Talk to a merchandiser"
                intro="Send the requirement — style, quantity, delivery window — and we'll come back with factory options and costing. No account, no minimum enquiry."
                image={STOCK_PHOTOS.qualityDetail}
            />

            <section className="bg-surface py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14">
                        <div>
                            <ContactForm inquiryEmail={inquiryEmail} />

                            {/* Fills the height the shorter form leaves beside the sticky
                                sidebar, and answers "why trust us" while they wait. */}
                            <div className="relative mt-6 overflow-hidden rounded-2xl border border-border-subtle bg-surface-dark">
                                <Photo
                                    src={STOCK_PHOTOS.sewingFloor}
                                    className="h-48 w-full object-cover sm:h-56"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-brand-dark/90 via-brand-dark/30 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                                    <p className="text-[10px] font-bold tracking-[0.24em] text-brand-gold uppercase">
                                        While you wait
                                    </p>
                                    <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-white/90">
                                        Knitwear, woven, denim and home textiles — every order
                                        checked by our own QC team, never self-certified by the
                                        factory.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <aside className="lg:sticky lg:top-24 lg:self-start">
                            <h2 className="border-b border-border-subtle pb-3 font-heading text-[11px] font-bold tracking-[0.26em] text-content-muted uppercase">
                                Our offices
                            </h2>
                            <OfficeCards offices={offices} className="mt-5" />

                            <h2 className="mt-10 border-b border-border-subtle pb-3 font-heading text-[11px] font-bold tracking-[0.26em] text-content-muted uppercase">
                                What happens next
                            </h2>
                            {/* Numbered because it genuinely is a sequence. */}
                            <ol className="mt-5 space-y-6">
                                {NEXT_STEPS.map((item) => (
                                    <li key={item.step} className="relative">
                                        <span className="font-mono text-[11px] tracking-[0.14em] text-brand-gold tabular-nums">
                                            {item.step}
                                        </span>
                                        <h3 className="mt-1 font-heading text-[14px] font-bold text-content">
                                            {item.title}
                                        </h3>
                                        <p className="mt-1 text-[13px] leading-relaxed text-content-muted">
                                            {item.body}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        </aside>
                    </div>
                </div>
            </section>
        </>
    );
}
