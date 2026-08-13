// src/components/client/PageHeader.jsx
/* eslint-disable react-refresh/only-export-components */
// The navy page header used by every interior client page: warp/weft lattice,
// breadcrumb, h1, intro, and an optional aside slot on the right.
//
// Extracted in Task 5 — ProductsPage and CompliancePage each carried their own
// copy of the LATTICE object and the breadcrumb markup, which is three places to
// fix a spacing bug. Those two can migrate to this at any time; the markup and
// class names here are byte-for-byte what they already render.
import { Link } from "react-router-dom";
import Photo from "../ui/Photo";

export const LATTICE = {
    backgroundImage:
        "repeating-linear-gradient(90deg, rgba(197,160,89,0.09) 0 1px, transparent 1px 76px)," +
        "repeating-linear-gradient(0deg, rgba(197,160,89,0.06) 0 1px, transparent 1px 76px)",
    maskImage: "radial-gradient(120% 120% at 85% 0%, #000 0%, transparent 70%)",
    WebkitMaskImage: "radial-gradient(120% 120% at 85% 0%, #000 0%, transparent 70%)",
};

export default function PageHeader({ crumb, title, intro, aside, image, children }) {
    return (
        <section className="relative overflow-hidden bg-surface-dark pt-10 pb-12 sm:pt-14 sm:pb-16">
            {image ? (
                <>
                    <Photo
                        src={image}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    {/* Same dark scrim on every frame — a static band, not the hero's
                        reveal, so it stays a quiet backdrop for the h1. */}
                    <div className="absolute inset-0 bg-linear-to-b from-brand-dark/92 via-brand-dark/88 to-brand-dark/92" />
                </>
            ) : null}
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
                        <li className="text-brand-gold">{crumb}</li>
                    </ol>
                </nav>

                <div
                    className={`mt-6 grid gap-10 ${
                        aside ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end" : ""
                    }`}
                >
                    <div>
                        <h1 className="font-heading text-4xl leading-[1.08] font-extrabold tracking-[-0.03em] text-content-inverse sm:text-5xl">
                            {title}
                        </h1>
                        {intro ? (
                            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-content-subtle">
                                {intro}
                            </p>
                        ) : null}
                    </div>

                    {aside ? <div className="lg:justify-self-end lg:w-full">{aside}</div> : null}
                </div>

                {children}
            </div>
        </section>
    );
}
