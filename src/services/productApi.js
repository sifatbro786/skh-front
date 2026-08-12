// src/services/productApi.js
import api, { clean, appendField, apiErrorMessage } from "./api";

/**
 * Multipart body for create/update.
 *
 * `code` is deliberately dropped when blank: the schema index is
 * `unique + sparse`, and sparse only skips null/missing — two products saved
 * with code:"" would collide with a 409. Blank => omit => backend auto-assigns
 * SKH-00001 via nextSequence().
 */
const buildProductForm = ({ images = [], removeImages, replaceImages, code, ...fields } = {}) => {
    const fd = new FormData();

    Object.entries(fields).forEach(([key, value]) => appendField(fd, key, value));
    if (code && String(code).trim()) fd.append("code", String(code).trim());

    // asArray() on the backend parses a JSON string — deterministic regardless
    // of how many entries there are (repeated fields collapse to a string at 1).
    if (Array.isArray(removeImages) && removeImages.length) {
        fd.append("removeImages", JSON.stringify(removeImages));
    }
    if (replaceImages) fd.append("replaceImages", "true");

    Array.from(images).forEach((file) => fd.append("images", file));
    return fd;
};

export const productApi = {
    /** GET /api/products — { page, limit<=60, category, search, sort, featured, includeInactive } */
    list: (params = {}) => api.get("/products", { params: clean(params) }).then((r) => r.data),

    /** GET /api/products/categories → [{ name, count }] (active products only) */
    categories: () => api.get("/products/categories").then((r) => r.data),

    /** GET /api/products/:id — 404s for inactive rows unless a valid token is sent */
    getById: (id) => api.get(`/products/${id}`).then((r) => r.data),

    /** POST /api/products (multipart, field "images", max 8) */
    create: (payload) => api.post("/products", buildProductForm(payload)).then((r) => r.data),

    /** PATCH /api/products/:id — pass replaceImages OR removeImages[], never a naive re-POST */
    update: (id, payload) =>
        api.patch(`/products/${id}`, buildProductForm(payload)).then((r) => r.data),

    /** PATCH /api/products/:id/featured — server-side toggle, no body */
    toggleFeatured: (id) => api.patch(`/products/${id}/featured`).then((r) => r.data),

    /** DELETE /api/products/:id — super_admin only (403 otherwise) */
    remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
};

export const productErrorMessage = (err, fallback = "Could not complete the product request") =>
    apiErrorMessage(err, fallback);

export const PRODUCT_SORTS = [
    { value: "", label: "Featured first" },
    { value: "oldest", label: "Oldest first" },
    { value: "title", label: "Title (A–Z)" },
];
