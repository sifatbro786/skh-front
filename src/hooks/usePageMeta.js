/* eslint-disable react-hooks/set-state-in-effect */
// src/hooks/usePageMeta.js  — REPLACE the body of the effect
import { useState, useEffect } from "react";
import api from "../services/api";

export const usePageMeta = (pageSlug) => {
    const [pageMeta, setPageMeta] = useState(null);
    const [loading, setLoading] = useState(Boolean(pageSlug));
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!pageSlug) {
            setLoading(false);
            return;
        }
        let active = true;
        setLoading(true);
        setError(null);

        api.get(`/page-meta/slug/${encodeURIComponent(pageSlug)}`)
            .then(({ data }) => {
                if (active) setPageMeta(data.pageMeta || null);
            })
            .catch((err) => {
                if (!active) return;
                // 404 = no row seeded for this slug yet. Render without meta.
                if (err?.response?.status !== 404) setError(err.message);
                setPageMeta(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [pageSlug]);

    return { pageMeta, loading, error };
};
