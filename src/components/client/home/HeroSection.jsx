// src/components/client/home/HeroSection.jsx
// Editorial hero: a rotating photo backdrop of the actual production floor
// (sewing lines, denim, fabric, QC) under a navy scrim, paired with the
// "range index" — a line-sheet of live catalogue categories — and a small
// stacked photo card so the right column feels grounded in real product,
// not just numbers. Categories are fetched once here and shared by both the
// index and the showcase card instead of each fetching its own copy.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Globe } from "lucide-react";
import Button from "../../ui/Button";
import { useAsync } from "../../../hooks/useAsync";
import { productApi } from "../../../services/productApi";
import { HERO, TARGET_MARKETS } from "../../../data/siteContent";
import { openRfq } from "../../../lib/rfqBus";

// Placeholder editorial stock — swap for real factory/floor photography
// whenever it's shot. Kept as direct CDN URLs (not source.unsplash.com) so
// they don't 302 or drift.
const SLIDES = [
    {
        id: "sewing-floor",
        label: "Modern sewing floor",
        url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=80&auto=format&fit=crop",
    },
    {
        id: "denim-stack",
        label: "Denim & wovens",
        url: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1920&q=80&auto=format&fit=crop",
    },
    {
        id: "quality-detail",
        label: "Fabric & quality detail",
        url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1920&q=80&auto=format&fit=crop",
    },
    {
        id: "fabric-rolls",
        label: "Fabric sourcing",
        url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80&auto=format&fit=crop",
    },
];

const LATTICE = {
    backgroundImage:
        "repeating-linear-gradient(90deg, rgba(197,160,89,0.10) 0 1px, transparent 1px 76px)," +
        "repeating-linear-gradient(0deg, rgba(197,160,89,0.07) 0 1px, transparent 1px 76px)",
};

const SHOWCASE_FALLBACK = [{ name: "Knitwear" }, { name: "Denim & Wovens" }];

/** Rows shown in the range index — keeps the hero to roughly one screen. */
const RANGE_ROWS = 5;

/** Skips indices already known to 404, so a dead photo can't stall the rotation. */
const advance = (current, broken) => {
    for (let step = 1; step <= SLIDES.length; step++) {
        const next = (current + step) % SLIDES.length;
        if (!broken.has(next)) return next;
    }
    return current;
};

function HeroBackdrop({ active, broken, onError, reduced }) {
    return (
        <div className="pointer-events-none absolute inset-0 bg-brand-dark" aria-hidden="true">
            {SLIDES.map((slide, i) => (
                <motion.div
                    key={slide.id}
                    className="absolute inset-0 overflow-hidden"
                    animate={{ opacity: i === active && !broken.has(i) ? 1 : 0 }}
                    transition={{ duration: 1.4, ease: "easeInOut" }}
                >
                    <motion.img
                        src={slide.url}
                        alt=""
                        onError={() => onError(i)}
                        className="h-full w-full object-cover"
                        animate={{ scale: reduced ? 1 : i === active ? 1.09 : 1 }}
                        transition={{ duration: 7, ease: "linear" }}
                    />
                </motion.div>
            ))}

            {/* Below lg the columns stack, so text runs full-width — a uniform
                overlay there, then left-to-right once the image sits beside it. */}
            <div className="absolute inset-0 bg-linear-to-b from-brand-dark/88 via-brand-dark/74 to-brand-dark/60 lg:bg-linear-to-r lg:from-brand-dark/90 lg:via-brand-dark/65 lg:to-brand-dark/30" />
            <div className="absolute inset-0 bg-linear-to-t from-brand-dark/60 via-transparent to-transparent" />
            {/* Faint weave motif — the old lattice, now a texture over real fabric. */}
            <div className="absolute inset-0 opacity-[0.07]" style={LATTICE} />
            <div className="absolute -top-32 -right-24 h-104 w-104 rounded-full bg-brand-gold/10 blur-[110px]" />
        </div>
    );
}

