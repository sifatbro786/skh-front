// src/hooks/useOffices.js
// /api/stats is upsert-on-read, so `contactDetails` exists but individual fields
// can be blank until someone fills the admin form. Merging field-by-field over
// OFFICES_FALLBACK means a half-filled record can never render an office card
// with an empty address — the same merge the Footer does inline.
import { useMemo } from "react";
import { useAsync } from "./useAsync";
import { statsApi, toOffices } from "../services/statsApi";
import { OFFICES_FALLBACK } from "../data/siteContent";

export const mergeOffices = (stats) => {
    if (!stats?.contactDetails) return OFFICES_FALLBACK;
    const live = toOffices(stats);
    return OFFICES_FALLBACK.map((fallback) => {
        const hit = live.find((office) => office.id === fallback.id) || {};
        // Drop empty/undefined live values so they don't overwrite a good fallback.
        const filled = Object.fromEntries(Object.entries(hit).filter(([, value]) => value));
        return { ...fallback, ...filled };
    });
};

export function useOffices() {
    const { data, loading, error, retry } = useAsync(() => statsApi.get(), []);
    const stats = data?.stats || null;
    const offices = useMemo(() => mergeOffices(stats), [stats]);
    return { offices, stats, loading, error, retry };
}

export default useOffices;
