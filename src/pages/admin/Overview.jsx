// src/pages/admin/Overview.jsx
// The landing screen. Five independent fetches rather than one aggregate
// endpoint: /api/stats has no dashboard rollup, and a failing certifications
// call shouldn't blank the inquiry figures.
//
// The admin count is super_admin-only server-side (restrictTo), so that tile is
// role-gated here too — an `admin` would otherwise watch it 403 forever.
import { Link } from "react-router-dom";
import { BadgeCheck, Inbox, Shirt, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import { productApi } from "../../services/productApi";
import { inquiryApi, STATUS_STYLES } from "../../services/inquiryApi";
import { certificationApi } from "../../services/certificationApi";
import { adminApi } from "../../services/adminApi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import DataTable, { timeAgo } from "../../components/admin/DataTable";
import { CategoryBars, StatusDonut } from "../../components/admin/OverviewCharts";
import { Skeleton } from "../../components/ui";

function StatCard({ icon: Icon, label, value, loading, to }) {
    const body = (
        <div className="group relative overflow-hidden rounded-xl border border-border-subtle bg-surface-raised p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-brand-gold/45 motion-reduce:transform-none">
            <span className="absolute top-0 left-0 h-1.5 w-1.5 bg-brand-gold" aria-hidden="true" />
            <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold tracking-[0.2em] text-content-subtle uppercase">
                    {label}
                </p>
                <Icon className="h-4 w-4 shrink-0 text-brand-gold" aria-hidden="true" />
            </div>
            {loading ? (
                <Skeleton className="mt-4 h-8 w-16" />
            ) : (
                <p className="mt-3 font-mono text-3xl font-bold text-content tabular-nums">
                    {value ?? "—"}
                </p>
            )}
        </div>
    );

    return to ? (
        <Link
            to={to}
            className="rounded-xl focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
        >
            {body}
        </Link>
    ) : (
        body
    );
}

export default function Overview() {
    const { user } = useAuth();
    const isSuper = user?.role === "super_admin";

    // limit:1 — we only want the `total`, not the rows.
    const products = useAsync(() => productApi.list({ limit: 1, includeInactive: true }), []);
    const inquiries = useAsync(() => inquiryApi.list({ limit: 1 }), []);
    const certs = useAsync(() => certificationApi.list({ includeInactive: true }), []);
    const admins = useAsync(() => (isSuper ? adminApi.list() : Promise.resolve(null)), [isSuper]);

    const recentInquiries = useAsync(() => inquiryApi.list({ limit: 5 }), []);
    const recentProducts = useAsync(() => productApi.list({ limit: 5, includeInactive: true }), []);
    // Active-only counts, straight from the aggregate endpoint.
    const categories = useAsync(() => productApi.categories(), []);

    const statusCounts = inquiries.data?.statusCounts || {};

    return (
        <div className="space-y-8">
            <AdminPageHeader description="Everything currently live on skhsourcing.com, at a glance." />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={Shirt}
                    label="Products"
                    value={products.data?.total}
                    loading={products.loading}
                    to="/admin/products"
                />
                <StatCard
                    icon={Inbox}
                    label="Inquiries"
                    value={inquiries.data?.total}
                    loading={inquiries.loading}
                    to="/admin/inquiries"
                />
                <StatCard
                    icon={BadgeCheck}
                    label="Certifications"
                    value={certs.data?.count}
                    loading={certs.loading}
                    to="/admin/certifications"
                />
                {isSuper ? (
                    <StatCard
                        icon={Users}
                        label="Admin Users"
                        value={admins.data?.count}
                        loading={admins.loading}
                        to="/admin/users"
                    />
                ) : null}
            </div>

            {/* Status chips come free with the inquiry list — no extra round-trip. */}
            <div className="grid gap-6 xl:grid-cols-2">
                <StatusDonut statusCounts={statusCounts} loading={inquiries.loading} />
                <CategoryBars
                    categories={categories.data?.categories || []}
                    loading={categories.loading}
                />
            </div>

            <div>
                <h2 className="font-heading text-[13px] font-bold tracking-[0.18em] text-content-subtle uppercase">
                    Jump to a status
                </h2>
                <div className="mt-4 flex flex-wrap gap-2.5">
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <Link
                            key={status}
                            to={`/admin/inquiries?status=${encodeURIComponent(status)}`}
                            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-opacity hover:opacity-80 ${
                                STATUS_STYLES[status] || "bg-slate-500/15 text-slate-500"
                            }`}
                        >
                            {status}
                            <span className="font-mono tabular-nums">{count}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-2">
                <section>
                    <div className="mb-4 flex items-baseline justify-between gap-3">
                        <h2 className="font-heading text-[15px] font-bold text-content">
                            Latest inquiries
                        </h2>
                        <Link
                            to="/admin/inquiries"
                            className="text-[12px] font-semibold tracking-widest text-brand-gold uppercase hover:underline"
                        >
                            View all
                        </Link>
                    </div>
                    <DataTable
                        loading={recentInquiries.loading}
                        rows={recentInquiries.data?.inquiries || []}
                        emptyIcon={Inbox}
                        emptyTitle="No inquiries yet"
                        emptyDescription="Quote requests from the site will appear here."
                        skeletonRows={5}
                        columns={[
                            { key: "buyerName", header: "Name" },
                            {
                                key: "email",
                                header: "Email",
                                render: (r) => (
                                    <span className="text-content-muted">{r.email}</span>
                                ),
                            },
                            {
                                key: "status",
                                header: "Status",
                                render: (r) => (
                                    <span
                                        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                            STATUS_STYLES[r.status] || ""
                                        }`}
                                    >
                                        {r.status}
                                    </span>
                                ),
                            },
                            {
                                key: "createdAt",
                                header: "Created",
                                render: (r) => (
                                    <span className="whitespace-nowrap text-content-muted">
                                        {timeAgo(r.createdAt)}
                                    </span>
                                ),
                            },
                        ]}
                    />
                </section>

                <section>
                    <div className="mb-4 flex items-baseline justify-between gap-3">
                        <h2 className="font-heading text-[15px] font-bold text-content">
                            Latest products
                        </h2>
                        <Link
                            to="/admin/products"
                            className="text-[12px] font-semibold tracking-widest text-brand-gold uppercase hover:underline"
                        >
                            View all
                        </Link>
                    </div>
                    <DataTable
                        loading={recentProducts.loading}
                        rows={recentProducts.data?.products || []}
                        emptyIcon={Shirt}
                        emptyTitle="No products yet"
                        emptyDescription="Add your first style to the catalog."
                        skeletonRows={5}
                        columns={[
                            {
                                key: "code",
                                header: "Code",
                                render: (r) => (
                                    <span className="font-mono text-[12.5px] tabular-nums">
                                        {r.code || "—"}
                                    </span>
                                ),
                            },
                            { key: "title", header: "Title" },
                            {
                                key: "category",
                                header: "Category",
                                render: (r) => (
                                    <span className="text-content-muted">{r.category}</span>
                                ),
                            },
                            {
                                key: "createdAt",
                                header: "Created",
                                render: (r) => (
                                    <span className="whitespace-nowrap text-content-muted">
                                        {timeAgo(r.createdAt)}
                                    </span>
                                ),
                            },
                        ]}
                    />
                </section>
            </div>
        </div>
    );
}