function RangeIndex({ rows, loading, showCounts }) {
    return (
        <aside className="rounded-2xl border border-white/15 bg-white/6 p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:p-6">
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
                    {Array.from({ length: RANGE_ROWS }).map((_, i) => (
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
                                className="group/row flex items-baseline gap-3 border-b border-white/5 py-2.5 transition-colors last:border-b-0 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                            >
                                <span className="w-6 shrink-0 font-mono text-[11px] text-brand-gold/70 tabular-nums">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="text-[13.5px] font-medium text-content-inverse transition-colors group-hover/row:text-brand-gold">
                                    {cat.name}
                                </span>
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

/** Two overlapping photo cards — a mood-board pairing, not a symmetric grid. */
function CategoryShowcase({ rows }) {
    const [front, back] = rows.length ? rows : SHOWCASE_FALLBACK;

    return (
        <div className="relative mb-8 h-40 sm:h-48">
            <div className="absolute top-6 right-2 z-0 h-28 w-24  overflow-hidden rounded-xl border border-white/15 shadow-xl sm:h-39.5 sm:w-30">
                <img
                    src={SLIDES[1].url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-brand-dark/85 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[9px] font-bold tracking-wide text-white/90 uppercase">
                    {back?.name}
                </span>
            </div>

            <div className="absolute top-6 left-0 z-10 h-34 w-[72%] overflow-hidden rounded-2xl border border-white/15 shadow-2xl sm:h-40">
                <img
                    src={SLIDES[0].url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-brand-dark/90 via-brand-dark/5 to-transparent" />
                <span className="absolute bottom-3 left-3 font-heading text-sm font-bold text-white">
                    {front?.name}
                </span>
            </div>
        </div>
    );
}

export default function HeroSection() {
    const reduced = useReducedMotion();
    const [active, setActive] = useState(0);
    const [broken, setBroken] = useState(() => new Set());

    const { data, loading } = useAsync(() => productApi.categories(), []);
    const all = data?.categories || [];
    const stocked = all.filter((c) => c.count > 0);
    // Capped at four: the index is a taste of the range, not the range itself,
    // and every extra row pushes the hero taller than one screen. "Full catalog"
    // at the foot of the panel is the way to the rest.
    const rows = (stocked.length ? stocked : all).slice(0, RANGE_ROWS);
    const showCounts = stocked.length > 0;

    useEffect(() => {
        if (reduced) return;
        const id = setInterval(() => setActive((i) => advance(i, broken)), 6000);
        return () => clearInterval(id);
    }, [reduced, broken]);

    // A frame that 404s shouldn't leave the hero parked on a blank slide —
    // hop to the next live one immediately instead of waiting for the timer.
    const markBroken = (i) => {
        setBroken((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
        setActive((current) =>
            current === i ? advance(current, new Set(broken).add(i)) : current,
        );
    };

    return (
        <section className="relative overflow-hidden bg-surface-dark pt-14 pb-24 sm:pt-20 sm:pb-32">
            <HeroBackdrop active={active} broken={broken} onError={markBroken} reduced={reduced} />

            <div className="relative mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start lg:gap-16 lg:px-8">
                <motion.div
                    initial={reduced ? false : { opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h1 className="max-w-3xl font-heading text-[2.5rem] leading-[1.05] font-extrabold tracking-[-0.035em] text-content-inverse sm:text-6xl lg:text-[4rem]">
                        {HERO.title}
                    </h1>

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
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {TARGET_MARKETS.map((market) => (
                                <li
                                    key={market}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-white/60 uppercase transition-colors hover:border-brand-gold/40 hover:text-brand-gold"
                                >
                                    <Globe
                                        className="h-3 w-3 text-brand-gold/70"
                                        aria-hidden="true"
                                    />
                                    {market}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                <motion.div
                    initial={reduced ? false : { opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                    <CategoryShowcase rows={rows} />
                    <RangeIndex rows={rows} loading={loading} showCounts={showCounts} />
                </motion.div>
            </div>
        </section>
    );
}
