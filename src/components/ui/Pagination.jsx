// src/components/ui/Pagination.jsx
// Windowed pager: first, last, current ±1, ellipsis for the gaps. Renders real
// <button>s rather than links so the catalog can keep page state in the URL
// without a full navigation per click.
import { ChevronLeft, ChevronRight } from "lucide-react";

/** [1, "…", 4, 5, 6, "…", 20] — de-duped, clamped, gaps marked. */
const buildRange = (page, pages) => {
    const wanted = new Set([1, pages, page - 1, page, page + 1]);

    // Keep the window a stable width at either end so the control doesn't
    // visibly resize as you walk through the first or last few pages.
    if (page <= 3) [2, 3, 4].forEach((n) => wanted.add(n));
    if (page >= pages - 2) [pages - 1, pages - 2, pages - 3].forEach((n) => wanted.add(n));

    const sorted = [...wanted].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);

    return sorted.reduce((acc, n, i) => {
        if (i && n - sorted[i - 1] > 1) acc.push({ gap: true });
        acc.push({ page: n });
        return acc;
    }, []);
};

const CELL =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-[13px] font-semibold " +
    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50";

export default function Pagination({ page = 1, pages = 1, onChange, className = "" }) {
    if (!pages || pages <= 1) return null;

    const current = Math.min(Math.max(page, 1), pages);
    const go = (next) => {
        if (next < 1 || next > pages || next === current) return;
        onChange?.(next);
    };

    return (
        <nav
            aria-label="Catalog pages"
            className={`flex flex-wrap items-center justify-center gap-1.5 ${className}`}
        >
            <button
                type="button"
                onClick={() => go(current - 1)}
                disabled={current === 1}
                aria-label="Previous page"
                className={`${CELL} border border-border-subtle text-content-muted hover:border-brand-gold hover:text-brand-gold disabled:pointer-events-none disabled:opacity-40`}
            >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            {buildRange(current, pages).map((item, i) =>
                item.gap ? (
                    <span
                        key={`gap-${i}`}
                        className="px-1 text-content-subtle select-none"
                        aria-hidden="true"
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={item.page}
                        type="button"
                        onClick={() => go(item.page)}
                        aria-current={item.page === current ? "page" : undefined}
                        aria-label={`Page ${item.page}`}
                        className={`${CELL} tabular-nums ${
                            item.page === current
                                ? "bg-brand-dark text-content-inverse"
                                : "border border-border-subtle text-content-muted hover:border-brand-gold hover:text-brand-gold"
                        }`}
                    >
                        {item.page}
                    </button>
                ),
            )}

            <button
                type="button"
                onClick={() => go(current + 1)}
                disabled={current === pages}
                aria-label="Next page"
                className={`${CELL} border border-border-subtle text-content-muted hover:border-brand-gold hover:text-brand-gold disabled:pointer-events-none disabled:opacity-40`}
            >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
        </nav>
    );
}
