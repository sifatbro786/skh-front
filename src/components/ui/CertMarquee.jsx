// src/components/ui/CertMarquee.jsx
// CSS-driven infinite loop (compositor-only transform, no JS rAF). The track is
// rendered twice and translated -50%, so the seam is invisible at any width.
//
// Two fixes in Phase 2:
//  1. `aria-hidden` was being passed to <Item> and silently dropped — it landed
//     on a component, not an element, so screen readers read every standard
//     twice. It's now applied to the <li>.
//  2. With few certifications seeded (3–4), one duplicate pass didn't span the
//     viewport and the loop showed a visible gap. The list is now repeated up to
//     MIN_TRACK entries *before* the -50% duplicate.
import { assetUrl } from "../../services/api";
import { isPlaceholderAsset } from "../../lib/placeholders";
import { COMPLIANCE_STANDARDS } from "../../data/siteContent";

const MIN_TRACK = 8;

const Item = ({ item, tone, hidden }) => {
    // A seeded placeholder plate is a navy box with the title already printed in
    // it — rendering it beside the wordmark reads as a broken logo twice over.
    // Until real artwork is uploaded the wordmark alone is the cleaner mark.
    const logo = isPlaceholderAsset(item.logoPath) ? null : assetUrl(item.logoPath);
    return (
        <li className="flex shrink-0 items-center gap-3 px-8" aria-hidden={hidden || undefined}>
            {logo ? (
                <img
                    src={logo}
                    alt=""
                    loading="lazy"
                    className={`h-9 w-auto object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 ${
                        tone === "dark" ? "brightness-0 invert" : ""
                    }`}
                />
            ) : null}
            <span
                className={`text-[11px] font-bold tracking-[0.26em] whitespace-nowrap uppercase ${
                    tone === "dark" ? "text-content-subtle" : "text-content-muted"
                }`}
            >
                {item.title || item.name}
            </span>
        </li>
    );
};

export default function CertMarquee({ items, tone = "light", className = "" }) {
    const source = items?.length ? items : COMPLIANCE_STANDARDS;
    if (!source.length) return null; // guard: the pad loop below must terminate

    // Pad short lists so one pass always overflows the viewport…
    const base = [];
    while (base.length < MIN_TRACK) base.push(...source);

    // …then duplicate for the seamless -50% wrap.
    const track = [...base, ...base];

    return (
        <div
            className={`group relative overflow-hidden ${className}`}
            style={{
                // Fade both edges instead of hard-cutting the loop.
                maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
                WebkitMaskImage:
                    "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
            }}
        >
            <ul
                data-marquee-track=""
                aria-label="Compliance standards"
                className="animate-marquee flex w-max items-center py-5 group-hover:[animation-play-state:paused]"
            >
                {track.map((item, i) => (
                    <Item
                        key={`${item._id || item.name || item.title}-${i}`}
                        item={item}
                        tone={tone}
                        hidden={i >= base.length}
                    />
                ))}
            </ul>
        </div>
    );
}
