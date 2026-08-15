/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/admin/InquiriesManagement.jsx
// The RFQ inbox. Filters map 1:1 onto buildInquiryFilter() in the backend
// (status, buyerType, country, from, to, hasTechPack, search, source) —
// anything not in that list is silently ignored server-side, so nothing is
// added here that the API can't honour.
//
// `hasTechPack` is a presence flag, not a path: sanitizeInquiry() strips
// techPackFile from every response and replaces it with a boolean, so the file
// is only ever reachable through the authenticated /:id/techpack download.
//
// `source` distinguishes RFQ origin. Backend sets it: "product-rfq" (RFQ opened
// from a product, productId is always set) or "rfq" (RFQ opened anywhere else).
// "contact" and "website" are LEGACY values only — the contact form is now
// email-only (POST /api/contact) and no longer writes to this collection, so no
// new rows carry those sources. The filter keeps them so old rows stay findable.
//
// The export deliberately reuses the SAME params object as the list so "Export
// Excel" always matches what's on screen; inquiryApi.exportExcel drops page and
// limit itself.
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, FileDown, Inbox, Paperclip, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import { useDebounce } from "../../hooks/useDebounce";
import { inquiryApi, inquiryErrorMessage, STATUS_STYLES } from "../../services/inquiryApi";
import { metaApi, META_FALLBACK } from "../../services/metaApi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import DataTable, { timeAgo } from "../../components/admin/DataTable";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { Button, Field, Modal, Pagination, Select, TextArea, TextInput } from "../../components/ui";

const SOURCE_LABEL = {
    contact: "Contact",
    rfq: "Quote",
    "product-rfq": "Product quote",
    website: "Website",
};

// Options for the filter <Select>. Kept local rather than round-tripping
// through /api/meta — it's a fixed, tiny, backend-defined enum.
const SOURCE_OPTIONS = [
    { value: "rfq", label: "Quote request" },
    { value: "product-rfq", label: "Product quote" },
];

// Small visual distinction so the two most common sources read at a glance
// without adding a new color to the design system.
const SOURCE_BADGE = {
    contact: "border-border-subtle text-content-muted",
    rfq: "border-brand-gold/40 text-brand-gold",
    "product-rfq": "border-brand-gold/40 text-brand-gold",
};

