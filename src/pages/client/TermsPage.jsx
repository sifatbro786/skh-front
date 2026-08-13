// src/pages/client/TermsPage.jsx
// Route: /terms · slug `terms`. Same cold-path/meta pattern as PrivacyPage.
//
// Template terms tailored to a B2B sourcing site: the catalog is representative,
// quotes are indicative until contracted, buyer IP in tech packs is preserved.
// Have counsel review before launch.
import { usePageMeta } from "../../hooks/usePageMeta";
import { SITE } from "../../data/siteContent";
import PageHeader from "../../components/client/PageHeader";

const LAST_UPDATED = "13 August 2026";
const INQUIRY_EMAIL = "inquiry@skhsourcing.com";

/** Clause block — shared visual language with the privacy page. */
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

export default function TermsPage() {
    const { pageMeta } = usePageMeta("terms");

    const title = pageMeta?.metaTitle || `Terms & Conditions — ${SITE.name}`;
    const description =
        pageMeta?.metaDescription ||
        `The terms that govern your use of the ${SITE.name} website and the inquiries you submit through it.`;

    return (
        <>
            <title>{title}</title>
            <meta name="description" content={description} />
            {pageMeta?.metaKeywords ? <meta name="keywords" content={pageMeta.metaKeywords} /> : null}
            {pageMeta?.canonicalUrl ? <link rel="canonical" href={pageMeta.canonicalUrl} /> : null}

            <PageHeader
                crumb="Terms"
                title="Terms & Conditions"
                intro="The terms that apply when you use the SKH Sourcing website and submit inquiries through it. Please read them before relying on any information here."
            />

            <section className="bg-surface py-14 sm:py-20">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <p className="text-[13px] tracking-[0.14em] text-content-subtle uppercase tabular-nums">
                        Last updated · {LAST_UPDATED}
                    </p>

                    <div className="mt-10 space-y-8">
                        <Clause n="01" title="Acceptance of these terms">
                            <p>
                                By accessing or using {SITE.domains[0]} you agree to these terms. If
                                you do not agree, please do not use the site. These terms apply to all
                                visitors and to anyone submitting an inquiry.
                            </p>
                        </Clause>

                        <Clause n="02" title="The service we provide">
                            <p>
                                {SITE.name} is a business-to-business sourcing and buying house. This
                                website is an informational and inquiry platform. Product listings,
                                specifications, MOQs and images are representative examples of our
                                capability — not stock offered for sale. Any pricing, lead time or
                                availability is indicative only and does not become binding until
                                confirmed in a signed order or contract.
                            </p>
                        </Clause>

                        <Clause n="03" title="Use of the site">
                            <p>You agree to use the site lawfully and, in particular, not to:</p>
                            <ul className="list-disc space-y-1.5 pl-5">
                                <li>
                                    submit false, misleading or third-party information you have no
                                    right to share;
                                </li>
                                <li>
                                    scrape, copy or systematically extract content except as normal
                                    browsing allows;
                                </li>
                                <li>
                                    interfere with the operation or security of the site or upload
                                    malicious files.
                                </li>
                            </ul>
                        </Clause>

                        <Clause n="04" title="Inquiries & submissions">
                            <p>
                                When you send a quote request, contact message or tech pack, you
                                confirm you own or are authorised to share those materials. Any
                                intellectual property in your designs, artwork and tech packs remains
                                yours; we use them solely to evaluate and service your request. Do not
                                submit another party&rsquo;s confidential information without their
                                permission.
                            </p>
                        </Clause>

                        <Clause n="05" title="Intellectual property">
                            <p>
                                All content on this site — text, graphics, product photography, logos
                                and the &ldquo;{SITE.name}&rdquo; name and marks — is owned by {" "}
                                {SITE.name} or its licensors and is protected by law. You may not
                                reproduce, distribute or create derivative works from it without our
                                prior written permission.
                            </p>
                        </Clause>

                        <Clause n="06" title="Third-party links">
                            <p>
                                The site may link to third-party websites or resources. We do not
                                control and are not responsible for their content, availability or
                                practices, and a link does not imply endorsement.
                            </p>
                        </Clause>

                        <Clause n="07" title="Disclaimers">
                            <p>
                                The site is provided on an &ldquo;as is&rdquo; and &ldquo;as
                                available&rdquo; basis. While we work to keep information accurate, we
                                make no warranty that the content — including specifications, pricing
                                or lead times — is complete, current or error-free, and none of it
                                constitutes a binding commitment until contracted.
                            </p>
                        </Clause>

                        <Clause n="08" title="Limitation of liability">
                            <p>
                                To the fullest extent permitted by law, {SITE.name} is not liable for
                                any indirect, incidental or consequential loss arising from your use
                                of, or reliance on, this website. Nothing in these terms excludes any
                                liability that cannot lawfully be excluded.
                            </p>
                        </Clause>

                        <Clause n="09" title="Indemnity">
                            <p>
                                You agree to indemnify {SITE.name} against claims, losses and costs
                                arising from your breach of these terms or from materials you submit
                                that infringe a third party&rsquo;s rights.
                            </p>
                        </Clause>

                        <Clause n="10" title="Governing law">
                            <p>
                                These terms are governed by the laws of Bangladesh, and the courts of
                                Dhaka have jurisdiction over any dispute. Our Australian operations are
                                additionally subject to applicable local law where relevant.
                            </p>
                        </Clause>

                        <Clause n="11" title="Changes to these terms">
                            <p>
                                We may update these terms from time to time. The &ldquo;last
                                updated&rdquo; date above reflects the current version, and continued
                                use of the site after a change means you accept the revised terms.
                            </p>
                        </Clause>

                        <Clause n="12" title="Contact us">
                            <p>
                                Questions about these terms can be sent to{" "}
                                <a
                                    href={`mailto:${INQUIRY_EMAIL}`}
                                    className="text-brand-gold hover:underline"
                                >
                                    {INQUIRY_EMAIL}
                                </a>
                                .
                            </p>
                        </Clause>
                    </div>
                </div>
            </section>
        </>
    );
}
