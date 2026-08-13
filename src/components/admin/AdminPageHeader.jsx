// src/components/admin/AdminPageHeader.jsx
// The strip every admin screen opens with: a one-line description of what the
// screen does, an optional figure row, and the primary action.
//
// It deliberately renders NO heading — the Topbar already renders the route's
// <h1>, and two headings for one screen is both a duplication and an a11y smell.
export default function AdminPageHeader({ description, meta = [], actions, className = "" }) {
    return (
        <div
            className={`flex flex-col gap-4 border-b border-border-subtle pb-5 sm:flex-row sm:items-start sm:justify-between ${className}`}
        >
            <div className="min-w-0">
                {description ? (
                    <p className="max-w-2xl text-[13.5px] leading-relaxed text-content-muted">
                        {description}
                    </p>
                ) : null}

                {meta.length ? (
                    <dl className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                        {meta.map((item) => (
                            <div key={item.label} className="flex items-baseline gap-2">
                                <dt className="text-[11px] font-semibold tracking-[0.16em] text-content-subtle uppercase">
                                    {item.label}
                                </dt>
                                <dd className="font-mono text-[13px] font-semibold text-content tabular-nums">
                                    {item.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                ) : null}
            </div>

            {actions ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>
            ) : null}
        </div>
    );
}
