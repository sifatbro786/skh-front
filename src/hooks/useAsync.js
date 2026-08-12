/* eslint-disable react-hooks/set-state-in-effect */
// src/hooks/useAsync.js
// One place for the alive-flag / loading / error boilerplate every client
// section repeats. Sections fetch independently on purpose: the homepage makes
// four parallel GETs instead of one waterfall, and a failing /api/certifications
// can't blank the featured products.
import { useEffect, useState } from "react";

export function useAsync(task, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nonce, setNonce] = useState(0);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError(null);

        // Promise.resolve().then() so a task that throws synchronously still
        // lands in .catch instead of escaping the effect.
        Promise.resolve()
            .then(task)
            .then((result) => alive && setData(result))
            .catch((err) => alive && setError(err))
            .finally(() => alive && setLoading(false));

        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, nonce]);

    return { data, loading, error, retry: () => setNonce((n) => n + 1) };
}

export default useAsync;
