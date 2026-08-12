// src/components/ui/SectionHeading.jsx
// Editorial heading: micro-label chip, selvedge-ruled title, optional trailing action.
export default function SectionHeading({
    eyebrow,
    title,
    subtitle,
    align = "left",
    tone = "light", // "light" | "dark" (on bg-surface-dark)
    action,
    className = "",
}) {
    const dark = tone === "dark";
    const centered = align === "center";

    return (
        <div
            className={`flex flex-col gap-5 ${
                action ? "md:flex-row md:items-end md:justify-between" : ""
            } ${className}`}
        >
            <div className={`max-w-2xl ${centered ? "mx-auto text-center" : ""}`}>
                {eyebrow ? (
                    <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] ${
                            dark
                                ? "border-border-dark bg-white/5 text-brand-gold"
                                : "border-border-subtle bg-surface-inset text-content-muted"
                        }`}
                    >
                        <span className="h-1 w-1 bg-brand-gold" aria-hidden="true" />
                        {eyebrow}
                    </span>
                ) : null}

                <h2
                    className={`mt-4 font-heading text-3xl leading-[1.12] font-extrabold tracking-[-0.02em] sm:text-4xl ${
                        dark ? "text-content-inverse" : "text-content"
                    } ${centered ? "" : "selvedge"}`}
                >
                    {title}
                </h2>

                {subtitle ? (
                    <p
                        className={`mt-4 text-[15px] leading-relaxed ${
                            centered ? "" : "pl-5"
                        } ${dark ? "text-content-subtle" : "text-content-muted"}`}
                    >
                        {subtitle}
                    </p>
                ) : null}
            </div>

            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}
