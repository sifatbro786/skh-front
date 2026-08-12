// src/services/certificationApi.js
import api, { appendField, assetUrl, apiErrorMessage } from "./api";

const CERT_FIELDS = ["title", "issuedBy", "order", "isActive"];

const buildCertForm = ({ logo, pdf, removePdf, ...fields } = {}) => {
    const fd = new FormData();
    CERT_FIELDS.forEach((key) => appendField(fd, key, fields[key]));
    if (logo) fd.append("logo", logo);
    if (pdf) fd.append("pdf", pdf);
    if (removePdf) fd.append("removePdf", "true");
    return fd;
};

export const certificationApi = {
    /**
     * GET /api/certifications (PUBLIC via optionalAuth).
     * includeInactive only takes effect when a valid admin token is attached.
     */
    list: ({ includeInactive = false } = {}) =>
        api
            .get("/certifications", {
                params: includeInactive ? { includeInactive: "true" } : {},
            })
            .then((r) => r.data),

    create: (payload) => api.post("/certifications", buildCertForm(payload)).then((r) => r.data),

    update: (id, payload) =>
        api.patch(`/certifications/${id}`, buildCertForm(payload)).then((r) => r.data),

    /** DELETE /api/certifications/:id — super_admin only */
    remove: (id) => api.delete(`/certifications/${id}`).then((r) => r.data),
};

/** Certification assets live in a PUBLIC uploads dir — direct links are fine. */
export const certLogoUrl = (cert) => assetUrl(cert?.logoPath);
export const certPdfUrl = (cert) => assetUrl(cert?.pdfPath);

/**
 * Multer enforces one permissive size cap (8 MB) across both fields, then the
 * controller re-checks the logo against IMAGE_MAX_BYTES (3 MB). A 4 MB logo
 * therefore passes upload and fails with 413 AFTER the request completes —
 * validate client-side against /api/meta.limits.imageMaxBytes to avoid it.
 */
export const certErrorMessage = (err, fallback = "Could not save the certification") => {
    if (err?.response?.status === 413) {
        return err.response.data?.message || "That file is too large";
    }
    return apiErrorMessage(err, fallback);
};