export default function InquiriesManagement() {
    const { user } = useAuth();
    const isSuper = user?.role === "super_admin";
    const [searchParams] = useSearchParams();

    // Deep link from the Overview status chips: /admin/inquiries?status=New
    const [status, setStatus] = useState(searchParams.get("status") || "");
    const [buyerType, setBuyerType] = useState("");
    const [source, setSource] = useState(searchParams.get("source") || "");
    const [country, setCountry] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [hasTechPack, setHasTechPack] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(search, 350);
    const debouncedCountry = useDebounce(country, 350);

    const [active, setActive] = useState(null); // detail drawer row
    const [draftStatus, setDraftStatus] = useState("");
    const [draftNote, setDraftNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [busy, setBusy] = useState(false);

    const meta = useAsync(() => metaApi.get().catch(() => META_FALLBACK), []);
    const statuses = meta.data?.inquiryStatuses || META_FALLBACK.inquiryStatuses;
    const buyerTypes = meta.data?.buyerTypes || META_FALLBACK.buyerTypes;

    const params = useMemo(
        () => ({
            page,
            limit: 20,
            status: status || undefined,
            buyerType: buyerType || undefined,
            source: source || undefined,
            country: debouncedCountry || undefined,
            from: from || undefined,
            to: to || undefined,
            hasTechPack: hasTechPack ? "true" : undefined,
            search: debouncedSearch || undefined,
        }),
        [page, status, buyerType, source, debouncedCountry, from, to, hasTechPack, debouncedSearch],
    );

    const { data, loading, retry } = useAsync(() => inquiryApi.list(params), [params]);
    const rows = data?.inquiries || [];

    useEffect(() => {
        if (active) {
            setDraftStatus(active.status || "New");
            setDraftNote(active.adminNote || "");
        }
    }, [active]);

    const saveStatus = async () => {
        setSaving(true);
        try {
            await inquiryApi.updateStatus(active._id, draftStatus, draftNote);
            toast.success("Inquiry updated");
            setActive(null);
            retry();
        } catch (err) {
            toast.error(inquiryErrorMessage(err, "Could not update the inquiry"));
        } finally {
            setSaving(false);
        }
    };

    const exportExcel = async () => {
        setExporting(true);
        try {
            await inquiryApi.exportExcel(params);
            toast.success("Export downloaded");
        } catch (err) {
            toast.error(inquiryErrorMessage(err, "Could not export inquiries"));
        } finally {
            setExporting(false);
        }
    };

    const downloadTechPack = async (id) => {
        try {
            await inquiryApi.downloadTechPack(id);
        } catch (err) {
            toast.error(inquiryErrorMessage(err, "Could not download the tech pack"));
        }
    };

    const confirmDelete = async () => {
        setBusy(true);
        try {
            await inquiryApi.remove(deleting._id);
            toast.success("Inquiry deleted");
            setDeleting(null);
            setActive(null);
            retry();
        } catch (err) {
            toast.error(inquiryErrorMessage(err, "Could not delete the inquiry"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                description="Quote requests from the RFQ modal and product pages. Contact-form messages are email-only and don't appear here. Filters apply to the Excel export too."
                meta={[{ label: "Total", value: data?.total ?? "—" }]}
                actions={
                    <Button
                        variant="outline"
                        leftIcon={FileDown}
                        onClick={exportExcel}
                        loading={exporting}
                    >
                        Export Excel
                    </Button>
                }
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="relative">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-content-subtle"
                        aria-hidden="true"
                    />
                    <TextInput
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Name, email, company…"
                        className="pl-9"
                        aria-label="Search inquiries"
                    />
                </div>
                <Select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                    options={statuses}
                    placeholder="All statuses"
                    aria-label="Filter by status"
                />
                <Select
                    value={source}
                    onChange={(e) => {
                        setSource(e.target.value);
                        setPage(1);
                    }}
                    options={SOURCE_OPTIONS}
                    placeholder="All sources"
                    aria-label="Filter by source"
                />
                <Select
                    value={buyerType}
                    onChange={(e) => {
                        setBuyerType(e.target.value);
                        setPage(1);
                    }}
                    options={buyerTypes}
                    placeholder="All buyer types"
                    aria-label="Filter by buyer type"
                />
                <TextInput
                    value={country}
                    onChange={(e) => {
                        setCountry(e.target.value);
                        setPage(1);
                    }}
                    placeholder="Country"
                    aria-label="Filter by country"
                />
                <TextInput
                    type="date"
                    value={from}
                    onChange={(e) => {
                        setFrom(e.target.value);
                        setPage(1);
                    }}
                    aria-label="From date"
                />
                <TextInput
                    type="date"
                    value={to}
                    onChange={(e) => {
                        setTo(e.target.value);
                        setPage(1);
                    }}
                    aria-label="To date"
                />
                <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                        type="checkbox"
                        checked={hasTechPack}
                        onChange={(e) => {
                            setHasTechPack(e.target.checked);
                            setPage(1);
                        }}
                        className="h-4 w-4 accent-brand-gold"
                    />
                    <span className="text-[13px] text-content">Has tech pack</span>
                </label>
            </div>

            <DataTable
                loading={loading}
                rows={rows}
                onRowClick={setActive}
                emptyIcon={Inbox}
                emptyTitle="No inquiries found"
                emptyDescription="Nothing matches these filters yet."
                columns={[
                    {
                        key: "buyerName",
                        header: "Buyer",
                        render: (r) => <span className="font-semibold">{r.buyerName}</span>,
                    },
                    {
                        key: "email",
                        header: "Email",
                        render: (r) => <span className="text-content-muted">{r.email}</span>,
                    },
                    {
                        key: "companyName",
                        header: "Company",
                        render: (r) => (
                            <span className="text-content-muted">{r.companyName || "—"}</span>
                        ),
                    },
                    {
                        // populate() only selects title + category — there is no
                        // product code on this payload.
                        key: "productId",
                        header: "Product",
                        render: (r) => (
                            <span className="text-content-muted">{r.productId?.title || "—"}</span>
                        ),
                    },
                    {
                        key: "source",
                        header: "Source",
                        render: (r) => (
                            <span
                                className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                                    SOURCE_BADGE[r.source] ||
                                    "border-border-subtle text-content-muted"
                                }`}
                            >
                                {SOURCE_LABEL[r.source] || "Website"}
                            </span>
                        ),
                    },
                    {
                        key: "status",
                        header: "Status",
                        render: (r) => (
                            <span
                                className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                                    STATUS_STYLES[r.status] || ""
                                }`}
                            >
                                {r.status}
                            </span>
                        ),
                    },
                    {
                        key: "hasTechPack",
                        header: "Tech pack",
                        render: (r) =>
                            r.hasTechPack ? (
                                <Paperclip
                                    className="h-4 w-4 text-brand-gold"
                                    aria-label="Has tech pack"
                                />
                            ) : (
                                <span className="text-content-subtle">—</span>
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

            <Pagination page={data?.page || 1} pages={data?.pages || 1} onChange={setPage} />

            <Modal
                open={Boolean(active)}
                onClose={() => setActive(null)}
                title={active?.buyerName || "Inquiry"}
                eyebrow="Inquiry detail"
                size="lg"
                dismissible={!saving}
                footer={
                    <div className="flex flex-wrap justify-between gap-2.5">
                        {isSuper ? (
                            <Button
                                variant="ghost"
                                leftIcon={Trash2}
                                onClick={() => setDeleting(active)}
                                disabled={saving}
                            >
                                Delete
                            </Button>
                        ) : (
                            <span />
                        )}
                        <div className="flex gap-2.5">
                            <Button
                                variant="ghost"
                                onClick={() => setActive(null)}
                                disabled={saving}
                            >
                                Close
                            </Button>
                            <Button onClick={saveStatus} loading={saving}>
                                Update
                            </Button>
                        </div>
                    </div>
                }
            >
                {active ? (
                    <div className="space-y-6">
                        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                            {[
                                ["Source", SOURCE_LABEL[active.source] || "Website"],
                                ["Email", active.email],
                                ["Phone", active.phone],
                                ["Company", active.companyName],
                                ["Country", active.country],
                                ["Buyer type", active.buyerType],
                                ["Target quantity", active.targetQuantity],
                                ["Product", active.productId?.title],
                                ["Category", active.productId?.category],
                                ["Received", new Date(active.createdAt).toLocaleString()],
                            ].map(([label, value]) => (
                                <div key={label} className="flex flex-col gap-0.5">
                                    <dt className="text-[10px] font-bold tracking-[0.18em] text-content-subtle uppercase">
                                        {label}
                                    </dt>
                                    <dd className="text-[13.5px] wrap-break-word text-content">
                                        {value || "—"}
                                    </dd>
                                </div>
                            ))}
                        </dl>

                        {active.message ? (
                            <div>
                                <p className="text-[10px] font-bold tracking-[0.18em] text-content-subtle uppercase">
                                    Message
                                </p>
                                <p className="mt-2 rounded-lg bg-surface-inset p-4 text-[14px] leading-relaxed whitespace-pre-wrap text-content-muted">
                                    {active.message}
                                </p>
                            </div>
                        ) : null}

                        {active.hasTechPack ? (
                            <Button
                                variant="outline"
                                leftIcon={Download}
                                onClick={() => downloadTechPack(active._id)}
                            >
                                Download tech pack
                            </Button>
                        ) : null}

                        <div className="grid gap-4 border-t border-border-subtle pt-5 sm:grid-cols-2">
                            <Field label="Status" htmlFor="i-status">
                                <Select
                                    id="i-status"
                                    value={draftStatus}
                                    onChange={(e) => setDraftStatus(e.target.value)}
                                    options={statuses}
                                    placeholder=""
                                />
                            </Field>
                            <Field
                                label="Admin note"
                                htmlFor="i-note"
                                className="sm:col-span-2"
                                counter={`${draftNote.length} / 2000`}
                            >
                                <TextArea
                                    id="i-note"
                                    rows={3}
                                    maxLength={2000}
                                    value={draftNote}
                                    onChange={(e) => setDraftNote(e.target.value)}
                                    placeholder="Internal only — never shown to the buyer."
                                />
                            </Field>
                        </div>
                    </div>
                ) : null}
            </Modal>

            <ConfirmDialog
                open={Boolean(deleting)}
                onClose={() => setDeleting(null)}
                onConfirm={confirmDelete}
                busy={busy}
                title={`Delete inquiry from ${deleting?.buyerName || "buyer"}?`}
                description="The inquiry and any uploaded tech pack will be permanently removed."
            />
        </div>
    );
}
