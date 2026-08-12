/* eslint-disable react-hooks/set-state-in-effect */
// src/components/common/RfqModal.jsx
// The single RFQ surface for the whole public site. Mounted once in
// ClientLayout; opened from anywhere via `openRfq()` (src/lib/rfqBus.js).
//
// Contract notes that drove the implementation:
//  - POST /api/inquiries is multipart and rate-limited to 8/hr per IP. A 429 is
//    a normal outcome here, not an exception — it gets its own terminal state
//    with a mailto escape hatch instead of a red toast.
//  - `website` is the honeypot. It must be PRESENT and EMPTY for humans; if a
//    bot fills it the backend returns a fake 201, so we render success either
//    way and never leak the trap.
//  - buyerType is an enum with NO empty member. `pickFields` keeps "" through to
//    Mongoose, so an unselected value would 400 — it is seeded to "Other".
//  - Field maxlengths mirror the Inquiry schema so the user hits the ceiling in
//    the UI, not in a validation error.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Clock3,
    Mail,
    Package,
    Send,
    ShieldCheck,
    TriangleAlert,
} from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Field, FileInput, Select, TextArea, TextInput } from "../ui/FormField";
import { inquiryApi, inquiryErrorMessage } from "../../services/inquiryApi";
import { META_FALLBACK, humanBytes, metaApi, validateUpload } from "../../services/metaApi";
import { assetUrl } from "../../services/api";

/* ------------------------------ Form model ------------------------------ */

const EMPTY = {
    buyerName: "",
    email: "",
    companyName: "",
    phone: "",
    country: "",
    buyerType: "Other", // never "" — see header note
    targetQuantity: "",
    message: "",
};

// Mirrors Inquiry schema maxlengths.
const MAX = {
    buyerName: 120,
    companyName: 160,
    phone: 40,
    country: 80,
    targetQuantity: 120,
    message: 5000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const STEPS = [
    { id: "contact", label: "Your details", fields: ["buyerName", "email"] },
    { id: "brief", label: "Sourcing brief", fields: ["message"] },
    { id: "review", label: "Review & send", fields: [] },
];

const validateStep = (index, values) => {
    const errors = {};
    if (index === 0) {
        if (!values.buyerName.trim()) errors.buyerName = "Tell us who to address the quote to";
        if (!values.email.trim()) errors.email = "We send the quotation to this address";
        else if (!EMAIL_RE.test(values.email.trim())) errors.email = "Check the email format";
    }
    if (index === 1) {
        const message = values.message.trim();
        if (!message) errors.message = "Describe what you need — styles, fabric, timeline";
        else if (message.length < 15) errors.message = "Add a little more detail (15+ characters)";
    }
    return errors;
};

const MIME_LABEL = {
    "application/pdf": "PDF",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/vnd.ms-excel": "XLS",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "application/zip": "ZIP",
    "application/x-zip-compressed": "ZIP",
};

/* ------------------------------ Sub-views ------------------------------- */

function StepRail({ current, total, label }) {
    return (
        <div className="px-5 pb-4 sm:px-7">
            <div className="flex items-center gap-1.5" aria-hidden="true">
                {Array.from({ length: total }, (_, i) => (
                    <span
                        key={i}
                        className={`h-0.75 flex-1 rounded-full transition-colors duration-300 ${
                            i <= current ? "bg-brand-gold" : "bg-border-subtle"
                        }`}
                    />
                ))}
            </div>
            <p className="mt-2 text-[11px] font-semibold tracking-[0.14em] text-content-subtle uppercase">
                <span aria-live="polite">
                    Step {current + 1} of {total} — {label}
                </span>
            </p>
        </div>
    );
}

function ProductChip({ product, productId }) {
    if (!product && !productId) return null;
    const thumb = assetUrl(product?.images?.[0]);

    return (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-brand-gold/25 bg-brand-gold/6 p-3">
            {thumb ? (
                <img
                    src={thumb}
                    alt=""
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
            ) : (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-brand-gold/12 text-brand-gold">
                    <Package className="h-5 w-5" aria-hidden="true" />
                </span>
            )}
            <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-brand-gold uppercase">
                    Quoting
                </p>
                <p className="truncate text-sm font-semibold text-content">
                    {product?.title || "Selected product"}
                </p>
                <p className="truncate text-[12px] text-content-muted">
                    {[product?.code, product?.category].filter(Boolean).join(" · ") ||
                        "Reference attached to your request"}
                </p>
            </div>
        </div>
    );
}

function SummaryRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex gap-3 border-b border-border-subtle py-2.5 last:border-0">
            <dt className="w-32 shrink-0 text-[12px] font-medium text-content-subtle sm:w-36">
                {label}
            </dt>
            <dd className="min-w-0 flex-1 text-[13px] wrap-break-word whitespace-pre-wrap text-content">
                {value}
            </dd>
        </div>
    );
}

