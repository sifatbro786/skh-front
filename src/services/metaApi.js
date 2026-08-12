// src/services/metaApi.js
import api from "./api";

/**
 * /api/meta is a static, unauthenticated enum payload — the single source of
 * truth for every dropdown, filter chip and upload limit. Cached in-module so
 * the RFQ modal, catalog filters and admin forms share one round-trip per
 * page load instead of N.
 */
let cache = null;
let inflight = null;

export const metaApi = {
    get: async ({ force = false } = {}) => {
        if (!force && cache) return cache;
        if (!force && inflight) return inflight;

        inflight = api
            .get("/meta")
            .then((r) => {
                cache = r.data.meta;
                return cache;
            })
            .finally(() => {
                inflight = null;
            });

        return inflight;
    },

    peek: () => cache,
    reset: () => {
        cache = null;
    },
};

/** Fallbacks so a form can render before /api/meta resolves. Backend still validates. */
export const META_FALLBACK = {
    productCategories: [
        "Knitwear",
        "Woven",
        "Denim",
        "Outerwear",
        "Sportswear",
        "Home Textile",
        "Accessories",
        "Yarn",
    ],
    buyerTypes: ["Importer", "Wholesaler", "Retailer", "Private Label", "Other"],
    inquiryStatuses: ["New", "Contacted", "In Progress", "Closed"],
    targetMarkets: ["Australia", "Europe", "North America", "Middle East", "Asia", "Africa"],
    limits: {
        productMaxImages: 8,
        imageMaxBytes: 3 * 1024 * 1024,
        techPackMaxBytes: 10 * 1024 * 1024,
        techPackAllowedMime: [],
    },
};

export const humanBytes = (bytes) =>
    !bytes ? "—" : `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`;

/** Client-side guard so an oversized file never burns a rate-limit slot. */
export const validateUpload = (file, { maxBytes, allowedMime = [] } = {}) => {
    if (!file) return null;
    if (maxBytes && file.size > maxBytes) return `File is too large (max ${humanBytes(maxBytes)})`;
    if (allowedMime.length && !allowedMime.includes(file.type)) return "Unsupported file type";
    return null;
};
