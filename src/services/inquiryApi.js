/* eslint-disable no-unused-vars */
// src/services/inquiryApi.js
import api, { clean, appendField, apiErrorMessage, saveBlob, filenameFromDisposition } from "./api";

const RFQ_FIELDS = [
    "buyerName",
    "email",
    "companyName",
    "phone",
    "country",
    "buyerType",
    "targetQuantity",
    "message",
    "productId",
];

/**
 * Public RFQ body. `website` is the honeypot — it must be PRESENT and EMPTY.
 * A filled value makes the backend return a fake 201 and discard the row.
 */
const buildInquiryForm = ({ techPackFile, website = "", ...fields } = {}) => {
    const fd = new FormData();
    RFQ_FIELDS.forEach((key) => appendField(fd, key, fields[key]));
    fd.append("website", website);
    if (techPackFile) fd.append("techPackFile", techPackFile);
    return fd;
};

export const inquiryApi = {
    /** POST /api/inquiries (PUBLIC, 8/hr per IP). Also powers the Contact page. */
    submit: (payload) => api.post("/inquiries", buildInquiryForm(payload)).then((r) => r.data),

    /** GET /api/inquiries — { page, limit<=100, status, buyerType, country, from, to, hasTechPack, search } */
    list: (params = {}) => api.get("/inquiries", { params: clean(params) }).then((r) => r.data),

    getById: (id) => api.get(`/inquiries/${id}`).then((r) => r.data),

    /** PATCH /api/inquiries/:id/status — adminNote is truncated to 2000 chars server-side */
    updateStatus: (id, status, adminNote) =>
        api.patch(`/inquiries/${id}/status`, clean({ status, adminNote })).then((r) => r.data),

    /** GET /api/inquiries/:id/techpack — triggers a browser download */
    downloadTechPack: async (id) => {
        const res = await api.get(`/inquiries/${id}/techpack`, { responseType: "blob" });
        saveBlob(
            res.data,
            filenameFromDisposition(res.headers["content-disposition"], `techpack-${id}`),
        );
    },

    /**
     * GET /api/inquiries/export — respects the SAME filter object as list().
     * Hard-capped at 5000 rows server-side (EXPORT_MAX_ROWS).
     */
    exportExcel: async (params = {}) => {
        const { page, limit, ...filters } = params; // pagination is meaningless for an export
        const res = await api.get("/inquiries/export", {
            params: clean(filters),
            responseType: "blob",
        });
        const stamp = new Date().toISOString().slice(0, 10);
        saveBlob(
            res.data,
            filenameFromDisposition(
                res.headers["content-disposition"],
                `skh-inquiries-${stamp}.xlsx`,
            ),
        );
    },

    /** DELETE /api/inquiries/:id — super_admin only */
    remove: (id) => api.delete(`/inquiries/${id}`).then((r) => r.data),
};

/** The 429 copy here is the RFQ limiter (8/hr), not the auth limiter. */
export const inquiryErrorMessage = (err, fallback = "Could not submit your inquiry") =>
    apiErrorMessage(err, fallback);

/** Mirrors backend INQUIRY_STATUS — use /api/meta as the runtime source of truth. */
export const STATUS_STYLES = {
    New: "bg-brand-gold/15 text-brand-gold",
    Contacted: "bg-sky-500/15 text-sky-600",
    "In Progress": "bg-amber-500/15 text-amber-600",
    Closed: "bg-slate-500/15 text-slate-500",
};
