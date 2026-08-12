// src/components/ui/Modal.jsx
// Base dialog primitive. Bottom-sheet on mobile, centred card from `sm` up.
// Owns: portal, scroll lock (with scrollbar-gutter compensation), focus trap,
// focus restore, ESC, backdrop dismiss. Consumers own the content.
//
// React 19: `ref` is a plain prop — no forwardRef wrapper.
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

const SIZES = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
};

const FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    'input:not([type="hidden"]):not([disabled])',
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function Modal({
    open,
    onClose,
    title,
    eyebrow,
    description,
    size = "md",
    dismissible = true, // false while a request is in flight
    closeOnBackdrop = true,
    header, // replaces the default header block entirely
    footer, // rendered sticky at the bottom, outside the scroll area
    className = "",
    bodyClassName = "",
    labelledBy, // override when `header` supplies its own heading id
    children,
}) {
    const panelRef = useRef(null);
    const restoreRef = useRef(null);
    const reduce = useReducedMotion();
    const autoId = useId();
    const titleId = labelledBy || `${autoId}-title`;
    const descId = `${autoId}-desc`;

    /* Scroll lock. Padding compensation stops the page from jolting sideways
       when the scrollbar disappears (desktop Chrome/Firefox). */
    useEffect(() => {
        if (!open) return undefined;
        const { body } = document;
        const prevOverflow = body.style.overflow;
        const prevPad = body.style.paddingRight;
        const gutter = window.innerWidth - document.documentElement.clientWidth;

        body.style.overflow = "hidden";
        if (gutter > 0) body.style.paddingRight = `${gutter}px`;

        return () => {
            body.style.overflow = prevOverflow;
            body.style.paddingRight = prevPad;
        };
    }, [open]);

    /* Move focus in, and hand it back to the trigger on close. */
    useEffect(() => {
        if (!open) return undefined;
        restoreRef.current = document.activeElement;

        const frame = requestAnimationFrame(() => {
            const target = panelRef.current?.querySelector("[data-autofocus]") ?? panelRef.current;
            target?.focus?.({ preventScroll: true });
        });

        return () => {
            cancelAnimationFrame(frame);
            // The trigger may have unmounted (e.g. a card that was filtered out).
            if (restoreRef.current?.isConnected) {
                restoreRef.current.focus?.({ preventScroll: true });
            }
        };
    }, [open]);

    /* ESC + tab trap. Capture phase so a nested listbox can't swallow ESC. */
    useEffect(() => {
        if (!open) return undefined;

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                if (!dismissible) return;
                event.stopPropagation();
                onClose?.();
                return;
            }
            if (event.key !== "Tab" || !panelRef.current) return;

            const nodes = Array.from(panelRef.current.querySelectorAll(FOCUSABLE)).filter(
                // offsetParent is null for display:none — keeps hidden honeypot
                // and collapsed step fields out of the tab ring.
                (node) => node.offsetParent !== null || node === document.activeElement,
            );
            if (!nodes.length) return;

            const first = nodes[0];
            const last = nodes[nodes.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown, true);
        return () => document.removeEventListener("keydown", onKeyDown, true);
    }, [open, dismissible, onClose]);

    if (typeof document === "undefined") return null;

    const motionProps = reduce
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : {
              initial: { opacity: 0, y: 28, scale: 0.985 },
              animate: { opacity: 1, y: 0, scale: 1 },
              exit: { opacity: 0, y: 20, scale: 0.99 },
              transition: { type: "spring", stiffness: 320, damping: 30, mass: 0.7 },
          };

    return createPortal(
        <AnimatePresence>
            {open ? (
                <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center sm:p-6">
                    <motion.div
                        className="absolute inset-0 bg-brand-dark/60 backdrop-blur-[2px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={() => {
                            if (dismissible && closeOnBackdrop) onClose?.();
                        }}
                        aria-hidden="true"
                    />

                    <motion.div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title || labelledBy ? titleId : undefined}
                        aria-describedby={description ? descId : undefined}
                        tabIndex={-1}
                        className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border-subtle bg-surface-raised shadow-[0_-8px_40px_-12px_rgba(15,23,42,0.35)] outline-none sm:max-h-[88dvh] sm:rounded-2xl sm:shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)] ${SIZES[size]} ${className}`}
                        {...motionProps}
                    >
                        {/* Grab handle — reads as a sheet on touch, invisible on desktop. */}
                        <span
                            className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-border-strong sm:hidden"
                            aria-hidden="true"
                        />

                        {header ?? (
                            <div className="flex items-start gap-4 px-5 pt-4 pb-4 sm:px-7 sm:pt-6">
                                <div className="min-w-0 flex-1">
                                    {eyebrow ? (
                                        <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-gold uppercase">
                                            {eyebrow}
                                        </p>
                                    ) : null}
                                    {title ? (
                                        <h2
                                            id={titleId}
                                            className="mt-1 font-heading text-xl font-bold text-content sm:text-2xl"
                                        >
                                            {title}
                                        </h2>
                                    ) : null}
                                    {description ? (
                                        <p
                                            id={descId}
                                            className="mt-1.5 text-sm leading-relaxed text-content-muted"
                                        >
                                            {description}
                                        </p>
                                    ) : null}
                                </div>

                                {dismissible ? (
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        aria-label="Close"
                                        className="-mt-1 -mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-content-subtle transition-colors hover:bg-surface-inset hover:text-content focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                                    >
                                        <X className="h-4.5 w-4.5" />
                                    </button>
                                ) : null}
                            </div>
                        )}

                        <div
                            className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-7 ${bodyClassName}`}
                        >
                            {children}
                        </div>

                        {footer ? (
                            <div className="shrink-0 border-t border-border-subtle bg-surface-raised px-5 pt-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-7 sm:pb-4">
                                {footer}
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>,
        document.body,
    );
}
