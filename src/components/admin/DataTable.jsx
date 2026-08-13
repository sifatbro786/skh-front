/* eslint-disable react-refresh/only-export-components */
// src/components/admin/DataTable.jsx
// The one table shell every admin list screen uses. There was no `Table`
// primitive in the tree, so this is it — kept in components/admin rather than
// components/ui because nothing on the client side renders a data grid.
//
// Horizontal scroll is on the wrapper (not the table) so the header row stays
// aligned with the body on narrow viewports, and `min-w-full` lets short tables
// still fill the panel.
import { SkeletonRows } from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";

/**
 * columns: [{ key, header, render?(row), className?, headClassName? }]
 * The `render` escape hatch is what keeps thumbnails, badges and action
 * buttons out of this file.
 */
export default function DataTable({
    columns = [],
    rows = [],
    loading = false,
    keyField = "_id",
    emptyTitle = "Nothing here yet",
    emptyDescription,
    emptyIcon,
    emptyAction,
    onRowClick,
    skeletonRows = 6,
    className = "",
}) {
    // SkeletonRows emits <tr> elements, so it has to live inside a real <tbody>
    // — wrapping it in a div produces invalid DOM and React will warn.
    if (loading) {
        return (
            <div
                className={`overflow-x-auto rounded-xl border border-border-subtle bg-surface-raised ${className}`}
            >
                <table className="min-w-full border-collapse text-left">
                    <tbody>
                        <SkeletonRows rows={skeletonRows} cols={columns.length || 5} />
                    </tbody>
                </table>
            </div>
        );
    }

    if (!rows.length) {
        return (
            <div className={`rounded-xl border border-border-subtle bg-surface-raised ${className}`}>
                <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                />
            </div>
        );
    }

    return (
        <div
            className={`overflow-x-auto rounded-xl border border-border-subtle bg-surface-raised ${className}`}
        >
            <table className="min-w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-border-subtle">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                scope="col"
                                className={`px-4 py-3 text-[10px] font-bold tracking-[0.18em] whitespace-nowrap text-content-subtle uppercase ${
                                    col.headClassName || ""
                                }`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={row[keyField]}
                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                            className={`border-b border-border-subtle last:border-b-0 ${
                                onRowClick
                                    ? "cursor-pointer transition-colors hover:bg-surface-inset"
                                    : ""
                            }`}
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className={`px-4 py-3 align-middle text-[13.5px] text-content ${
                                        col.className || ""
                                    }`}
                                >
                                    {col.render ? col.render(row) : (row[col.key] ?? "—")}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/** Relative timestamps for the "Updated / Created" columns. */
export const timeAgo = (value) => {
    if (!value) return "—";
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) return "—";
    const secs = Math.round((Date.now() - then) / 1000);
    if (secs < 60) return "just now";
    const mins = Math.round(secs / 60);
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
    const days = Math.round(hrs / 24);
    if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
    const months = Math.round(days / 30);
    if (months < 12) return `${months} mo ago`;
    return `${Math.round(months / 12)} yr ago`;
};
