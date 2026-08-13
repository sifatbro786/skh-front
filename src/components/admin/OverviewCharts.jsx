// src/components/admin/OverviewCharts.jsx
// Two charts for the dashboard, both fed by data the Overview already fetches —
// no extra endpoints.
//
// Colours are literal hex, not Tailwind classes: Recharts writes `fill`/`stroke`
// straight onto SVG nodes, so a utility class name would be inert there. These
// are the brand tokens' actual values, kept in one place below.
//
// Every chart is wrapped in ResponsiveContainer, which measures its PARENT — so
// the parent must have a real height. Hence the fixed-height div around each.
import {
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Skeleton } from "../ui";

const GOLD = "#C5A059";
const NAVY = "#0F172A";
const AXIS = "#94A3B8";
const GRID = "#E2E8F0";

/** Mirrors STATUS_STYLES in inquiryApi, translated to concrete SVG fills. */
const STATUS_FILL = {
    New: GOLD,
    Contacted: "#0EA5E9",
    "In Progress": "#F59E0B",
    Closed: "#94A3B8",
};

function ChartFrame({ title, subtitle, children }) {
    return (
        <section className="rounded-xl border border-border-subtle bg-surface-raised p-5">
            <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-heading text-[15px] font-bold text-content">{title}</h2>
                {subtitle ? (
                    <p className="text-[11px] tracking-[0.14em] text-content-subtle uppercase">
                        {subtitle}
                    </p>
                ) : null}
            </div>
            <div className="mt-5">{children}</div>
        </section>
    );
}

/** Shared tooltip so both charts read the same. */
const tooltipProps = {
    cursor: { fill: "rgba(197,160,89,0.08)" },
    contentStyle: {
        borderRadius: 10,
        border: `1px solid ${GRID}`,
        fontSize: 12.5,
        boxShadow: "0 6px 24px rgba(15,23,42,0.10)",
    },
    labelStyle: { color: NAVY, fontWeight: 700 },
};

export function StatusDonut({ statusCounts = {}, loading = false }) {
    const data = Object.entries(statusCounts)
        .map(([name, value]) => ({ name, value }))
        .filter((d) => d.value > 0);

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <ChartFrame title="Inquiries by status" subtitle={total ? `${total} total` : null}>
            <div className="h-64">
                {loading ? (
                    <Skeleton className="h-full w-full" />
                ) : !total ? (
                    <div className="grid h-full place-items-center text-[13px] text-content-muted">
                        No inquiries yet
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                innerRadius="58%"
                                outerRadius="82%"
                                paddingAngle={2}
                                stroke="none"
                            >
                                {data.map((entry) => (
                                    <Cell key={entry.name} fill={STATUS_FILL[entry.name] || AXIS} />
                                ))}
                            </Pie>
                            <Tooltip {...tooltipProps} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Custom legend rather than Recharts' <Legend>: it wraps predictably
                and reuses the same swatch language as the status chips. */}
            {total ? (
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {data.map((entry) => (
                        <li key={entry.name} className="flex items-center gap-2">
                            <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: STATUS_FILL[entry.name] || AXIS }}
                                aria-hidden="true"
                            />
                            <span className="text-[12.5px] text-content-muted">{entry.name}</span>
                            <span className="font-mono text-[12.5px] font-semibold text-content tabular-nums">
                                {entry.value}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : null}
        </ChartFrame>
    );
}

/**
 * Horizontal bars — category names are long ("Home Textile", "Accessories") and
 * would collide on a vertical X axis at this width.
 *
 * NOTE: /api/products/categories counts ACTIVE products only ($match on
 * isActive), so this deliberately won't match the total-products tile if any
 * styles are hidden.
 */
export function CategoryBars({ categories = [], loading = false }) {
    const data = categories.map((c) => ({ name: c.name, count: c.count }));
    const total = data.reduce((sum, d) => sum + d.count, 0);

    return (
        <ChartFrame title="Catalog by category" subtitle="Active styles">
            <div className="h-64">
                {loading ? (
                    <Skeleton className="h-full w-full" />
                ) : !total ? (
                    <div className="grid h-full place-items-center text-[13px] text-content-muted">
                        No active products yet
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
                            barCategoryGap={6}
                        >
                            <XAxis
                                type="number"
                                allowDecimals={false}
                                tick={{ fill: AXIS, fontSize: 11 }}
                                axisLine={{ stroke: GRID }}
                                tickLine={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={104}
                                tick={{ fill: AXIS, fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip {...tooltipProps} />
                            <Bar dataKey="count" fill={GOLD} radius={[0, 3, 3, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </ChartFrame>
    );
}
