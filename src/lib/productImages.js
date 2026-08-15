// src/lib/productImages.js
// One decision, made once: what does this product actually show?
//
// The seeded catalog ships generated SVG placeholders (a navy plate reading
// "PLACEHOLDER — REPLACE BEFORE LAUNCH"). Rendering those verbatim makes a real
// catalog look broken, so a placeholder is treated as "no photography yet" and
// swapped for a category stand-in — flagged as `isStock` so the UI can say so
// rather than passing a stock photo off as the buyer's style.
//
// Detection is by extension: uploads go through multer as raster files
// (jpg/png/webp), so an .svg under /uploads/products is always a seed artefact.
// The day real photos land, nothing here fires.
import { assetUrl } from "../services/api";
import { CATEGORY_STOCK, CATEGORY_STOCK_FALLBACK } from "../data/stockPhotos";
import { isPlaceholderAsset } from "./placeholders";

/** Stable per-product hash — the same style must not reshuffle between renders. */
const hash = (seed) => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    return Math.abs(h);
};

export const stockForCategory = (category, seed = "") => {
    const pool = CATEGORY_STOCK[category];
    if (!pool?.length) return CATEGORY_STOCK_FALLBACK;
    return pool[hash(String(seed)) % pool.length];
};

/**
 * @returns {{ urls: string[], isStock: boolean }}
 *   `urls` is never empty — a product with no usable photo still gets one
 *   category stand-in, so no surface has to render a "photography pending" box.
 */
export function resolveProductImages(product) {
    const real = (product?.images || []).filter((p) => !isPlaceholderAsset(p)).map(assetUrl);
    const usable = real.filter(Boolean);

    if (usable.length) return { urls: usable, isStock: false };

    // Seed on code first: it's stable and human-assigned, so a reseeded database
    // keeps each style on the photo buyers have already seen.
    const seed = product?.code || product?._id || product?.title || "";
    return { urls: [stockForCategory(product?.category, seed)], isStock: true };
}

/** Convenience for the card, which only ever needs the first frame. */
export function resolveProductThumb(product) {
    const { urls, isStock } = resolveProductImages(product);
    return { url: urls[0], isStock };
}
