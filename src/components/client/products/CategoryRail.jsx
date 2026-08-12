// src/components/client/products/CategoryRail.jsx
// The catalog's category filter, styled as the same line sheet the homepage hero
// uses — dotted leaders, tabular counts — so the two surfaces read as one system.
// Rendered twice: as a sticky desktop sidebar and inside the mobile filter sheet.
//
// Buttons, not links: the page keeps its state in the query string and updates it
// with `replace`/`push` deliberately, so an <a href> here would fight the router.
export default function CategoryRail({
    categories = [],
    active = "",
    total = 0,
    onSelect,
    className = "",
}) {
    const rows = [{ name: "", label: "All styles", count: total }, ...categories];

    return (
        <nav aria-label="Filter by category" className={className}>
            <h2 className="border-b border-border-subtle pb-3 font-heading text-[11px] font-bold tracking-[0.26em] text-content-muted uppercase">
                Categories
            </h2>

            <ul className="mt-1">
                {rows.map((row) => {
                    const isActive = (row.name || "") === active;
                    const empty = row.name && !row.count;

                    return (
                        <li key={row.name || "all"}>
                            <button
                                type="button"
                                onClick={() => onSelect?.(row.name)}
                                disabled={empty}
                                aria-current={isActive ? "true" : undefined}
                                className={`group flex w-full items-baseline gap-3 border-b border-border-subtle/60 py-2.5 text-left transition-colors last:border-b-0 focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none ${
                                    empty ? "cursor-not-allowed opacity-40" : ""
                                }`}
                            >
                                <span
                                    className={`h-3.5 w-0.5 shrink-0 transition-colors ${
                                        isActive ? "bg-brand-gold" : "bg-transparent"
                                    }`}
                                    aria-hidden="true"
                                />
                                <span
                                    className={`text-[13.5px] transition-colors ${
                                        isActive
                                            ? "font-bold text-content"
                                            : "font-medium text-content-muted group-hover:text-brand-gold"
                                    }`}
                                >
                                    {row.label || row.name}
                                </span>
                                <span
                                    className="mb-1 min-w-4 flex-1 border-b border-dotted border-border-strong"
                                    aria-hidden="true"
                                />
                                <span
                                    className={`font-mono text-[12px] tabular-nums ${
                                        isActive ? "text-brand-gold" : "text-content-subtle"
                                    }`}
                                >
                                    {String(row.count ?? 0).padStart(2, "0")}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
