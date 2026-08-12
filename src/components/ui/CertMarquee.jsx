// src/components/ui/CertMarquee.jsx
// CSS-driven infinite loop (compositor-only transform, no JS rAF). The track is
// rendered twice and translated -50%, so the seam is invisible at any width.
import { assetUrl } from "../../services/api";
import { COMPLIANCE_STANDARDS } from "../../data/siteContent";

const Item = ({ item, tone }) => {
    const logo = assetUrl(item.logoPath);
    return (
        <li className="flex shrink-0 items-center gap-3 px-8">
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
                className={`whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.26em] ${
                    tone === "dark" ? "text-content-subtle" : "text-content-muted"
                }`}
            >
                {item.title || item.name}
            </span>
        </li>
    );
};

export default function CertMarquee({ items, tone = "light", className = "" }) {
    const data = items?.length ? items : COMPLIANCE_STANDARDS;
    // Duplicate for the seamless -50% wrap.
    const track = [...data, ...data];

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
                className="flex w-max animate-marquee items-center py-5 group-hover:[animation-play-state:paused]"
            >
                {track.map((item, i) => (
                    <Item
                        key={`${item._id || item.name || item.title}-${i}`}
                        item={item}
                        tone={tone}
                        aria-hidden={i >= data.length}
                    />
                ))}
            </ul>
        </div>
    );
}
