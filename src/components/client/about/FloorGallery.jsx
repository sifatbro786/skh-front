// src/components/client/about/FloorGallery.jsx
// The one purely photographic beat on an otherwise typographic page — so
// "in-house QC" and "our own factory network" read as something we can show,
// not just a claim in a line sheet. Sits between the capability band and the
// track record, as visual proof of the paragraph just above it.
import Photo from "../../ui/Photo";
import { STOCK_PHOTOS } from "../../../data/stockPhotos";

// Captions describe what the placeholder photo actually shows. When real
// factory photography replaces STOCK_PHOTOS, retitle these to the process
// step ("Sewing line", "Inline inspection", "Fabric intake").
const FRAMES = [
    { src: STOCK_PHOTOS.sewingFloor, caption: "Knitwear" },
    { src: STOCK_PHOTOS.qualityDetail, caption: "Finished garments" },
    { src: STOCK_PHOTOS.fabricRolls, caption: "Range planning" },
];

function Frame({ src, caption }) {
    return (
        <figure className="group relative aspect-4/5 overflow-hidden rounded-xl border border-border-subtle bg-surface-inset">
            <Photo
                src={src}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-brand-dark/80 via-brand-dark/0 to-transparent" />
            <figcaption className="absolute bottom-3 left-4 text-[11px] font-bold tracking-[0.16em] text-white uppercase">
                {caption}
            </figcaption>
        </figure>
    );
}

export default function FloorGallery() {
    return (
        <section className="bg-surface-dark pb-16 sm:pb-20" aria-label="On the floor">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
                    {FRAMES.map((frame) => (
                        <Frame key={frame.caption} {...frame} />
                    ))}
                </div>
            </div>
        </section>
    );
}
