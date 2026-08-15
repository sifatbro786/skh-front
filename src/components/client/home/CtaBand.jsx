// src/components/client/home/CtaBand.jsx
// Page closer: the promise trio as the last reassurance, then the ask.
//
// The ask is a navy card rather than type on the page canvas. As flat light
// text it read as an afterthought at the bottom of a long light stretch — the
// final call to action should be the most deliberate object on the page, and
// the card also gives the light page a considered edge into the navy footer.
import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import Button from "../../ui/Button";
import { PROMISES } from "../../../data/siteContent";
import { openRfq } from "../../../lib/rfqBus";

const LATTICE = {
    backgroundImage:
        "repeating-linear-gradient(90deg, rgba(197,160,89,0.10) 0 1px, transparent 1px 76px)," +
        "repeating-linear-gradient(0deg, rgba(197,160,89,0.07) 0 1px, transparent 1px 76px)",
};

export default function CtaBand({ inquiryEmail = "inquiry@skhsourcing.com" }) {
    return (
        <section className="bg-surface pb-20 sm:pb-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 border-t border-border-subtle pt-14 sm:grid-cols-3">
                    {PROMISES.map(({ icon: Icon, title, body }) => (
                        <div key={title} className="selvedge">
                            <div className="flex items-center gap-2.5">
                                <Icon className="h-4 w-4 text-brand-gold" aria-hidden="true" />
                                <h3 className="font-heading text-[15px] font-bold text-content">
                                    {title}
                                </h3>
                            </div>
                            <p className="mt-2 text-[13.5px] leading-relaxed text-content-muted">
                                {body}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="relative mt-14 overflow-hidden rounded-2xl bg-surface-dark px-6 py-12 sm:px-10 sm:py-14">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-70"
                        style={LATTICE}
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-brand-gold/12 blur-[100px]"
                        aria-hidden="true"
                    />
                    {/* Selvedge corner — the recurring brand mark. */}
                    <span
                        className="absolute top-0 left-0 h-1.5 w-1.5 bg-brand-gold"
                        aria-hidden="true"
                    />
                    <span
                        className="absolute top-0.5 left-0 h-px w-24 bg-brand-gold"
                        aria-hidden="true"
                    />

                    <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-[10px] font-bold tracking-[0.28em] text-brand-gold uppercase">
                                Start an order
                            </p>
                            <h2 className="mt-4 font-heading text-3xl leading-[1.12] font-extrabold tracking-[-0.02em] text-content-inverse sm:text-4xl">
                                Send us a tech pack. Get costing back within a business day.
                            </h2>
                            <p className="mt-4 text-[15px] leading-relaxed text-content-subtle">
                                No account, no minimum enquiry. Tell us the style, quantity and
                                delivery window — we&apos;ll come back with factory options and
                                indicative pricing.
                            </p>
                        </div>

                        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                            <Button
                                size="lg"
                                rightIcon={ArrowRight}
                                onClick={() => openRfq({ source: "home-cta" })}
                            >
                                Request a quote
                            </Button>
                            <Button
                                as="a"
                                href={`mailto:${inquiryEmail}`}
                                variant="outline-inverse"
                                size="lg"
                                leftIcon={Mail}
                            >
                                {inquiryEmail}
                            </Button>
                        </div>
                    </div>

                    <p className="relative mt-8 border-t border-white/10 pt-6 text-[13px] text-content-subtle">
                        Prefer to browse first?{" "}
                        <Link
                            to="/products"
                            className="font-semibold text-brand-gold underline-offset-4 hover:underline"
                        >
                            Open the catalog
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </section>
    );
}
