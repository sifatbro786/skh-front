// src/services/contactApi.js
// Contact form talks to POST /api/contact — an email-ONLY endpoint. Nothing is
// persisted and nothing lands in the admin dashboard (that's the RFQ flow in
// inquiryApi.js). JSON, not multipart: contact never carries a file.
import api, { clean, apiErrorMessage } from "./api";

export const contactApi = {
    /**
     * POST /api/contact (PUBLIC, 10/hr per IP).
     * `website` is the honeypot — it must be PRESENT and EMPTY. A filled value
     * gets a fake 200 from the backend and the message is discarded.
     */
    submit: (payload = {}) => {
        const { website = "", ...fields } = payload;
        return api.post("/contact", { ...clean(fields), website }).then((r) => r.data);
    },
};

/** 429-aware message extractor. Backend messages are user-safe — surface verbatim. */
export const contactErrorMessage = (err, fallback = "Could not send your message") =>
    apiErrorMessage(err, fallback);
