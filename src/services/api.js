import axios from "axios";

/** Bare origin (no /api) — needed to resolve "/uploads/..." asset paths. */
export const API_ORIGIN = String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const api = axios.create({
    baseURL: `${API_ORIGIN}/api`, // <-- was `${import.meta.env.VITE_API_URL}`
    headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "mpg_token";

export const tokenStore = {
    get: () => localStorage.getItem(TOKEN_KEY),
    set: (t) => localStorage.setItem(TOKEN_KEY, t),
    clear: () => localStorage.removeItem(TOKEN_KEY),
};

api.interceptors.request.use((config) => {
    const token = tokenStore.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Multipart: the browser must set Content-Type itself so the boundary is
    // present. The instance-level JSON default would otherwise corrupt every
    // upload (products, tech packs, certification logos).
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const res = error?.response;

        // responseType:"blob" downloads (xlsx export, tech pack) return a Blob
        // even on a 4xx JSON error — rehydrate it so apiErrorMessage works.
        if (res?.data instanceof Blob && res.data.type?.includes("json")) {
            try {
                res.data = JSON.parse(await res.data.text());
            } catch {
                /* leave the blob as-is */
            }
        }

        const url = error?.config?.url || "";
        if (res?.status === 401 && !url.includes("/auth/login")) tokenStore.clear();
        return Promise.reject(error);
    },
);

/* ------------------------- Shared module helpers ------------------------ */

/** "/uploads/products/x.webp" -> "http://localhost:5000/uploads/products/x.webp" */
export const assetUrl = (publicPath) =>
    !publicPath
        ? null
        : /^https?:\/\//i.test(publicPath)
          ? publicPath
          : `${API_ORIGIN}${publicPath}`;

/** Drop undefined/null/"" so query strings stay clean and filters stay optional. */
export const clean = (params = {}) =>
    Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== "") acc[k] = v;
        return acc;
    }, {});

/** Append to FormData, preserving "" (a legitimate field clear) but not null/undefined. */
export const appendField = (fd, key, value) => {
    if (value === undefined || value === null) return;
    fd.append(key, typeof value === "boolean" ? String(value) : value);
};

/** 429-aware message extractor. Backend messages are user-safe — surface verbatim. */
export const apiErrorMessage = (err, fallback = "Something went wrong") => {
    if (err?.response?.status === 429) {
        return err.response.data?.message || "Too many requests, please slow down";
    }
    return err?.response?.data?.message || fallback;
};

/** Content-Disposition -> filename (handles RFC 5987 UTF-8 form). */
export const filenameFromDisposition = (disposition, fallback) => {
    if (!disposition) return fallback;
    const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
    if (utf8) return decodeURIComponent(utf8[1]);
    const plain = /filename="?([^";]+)"?/i.exec(disposition);
    return plain ? plain[1] : fallback;
};

export const saveBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000); // Safari needs the tick
};

export default api;
