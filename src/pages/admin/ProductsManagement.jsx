// src/pages/admin/ProductsManagement.jsx
// Catalog CRUD. Two things here are load-bearing and easy to get wrong:
//
//  1. IMAGE CONTRACT — the backend takes `replaceImages` (wipe all, use the new
//     upload) OR `removeImages[]` (delete named paths). Sending both is
//     ambiguous, so the form disables the per-image checkboxes the moment
//     "replace all" is ticked.
//  2. CODE — left blank on create, the backend assigns SKH-000NN via
//     nextSequence(). productApi.buildProductForm already drops a blank code
//     rather than sending "" (which would collide on the sparse unique index).
//
// The "Active" filter maps to includeInactive, NOT a boolean field: the backend
// exposes all-vs-active-only, not active-only-vs-inactive-only.
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Shirt, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import { useDebounce } from "../../hooks/useDebounce";
import { productApi, productErrorMessage } from "../../services/productApi";
import { assetUrl } from "../../services/api";
import { metaApi, META_FALLBACK } from "../../services/metaApi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import DataTable, { timeAgo } from "../../components/admin/DataTable";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { Button, Field, Modal, Pagination, Select, TextArea, TextInput } from "../../components/ui";

const BLANK = {
    title: "",
    code: "",
    category: "",
    subCategory: "",
    fabricDetails: "",
    moq: "",
    description: "",
    isFeatured: false,
    isActive: true,
};

function Toggle({ id, checked, onChange, label }) {
    return (
        <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5">
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 accent-brand-gold"
            />
            <span className="text-[13px] text-content">{label}</span>
        </label>
    );
}