/* -------------------------------- Modal --------------------------------- */

export default function RfqModal({ open, context, onClose }) {
    const reduce = useReducedMotion();
    const [meta, setMeta] = useState(() => metaApi.peek() || META_FALLBACK);
    const [step, setStep] = useState(0);
    const [values, setValues] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [website, setWebsite] = useState(""); // honeypot — humans leave this empty
    const [submitting, setSubmitting] = useState(false);
    const [failure, setFailure] = useState(null); // { status, message }
    const [result, setResult] = useState(null);

    const stepRef = useRef(null);
    const prevStepRef = useRef(0);
    const submittedRef = useRef(false);
    const productId = context?.productId || context?.product?._id || "";
    const product = context?.product || null;
    const limits = meta?.limits || META_FALLBACK.limits;
    const rateLimited = failure?.status === 429;

    const accept = useMemo(() => {
        const mimes = limits.techPackAllowedMime || [];
        return mimes.length ? mimes.join(",") : ".pdf,.doc,.docx,.xls,.xlsx,.zip";
    }, [limits.techPackAllowedMime]);

    const acceptHint = useMemo(() => {
        const mimes = limits.techPackAllowedMime || [];
        const labels = [...new Set(mimes.map((m) => MIME_LABEL[m]).filter(Boolean))];
        const kinds = labels.length ? labels.join(", ") : "PDF, DOC, XLS, ZIP";
        return `${kinds} · up to ${humanBytes(limits.techPackMaxBytes)}`;
    }, [limits.techPackAllowedMime, limits.techPackMaxBytes]);

    /* /api/meta is module-cached — this is one round-trip per page load, shared
       with the catalog filters and admin forms. */
    useEffect(() => {
        if (!open) return;
        let alive = true;
        metaApi
            .get()
            .then((next) => alive && next && setMeta(next))
            .catch(() => {
                /* META_FALLBACK already rendered; the backend still validates. */
            });
        return () => {
            alive = false;
        };
    }, [open]);

    /* Re-opening returns to step 1 with the typed values intact (a buyer often
       quotes a second product), but a completed submission starts clean.
       The ref keeps the reset out of a state updater — StrictMode double-invokes
       those, and a setState inside one is a side effect. */
    useEffect(() => {
        if (!open) return;
        setStep(0);
        setErrors({});
        setFailure(null);
        if (submittedRef.current) {
            submittedRef.current = false;
            setResult(null);
            setValues(EMPTY);
            setFile(null);
            setFileError("");
        }
    }, [open, context]);

    /* Focus the first control of each new step so keyboard users don't tab back
       up through the header. Skipped on open — Modal parks focus on the panel,
       and auto-focusing a text field would throw up the mobile keyboard over
       the sheet before the user has read anything. */
    useEffect(() => {
        if (!open || result) return;
        if (prevStepRef.current === step) return;
        prevStepRef.current = step;
        stepRef.current
            ?.querySelector("input:not([type='hidden']):not(.sr-only), textarea, select")
            ?.focus?.({ preventScroll: true });
    }, [step, open, result]);

    const setValue = useCallback((name, value) => {
        setValues((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
    }, []);

    const handleFile = useCallback(
        (next) => {
            const problem = validateUpload(next, {
                maxBytes: limits.techPackMaxBytes,
                allowedMime: limits.techPackAllowedMime,
            });
            // Bail before the request so an oversized file never burns one of
            // the 8 hourly slots on a guaranteed 413.
            if (problem) {
                setFile(null);
                setFileError(problem);
                return;
            }
            setFileError("");
            setFile(next);
        },
        [limits.techPackMaxBytes, limits.techPackAllowedMime],
    );

    const submit = useCallback(async () => {
        const found = { ...validateStep(0, values), ...validateStep(1, values) };
        const keys = Object.keys(found);
        if (keys.length) {
            setErrors(found);
            const firstBad = STEPS.findIndex((s) => s.fields.some((f) => keys.includes(f)));
            setStep(firstBad === -1 ? 0 : firstBad);
            return;
        }

        setSubmitting(true);
        setFailure(null);
        try {
            const data = await inquiryApi.submit({
                ...values,
                productId,
                techPackFile: file,
                website, // stays "" for humans
            });
            submittedRef.current = true;
            setResult(data);
        } catch (err) {
            setFailure({ status: err?.response?.status, message: inquiryErrorMessage(err) });
        } finally {
            setSubmitting(false);
        }
    }, [values, productId, file, website]);

    const goNext = () => {
        const found = validateStep(step, values);
        if (Object.keys(found).length) {
            setErrors((prev) => ({ ...prev, ...found }));
            return;
        }
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    const onFormSubmit = (event) => {
        event.preventDefault();
        if (submitting) return;
        if (step < STEPS.length - 1) goNext();
        else submit();
    };

    const startOver = () => {
        submittedRef.current = false;
        prevStepRef.current = 0;
        setResult(null);
        setValues(EMPTY);
        setFile(null);
        setFileError("");
        setFailure(null);
        setErrors({});
        setStep(0);
    };

    const isLast = step === STEPS.length - 1;

    /* ------------------------------ Footer ------------------------------ */

    const footer = result ? (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={startOver} fullWidth className="sm:w-auto">
                Send another request
            </Button>
            <Button onClick={onClose} fullWidth className="sm:w-auto">
                Done
            </Button>
        </div>
    ) : (
        <div className="flex items-center gap-2.5">
            {step > 0 ? (
                <Button
                    variant="outline"
                    leftIcon={ArrowLeft}
                    onClick={() => setStep((s) => s - 1)}
                    disabled={submitting}
                    aria-label="Back"
                    className="shrink-0"
                >
                    <span className="hidden sm:inline">Back</span>
                </Button>
            ) : (
                <p className="hidden shrink-0 items-center gap-1.5 text-[12px] text-content-subtle sm:flex">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" aria-hidden="true" />
                    Confidential — used only for this quotation
                </p>
            )}

            <div className="flex-1" />

            {isLast ? (
                <Button
                    type="submit"
                    form="rfq-form"
                    rightIcon={Send}
                    loading={submitting}
                    disabled={rateLimited}
                    className="min-w-42 flex-1 sm:flex-none"
                >
                    Send request
                </Button>
            ) : (
                <Button
                    type="submit"
                    form="rfq-form"
                    rightIcon={ArrowRight}
                    className="flex-1 sm:flex-none sm:min-w-36"
                >
                    Continue
                </Button>
            )}
        </div>
    );

    /* ------------------------------- Header ----------------------------- */

    const header = (
        <div className="shrink-0">
            <div className="flex items-start gap-4 px-5 pt-4 sm:px-7 sm:pt-6">
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-gold uppercase">
                        Request for quotation
                    </p>
                    <h2
                        id="rfq-title"
                        className="mt-1 font-heading text-xl font-bold text-content sm:text-[26px]"
                    >
                        {result ? "Request received" : "Tell us what you're sourcing"}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-content-muted">
                        {result
                            ? "Our merchandising team picks this up from here."
                            : "A merchandiser replies within one business day, Dhaka time."}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    aria-label="Close"
                    className="-mt-1 -mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-content-subtle transition-colors hover:bg-surface-inset hover:text-content focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none disabled:opacity-40"
                >
                    <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
                        <path
                            d="m5 5 10 10M15 5 5 15"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            </div>

            {result ? (
                <div className="pb-4" />
            ) : (
                <StepRail current={step} total={STEPS.length} label={STEPS[step].label} />
            )}
        </div>
    );

    /* -------------------------------- Body ------------------------------ */

    const stepMotion = reduce
        ? {}
        : {
              initial: { opacity: 0, x: 12 },
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 0, x: -12 },
              transition: { duration: 0.18, ease: "easeOut" },
          };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            header={header}
            footer={footer}
            labelledBy="rfq-title"
            dismissible={!submitting}
            closeOnBackdrop={!submitting}
        >
            {result ? (
                <div className="py-6 text-center">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/10">
                        <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
                    </span>
                    <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-content">
                        {result.message ||
                            "Your inquiry has been received. Our team will respond within one business day."}
                    </p>
                    {result.inquiryId ? (
                        <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-surface-inset px-3.5 py-2 font-mono text-[12px] tracking-wider text-content-muted">
                            REF · {String(result.inquiryId).slice(-8).toUpperCase()}
                        </p>
                    ) : null}
                    <p className="mt-5 text-[13px] text-content-subtle">
                        A copy is on its way to{" "}
                        <span className="font-medium text-content">{values.email}</span>. Check spam
                        if it hasn&apos;t landed in ten minutes.
                    </p>
                </div>
            ) : (
                <form id="rfq-form" onSubmit={onFormSubmit} noValidate>
                    <ProductChip product={product} productId={productId} />

                    {/* Honeypot. Off-screen rather than display:none so naive bots
                        still see it; aria-hidden + tabIndex keep it away from
                        humans and screen readers. */}
                    <div className="sr-only" aria-hidden="true">
                        <label htmlFor="rfq-website">Website</label>
                        <input
                            id="rfq-website"
                            name="website"
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                        />
                    </div>

                    <div ref={stepRef}>
                        <AnimatePresence mode="wait" initial={false}>
                            {step === 0 ? (
                                <motion.div key="contact" {...stepMotion} className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field
                                            label="Full name"
                                            htmlFor="rfq-buyerName"
                                            required
                                            error={errors.buyerName}
                                        >
                                            <TextInput
                                                id="rfq-buyerName"
                                                name="buyerName"
                                                autoComplete="name"
                                                maxLength={MAX.buyerName}
                                                placeholder="Jane Whitfield"
                                                invalid={!!errors.buyerName}
                                                value={values.buyerName}
                                                onChange={(e) =>
                                                    setValue("buyerName", e.target.value)
                                                }
                                            />
                                        </Field>

                                        <Field
                                            label="Work email"
                                            htmlFor="rfq-email"
                                            required
                                            error={errors.email}
                                        >
                                            <TextInput
                                                id="rfq-email"
                                                name="email"
                                                type="email"
                                                inputMode="email"
                                                autoComplete="email"
                                                placeholder="jane@retailgroup.com"
                                                invalid={!!errors.email}
                                                value={values.email}
                                                onChange={(e) => setValue("email", e.target.value)}
                                            />
                                        </Field>
                                    </div>

                                    <Field label="Company" htmlFor="rfq-companyName">
                                        <TextInput
                                            id="rfq-companyName"
                                            name="companyName"
                                            autoComplete="organization"
                                            maxLength={MAX.companyName}
                                            placeholder="Retail Group Pty Ltd"
                                            value={values.companyName}
                                            onChange={(e) =>
                                                setValue("companyName", e.target.value)
                                            }
                                        />
                                    </Field>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field
                                            label="Phone / WhatsApp"
                                            htmlFor="rfq-phone"
                                            hint="Include the country code"
                                        >
                                            <TextInput
                                                id="rfq-phone"
                                                name="phone"
                                                type="tel"
                                                inputMode="tel"
                                                autoComplete="tel"
                                                maxLength={MAX.phone}
                                                placeholder="+61 480 687 273"
                                                value={values.phone}
                                                onChange={(e) => setValue("phone", e.target.value)}
                                            />
                                        </Field>

                                        <Field label="Country" htmlFor="rfq-country">
                                            <TextInput
                                                id="rfq-country"
                                                name="country"
                                                autoComplete="country-name"
                                                maxLength={MAX.country}
                                                list="rfq-country-list"
                                                placeholder="Australia"
                                                value={values.country}
                                                onChange={(e) =>
                                                    setValue("country", e.target.value)
                                                }
                                            />
                                            <datalist id="rfq-country-list">
                                                {(meta.targetMarkets || []).map((m) => (
                                                    <option key={m} value={m} />
                                                ))}
                                            </datalist>
                                        </Field>
                                    </div>
                                </motion.div>
                            ) : null}

                            {step === 1 ? (
                                <motion.div key="brief" {...stepMotion} className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field label="Buyer type" htmlFor="rfq-buyerType">
                                            <Select
                                                id="rfq-buyerType"
                                                name="buyerType"
                                                placeholder=""
                                                options={meta.buyerTypes || []}
                                                value={values.buyerType}
                                                onChange={(e) =>
                                                    setValue("buyerType", e.target.value)
                                                }
                                            />
                                        </Field>

                                        <Field
                                            label="Target quantity"
                                            htmlFor="rfq-targetQuantity"
                                            hint="Per style or total — either works"
                                        >
                                            <TextInput
                                                id="rfq-targetQuantity"
                                                name="targetQuantity"
                                                maxLength={MAX.targetQuantity}
                                                placeholder="5,000 pcs / style"
                                                value={values.targetQuantity}
                                                onChange={(e) =>
                                                    setValue("targetQuantity", e.target.value)
                                                }
                                            />
                                        </Field>
                                    </div>

                                    <Field
                                        label="What do you need?"
                                        htmlFor="rfq-message"
                                        required
                                        error={errors.message}
                                        counter={`${values.message.length} / ${MAX.message}`}
                                    >
                                        <TextArea
                                            id="rfq-message"
                                            name="message"
                                            rows={5}
                                            maxLength={MAX.message}
                                            invalid={!!errors.message}
                                            placeholder="240 gsm organic cotton crew tees, 4 colourways, sizes S–XXL. Need FOB Chattogram and a delivery window for March."
                                            value={values.message}
                                            onChange={(e) => setValue("message", e.target.value)}
                                        />
                                    </Field>

                                    <Field
                                        label="Tech pack"
                                        htmlFor="rfq-techpack"
                                        error={fileError}
                                        hint="Optional — specs, measurements or artwork speed up costing"
                                    >
                                        <FileInput
                                            id="rfq-techpack"
                                            file={file}
                                            accept={accept}
                                            invalid={!!fileError}
                                            onSelect={handleFile}
                                            onClear={() => {
                                                setFile(null);
                                                setFileError("");
                                            }}
                                            label="Drop your tech pack or browse"
                                            hint={acceptHint}
                                        />
                                    </Field>
                                </motion.div>
                            ) : null}

                            {step === 2 ? (
                                <motion.div key="review" {...stepMotion}>
                                    <dl className="rounded-xl border border-border-subtle bg-surface-inset/50 px-4 py-1.5">
                                        <SummaryRow label="Name" value={values.buyerName} />
                                        <SummaryRow label="Email" value={values.email} />
                                        <SummaryRow label="Company" value={values.companyName} />
                                        <SummaryRow label="Phone" value={values.phone} />
                                        <SummaryRow label="Country" value={values.country} />
                                        <SummaryRow label="Buyer type" value={values.buyerType} />
                                        <SummaryRow
                                            label="Quantity"
                                            value={values.targetQuantity}
                                        />
                                        <SummaryRow label="Requirement" value={values.message} />
                                        <SummaryRow label="Tech pack" value={file?.name} />
                                        <SummaryRow
                                            label="Product"
                                            value={product?.title || (productId ? "Attached" : "")}
                                        />
                                    </dl>

                                    {failure ? (
                                        <div
                                            role="alert"
                                            className={`mt-4 flex gap-3 rounded-xl border p-4 ${
                                                rateLimited
                                                    ? "border-warning/30 bg-warning/8"
                                                    : "border-danger/30 bg-danger/6"
                                            }`}
                                        >
                                            <span
                                                className={
                                                    rateLimited ? "text-warning" : "text-danger"
                                                }
                                            >
                                                {rateLimited ? (
                                                    <Clock3
                                                        className="h-5 w-5"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    <TriangleAlert
                                                        className="h-5 w-5"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                            </span>
                                            <div className="min-w-0 text-[13px] leading-relaxed">
                                                <p className="font-semibold text-content">
                                                    {rateLimited
                                                        ? "Hourly request limit reached"
                                                        : "That didn't send"}
                                                </p>
                                                {/* Backend copy is user-safe — surfaced verbatim. */}
                                                <p className="mt-0.5 text-content-muted">
                                                    {failure.message}
                                                </p>
                                                {rateLimited ? (
                                                    <a
                                                        href={`mailto:inquiry@skhsourcing.com?subject=${encodeURIComponent(
                                                            `RFQ — ${values.companyName || values.buyerName}`,
                                                        )}&body=${encodeURIComponent(values.message)}`}
                                                        className="mt-2 inline-flex items-center gap-1.5 font-semibold text-brand-gold underline-offset-4 hover:underline"
                                                    >
                                                        <Mail
                                                            className="h-3.5 w-3.5"
                                                            aria-hidden="true"
                                                        />
                                                        Email inquiry@skhsourcing.com instead
                                                    </a>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFailure(null)}
                                                        className="mt-2 font-semibold text-brand-gold underline-offset-4 hover:underline"
                                                    >
                                                        Try again
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-content-subtle">
                                            <ShieldCheck
                                                className="mt-px h-4 w-4 shrink-0 text-brand-gold"
                                                aria-hidden="true"
                                            />
                                            Your details and tech pack stay with SKH Sourcing and
                                            the mills we cost with. We never publish or resell buyer
                                            data.
                                        </p>
                                    )}
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>
                </form>
            )}
        </Modal>
    );
}
