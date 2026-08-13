// src/components/ui/IndexPanel.jsx
/* eslint-disable react-refresh/only-export-components */
// The line-sheet index as a primitive: label · dotted leader · mono tabular
// figure. First appeared inline in the hero range index and again in the
// Compliance register; Task 5 needs it twice more, so it lives here now.
//
// <dl> is the honest semantic, and its only valid children are dt/dd (or a div
// wrapping them) — the leader rule therefore sits INSIDE the <dt>, not as a
// sibling, which is why this looks slightly odd for a two-column layout.

const NUMBER = new Intl.NumberFormat("en-US");

/** Two-digit line-sheet padding below 100, grouped thousands above it. */
export const indexFigure = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "––";
    return n < 100 ? String(Math.max(0, Math.round(n))).padStart(2, "0") : NUMBER.format(n);
};

export default function IndexPanel({
    title,
    rows = [],
    tone = "dark", // "dark" = on navy, "light" = on the page canvas
    loading = false,
    className = "",
}) {
    const dark = tone === "dark";

    return (
        <div
            className={`rounded-xl border p-5 ${
                dark ? "border-border-dark bg-white/5" : "border-border-subtle bg-surface-raised"
            } ${className}`}
        >
            {title ? (
                <h2
                    className={`font-heading text-[10px] font-bold tracking-[0.26em] uppercase ${
                        dark ? "text-white/45" : "text-content-muted"
                    }`}
                >
                    {title}
                </h2>
            ) : null}

            <dl className={`space-y-2.5 ${title ? "mt-4" : ""}`}>
                {rows.map((row) => (
                    <div key={row.label} className="flex items-baseline gap-3">
                        <dt
                            className={`flex flex-1 items-baseline gap-3 text-[12px] ${
                                dark ? "text-content-subtle" : "text-content-muted"
                            }`}
                        >
                            <span className="whitespace-nowrap">{row.label}</span>
                            <span
                                className={`mb-1 min-w-4 flex-1 border-b border-dotted ${
                                    dark ? "border-white/20" : "border-border-strong"
                                }`}
                                aria-hidden="true"
                            />
                        </dt>
                        <dd className="font-mono text-[13px] whitespace-nowrap text-brand-gold tabular-nums">
                            {loading ? "––" : row.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
