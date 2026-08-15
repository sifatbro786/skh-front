// src/components/client/ProductCard.jsx
// Shared by the homepage featured grid and the Task 3 catalog — deliberately one
// level above /home so the catalog doesn't have to import from a home folder.
//
// Markup note: the card is a <div>, not an <a>. The title carries a stretched
// link (`after:absolute after:inset-0`) so the whole card is clickable, while the
// "Request quote" button sits above it on z-10. Nesting a <button> inside an <a>
// is invalid HTML and breaks keyboard activation in Safari.
import { Link } from "react-router-dom";
import { ArrowUpRight, Layers } from "lucide-react";
import { openRfqForProduct } from "../../lib/rfqBus";
import { resolveProductImages } from "../../lib/productImages";

export default function ProductCard({ product, priority = false }) {
    if (!product) return null;

    const { urls, isStock } = resolveProductImages(product);
    const extraImages = isStock ? 0 : Math.max(urls.length - 1, 0);

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface-raised transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-brand-gold/45 hover:shadow-[0_20px_44px_-28px_rgba(15,23,42,0.45)] motion-reduce:hover:translate-y-0">
            <div className="relative aspect-4/5 overflow-hidden bg-surface-inset">
                <img
                    src={urls[0]}
                    alt={product.title}
                    loading={priority ? "eager" : "lazy"}
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
                />
                {/* Grounds the frame so pale flat-lays don't float off the card edge. */}
                <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-brand-dark/25 to-transparent"
                    aria-hidden="true"
                />

                {product.isFeatured ? (
                    <span className="absolute top-3 left-3 rounded-full bg-brand-dark/85 px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] text-brand-gold uppercase backdrop-blur-sm">
                        Featured
                    </span>
                ) : null}

                {isStock ? (
                    // Say it plainly — a buyer must never think this is the style.
                    <span className="absolute right-3 bottom-3 rounded-md bg-brand-dark/70 px-2 py-1 text-[9px] font-semibold tracking-[0.14em] text-white/75 uppercase backdrop-blur-sm">
                        Stock image
                    </span>
                ) : extraImages ? (
                    <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-md bg-brand-dark/70 px-2 py-1 text-[10px] font-semibold text-white/90 tabular-nums backdrop-blur-sm">
                        <Layers className="h-3 w-3" aria-hidden="true" />+{extraImages}
                    </span>
                ) : null}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-brand-gold uppercase">
                        {product.category}
                    </span>
                    {product.code ? (
                        <span className="font-mono text-[11px] tracking-wider text-content-subtle">
                            {product.code}
                        </span>
                    ) : null}
                </div>

                <h3 className="mt-2 font-heading text-[15px] leading-snug font-bold text-content">
                    <Link
                        to={`/products/${product._id}`}
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:text-brand-gold hover:text-brand-gold"
                    >
                        {product.title}
                    </Link>
                </h3>

                {product.fabricDetails ? (
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-content-muted">
                        {product.fabricDetails}
                    </p>
                ) : null}

                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold tracking-[0.16em] text-content-subtle uppercase">
                            MOQ
                        </p>
                        <p className="truncate text-[13px] font-semibold text-content">
                            {product.moq || "On request"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => openRfqForProduct(product)}
                        className="relative z-10 inline-flex shrink-0 items-center gap-1 rounded-lg border border-border-subtle px-3 py-2 text-[12px] font-semibold text-content transition-colors hover:border-brand-gold hover:bg-brand-gold/8 hover:text-brand-gold focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                    >
                        Request quote
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </article>
    );
}
