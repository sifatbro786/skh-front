// src/pages/client/PrivacyPage.jsx
// Route: /privacy · slug `privacy` (no CMS row is seeded — usePageMeta 404s to
// the static fallbacks below, same as every other interior page's cold path).
//
// Template policy tailored to SKH's actual data flows (RFQ/contact forms, tech
// pack uploads, dual BD/AU processing). Have counsel review before launch — the
// clause structure is production-shaped, the wording is a starting point.
import { usePageMeta } from "../../hooks/usePageMeta";
import { SITE, OFFICES_FALLBACK } from "../../data/siteContent";
import PageHeader from "../../components/client/PageHeader";

const LAST_UPDATED = "13 August 2026";
const INQUIRY_EMAIL = "inquiry@skhsourcing.com";
const PRIMARY_EMAIL = "kazal@skhsourcing.com";

/** Clause block — mono `01` index + heading, on the same selvedge rhythm as the
 *  milestone ledger and product line sheets. */
function Clause({ n, title, children }) {
    return (
        <section className="border-t border-border-subtle pt-8 first:border-t-0 first:pt-0">
            <div className="flex items-baseline gap-3">
                <span className="font-mono text-[12px] font-semibold text-brand-gold tabular-nums">
                    {n}
                </span>
                <h2 className="font-heading text-[19px] leading-snug font-bold text-content">
                    {title}
                </h2>
            </div>
            <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-content-muted">
                {children}
            </div>
        </section>
    );
}

export default function PrivacyPage() {
    const { pageMeta } = usePageMeta("privacy");

    const title = pageMeta?.metaTitle || `Privacy Policy — ${SITE.name}`;
    const description =
        pageMeta?.metaDescription ||
        `How ${SITE.name} collects, uses and protects the information you share through our sourcing inquiries and website.`;

    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
            {pageMeta?.metaKeywords ? <meta name="keywords" content={pageMeta.metaKeywords} /> : null}
            {pageMeta?.canonicalUrl ? <link rel="canonical" href={pageMeta.canonicalUrl} /> : null}

            <PageHeader
                crumb="Privacy"
                title="Privacy Policy"
                intro="How we handle the information you share when you request a quote, contact us, or browse the SKH Sourcing website."
            />

            <section className="bg-surface py-14 sm:py-20">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <p className="text-[13px] tracking-[0.14em] text-content-subtle uppercase tabular-nums">
                        Last updated · {LAST_UPDATED}
                    </p>

                    <div className="mt-10 space-y-8">
                        <Clause n="01" title="Who we are">
                            <p>
                                {SITE.name} is an apparel and textile sourcing partner operating from
                                offices in Dhaka, Bangladesh and Liverpool, NSW, Australia. This
                                policy applies to {SITE.domains[0]} and {SITE.domains[1]} and to the
                                inquiries submitted through them.
                            </p>
                        </Clause>

                        <Clause n="02" title="Information we collect">
                            <p>We collect only what we need to respond to your business:</p>
                            <ul className="list-disc space-y-1.5 pl-5">
                                <li>
                                    <span className="text-content">Information you provide</span> —
                                    when you submit a quote request or contact form: your name,
                                    company, email, phone, country, buyer type, target quantity, your
                                    message, and any tech pack or reference file you choose to upload.
                                </li>
                                <li>
                                    <span className="text-content">Usage information</span> — basic
                                    technical data such as IP address, browser type and pages
                                    visited, collected through cookies and analytics to keep the site
                                    working and improve it.
                                </li>
                            </ul>
                        </Clause>

                        <Clause n="03" title="How we use your information">
                            <p>We use the information you provide to:</p>
                            <ul className="list-disc space-y-1.5 pl-5">
                                <li>respond to your inquiry and prepare costings and quotations;</li>
                                <li>
                                    manage the sourcing relationship and communicate about your
                                    order or programme;
                                </li>
                                <li>operate, secure and improve the website;</li>
                                <li>meet legal, tax and record-keeping obligations.</li>
                            </ul>
                            <p>
                                Our lawful basis is your request and our legitimate interest in
                                running a sourcing business. We do not use your data for automated
                                decision-making.
                            </p>
                        </Clause>

                        <Clause n="04" title="Tech packs & confidential materials">
                            <p>
                                Design files, tech packs and artwork you send are treated as
                                confidential. They are shared only with the specific manufacturing
                                partners we evaluate for your project, and only to the extent needed
                                to quote or produce your order. Any intellectual property in those
                                materials remains yours.
                            </p>
                        </Clause>

                        <Clause n="05" title="Cookies & analytics">
                            <p>
                                We use essential cookies required for the site to function and, where
                                enabled, analytics cookies to understand aggregate usage. You can
                                control or clear cookies through your browser settings; disabling
                                non-essential cookies will not affect your ability to send an
                                inquiry.
                            </p>
                        </Clause>

                        <Clause n="06" title="Sharing & disclosure">
                            <p>
                                We share your information only with vetted manufacturing partners and
                                service providers (for example, email and hosting providers) strictly
                                to fulfil your request. We do not sell your personal information. We
                                may disclose information where required by law or to protect our legal
                                rights.
                            </p>
                        </Clause>

                        <Clause n="07" title="Data retention & security">
                            <p>
                                We keep your information only as long as needed for the purposes above
                                or as required by law, then delete or anonymise it. We apply
                                reasonable technical and organisational safeguards; however, no method
                                of transmission or storage is completely secure.
                            </p>
                        </Clause>

                        <Clause n="08" title="International transfers">
                            <p>
                                As we operate from Bangladesh and Australia, your information may be
                                processed in either country. By submitting an inquiry you consent to
                                this cross-border processing, carried out under this policy.
                            </p>
                        </Clause>

                        <Clause n="09" title="Your rights">
                            <p>
                                You may request access to, correction of, or deletion of the personal
                                information we hold about you, and you may ask us to stop contacting
                                you. To exercise any of these, contact us using the details below and
                                we will respond within a reasonable period.
                            </p>
                        </Clause>

                        <Clause n="10" title="Contact us">
                            <p>Questions about this policy or your data can be sent to:</p>
                            <ul className="space-y-1.5">
                                <li>
                                    <a
                                        href={`mailto:${INQUIRY_EMAIL}`}
                                        className="text-brand-gold hover:underline"
                                    >
                                        {INQUIRY_EMAIL}
                                    </a>{" "}
                                    ·{" "}
                                    <a
                                        href={`mailto:${PRIMARY_EMAIL}`}
                                        className="text-brand-gold hover:underline"
                                    >
                                        {PRIMARY_EMAIL}
                                    </a>
                                </li>
                                {OFFICES_FALLBACK.map((office) => (
                                    <li key={office.id} className="text-[13.5px]">
                                        <span className="text-content">{office.label}:</span>{" "}
                                        {office.address}
                                    </li>
                                ))}
                            </ul>
                        </Clause>
                    </div>
                </div>
            </section>
        </>
    );
}
