// src/components/ui/FormField.jsx
// Form primitives shared by the RFQ modal, the Contact page and (later) every
// admin form. One control = one visual contract, so validation styling never
// drifts between the public site and the console.
import { useId, useRef, useState } from "react";
import { FileUp, Paperclip, X } from "lucide-react";

const CONTROL =
    "w-full rounded-lg border bg-surface-raised text-sm text-content placeholder:text-content-subtle " +
    "transition-[border-color,box-shadow] duration-150 outline-none " +
    "focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/25 " +
    "disabled:cursor-not-allowed disabled:bg-surface-inset disabled:opacity-60";

const tone = (invalid) =>
    invalid
        ? "border-danger focus:border-danger focus:ring-danger/20"
        : "border-border-strong hover:border-content-subtle";

/* ------------------------------- Wrapper -------------------------------- */

export function Field({
    label,
    htmlFor,
    required = false,
    hint,
    error,
    counter, // e.g. "120 / 5000"
    className = "",
    children,
}) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label ? (
                <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor={htmlFor} className="text-[13px] font-semibold text-content">
                        {label}
                        {required ? (
                            <span className="ml-0.5 text-brand-gold" aria-hidden="true">
                                *
                            </span>
                        ) : null}
                    </label>
                    {counter ? (
                        <span className="text-[11px] tabular-nums text-content-subtle">
                            {counter}
                        </span>
                    ) : null}
                </div>
            ) : null}

            {children}

            {error ? (
                <p
                    id={htmlFor ? `${htmlFor}-error` : undefined}
                    role="alert"
                    className="text-[12px] font-medium text-danger"
                >
                    {error}
                </p>
            ) : hint ? (
                <p className="text-[12px] leading-relaxed text-content-subtle">{hint}</p>
            ) : null}
        </div>
    );
}

/* ------------------------------- Controls ------------------------------- */

export function TextInput({ invalid = false, className = "", ...props }) {
    return (
        <input
            {...props}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid && props.id ? `${props.id}-error` : props["aria-describedby"]}
            className={`${CONTROL} ${tone(invalid)} h-11 px-3.5 ${className}`}
        />
    );
}

export function TextArea({ invalid = false, rows = 4, className = "", ...props }) {
    return (
        <textarea
            {...props}
            rows={rows}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid && props.id ? `${props.id}-error` : props["aria-describedby"]}
            className={`${CONTROL} ${tone(invalid)} resize-y px-3.5 py-2.5 leading-relaxed ${className}`}
        />
    );
}

export function Select({
    invalid = false,
    options = [],
    placeholder = "Select…",
    className = "",
    ...props
}) {
    return (
        <div className="relative">
            <select
                {...props}
                aria-invalid={invalid || undefined}
                className={`${CONTROL} ${tone(invalid)} h-11 appearance-none pr-9 pl-3.5 ${className}`}
            >
                {placeholder ? <option value="">{placeholder}</option> : null}
                {options.map((opt) => {
                    const value = typeof opt === "string" ? opt : opt.value;
                    const label = typeof opt === "string" ? opt : opt.label;
                    return (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    );
                })}
            </select>
            <svg
                className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-content-subtle"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="m6 8 4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}

/* ------------------------------ File input ------------------------------ */

const prettySize = (bytes) =>
    bytes < 1024 * 1024
        ? `${Math.max(1, Math.round(bytes / 1024))} KB`
        : `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`;

/**
 * Single-file picker with drag-and-drop. Validation stays with the caller so the
 * limits can come from /api/meta rather than being hard-coded here.
 */
export function FileInput({
    id,
    file,
    onSelect,
    onClear,
    accept,
    invalid = false,
    disabled = false,
    label = "Drop a file or browse",
    hint,
}) {
    const inputRef = useRef(null);
    const fallbackId = useId();
    const inputId = id || fallbackId;
    const [dragging, setDragging] = useState(false);

    const pick = (list) => {
        const next = list?.[0];
        if (next) onSelect?.(next);
    };

    if (file) {
        return (
            <div
                className={`flex items-center gap-3 rounded-lg border bg-surface-inset px-3.5 py-3 ${
                    invalid ? "border-danger" : "border-border-subtle"
                }`}
            >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand-gold/12 text-brand-gold">
                    <Paperclip className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-content">{file.name}</p>
                    <p className="text-[11px] text-content-subtle">{prettySize(file.size)}</p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        if (inputRef.current) inputRef.current.value = "";
                        onClear?.();
                    }}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-content-subtle transition-colors hover:bg-surface-raised hover:text-danger focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                    aria-label={`Remove ${file.name}`}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <>
            <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept={accept}
                disabled={disabled}
                className="sr-only"
                onChange={(e) => pick(e.target.files)}
            />
            <label
                htmlFor={inputId}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!disabled) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    if (!disabled) pick(e.dataTransfer.files);
                }}
                className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-6 text-center transition-colors ${
                    disabled ? "cursor-not-allowed opacity-60" : ""
                } ${
                    invalid
                        ? "border-danger bg-danger/5"
                        : dragging
                          ? "border-brand-gold bg-brand-gold/8"
                          : "border-border-strong bg-surface-inset/60 hover:border-brand-gold hover:bg-brand-gold/5"
                }`}
            >
                <FileUp className="h-5 w-5 text-brand-gold" aria-hidden="true" />
                <span className="text-[13px] font-medium text-content">{label}</span>
                {hint ? <span className="text-[11px] text-content-subtle">{hint}</span> : null}
            </label>
        </>
    );
}
