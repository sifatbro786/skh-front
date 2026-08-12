// src/components/client/home/HeroSection.jsx
// Asymmetric editorial hero on navy.
//
// The right column is the signature: a "range index" — a line sheet of the
// catalogue categories with live counts from GET /api/products/categories,
// styled like the index page of a buyer's range plan (numbered rows, dotted
// leaders, tabular figures). It's decoration that is also navigation: every row
// deep-links into the filtered catalog.
//
// Background is a warp/weft lattice in CSS — literally the structure of woven
// fabric, and zero image assets to ship or lazy-load.
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Button from "../../ui/Button";
import { useAsync } from "../../../hooks/useAsync";
import { productApi } from "../../../services/productApi";
import { HERO, TARGET_MARKETS } from "../../../data/siteContent";
import { openRfq } from "../../../lib/rfqBus";

const LATTICE = {
    backgroundImage:
        "repeating-linear-gradient(90deg, rgba(197,160,89,0.10) 0 1px, transparent 1px 76px)," +
        "repeating-linear-gradient(0deg, rgba(197,160,89,0.07) 0 1px, transparent 1px 76px)",
    maskImage: "radial-gradient(120% 90% at 78% 8%, #000 0%, transparent 72%)",
    WebkitMaskImage: "radial-gradient(120% 90% at 78% 8%, #000 0%, transparent 72%)",
};

function RangeIndex() {
    const { data, loading } = useAsync(() => productApi.categories(), []);
    const all = data?.categories || [];

    // Don't advertise empty categories — but on a freshly seeded database every
    // count is 0, so fall back to the full list without figures rather than
    // rendering an empty panel.
    const stocked = all.filter((c) => c.count > 0);
    const rows = stocked.length ? stocked : all;
    const showCounts = stocked.length > 0;

    return (
        <aside className="rounded-2xl border border-white/10 bg-white/3 p-5 backdrop-blur-sm sm:p-6">
            <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
                <h2 className="font-heading text-[13px] font-bold tracking-[0.22em] text-content-inverse uppercase">
                    Range Index
                </h2>
                <span className="text-[10px] font-semibold tracking-[0.16em] text-brand-gold uppercase">
                    {showCounts ? "Live styles" : "Categories"}
                </span>
            </div>

            {loading && !rows.length ? (
                <ul className="mt-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <li
                            key={i}
                            className="flex items-center gap-4 border-b border-white/5 py-3"
                        >
                            <span className="h-2.5 w-6 rounded bg-white/10" />
                            <span className="h-2.5 flex-1 rounded bg-white/8" />
                        </li>
                    ))}
                </ul>
            ) : (
                <ul className="mt-1">
                    {rows.map((cat, i) => (
                        <li key={cat.name}>
                            <Link
                                to={`/products?category=${encodeURIComponent(cat.name)}`}
                                className="group/row flex items-baseline gap-3 border-b border-white/5 py-2.5 transition-colors last:border-b-0 hover:bg-white/3 focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                            >
                                <span className="w-6 shrink-0 font-mono text-[11px] text-brand-gold/70 tabular-nums">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="text-[13.5px] font-medium text-content-inverse transition-colors group-hover/row:text-brand-gold">
                                    {cat.name}
                                </span>
                                {/* Dotted leader — the line-sheet detail. */}
                                <span
                                    className="mb-1 min-w-4 flex-1 border-b border-dotted border-white/20"
                                    aria-hidden="true"
                                />
                                <span className="font-mono text-[12px] text-white/45 tabular-nums">
                                    {showCounts ? String(cat.count).padStart(2, "0") : "—"}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            <Link
                to="/products"
                className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.14em] text-brand-gold uppercase underline-offset-4 hover:underline"
            >
                Full catalog
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
        </aside>
    );
}

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-surface-dark pt-14 pb-28 sm:pt-20 sm:pb-36">
            <div
                className="pointer-events-none absolute inset-0"
                style={LATTICE}
                aria-hidden="true"
            />
            {/* Single warm light source, top-right — keeps the navy from reading flat. */}
            <div
                className="pointer-events-none absolute -top-32 -right-24 h-104 w-104 rounded-full bg-brand-gold/10 blur-[110px]"
                aria-hidden="true"
            />

            <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:px-8">
                <div>
                    <span className="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-[10px] font-bold tracking-[0.22em] text-content-inverse uppercase">
                        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-gold opacity-60 motion-reduce:hidden" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-gold" />
                        </span>
                        {HERO.eyebrow}
                    </span>

                    <h1 className="mt-6 max-w-3xl font-heading text-[2.5rem] leading-[1.05] font-extrabold tracking-[-0.035em] text-content-inverse sm:text-6xl lg:text-[4rem]">
                        {HERO.title}
                    </h1>

                    {/* The selvedge device, laid horizontal. */}
                    <div className="mt-7 flex items-center gap-2" aria-hidden="true">
                        <span className="h-1.5 w-1.5 bg-brand-gold" />
                        <span className="h-px w-24 bg-linear-to-r from-brand-gold to-transparent" />
                    </div>

                    <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-content-subtle sm:text-base">
                        {HERO.subtitle}
                    </p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button
                            size="lg"
                            rightIcon={ArrowRight}
                            onClick={() => openRfq({ source: "hero" })}
                            className="w-full sm:w-auto"
                        >
                            {HERO.primaryCta.label}
                        </Button>
                        <Button
                            as={Link}
                            to={HERO.secondaryCta.to}
                            variant="outline-inverse"
                            size="lg"
                            className="w-full sm:w-auto"
                        >
                            {HERO.secondaryCta.label}
                        </Button>
                    </div>

                    <div className="mt-10 border-t border-white/10 pt-6">
                        <p className="text-[13px] leading-relaxed text-content-subtle">
                            {HERO.trustLine}
                        </p>
                        <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                            {TARGET_MARKETS.map((market) => (
                                <li
                                    key={market}
                                    className="text-[10px] font-bold tracking-[0.2em] text-white/35 uppercase"
                                >
                                    {market}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <RangeIndex />
            </div>
        </section>
    );
}
