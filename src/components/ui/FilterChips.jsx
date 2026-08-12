// src/components/ui/FilterChips.jsx
// Applied-filter row. Each chip states the field it came from ("Category:
// Denim") so the row is readable on its own — a bare "Denim" chip next to a bare
// "hoodie" chip tells you nothing about which control produced it.
import { X } from "lucide-react";

export default function FilterChips({ items = [], onClearAll, className = "" }) {
    const active = items.filter(Boolean);
    if (!active.length) return null;

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            {active.map((item) => (
                <span
                    key={item.key}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-raised py-1 pr-1 pl-3 text-[12px] font-medium text-content"
                >
                    {item.field ? <span className="text-content-subtle">{item.field}:</span> : null}
                    <span className="max-w-56 truncate">{item.label}</span>
                    <button
                        type="button"
                        onClick={item.onRemove}
                        aria-label={`Remove filter ${item.field ? `${item.field}: ` : ""}${item.label}`}
                        className="grid h-5 w-5 place-items-center rounded-full text-content-subtle transition-colors hover:bg-brand-gold/15 hover:text-brand-gold focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                    >
                        <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                </span>
            ))}

            {active.length > 1 && onClearAll ? (
                <button
                    type="button"
                    onClick={onClearAll}
                    className="text-[12px] font-semibold text-brand-gold underline-offset-4 hover:underline"
                >
                    Clear all
                </button>
            ) : null}
        </div>
    );
}
