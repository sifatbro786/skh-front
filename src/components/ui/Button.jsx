// src/components/ui/Button.jsx
// Multi-variant button. `as` allows <Link as> / <a as> without losing styling.
// React 19: `ref` is a plain prop, no forwardRef wrapper needed.
//
// Phase 2 change: added `outline-inverse`. The existing `outline` variant sets
// text-content (near-black) and border-border-strong, which is invisible on the
// navy hero. Overriding those through className would be a coin flip — two
// utilities for the same CSS property resolve by stylesheet order, not by the
// order they appear in the class attribute — so it has to be a real variant.
import { Loader2 } from "lucide-react";

const BASE =
    "relative inline-flex items-center justify-center gap-2 rounded-lg font-semibold " +
    "transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-out " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-55 " +
    "active:translate-y-0 motion-reduce:transform-none";

const VARIANTS = {
    primary:
        "bg-brand-gold text-brand-gold-light shadow-[0_4px_14px_-6px_rgba(197,160,89,0.75)] " +
        "hover:bg-brand-gold-hover hover:-translate-y-px hover:shadow-[0_8px_20px_-8px_rgba(197,160,89,0.85)]",
    secondary: "bg-surface-dark text-content-inverse hover:bg-brand-navy hover:-translate-y-px",
    outline:
        "border border-border-strong bg-transparent text-content hover:border-brand-gold hover:text-brand-gold",
    "outline-inverse":
        "border border-white/25 bg-transparent text-content-inverse " +
        "hover:border-brand-gold hover:bg-white/5 hover:text-brand-gold",
    ghost: "bg-transparent text-content-muted hover:bg-surface-inset hover:text-content",
    danger: "bg-danger text-white hover:brightness-110",
};

const SIZES = {
    sm: "h-9 px-3.5 text-[13px]",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-7 text-[15px]",
};

export default function Button({
    as: Tag = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon: Left,
    rightIcon: Right,
    className = "",
    children,
    ...props
}) {
    const isNative = Tag === "button";
    // Fallback so a typo'd variant degrades to a styled button instead of
    // interpolating the string "undefined" into className.
    const variantClass = VARIANTS[variant] || VARIANTS.primary;
    const sizeClass = SIZES[size] || SIZES.md;

    return (
        <Tag
            {...(isNative ? { type: props.type || "button", disabled: disabled || loading } : {})}
            aria-busy={loading || undefined}
            data-loading={loading ? "" : undefined}
            className={`${BASE} ${variantClass} ${sizeClass} ${fullWidth ? "w-full" : ""} ${className}`}
            {...props}
        >
            {loading && <Loader2 className="absolute h-4 w-4 animate-spin" aria-hidden="true" />}
            {/* Children stay mounted so the button never changes width mid-request. */}
            <span className={`inline-flex items-center gap-2 ${loading ? "invisible" : ""}`}>
                {Left ? <Left className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
                {children}
                {Right ? <Right className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
            </span>
        </Tag>
    );
}
