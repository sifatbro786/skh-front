// src/components/client/home/CtaBand.jsx
// Page closer. Deliberately quiet: the hero's range index and the process rail
// carry the visual weight, so this is type, a gold rule and two actions.
// The promise trio sits above it as the last piece of reassurance before the ask.
import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import Button from "../../ui/Button";
import { PROMISES } from "../../../data/siteContent";
import { openRfq } from "../../../lib/rfqBus";

export default function CtaBand({ inquiryEmail = "inquiry@skhsourcing.com" }) {
    return (
        <section className="bg-surface py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-3">
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

                <div className="mt-16 flex flex-col gap-8 border-t border-border-subtle pt-12 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <h2 className="font-heading text-3xl leading-[1.12] font-extrabold tracking-[-0.02em] text-content sm:text-4xl">
                            Send us a tech pack. Get costing back within a business day.
                        </h2>
                        <p className="mt-4 text-[15px] leading-relaxed text-content-muted">
                            No account, no minimum enquiry. Tell us the style, quantity and delivery
                            window — we&apos;ll come back with factory options and indicative
                            pricing.
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
                            variant="outline"
                            size="lg"
                            leftIcon={Mail}
                        >
                            {inquiryEmail}
                        </Button>
                    </div>
                </div>

                <p className="mt-6 text-[13px] text-content-subtle">
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
        </section>
    );
}
