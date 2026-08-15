// src/components/client/contact/ContactForm.jsx
// The contact form is EMAIL-ONLY. It posts to POST /api/contact, which just
// sends one notification email to the SKH inbox — no Mongo row, no dashboard
// entry (that's the RFQ flow, RfqModal -> POST /api/inquiries). Contract rules:
//
//   1. `website` is the honeypot — PRESENT and EMPTY. A filled value gets a fake
//      200 from the backend, so we render success either way and never tell a
//      bot it was caught.
//   2. The endpoint is rate-limited to 10/hr per IP. A 429 is a normal outcome,
//      not an exception — and because there's no persisted record here, ANY
//      failure surfaces a mailto escape hatch so the message isn't lost.
//
// Field maxlengths mirror the backend clip() ceilings so the limit is hit in
// the UI rather than in a 400.
import { useEffect, useRef, useState } from "react";
import {
    CheckCircle2,
    Clock3,
    Mail,
    Paperclip,
    Send,
    ShieldCheck,
    TriangleAlert,
} from "lucide-react";
import { Field, TextArea, TextInput } from "../../ui/FormField";
import Button from "../../ui/Button";
import { contactApi, contactErrorMessage } from "../../../services/contactApi";
import { TARGET_MARKETS } from "../../../data/siteContent";
import { openRfq } from "../../../lib/rfqBus";

const EMPTY = {
    buyerName: "",
    email: "",
    companyName: "",
    phone: "",
    country: "",
    message: "",
};

