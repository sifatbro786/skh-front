// src/components/client/products/CatalogToolbar.jsx
// Result count + sort + the mobile filter trigger. Deliberately not sticky — the
// Navbar already owns the top of the viewport, and stacking two sticky bars on a
// short mobile screen leaves almost no room for the grid.
import { SlidersHorizontal } from "lucide-react";
import { Select } from "../../ui/FormField";
import { PRODUCT_SORTS } from "../../../services/productApi";

export default function CatalogToolbar({
    total = 0,
    page = 1,
    limit = 12,
    loading = false,
    sort = "",
    onSortChange,
    onOpenFilters,
    activeFilterCount = 0,
}) {
    // Range readout ("13–24 of 57") — cheaper to parse than a bare total when
    // you're deep in a paged list.
    const from = total ? (page - 1) * limit + 1 : 0;
    const to = Math.min(page * limit, total);

    return (
        <div className="flex flex-col gap-4 border-b border-border-subtle pb-5 sm:flex-row sm:items-center sm:justify-between">
            <p
                className="text-[13px] text-content-muted"
                aria-live="polite"
                aria-busy={loading || undefined}
            >
                {total ? (
                    <>
                        <span className="font-semibold text-content tabular-nums">
                            {from}–{to}
                        </span>{" "}
                        of <span className="tabular-nums">{total}</span>{" "}
                        {total === 1 ? "style" : "styles"}
                    </>
                ) : loading ? (
                    "Loading styles…"
                ) : (
                    "No styles match these filters"
                )}
            </p>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onOpenFilters}
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-border-strong px-3.5 text-[13px] font-semibold text-content transition-colors hover:border-brand-gold hover:text-brand-gold focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none lg:hidden"
                >
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                    Filters
                    {activeFilterCount ? (
                        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-gold px-1 text-[11px] font-bold text-brand-dark tabular-nums">
                            {activeFilterCount}
                        </span>
                    ) : null}
                </button>

                <label className="flex items-center gap-2.5">
                    <span className="hidden text-[11px] font-bold tracking-[0.18em] text-content-subtle uppercase sm:inline">
                        Sort
                    </span>
                    <Select
                        value={sort}
                        placeholder=""
                        options={PRODUCT_SORTS}
                        onChange={(e) => onSortChange?.(e.target.value)}
                        className="min-w-42"
                    />
                </label>
            </div>
        </div>
    );
}
