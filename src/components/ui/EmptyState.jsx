// src/components/ui/EmptyState.jsx
// Empty is an invitation to act, not a shrug — always offer the next step.
import { Inbox } from "lucide-react";

export default function EmptyState({
    icon: Icon = Inbox,
    title = "Nothing here yet",
    description,
    action,
    secondaryAction,
    compact = false,
    className = "",
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-raised text-center ${
                compact ? "px-6 py-10" : "px-8 py-16"
            } ${className}`}
        >
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-inset">
                <span
                    className="absolute inset-0 rounded-full ring-1 ring-brand-gold/25"
                    aria-hidden="true"
                />
                <Icon className="h-6 w-6 text-brand-gold" aria-hidden="true" />
            </span>

            <h3 className="mt-5 font-heading text-lg font-bold text-content">{title}</h3>
            {description ? (
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-content-muted">
                    {description}
                </p>
            ) : null}

            {action || secondaryAction ? (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {action}
                    {secondaryAction}
                </div>
            ) : null}
        </div>
    );
}
