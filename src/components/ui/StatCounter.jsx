/* eslint-disable react-hooks/set-state-in-effect */
// src/components/ui/StatCounter.jsx
// Count-up on first viewport entry. Tabular figures so the number doesn't jitter
// while animating. Reduced-motion users get the final value immediately.
import { useEffect, useRef, useState } from "react";
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
    const inView = useInView(ref, { once: true, margin: "-15% 0px" });
    const reduced = useReducedMotion();
    const [display, setDisplay] = useState(0);
    const target = Number(value) || 0;

    useEffect(() => {
        if (!inView) return;
        if (reduced) {
            setDisplay(target);
            return;
        }
        const controls = animate(0, target, {
            duration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => setDisplay(Math.round(v)),
        });
        return () => controls.stop();
    }, [inView, target, duration, reduced]);

    const dark = tone === "dark";

    return (
        <div ref={ref} className={`group ${className}`}>
            <div
                className={`h-px w-10 transition-all duration-500 group-hover:w-16 ${
                    dark ? "bg-brand-gold" : "bg-brand-gold"
                }`}
                aria-hidden="true"
            />
            <p
                className={`mt-4 font-heading text-4xl font-extrabold tracking-[-0.03em] tabular-nums sm:text-5xl ${
                    dark ? "text-content-inverse" : "text-content"
                }`}
            >
                {prefix}
                {formatter.format(display)}
                <span className="text-brand-gold">{suffix}</span>
            </p>
            <p
                className={`mt-2 text-[11px] font-bold uppercase tracking-[0.24em] ${
                    dark ? "text-content-subtle" : "text-content-muted"
                }`}
            >
                {label}
            </p>
        </div>
    );
}