export default function ProductsManagement() {
    const { user } = useAuth();
    const isSuper = user?.role === "super_admin";

    const [page, setPage] = useState(1);
    const [category, setCategory] = useState("");
    const [search, setSearch] = useState("");
    const [featured, setFeatured] = useState("");
    const [showInactive, setShowInactive] = useState(true);
    const debouncedSearch = useDebounce(search, 350);

    const [editing, setEditing] = useState(null); // null = closed, {} = create
    const [form, setForm] = useState(BLANK);
    const [files, setFiles] = useState([]);
    const [replaceImages, setReplaceImages] = useState(false);
    const [removeImages, setRemoveImages] = useState([]);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [busy, setBusy] = useState(false);

    const meta = useAsync(() => metaApi.get().catch(() => META_FALLBACK), []);
    const categories = meta.data?.productCategories || META_FALLBACK.productCategories;
    const maxImages = meta.data?.limits?.productMaxImages || 8;

    const params = useMemo(
        () => ({
            page,
            limit: 20,
            category: category || undefined,
            search: debouncedSearch || undefined,
            featured: featured === "" ? undefined : featured,
            includeInactive: showInactive ? "true" : undefined,
        }),
        [page, category, debouncedSearch, featured, showInactive],
    );

    const { data, loading, retry } = useAsync(() => productApi.list(params), [params]);
    const rows = data?.products || [];

    const openCreate = () => {
        setForm(BLANK);
        setFiles([]);
        setReplaceImages(false);
        setRemoveImages([]);
        setEditing({});
    };

    const openEdit = (product) => {
        setForm({
            title: product.title || "",
            code: product.code || "",
            category: product.category || "",
            subCategory: product.subCategory || "",
            fabricDetails: product.fabricDetails || "",
            moq: product.moq || "",
            description: product.description || "",
            isFeatured: Boolean(product.isFeatured),
            isActive: product.isActive !== false,
        });
        setFiles([]);
        setReplaceImages(false);
        setRemoveImages([]);
        setEditing(product);
    };

    const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

    const save = async () => {
        if (!form.title.trim() || !form.category) {
            toast.error("Title and category are required");
            return;
        }
        if (files.length > maxImages) {
            toast.error(`Maximum ${maxImages} images`);
            return;
        }

        setSaving(true);
        try {
            const payload = { ...form, images: files };
            // Never send both — replaceImages already implies a full wipe.
            if (replaceImages) payload.replaceImages = true;
            else if (removeImages.length) payload.removeImages = removeImages;

            if (editing?._id) await productApi.update(editing._id, payload);
            else await productApi.create(payload);

            toast.success(editing?._id ? "Product updated" : "Product created");
            setEditing(null);
            retry();
        } catch (err) {
            toast.error(productErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const toggleFeatured = async (product) => {
        try {
            await productApi.toggleFeatured(product._id);
            retry();
        } catch (err) {
            toast.error(productErrorMessage(err));
        }
    };

    const confirmDelete = async () => {
        setBusy(true);
        try {
            await productApi.remove(deleting._id);
            toast.success("Product deleted");
            setDeleting(null);
            retry();
        } catch (err) {
            toast.error(productErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const existingImages = editing?.images || [];

    return (
        <div className="space-y-6">
            <AdminPageHeader
                description="Every style in the public catalog. Codes are assigned automatically when left blank."
                meta={[{ label: "Total", value: data?.total ?? "—" }]}
                actions={
                    <Button leftIcon={Plus} onClick={openCreate}>
                        New product
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
                        placeholder="Search title, code, fabric…"
                        className="pl-9"
                        aria-label="Search products"
                    />
                </div>
                <Select
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                        setPage(1);
                    }}
                    options={categories}
                    placeholder="All categories"
                    aria-label="Filter by category"
                />
                <Select
                    value={featured}
                    onChange={(e) => {
                        setFeatured(e.target.value);
                        setPage(1);
                    }}
                    options={[
                        { value: "true", label: "Featured only" },
                        { value: "false", label: "Not featured" },
                    ]}
                    placeholder="All products"
                    aria-label="Filter by featured"
                />
                <div className="flex items-center">
                    <Toggle
                        id="show-inactive"
                        checked={showInactive}
                        onChange={(v) => {
                            setShowInactive(v);
                            setPage(1);
                        }}
                        label="Include inactive"
                    />
                </div>
            </div>

            <DataTable
                loading={loading}
                rows={rows}
                emptyIcon={Shirt}
                emptyTitle="No products found"
                emptyDescription="Adjust the filters, or add a new style to the catalog."
                emptyAction={
                    <Button leftIcon={Plus} onClick={openCreate}>
                        New product
                    </Button>
                }
                columns={[
                    {
                        key: "image",
                        header: "",
                        render: (r) =>
                            r.images?.[0] ? (
                                <img
                                    src={assetUrl(r.images[0])}
                                    alt=""
                                    loading="lazy"
                                    className="h-10 w-10 rounded-md object-cover"
                                />
                            ) : (
                                <div className="grid h-10 w-10 place-items-center rounded-md bg-surface-inset text-[10px] text-content-subtle">
                                    —
                                </div>
                            ),
                    },
                    {
                        key: "code",
                        header: "Code",
                        render: (r) => (
                            <span className="font-mono text-[12.5px] whitespace-nowrap tabular-nums">
                                {r.code || "—"}
                            </span>
                        ),
                    },
                    {
                        key: "title",
                        header: "Title",
                        render: (r) => <span className="font-semibold">{r.title}</span>,
                    },
                    { key: "category", header: "Category" },
                    {
                        key: "subCategory",
                        header: "Sub",
                        render: (r) => (
                            <span className="text-content-muted">{r.subCategory || "—"}</span>
                        ),
                    },
                    {
                        key: "moq",
                        header: "MOQ",
                        render: (r) => <span className="text-content-muted">{r.moq || "—"}</span>,
                    },
                    {
                        key: "isFeatured",
                        header: "Featured",
                        render: (r) => (
                            <button
                                type="button"
                                onClick={() => toggleFeatured(r)}
                                aria-label={`${r.isFeatured ? "Unfeature" : "Feature"} ${r.title}`}
                                className="rounded p-1 transition-colors hover:bg-surface-inset focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                            >
                                <Star
                                    className={`h-4 w-4 ${
                                        r.isFeatured
                                            ? "fill-brand-gold text-brand-gold"
                                            : "text-content-subtle"
                                    }`}
                                />
                            </button>
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

            <Pagination page={data?.page || 1} pages={data?.pages || 1} onChange={setPage} />

            <Modal
                open={Boolean(editing)}
                onClose={() => setEditing(null)}
                title={editing?._id ? "Edit product" : "New product"}
                eyebrow="Catalog"
                size="lg"
                dismissible={!saving}
                footer={
                    <div className="flex justify-end gap-2.5">
                        <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={save} loading={saving}>
                            {editing?._id ? "Save changes" : "Create product"}
                        </Button>
                    </div>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Title" htmlFor="p-title" required className="sm:col-span-2">
                        <TextInput
                            id="p-title"
                            maxLength={140}
                            value={form.title}
                            onChange={(e) => set("title")(e.target.value)}
                        />
                    </Field>

                    <Field
                        label="Code"
                        htmlFor="p-code"
                        hint="Leave blank to auto-assign SKH-000NN"
                    >
                        <TextInput
                            id="p-code"
                            value={form.code}
                            onChange={(e) => set("code")(e.target.value)}
                            placeholder="Auto"
                        />
                    </Field>

                    <Field label="Category" htmlFor="p-cat" required>
                        <Select
                            id="p-cat"
                            value={form.category}
                            onChange={(e) => set("category")(e.target.value)}
                            options={categories}
                            placeholder="Select a category"
                        />
                    </Field>

                    <Field label="Sub-category" htmlFor="p-sub" hint="Free text, e.g. Polo Shirt">
                        <TextInput
                            id="p-sub"
                            maxLength={80}
                            value={form.subCategory}
                            onChange={(e) => set("subCategory")(e.target.value)}
                        />
                    </Field>

                    <Field label="MOQ" htmlFor="p-moq">
                        <TextInput
                            id="p-moq"
                            maxLength={80}
                            value={form.moq}
                            onChange={(e) => set("moq")(e.target.value)}
                            placeholder="500 pcs / colour"
                        />
                    </Field>

                    <Field
                        label="Fabric details"
                        htmlFor="p-fabric"
                        className="sm:col-span-2"
                        counter={`${form.fabricDetails.length} / 300`}
                    >
                        <TextArea
                            id="p-fabric"
                            rows={2}
                            maxLength={300}
                            value={form.fabricDetails}
                            onChange={(e) => set("fabricDetails")(e.target.value)}
                        />
                    </Field>

                    <Field
                        label="Description"
                        htmlFor="p-desc"
                        className="sm:col-span-2"
                        counter={`${form.description.length} / 4000`}
                    >
                        <TextArea
                            id="p-desc"
                            rows={4}
                            maxLength={4000}
                            value={form.description}
                            onChange={(e) => set("description")(e.target.value)}
                        />
                    </Field>

                    <Field
                        label="Images"
                        htmlFor="p-images"
                        className="sm:col-span-2"
                        hint={`Up to ${maxImages}. JPG, PNG or WebP.`}
                    >
                        <input
                            id="p-images"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setFiles(Array.from(e.target.files || []))}
                            className="block w-full text-[13px] text-content-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-inset file:px-3 file:py-2 file:text-[12.5px] file:font-semibold file:text-content"
                        />
                        {files.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {files.map((file, i) => (
                                    <img
                                        key={`${file.name}-${i}`}
                                        src={URL.createObjectURL(file)}
                                        alt=""
                                        className="h-14 w-14 rounded-md object-cover"
                                    />
                                ))}
                            </div>
                        ) : null}
                    </Field>

                    {existingImages.length ? (
                        <div className="sm:col-span-2">
                            <p className="text-[13px] font-semibold text-content">Current images</p>
                            <div className="mt-3 flex flex-wrap gap-3">
                                {existingImages.map((path) => (
                                    <label
                                        key={path}
                                        className={`relative cursor-pointer ${
                                            replaceImages ? "opacity-40" : ""
                                        }`}
                                    >
                                        <img
                                            src={assetUrl(path)}
                                            alt=""
                                            className={`h-16 w-16 rounded-md object-cover ${
                                                removeImages.includes(path)
                                                    ? "ring-2 ring-danger"
                                                    : ""
                                            }`}
                                        />
                                        <input
                                            type="checkbox"
                                            disabled={replaceImages}
                                            checked={removeImages.includes(path)}
                                            onChange={(e) =>
                                                setRemoveImages((list) =>
                                                    e.target.checked
                                                        ? [...list, path]
                                                        : list.filter((p) => p !== path),
                                                )
                                            }
                                            className="absolute top-1 right-1 h-3.5 w-3.5 accent-brand-gold"
                                            aria-label="Remove this image"
                                        />
                                    </label>
                                ))}
                            </div>
                            <div className="mt-3">
                                <Toggle
                                    id="p-replace"
                                    checked={replaceImages}
                                    onChange={(v) => {
                                        setReplaceImages(v);
                                        if (v) setRemoveImages([]);
                                    }}
                                    label="Replace ALL images with the new upload"
                                />
                            </div>
                        </div>
                    ) : null}

                    <div className="flex items-center gap-6 sm:col-span-2">
                        <Toggle
                            id="p-featured"
                            checked={form.isFeatured}
                            onChange={set("isFeatured")}
                            label="Featured"
                        />
                        <Toggle
                            id="p-active"
                            checked={form.isActive}
                            onChange={set("isActive")}
                            label="Active (visible publicly)"
                        />
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                open={Boolean(deleting)}
                onClose={() => setDeleting(null)}
                onConfirm={confirmDelete}
                busy={busy}
                title={`Delete ${deleting?.title || "product"}?`}
                description="The product and its uploaded images will be permanently removed."
            />
        </div>
    );
}