const MAX = {
    buyerName: 120,
    companyName: 160,
    phone: 40,
    country: 80,
    message: 5000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validate = (values) => {
    const errors = {};
    if (!values.buyerName.trim()) errors.buyerName = "Tell us who we're replying to";
    if (!values.email.trim()) errors.email = "We reply to this address";
    else if (!EMAIL_RE.test(values.email.trim())) errors.email = "Check the email format";

    const message = values.message.trim();
    if (!message) errors.message = "Tell us what you need — styles, quantity, timeline";
    else if (message.length < 15) errors.message = "Add a little more detail (15+ characters)";

    return errors;
};

export default function ContactForm({ inquiryEmail = "inquiry@skhsourcing.com", className = "" }) {
    const [values, setValues] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [website, setWebsite] = useState(""); // honeypot — humans leave this empty
    const [submitting, setSubmitting] = useState(false);
    const [failure, setFailure] = useState(null); // { status, message }
    const [result, setResult] = useState(null);

    const cardRef = useRef(null);
    const rateLimited = failure?.status === 429;

    // The form is tall on mobile; on success the panel that replaces it can land
    // below the fold. No state is written here — just a scroll.
    useEffect(() => {
        if (!result) return;
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [result]);

    const setValue = (name, value) => {
        setValues((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;

        const found = validate(values);
        if (Object.keys(found).length) {
            setErrors(found);
            // Focus the first invalid control instead of leaving the user to hunt
            // for the red text on a two-column form.
            const firstKey = Object.keys(found)[0];
            cardRef.current?.querySelector(`#contact-${firstKey}`)?.focus?.();
            return;
        }

        setSubmitting(true);
        setFailure(null);
        try {
            const data = await contactApi.submit({ ...values, website });
            setResult(data);
        } catch (err) {
            setFailure({ status: err?.response?.status, message: contactErrorMessage(err) });
        } finally {
            setSubmitting(false);
        }
    };

    const startOver = () => {
        setResult(null);
        setValues(EMPTY);
        setErrors({});
        setFailure(null);
    };

    /* ------------------------------- Success ------------------------------ */

    if (result) {
        return (
            <div
                ref={cardRef}
                className={`scroll-mt-24 rounded-2xl border border-border-subtle bg-surface-raised p-6 text-center sm:p-10 ${className}`}
            >
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-7 w-7 text-success" aria-hidden="true" />
                </span>

                <h2 className="mt-5 font-heading text-2xl font-extrabold text-content">
                    Message received
                </h2>
                <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-content-muted">
                    {result.message ||
                        "Thanks — a merchandiser picks this up and replies within one business day, Dhaka time."}
                </p>

                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button variant="outline" onClick={startOver}>
                        Send another message
                    </Button>
                    <Button onClick={() => openRfq({ source: "contact-success" })}>
                        Request a quote
                    </Button>
                </div>
            </div>
        );
    }

    /* -------------------------------- Form -------------------------------- */

    return (
        <div
            ref={cardRef}
            className={`scroll-mt-24 rounded-2xl border border-border-subtle bg-surface-raised p-5 sm:p-8 ${className}`}
        >
            <div className="flex items-baseline justify-between gap-4">
                <div>
                    <p className="text-[10px] font-bold tracking-[0.28em] text-brand-gold uppercase">
                        Send a message
                    </p>
                    <h2 className="mt-2 font-heading text-2xl font-extrabold text-content">
                        Tell us what you&rsquo;re sourcing
                    </h2>
                </div>
                <span
                    className="mt-1 hidden h-1.5 w-1.5 shrink-0 bg-brand-gold sm:block"
                    aria-hidden="true"
                />
            </div>

            <form onSubmit={onSubmit} noValidate className="mt-7 space-y-4">
                {/* Honeypot. Off-screen rather than display:none so naive bots still
                    fill it; aria-hidden + tabIndex keep it away from real users. */}
                <div className="sr-only" aria-hidden="true">
                    <label htmlFor="contact-website">Website</label>
                    <input
                        id="contact-website"
                        name="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                        label="Full name"
                        htmlFor="contact-buyerName"
                        required
                        error={errors.buyerName}
                    >
                        <TextInput
                            id="contact-buyerName"
                            name="buyerName"
                            autoComplete="name"
                            maxLength={MAX.buyerName}
                            placeholder="Jane Whitfield"
                            invalid={!!errors.buyerName}
                            value={values.buyerName}
                            onChange={(e) => setValue("buyerName", e.target.value)}
                        />
                    </Field>

                    <Field label="Work email" htmlFor="contact-email" required error={errors.email}>
                        <TextInput
                            id="contact-email"
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

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Company" htmlFor="contact-companyName">
                        <TextInput
                            id="contact-companyName"
                            name="companyName"
                            autoComplete="organization"
                            maxLength={MAX.companyName}
                            placeholder="Retail Group Pty Ltd"
                            value={values.companyName}
                            onChange={(e) => setValue("companyName", e.target.value)}
                        />
                    </Field>

                    <Field
                        label="Phone / WhatsApp"
                        htmlFor="contact-phone"
                        hint="Include the country code"
                    >
                        <TextInput
                            id="contact-phone"
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
                </div>

                <Field label="Country" htmlFor="contact-country">
                    <TextInput
                        id="contact-country"
                        name="country"
                        autoComplete="country-name"
                        maxLength={MAX.country}
                        list="contact-country-list"
                        placeholder="Australia"
                        value={values.country}
                        onChange={(e) => setValue("country", e.target.value)}
                    />
                    <datalist id="contact-country-list">
                        {TARGET_MARKETS.map((market) => (
                            <option key={market} value={market} />
                        ))}
                    </datalist>
                </Field>

                <Field
                    label="Your message"
                    htmlFor="contact-message"
                    required
                    error={errors.message}
                    counter={`${values.message.length} / ${MAX.message}`}
                >
                    <TextArea
                        id="contact-message"
                        name="message"
                        rows={6}
                        maxLength={MAX.message}
                        invalid={!!errors.message}
                        placeholder="We're looking for a supplier for 240 gsm organic cotton tees — around 8,000 pcs across four colourways, delivered to Sydney by March."
                        value={values.message}
                        onChange={(e) => setValue("message", e.target.value)}
                    />
                </Field>

                {failure ? (
                    <div
                        role="alert"
                        className={`flex gap-3 rounded-xl border p-4 ${
                            rateLimited
                                ? "border-warning/30 bg-warning/8"
                                : "border-danger/30 bg-danger/6"
                        }`}
                    >
                        <span className={rateLimited ? "text-warning" : "text-danger"}>
                            {rateLimited ? (
                                <Clock3 className="h-5 w-5" aria-hidden="true" />
                            ) : (
                                <TriangleAlert className="h-5 w-5" aria-hidden="true" />
                            )}
                        </span>
                        <div className="min-w-0 text-[13px] leading-relaxed">
                            <p className="font-semibold text-content">
                                {rateLimited ? "Hourly message limit reached" : "That didn't send"}
                            </p>
                            {/* Backend copy is user-safe — surfaced verbatim. */}
                            <p className="mt-0.5 text-content-muted">{failure.message}</p>
                            {/* Contact is email-only: nothing is persisted, so ANY
                                failure offers the mailto escape hatch so the message
                                isn't lost. "Try again" is offered for non-429s. */}
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                                <a
                                    href={`mailto:${inquiryEmail}?subject=${encodeURIComponent(
                                        `Enquiry — ${values.companyName || values.buyerName}`,
                                    )}&body=${encodeURIComponent(values.message)}`}
                                    className="inline-flex items-center gap-1.5 font-semibold text-brand-gold underline-offset-4 hover:underline"
                                >
                                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                                    Email {inquiryEmail} instead
                                </a>
                                {!rateLimited ? (
                                    <button
                                        type="button"
                                        onClick={() => setFailure(null)}
                                        className="font-semibold text-brand-gold underline-offset-4 hover:underline"
                                    >
                                        Try again
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex flex-col gap-4 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-start gap-2 text-[12px] leading-relaxed text-content-subtle">
                        <ShieldCheck
                            className="mt-px h-4 w-4 shrink-0 text-brand-gold"
                            aria-hidden="true"
                        />
                        Your details stay with SKH Sourcing and the mills we cost with.
                    </p>
                    <Button
                        type="submit"
                        size="lg"
                        rightIcon={Send}
                        loading={submitting}
                        disabled={rateLimited}
                        className="w-full sm:w-auto sm:min-w-44"
                    >
                        Send message
                    </Button>
                </div>
            </form>

            <p className="mt-5 flex items-start gap-2 text-[12.5px] leading-relaxed text-content-muted">
                <Paperclip
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold"
                    aria-hidden="true"
                />
                <span>
                    Attaching a tech pack?{" "}
                    <button
                        type="button"
                        onClick={() => openRfq({ source: "contact-page" })}
                        className="font-semibold text-brand-gold underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                    >
                        Use the quote request
                    </button>{" "}
                    — it takes a file upload.
                </span>
            </p>
        </div>
    );
}
