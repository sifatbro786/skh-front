// src/components/client/about/DirectorNote.jsx
// The director's note. The photo is a static public asset (/director.jpg) that
// may simply not be on the server yet — onError swaps in a monogram plate rather
// than leaving a broken-image icon in the middle of the page, and the frame rule
// is drawn on the wrapper so the layout is identical either way.
import { useState } from "react";
import { Mail } from "lucide-react";
import { DIRECTOR, SITE } from "../../../data/siteContent";
import { LATTICE } from "../PageHeader";

const initials = (name = "") =>
    name
        .replace(/[^A-Za-z ]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .slice(-2)
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "SKH";

export default function DirectorNote() {
    const [showPhoto, setShowPhoto] = useState(Boolean(DIRECTOR.photo));

    return (
        <section className="bg-surface py-14 sm:py-20" aria-labelledby="directors-note">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
                    {/* Portrait — offset gold frame, the selvedge scaled to a plate. */}
                    <figure className="relative mx-auto w-full max-w-xs lg:mx-0 lg:max-w-none">
                        <span
                            className="absolute -top-3 -left-3 h-24 w-24 border-t border-l border-brand-gold/60"
                            aria-hidden="true"
                        />
                        <div className="relative aspect-4/5 overflow-hidden rounded-xl border border-border-subtle">
                            {showPhoto ? (
                                <img
                                    src={DIRECTOR.photo}
                                    alt={`${DIRECTOR.name}, ${DIRECTOR.role} of ${SITE.name}`}
                                    loading="lazy"
                                    decoding="async"
                                    onError={() => setShowPhoto(false)}
                                    className="h-full w-full object-cover object-top"
                                />
                            ) : (
                                // No portrait on file yet — a navy monogram plate reads as a
                                // deliberate brand device, not a missing image.
                                <div className="relative grid h-full w-full place-items-center bg-linear-to-br from-brand-navy via-surface-dark to-brand-dark">
                                    <div
                                        className="pointer-events-none absolute inset-0"
                                        style={LATTICE}
                                        aria-hidden="true"
                                    />
                                    <div
                                        className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-brand-gold/15 blur-[70px]"
                                        aria-hidden="true"
                                    />
                                    <span className="relative font-heading text-5xl font-extrabold tracking-[0.08em] text-brand-gold/80">
                                        {initials(DIRECTOR.name)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <figcaption className="mt-4 flex items-baseline gap-3">
                            <span className="text-[13px] font-semibold text-content">
                                {DIRECTOR.name}
                            </span>
                            <span
                                className="mb-1 min-w-4 flex-1 border-b border-dotted border-border-strong"
                                aria-hidden="true"
                            />
                            <span className="font-mono text-[11px] tracking-widest text-content-subtle uppercase">
                                {DIRECTOR.role}
                            </span>
                        </figcaption>
                    </figure>

                    <div className="lg:pt-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-inset px-3 py-1 text-[10px] font-bold tracking-[0.28em] text-content-muted uppercase">
                            <span className="h-1 w-1 bg-brand-gold" aria-hidden="true" />
                            Director&rsquo;s note
                        </span>

                        <h2
                            id="directors-note"
                            className="selvedge mt-4 font-heading text-3xl leading-[1.12] font-extrabold tracking-[-0.02em] text-content sm:text-4xl"
                        >
                            We answer for what leaves the floor
                        </h2>

                        <div className="mt-6 space-y-5 pl-5">
                            {DIRECTOR.bio.map((paragraph) => (
                                <p
                                    key={paragraph.slice(0, 32)}
                                    className="text-[15px] leading-relaxed text-content-muted"
                                >
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border-subtle pt-6 pl-5">
                            <p className="font-heading text-[15px] font-bold text-content">
                                {DIRECTOR.name}
                                <span className="ml-2 text-[12px] font-medium text-content-subtle">
                                    {DIRECTOR.role}, {SITE.name}
                                </span>
                            </p>
                            <a
                                href={`mailto:${DIRECTOR.email}`}
                                className="inline-flex items-center gap-2 text-[13px] font-semibold text-brand-gold underline-offset-4 transition-colors hover:text-brand-gold-hover hover:underline focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                            >
                                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                                {DIRECTOR.email}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
