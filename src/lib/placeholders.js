// src/lib/placeholders.js
// The seed script writes generated SVG plates (navy box, gold rule, "PLACEHOLDER
// — REPLACE BEFORE LAUNCH") for products and certification logos alike. Real
// uploads go through multer as raster files, so an .svg under /uploads is always
// a seed artefact and never something a client uploaded.
//
// Shared so the product grid and the compliance marquee agree on what counts as
// "no artwork yet" — they degrade differently, but from the same signal.
export const isPlaceholderAsset = (path) => /\.svg(\?|$)/i.test(String(path || ""));
