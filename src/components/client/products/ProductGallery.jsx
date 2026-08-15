// src/components/client/products/ProductGallery.jsx
// Main frame + a numbered thumbnail index (01, 02, …) — the same line-sheet
// language as the homepage range index and the catalog category rail.
//
// The lightbox reuses the Task 1 Modal, so focus trap, scroll lock, ESC and the
// mobile sheet behaviour all come for free; this only adds arrow keys and swipe.
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import Modal from "../../ui/Modal";

const SWIPE_THRESHOLD = 48; // px — below this it's a tap, not a swipe

export default function ProductGallery({ urls = [], isStock = false, title = "" }) {
    const [index, setIndex] = useState(0);
    const [zoomOpen, setZoomOpen] = useState(false);
    const touchStart = useRef(null);

    // A different product (or an admin edit) can shrink the array under us.
    const safeIndex = Math.min(index, Math.max(urls.length - 1, 0));

    const step = useCallback(
        (delta) => {
            if (urls.length < 2) return;
            setIndex((i) => (i + delta + urls.length) % urls.length);
        },
        [urls.length],
    );

    // Arrow keys drive the lightbox. Modal already owns ESC and the tab ring.
    useEffect(() => {
        if (!zoomOpen) return undefined;
        const onKey = (e) => {
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [zoomOpen, step]);

    const onTouchEnd = (e) => {
        if (touchStart.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStart.current;
        touchStart.current = null;
        if (Math.abs(delta) > SWIPE_THRESHOLD) step(delta < 0 ? 1 : -1);
    };

    // resolveProductImages() always returns at least one frame, so there is no
    // empty state left to render here.
    if (!urls.length) return null;

    return (
        <div>
            <div
                className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-inset"
                onTouchStart={(e) => {
                    touchStart.current = e.touches[0].clientX;
                }}
                onTouchEnd={onTouchEnd}
            >
                <img
                    key={urls[safeIndex]}
                    src={urls[safeIndex]}
                    alt={`${title} — view ${safeIndex + 1} of ${urls.length}`}
                    className="aspect-4/5 w-full object-cover"
                />

                <button
                    type="button"
                    onClick={() => setZoomOpen(true)}
                    aria-label="Open full size"
                    className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-lg bg-brand-dark/70 text-white/90 backdrop-blur-sm transition-colors hover:bg-brand-dark hover:text-brand-gold focus-visible:ring-2 focus-visible:ring-brand-gold/60 focus-visible:outline-none"
                >
                    <Expand className="h-4 w-4" aria-hidden="true" />
                </button>

                {isStock ? (
                    <span className="absolute bottom-3 left-3 rounded-md bg-brand-dark/75 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-white/80 uppercase backdrop-blur-sm">
                        Stock image — photography pending
                    </span>
                ) : null}

                {urls.length > 1 ? (
                    <>
                        <button
                            type="button"
                            onClick={() => step(-1)}
                            aria-label="Previous image"
                            className="absolute top-1/2 left-3 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-surface-raised/90 text-content shadow-sm backdrop-blur-sm transition-opacity hover:text-brand-gold focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                        >
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => step(1)}
                            aria-label="Next image"
                            className="absolute top-1/2 right-3 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-surface-raised/90 text-content shadow-sm backdrop-blur-sm transition-opacity hover:text-brand-gold focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                        >
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </>
                ) : null}
            </div>

            {urls.length > 1 ? (
                <ul className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {urls.map((url, i) => (
                        <li key={url}>
                            <button
                                type="button"
                                onClick={() => setIndex(i)}
                                aria-label={`View image ${i + 1}`}
                                aria-current={i === safeIndex ? "true" : undefined}
                                className={`group/thumb relative block w-full overflow-hidden rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none ${
                                    i === safeIndex
                                        ? "border-brand-gold"
                                        : "border-border-subtle hover:border-content-subtle"
                                }`}
                            >
                                <img
                                    src={url}
                                    alt=""
                                    loading="lazy"
                                    className={`aspect-square w-full object-cover transition-opacity ${
                                        i === safeIndex
                                            ? ""
                                            : "opacity-70 group-hover/thumb:opacity-100"
                                    }`}
                                />
                                <span
                                    className={`absolute bottom-1 left-1 rounded px-1 font-mono text-[10px] tabular-nums backdrop-blur-sm ${
                                        i === safeIndex
                                            ? "bg-brand-gold text-brand-dark"
                                            : "bg-brand-dark/60 text-white/80"
                                    }`}
                                >
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}

            <Modal
                open={zoomOpen}
                onClose={() => setZoomOpen(false)}
                size="xl"
                title={title}
                eyebrow={`Image ${safeIndex + 1} of ${urls.length}`}
                bodyClassName="pt-0"
            >
                <div
                    className="relative"
                    onTouchStart={(e) => {
                        touchStart.current = e.touches[0].clientX;
                    }}
                    onTouchEnd={onTouchEnd}
                >
                    <img
                        src={urls[safeIndex]}
                        alt={`${title} — view ${safeIndex + 1}`}
                        className="mx-auto max-h-[70dvh] w-auto rounded-lg object-contain"
                    />
                    {urls.length > 1 ? (
                        <div className="mt-4 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => step(-1)}
                                aria-label="Previous image"
                                className="grid h-10 w-10 place-items-center rounded-full border border-border-subtle text-content-muted transition-colors hover:border-brand-gold hover:text-brand-gold focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                            >
                                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <span className="font-mono text-[12px] text-content-subtle tabular-nums">
                                {String(safeIndex + 1).padStart(2, "0")} /{" "}
                                {String(urls.length).padStart(2, "0")}
                            </span>
                            <button
                                type="button"
                                onClick={() => step(1)}
                                aria-label="Next image"
                                className="grid h-10 w-10 place-items-center rounded-full border border-border-subtle text-content-muted transition-colors hover:border-brand-gold hover:text-brand-gold focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                            >
                                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    ) : null}
                </div>
            </Modal>
        </div>
    );
}
