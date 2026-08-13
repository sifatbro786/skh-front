// src/pages/admin/CertificationsManagement.jsx
// The compliance register. `scope` is the field that matters: 'partner' rows are
// standards our audited mills hold, 'held' rows are certificates SKH itself
// holds. Only 'held' may carry a downloadable PDF — the public CertificationGrid
// gates the download on exactly this, so the form hides the PDF input for
// partner rows rather than letting someone upload a file that will never render.
//
// Scope/active are client-side filters: GET /api/certifications supports only
// includeInactive, so the list is fetched once and narrowed in memory. That's
// fine at register size (~16 rows) and avoids a round-trip per chip.
import { useMemo, useState } from "react";
import { BadgeCheck, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import {
    certificationApi,
    certErrorMessage,
    certLogoUrl,
    certPdfUrl,
} from "../../services/certificationApi";
import { metaApi, META_FALLBACK, humanBytes, validateUpload } from "../../services/metaApi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import DataTable from "../../components/admin/DataTable";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { Button, Field, Modal, Select, TextInput } from "../../components/ui";

const SCOPES = [
    { value: "partner", label: "Partner-audited standard" },
    { value: "held", label: "Held by SKH" },
];

const BLANK = { title: "", issuedBy: "", scope: "partner", order: 0, isActive: true };

export default function CertificationsManagement() {
    const { user } = useAuth();
    const isSuper = user?.role === "super_admin";

    const [scopeFilter, setScopeFilter] = useState("");
    const [activeFilter, setActiveFilter] = useState("");
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(BLANK);
    const [logo, setLogo] = useState(null);
    const [pdf, setPdf] = useState(null);
    const [removePdf, setRemovePdf] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [busy, setBusy] = useState(false);

    const meta = useAsync(() => metaApi.get().catch(() => META_FALLBACK), []);
    const imageMaxBytes = meta.data?.limits?.imageMaxBytes || META_FALLBACK.limits.imageMaxBytes;

    const { data, loading, retry } = useAsync(
        () => certificationApi.list({ includeInactive: true }),
        [],
    );

    const rows = useMemo(() => {
        let list = data?.certifications || [];
        if (scopeFilter) list = list.filter((c) => (c.scope || "partner") === scopeFilter);
        if (activeFilter) list = list.filter((c) => String(c.isActive) === activeFilter);
        return list;
    }, [data, scopeFilter, activeFilter]);

    const openCreate = () => {
        setForm(BLANK);
        setLogo(null);
        setPdf(null);
        setRemovePdf(false);
        setEditing({});
    };

    const openEdit = (cert) => {
        setForm({
            title: cert.title || "",
            issuedBy: cert.issuedBy || "",
            scope: cert.scope || "partner",
            order: cert.order ?? 0,
            isActive: cert.isActive !== false,
        });
        setLogo(null);
        setPdf(null);
        setRemovePdf(false);
        setEditing(cert);
    };

    const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

    const save = async () => {
        if (!form.title.trim()) {
            toast.error("Title is required");
            return;
        }
        // The multer cap is permissive (8 MB across both fields) and the logo is
        // re-checked server-side at 3 MB — catch it here so a 413 doesn't land
        // after a full upload.
        const logoError = validateUpload(logo, { maxBytes: imageMaxBytes });
        if (logoError) {
            toast.error(`Logo: ${logoError}`);
            return;
        }

        setSaving(true);
        try {
            const payload = { ...form };
            if (logo) payload.logo = logo;
            // A partner-scope row must never carry a downloadable certificate.
            if (form.scope === "held" && pdf) payload.pdf = pdf;
            if (removePdf || (form.scope === "partner" && editing?.pdfPath)) {
                payload.removePdf = true;
            }

            if (editing?._id) await certificationApi.update(editing._id, payload);
            else await certificationApi.create(payload);

            toast.success(editing?._id ? "Certification updated" : "Certification added");
            setEditing(null);
            retry();
        } catch (err) {
            toast.error(certErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        setBusy(true);
        try {
            await certificationApi.remove(deleting._id);
            toast.success("Certification deleted");
            setDeleting(null);
            retry();
        } catch (err) {
            toast.error(certErrorMessage(err, "Could not delete the certification"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                description="Standards shown on the Compliance page. Only certificates SKH actually holds may carry a downloadable PDF."
                meta={[{ label: "Total", value: data?.count ?? "—" }]}
                actions={
                    <Button leftIcon={Plus} onClick={openCreate}>
                        Add certification
                    </Button>
                }
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Select
                    value={scopeFilter}
                    onChange={(e) => setScopeFilter(e.target.value)}
                    options={SCOPES}
                    placeholder="All scopes"
                    aria-label="Filter by scope"
                />
                <Select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    options={[
                        { value: "true", label: "Active only" },
                        { value: "false", label: "Inactive only" },
                    ]}
                    placeholder="All statuses"
                    aria-label="Filter by active"
                />
            </div>

            <DataTable
                loading={loading}
                rows={rows}
                emptyIcon={BadgeCheck}
                emptyTitle="No certifications"
                emptyDescription="Add the standards your partner mills are audited against."
                emptyAction={
                    <Button leftIcon={Plus} onClick={openCreate}>
                        Add certification
                    </Button>
                }
                columns={[
                    {
                        key: "logo",
                        header: "",
                        render: (r) =>
                            r.logoPath ? (
                                <img
                                    src={certLogoUrl(r)}
                                    alt=""
                                    loading="lazy"
                                    className="h-9 w-9 object-contain"
                                />
                            ) : (
                                <div className="grid h-9 w-9 place-items-center rounded-md bg-surface-inset text-[10px] text-content-subtle">
                                    —
                                </div>
                            ),
                    },
                    {
                        key: "title",
                        header: "Title",
                        render: (r) => <span className="font-semibold">{r.title}</span>,
                    },
                    {
                        key: "issuedBy",
                        header: "Issued by",
                        render: (r) => (
                            <span className="text-content-muted">{r.issuedBy || "—"}</span>
                        ),
                    },
                    {
                        key: "scope",
                        header: "Scope",
                        render: (r) => (
                            <span
                                className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                                    (r.scope || "partner") === "held"
                                        ? "bg-brand-gold/15 text-brand-gold"
                                        : "bg-slate-500/15 text-slate-500"
                                }`}
                            >
                                {(r.scope || "partner") === "held" ? "Held" : "Partner"}
                            </span>
                        ),
                    },
                    {
                        key: "order",
                        header: "Order",
                        render: (r) => (
                            <span className="font-mono tabular-nums">{r.order ?? 0}</span>
                        ),
                    },
                    {
                        key: "isActive",
                        header: "Active",
                        render: (r) => (
                            <span
                                className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                    r.isActive
                                        ? "bg-emerald-500/15 text-emerald-600"
                                        : "bg-slate-500/15 text-slate-500"
                                }`}
                            >
                                {r.isActive ? "Live" : "Hidden"}
                            </span>
                        ),
                    },
                    {
                        key: "pdf",
                        header: "PDF",
                        render: (r) =>
                            r.pdfPath ? (
                                <FileText className="h-4 w-4 text-brand-gold" aria-label="Has PDF" />
                            ) : (
                                <span className="text-content-subtle">—</span>
                            ),
                    },
                    {
                        key: "actions",
                        header: "",
                        render: (r) => (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEdit(r)}
                                    aria-label={`Edit ${r.title}`}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                {isSuper ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeleting(r)}
                                        aria-label={`Delete ${r.title}`}
                                    >
                                        <Trash2 className="h-4 w-4 text-danger" />
                                    </Button>
                                ) : null}
                            </div>
                        ),
                    },
                ]}
            />

            <Modal
                open={Boolean(editing)}
                onClose={() => setEditing(null)}
                title={editing?._id ? "Edit certification" : "Add certification"}
                eyebrow="Compliance"
                dismissible={!saving}
                footer={
                    <div className="flex justify-end gap-2.5">
                        <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={save} loading={saving}>
                            {editing?._id ? "Save changes" : "Add"}
                        </Button>
                    </div>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Title" htmlFor="c-title" required className="sm:col-span-2">
                        <TextInput
                            id="c-title"
                            maxLength={140}
                            value={form.title}
                            onChange={(e) => set("title")(e.target.value)}
                            placeholder="OEKO-TEX STANDARD 100"
                        />
                    </Field>

                    <Field label="Issued by" htmlFor="c-issuer">
                        <TextInput
                            id="c-issuer"
                            maxLength={140}
                            value={form.issuedBy}
                            onChange={(e) => set("issuedBy")(e.target.value)}
                        />
                    </Field>

                    <Field label="Order" htmlFor="c-order" hint="Lower sorts first">
                        <TextInput
                            id="c-order"
                            type="number"
                            min={0}
                            value={form.order}
                            onChange={(e) => set("order")(e.target.value)}
                        />
                    </Field>

                    <Field
                        label="Scope"
                        htmlFor="c-scope"
                        className="sm:col-span-2"
                        hint="Partner rows show 'Partner-audited' publicly and never expose a download."
                    >
                        <Select
                            id="c-scope"
                            value={form.scope}
                            onChange={(e) => set("scope")(e.target.value)}
                            options={SCOPES}
                            placeholder=""
                        />
                    </Field>

                    <Field
                        label="Logo"
                        htmlFor="c-logo"
                        className="sm:col-span-2"
                        hint={`Max ${humanBytes(imageMaxBytes)}. PNG or SVG on a transparent background.`}
                    >
                        <input
                            id="c-logo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setLogo(e.target.files?.[0] || null)}
                            className="block w-full text-[13px] text-content-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-inset file:px-3 file:py-2 file:text-[12.5px] file:font-semibold file:text-content"
                        />
                        <div className="mt-3 flex items-center gap-3">
                            {logo ? (
                                <img
                                    src={URL.createObjectURL(logo)}
                                    alt=""
                                    className="h-12 w-12 object-contain"
                                />
                            ) : editing?.logoPath ? (
                                <img
                                    src={certLogoUrl(editing)}
                                    alt=""
                                    className="h-12 w-12 object-contain"
                                />
                            ) : null}
                        </div>
                    </Field>

                    {/* PDF only exists for scope=held — see the file header. */}
                    {form.scope === "held" ? (
                        <Field
                            label="Certificate PDF"
                            htmlFor="c-pdf"
                            className="sm:col-span-2"
                            hint="Only upload a certificate SKH actually holds."
                        >
                            <input
                                id="c-pdf"
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => setPdf(e.target.files?.[0] || null)}
                                className="block w-full text-[13px] text-content-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-inset file:px-3 file:py-2 file:text-[12.5px] file:font-semibold file:text-content"
                            />
                            {editing?.pdfPath ? (
                                <div className="mt-3 flex flex-wrap items-center gap-4">
                                    <a
                                        href={certPdfUrl(editing)}
                                        target="_blank"
                                        rel="noopener"
                                        className="text-[12.5px] font-semibold text-brand-gold hover:underline"
                                    >
                                        View current PDF
                                    </a>
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={removePdf}
                                            onChange={(e) => setRemovePdf(e.target.checked)}
                                            className="h-4 w-4 accent-[#C5A059]"
                                        />
                                        <span className="text-[13px] text-content">
                                            Remove current PDF
                                        </span>
                                    </label>
                                </div>
                            ) : null}
                        </Field>
                    ) : editing?.pdfPath ? (
                        <p className="text-[12.5px] text-content-muted sm:col-span-2">
                            Switching this row to partner scope will remove its stored PDF on save.
                        </p>
                    ) : null}

                    <label className="flex cursor-pointer items-center gap-2.5 sm:col-span-2">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) => set("isActive")(e.target.checked)}
                            className="h-4 w-4 accent-[#C5A059]"
                        />
                        <span className="text-[13px] text-content">Active (visible publicly)</span>
                    </label>
                </div>
            </Modal>

            <ConfirmDialog
                open={Boolean(deleting)}
                onClose={() => setDeleting(null)}
                onConfirm={confirmDelete}
                busy={busy}
                title={`Delete ${deleting?.title || "certification"}?`}
                description="The logo and any stored certificate PDF will be removed from disk."
            />
        </div>
    );
}
