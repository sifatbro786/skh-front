// src/pages/admin/PageMetaManagement.jsx
// SEO rows for the public pages.
//
// Schema gotchas this form is built around:
//  · metaTitle, metaDescription, metaKeywords AND canonicalUrl are all REQUIRED
//    on the model — a partial create 400s, so every field is marked required here.
//  · pageSlug is `unique + sparse`: a row saved WITHOUT a slug is invisible to
//    the public route (usePageMeta looks up by slug), so the form warns instead
//    of silently creating an orphan row.
//  · GET /api/page-meta returns the full list — no pagination server-side, so
//    there's no Pagination here. Search is client-side for the same reason.
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAsync } from "../../hooks/useAsync";
import { pageMetaApi, pageMetaErrorMessage } from "../../services/pageMetaApi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import DataTable, { timeAgo } from "../../components/admin/DataTable";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { Button, Field, Modal, TextArea, TextInput } from "../../components/ui";

const BLANK = {
    pageName: "",
    pageSlug: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    isActive: true,
};

export default function PageMetaManagement() {
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(BLANK);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [busy, setBusy] = useState(false);

    const { data, loading, retry } = useAsync(() => pageMetaApi.getAll(), []);

    const rows = useMemo(() => {
        const list = data?.pageMetas || [];
        const term = search.trim().toLowerCase();
        if (!term) return list;
        return list.filter((r) =>
            [r.pageName, r.pageSlug, r.metaTitle]
                .filter(Boolean)
                .some((v) => v.toLowerCase().includes(term)),
        );
    }, [data, search]);

    const openCreate = () => {
        setForm(BLANK);
        setEditing({});
    };

    const openEdit = (row) => {
        setForm({
            pageName: row.pageName || "",
            pageSlug: row.pageSlug || "",
            metaTitle: row.metaTitle || "",
            metaDescription: row.metaDescription || "",
            metaKeywords: row.metaKeywords || "",
            canonicalUrl: row.canonicalUrl || "",
            isActive: row.isActive !== false,
        });
        setEditing(row);
    };

    const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

    const save = async () => {
        const missing = ["pageName", "metaTitle", "metaDescription", "metaKeywords", "canonicalUrl"]
            .filter((k) => !String(form[k]).trim());
        if (missing.length) {
            toast.error("All fields except the slug are required by the schema");
            return;
        }

        setSaving(true);
        try {
            if (editing?._id) await pageMetaApi.update(editing._id, form);
            else await pageMetaApi.create(form);
            toast.success(editing?._id ? "Page SEO updated" : "Page SEO created");
            setEditing(null);
            retry();
        } catch (err) {
            toast.error(pageMetaErrorMessage(err, "Could not save the page SEO row"));
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        setBusy(true);
        try {
            await pageMetaApi.remove(deleting._id);
            toast.success("Page SEO row deleted");
            setDeleting(null);
            retry();
        } catch (err) {
            toast.error(pageMetaErrorMessage(err, "Could not delete the row"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                description="Meta titles and descriptions the public pages hydrate by slug. A row without a slug is never served."
                meta={[{ label: "Rows", value: data?.count ?? "—" }]}
                actions={
                    <Button leftIcon={Plus} onClick={openCreate}>
                        New page
                    </Button>
                }
            />

            <div className="relative max-w-sm">
                <Search
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-content-subtle"
                    aria-hidden="true"
                />
                <TextInput
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, slug or title…"
                    className="pl-9"
                    aria-label="Search page SEO rows"
                />
            </div>

            <DataTable
                loading={loading}
                rows={rows}
                emptyIcon={Search}
                emptyTitle="No SEO rows"
                emptyDescription="Add a row per public page to control its meta tags."
                emptyAction={
                    <Button leftIcon={Plus} onClick={openCreate}>
                        New page
                    </Button>
                }
                columns={[
                    {
                        key: "pageName",
                        header: "Page",
                        render: (r) => <span className="font-semibold">{r.pageName}</span>,
                    },
                    {
                        key: "pageSlug",
                        header: "Slug",
                        render: (r) =>
                            r.pageSlug ? (
                                <span className="font-mono text-[12.5px]">{r.pageSlug}</span>
                            ) : (
                                <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
                                    No slug
                                </span>
                            ),
                    },
                    {
                        key: "metaTitle",
                        header: "Title",
                        render: (r) => (
                            <span className="line-clamp-1 max-w-xs text-content-muted">
                                {r.metaTitle}
                            </span>
                        ),
                    },
                    {
                        key: "metaDescription",
                        header: "Description",
                        render: (r) => (
                            <span className="line-clamp-1 max-w-sm text-content-muted">
                                {r.metaDescription}
                            </span>
                        ),
                    },
                    {
                        key: "updatedAt",
                        header: "Updated",
                        render: (r) => (
                            <span className="whitespace-nowrap text-content-muted">
                                {timeAgo(r.updatedAt)}
                            </span>
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
                                    aria-label={`Edit ${r.pageName}`}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                {/* Not super_admin gated — the route is `protect` only. */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleting(r)}
                                    aria-label={`Delete ${r.pageName}`}
                                >
                                    <Trash2 className="h-4 w-4 text-danger" />
                                </Button>
                            </div>
                        ),
                    },
                ]}
            />

            <Modal
                open={Boolean(editing)}
                onClose={() => setEditing(null)}
                title={editing?._id ? "Edit page SEO" : "New page SEO"}
                eyebrow="Site"
                size="lg"
                dismissible={!saving}
                footer={
                    <div className="flex justify-end gap-2.5">
                        <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={save} loading={saving}>
                            {editing?._id ? "Save changes" : "Create"}
                        </Button>
                    </div>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Page name" htmlFor="m-name" required>
                        <TextInput
                            id="m-name"
                            value={form.pageName}
                            onChange={(e) => set("pageName")(e.target.value)}
                            placeholder="Home"
                        />
                    </Field>

                    <Field
                        label="Page slug"
                        htmlFor="m-slug"
                        hint="Lowercase. Without it, this row is never served publicly."
                    >
                        <TextInput
                            id="m-slug"
                            value={form.pageSlug}
                            onChange={(e) => set("pageSlug")(e.target.value.toLowerCase())}
                            placeholder="home"
                        />
                    </Field>

                    <Field
                        label="Meta title"
                        htmlFor="m-title"
                        required
                        className="sm:col-span-2"
                        counter={`${form.metaTitle.length} / 70 recommended`}
                    >
                        <TextInput
                            id="m-title"
                            value={form.metaTitle}
                            onChange={(e) => set("metaTitle")(e.target.value)}
                            invalid={form.metaTitle.length > 70}
                        />
                    </Field>

                    <Field
                        label="Meta description"
                        htmlFor="m-desc"
                        required
                        className="sm:col-span-2"
                        counter={`${form.metaDescription.length} / 160 recommended`}
                    >
                        <TextArea
                            id="m-desc"
                            rows={3}
                            value={form.metaDescription}
                            onChange={(e) => set("metaDescription")(e.target.value)}
                            invalid={form.metaDescription.length > 160}
                        />
                    </Field>

                    <Field
                        label="Meta keywords"
                        htmlFor="m-keys"
                        required
                        className="sm:col-span-2"
                        hint="Comma separated"
                    >
                        <TextInput
                            id="m-keys"
                            value={form.metaKeywords}
                            onChange={(e) => set("metaKeywords")(e.target.value)}
                            placeholder="apparel sourcing, bangladesh, knitwear"
                        />
                    </Field>

                    <Field
                        label="Canonical URL"
                        htmlFor="m-canon"
                        required
                        className="sm:col-span-2"
                    >
                        <TextInput
                            id="m-canon"
                            type="url"
                            value={form.canonicalUrl}
                            onChange={(e) => set("canonicalUrl")(e.target.value)}
                            placeholder="https://www.skhsourcing.com/"
                        />
                    </Field>

                    <label className="flex cursor-pointer items-center gap-2.5 sm:col-span-2">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) => set("isActive")(e.target.checked)}
                            className="h-4 w-4 accent-[#C5A059]"
                        />
                        <span className="text-[13px] text-content">Active</span>
                    </label>
                </div>
            </Modal>

            <ConfirmDialog
                open={Boolean(deleting)}
                onClose={() => setDeleting(null)}
                onConfirm={confirmDelete}
                busy={busy}
                title={`Delete SEO row for ${deleting?.pageName || "page"}?`}
                description="That page will fall back to its hard-coded meta tags."
            />
        </div>
    );
}
