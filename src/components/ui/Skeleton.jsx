// src/components/ui/Skeleton.jsx
export function Skeleton({ className = "", rounded = "rounded-md" }) {
    return (
        <span
            aria-hidden="true"
            className={`relative block overflow-hidden bg-surface-inset shimmer ${rounded} ${className}`}
        />
    );
}

/** Multi-line text block; the last line is short so it reads like real copy. */
export function SkeletonText({ lines = 3, className = "" }) {
    return (
        <div className={`space-y-2.5 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-2/5" : "w-full"}`} />
            ))}
        </div>
    );
}

export function SkeletonProductCard() {
    return (
        <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-raised">
            <Skeleton className="aspect-4/5 w-full" rounded="rounded-none" />
            <div className="space-y-3 p-4">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}

/** Table body placeholder — pass the live column count so nothing shifts on load. */
export function SkeletonRows({ rows = 6, cols = 5 }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, r) => (
                <tr key={r} className="border-b border-border-subtle last:border-0">
                    {Array.from({ length: cols }).map((_, c) => (
                        <td key={c} className="px-4 py-4">
                            <Skeleton className={`h-3 ${c === 0 ? "w-40" : "w-20"}`} />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

export default Skeleton;
