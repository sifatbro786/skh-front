// src/components/auth/AuthShell.jsx
// Split-screen auth chrome + the shared field/alert primitives the three auth
// pages compose. The left panel is hidden below lg so mobile gets the form only.
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, TriangleAlert } from "lucide-react";

const QUOTE = {
    text: "We do not sign off on a shipment we have not inspected ourselves. That is the whole business.",
    author: "MD. Abdul Manzur Kazal",
    role: "Director, SKH Sourcing",
};

export function AuthAlert({ message, tone = "danger" }) {
    if (!message) return null;
    const danger = tone === "danger";
    return (
        <div
            role="alert"
            aria-live="polite"
            className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-[13px] leading-relaxed ${
                danger
                    ? "border-danger/25 bg-danger/8 text-danger"
                    : "border-success/25 bg-success/8 text-success"
            }`}
        >
            {danger ? (
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : null}
            <span>{message}</span>
        </div>
    );
}

export function AuthField({ id, label, type = "text", hint, className = "", ...props }) {
    const [reveal, setReveal] = useState(false);
    const isPassword = type === "password";
    const resolved = isPassword && reveal ? "text" : type;

    return (
        <div className={className}>
            <div className="flex items-baseline justify-between gap-3">
                <label
                    htmlFor={id}
                    className="text-[11px] font-bold tracking-[0.22em] text-content-muted uppercase"
                >
                    {label}
                </label>
                {hint}
            </div>
            <div className="relative mt-2">
                <input
                    id={id}
                    type={resolved}
                    className="h-12 w-full rounded-lg border border-border-subtle bg-surface-inset px-4 pr-11 text-[15px] text-content transition-colors placeholder:text-content-subtle focus:border-brand-gold focus:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-brand-gold/25"
                    {...props}
                />
                {isPassword ? (
                    <button
                        type="button"
                        onClick={() => setReveal((v) => !v)}
                        aria-label={reveal ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-content-subtle transition-colors hover:text-content"
                    >
                        {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export default function AuthShell({ eyebrow, title, description, footer, children }) {
    return (
        <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
            {/* Showcase panel */}
            <aside className="relative hidden overflow-hidden bg-surface-dark lg:flex lg:flex-col lg:justify-between lg:p-14">
                {/* Warp-and-weft field — a textile grid, not a generic dot pattern. */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.13]"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(90deg,#C5A059 0 1px,transparent 1px 14px)," +
                            "repeating-linear-gradient(0deg,#C5A059 0 1px,transparent 1px 14px)",
                    }}
                />
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_0%,transparent,#0f172a_78%)]"
                />

                <div className="relative flex items-center gap-2.5">
                    <img src="/logo.png" alt="logo" className="h-10 w-auto shrink-0" />
                </div>

                <motion.blockquote
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="relative max-w-lg"
                >
                    <p className="font-heading text-[28px] leading-[1.32] font-bold text-content-inverse">
                        “{QUOTE.text}”
                    </p>
                    <footer className="mt-6 flex items-center gap-3">
                        <span className="h-px w-8 bg-brand-gold" />
                        <span className="text-sm font-semibold text-content-inverse">
                            {QUOTE.author}
                        </span>
                        <span className="text-[11px] tracking-[0.2em] text-content-subtle uppercase">
                            {QUOTE.role}
                        </span>
                    </footer>
                </motion.blockquote>

                <dl className="relative grid grid-cols-3 gap-6 border-t border-border-dark pt-8">
                    {[
                        ["Since", "2014"],
                        ["Offices", "Dhaka / Sydney"],
                        ["QC", "In-house"],
                    ].map(([k, v]) => (
                        <div key={k}>
                            <dt className="text-[10px] font-bold tracking-[0.24em] text-content-subtle uppercase">
                                {k}
                            </dt>
                            <dd className="mt-1.5 font-heading text-base font-bold text-content-inverse tabular-nums">
                                {v}
                            </dd>
                        </div>
                    ))}
                </dl>
            </aside>

            {/* Form panel */}
            <main className="flex flex-col justify-center bg-surface px-5 py-12 sm:px-10 lg:px-16">
                <div className="mx-auto w-full max-w-md">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.22em] text-content-muted uppercase transition-colors hover:text-brand-gold"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        Back to site
                    </Link>

                    <div className="mt-10">
                        {eyebrow ? (
                            <span className="text-[10px] font-bold tracking-[0.28em] text-brand-gold uppercase">
                                {eyebrow}
                            </span>
                        ) : null}
                        <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.02em] text-content">
                            {title}
                        </h1>
                        {description ? (
                            <p className="mt-3 text-sm leading-relaxed text-content-muted">
                                {description}
                            </p>
                        ) : null}
                    </div>

                    <div className="mt-8">{children}</div>

                    {footer ? (
                        <div className="mt-8 border-t border-border-subtle pt-6 text-[13px] text-content-muted">
                            {footer}
                        </div>
                    ) : null}
                </div>
            </main>
        </div>
    );
}
