// src/components/ui/StatCounter.jsx
// Count-up on first viewport entry.
//
// Rewrite note (Phase 2): the previous version called setState on every animation
// frame, so four counters re-rendered React ~360 times over the run. The value is
// write-only display text — it now goes straight to the DOM node, which drops the
// re-renders to zero and lets the `react-hooks/set-state-in-effect` disable go.
// Tabular figures keep the number from jittering as digits change width.
import { useLayoutEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

const formatter = new Intl.NumberFormat("en-US");

export default function StatCounter({
    value = 0,
    label,
    suffix = "",
    prefix = "",
    duration = 1.6,
    tone = "light",
    className = "",
}) {
    const ref = useRef(null);
    const numberRef = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-15% 0px" });
    const reduced = useReducedMotion();
    const target = Number(value) || 0;

    // useLayoutEffect, not useEffect: the JSX seeds the final value (so a
    // pre-hydration paint and screen readers never see a bare 0), and this has
    // to reset it to 0 BEFORE the browser paints or the number visibly flashes.
    useLayoutEffect(() => {
        const node = numberRef.current;
        if (!node) return undefined;

        if (!inView || reduced) {
            // Off-screen or reduced-motion: land on the final value with no run.
            node.textContent = formatter.format(inView ? target : 0);
            return undefined;
        }

        const controls = animate(0, target, {
            duration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => {
                node.textContent = formatter.format(Math.round(v));
            },
        });
        return () => controls.stop();
    }, [inView, target, duration, reduced]);

    const dark = tone === "dark";

    return (
        <div ref={ref} className={`group ${className}`}>
            <div
                className="h-px w-10 bg-brand-gold transition-all duration-500 group-hover:w-16"
                aria-hidden="true"
            />
            <p
                className={`mt-4 font-heading text-4xl font-extrabold tracking-[-0.03em] tabular-nums sm:text-5xl ${
                    dark ? "text-content-inverse" : "text-content"
                }`}
            >
                {prefix}
                {/* Seeded with the real value so no-JS / pre-hydration paint and
                    screen readers never see a bare 0. */}
                <span ref={numberRef}>{formatter.format(target)}</span>
                <span className="text-brand-gold">{suffix}</span>
            </p>
            <p
                className={`mt-2 text-[11px] font-bold tracking-[0.24em] uppercase ${
                    dark ? "text-content-subtle" : "text-content-muted"
                }`}
            >
                {label}
            </p>
        </div>
    );
}
