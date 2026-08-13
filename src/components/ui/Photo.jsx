// src/components/ui/Photo.jsx
// <img> that quietly unmounts instead of showing a broken-image icon if the
// src 404s — used everywhere a placeholder stock photo might not resolve.
import { useState } from "react";

export default function Photo({ src, alt = "", className = "", onError, ...props }) {
    const [ok, setOk] = useState(true);
    if (!ok) return null;

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={className}
            onError={(e) => {
                setOk(false);
                onError?.(e);
            }}
            {...props}
        />
    );
}
