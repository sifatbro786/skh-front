// src/services/pageMetaApi.js
import api from "./api";

export const pageMetaApi = {
    /** GET /api/page-meta  (optional ?page&limit&search) */
    getAll: (params = {}) => api.get("/page-meta", { params }).then((r) => r.data),

    /** GET /api/page-meta/:id */
    getById: (id) => api.get(`/page-meta/${id}`).then((r) => r.data),

    /** POST /api/page-meta
     *  { pageName, pageSlug, metaTitle, metaDescription, metaKeywords,
     *    canonicalUrl, isActive } */
    create: (payload) => api.post("/page-meta", payload).then((r) => r.data),

    /** PATCH /api/page-meta/:id  — [VERIFY] switch to api.put if your route uses PUT */
    update: (id, payload) => api.patch(`/page-meta/${id}`, payload).then((r) => r.data),

    /** DELETE /api/page-meta/:id */
    remove: (id) => api.delete(`/page-meta/${id}`).then((r) => r.data),
};

/** [VERIFY] Tolerant extractor — returns the array regardless of envelope key. */
export const normalizePageMetaList = (res) =>
    res?.pageMetas ?? res?.pages ?? res?.data ?? res?.items ?? [];

export const pageMetaErrorMessage = (err, fallback = "Something went wrong") =>
    err?.response?.data?.message || fallback;
