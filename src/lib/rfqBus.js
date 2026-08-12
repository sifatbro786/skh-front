// src/lib/rfqBus.js
// The RFQ opener is a cross-cutting concern: Navbar, hero CTA, product cards,
// product detail and the 404 page all fire it. Keeping it in Navbar.jsx meant a
// product card had to import from Navbar to open a modal it does not own — this
// is the same event contract, just with a neutral home.
//
// ClientLayout is the only listener. Detail shape:
//   { productId?: string, product?: Product, source?: string }
// `product` is optional and purely cosmetic (thumbnail + code chip); `productId`
// is the only thing that reaches the backend.

export const RFQ_EVENT = "skh:request-quote";

export const openRfq = (detail = {}) =>
    window.dispatchEvent(new CustomEvent(RFQ_EVENT, { detail }));

/** Convenience for product cards / detail page. */
export const openRfqForProduct = (product, source = "product-card") =>
    openRfq({ productId: product?._id, product, source });
