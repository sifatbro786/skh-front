// src/pages/admin/UserManagement.jsx
// Admin accounts. IMPORTANT — this screen is built to what the API actually
// exposes, which is narrower than a generic CRUD table:
//
//   POST   /auth/admins            → create (name, email, password, role)
//   PATCH  /auth/admins/:id/role   → role ONLY
//   PATCH  /auth/admins/:id/status → active toggle, no body
//   DELETE /auth/admins/:id
//
// There is no endpoint to edit another admin's name, email or password, so this
// screen doesn't pretend to offer one — an admin changes their own password on
// the Account screen (/auth/change-password), which rotates their token.
//
// !! FIELD NAME GOTCHA — the cause of the "super_admin can't change roles" bug.
// authController's sanitizeAdmin() returns `id`, NOT `_id`:
//     { id: admin._id, name, email, role, isActive, createdAt }
// Every OTHER collection is served via .lean() and does carry `_id`, so this
// screen is the one exception. With `_id`, both `r._id` and `user?._id` were
// undefined, so `isSelf` evaluated `undefined === undefined` → TRUE on every
// row: every Role select rendered disabled and every Delete button was hidden.
// Use `id` here, and pass keyField="id" to DataTable (its default is `_id`).
//
// Every self-protection rule is ALSO enforced server-side (self-demote,
// self-deactivate, self-delete, last super_admin). The UI disables those
// controls so the user never has to discover the rule via a 400, but the
// backend remains the authority.
import { useState } from "react";
import { Plus, Trash2, UserCog } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import { adminApi, adminErrorMessage, ADMIN_ROLES, ROLE_LABELS } from "../../services/adminApi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import DataTable, { timeAgo } from "../../components/admin/DataTable";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { Button, Field, Modal, Select, TextInput } from "../../components/ui";

const BLANK = { name: "", email: "", password: "", role: "admin" };

const ROLE_OPTIONS = ADMIN_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }));

export default function UserManagement() {
    const { user } = useAuth();
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState(BLANK);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [busy, setBusy] = useState(false);
    const [rowBusy, setRowBusy] = useState(null);

    const { data, loading, retry } = useAsync(() => adminApi.list(), []);
    const rows = data?.admins || [];
    const superCount = rows.filter((a) => a.role === "super_admin").length;

    const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

    const create = async () => {
        if (!form.name.trim() || !form.email.trim() || !form.password) {
            toast.error("Name, email and password are required");
            return;
        }
        if (form.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setSaving(true);
        try {
            await adminApi.create(form);
            toast.success("Admin created");
            setCreating(false);
            setForm(BLANK);
            retry();
        } catch (err) {
            toast.error(adminErrorMessage(err, "Could not create the admin"));
        } finally {
            setSaving(false);
        }
    };

    const changeRole = async (admin, role) => {
        setRowBusy(admin.id);
        try {
            await adminApi.updateRole(admin.id, role);
            toast.success(`${admin.name} is now ${ROLE_LABELS[role]}`);
            retry();
        } catch (err) {
            toast.error(adminErrorMessage(err, "Could not change the role"));
        } finally {
            setRowBusy(null);
        }
    };

    const toggleStatus = async (admin) => {
        setRowBusy(admin.id);
        try {
            const res = await adminApi.toggleStatus(admin.id);
            toast.success(res.message || "Status updated");
            retry();
        } catch (err) {
            toast.error(adminErrorMessage(err, "Could not update the status"));
        } finally {
            setRowBusy(null);
        }
    };

    const confirmDelete = async () => {
        setBusy(true);
        try {
            await adminApi.remove(deleting.id);
            toast.success("Admin deleted");
            setDeleting(null);
            retry();
        } catch (err) {
            toast.error(adminErrorMessage(err, "Could not delete the admin"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                description="Console accounts. Roles and access are enforced server-side — this screen mirrors those rules so you don't hit them as errors."
                meta={[
                    { label: "Admins", value: data?.count ?? "—" },
                    { label: "Super admins", value: superCount || "—" },
                ]}
                actions={
                    <Button leftIcon={Plus} onClick={() => setCreating(true)}>
                        New admin
                    </Button>
                }
            />

            <DataTable
                loading={loading}
                rows={rows}
                keyField="id"
                emptyIcon={UserCog}
                emptyTitle="No admin accounts"
                emptyDescription="Create the first console account."
                columns={[
                    {
                        key: "name",
                        header: "Name",
                        render: (r) => (
                            <span className="font-semibold">
                                {r.name}
                                {r.id === user?.id ? (
                                    <span className="ml-2 rounded-full bg-brand-gold/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-brand-gold uppercase">
                                        You
                                    </span>
                                ) : null}
                            </span>
                        ),
                    },
                    {
                        key: "email",
                        header: "Email",
                        render: (r) => <span className="text-content-muted">{r.email}</span>,
                    },
                    {
                        key: "role",
                        header: "Role",
                        render: (r) => {
                            // Can't demote yourself, and can't demote the last super_admin.
                            const isSelf = r.id === user?.id;
                            const lastSuper = r.role === "super_admin" && superCount <= 1;
                            return (
                                <Select
                                    value={r.role}
                                    onChange={(e) => changeRole(r, e.target.value)}
                                    options={ROLE_OPTIONS}
                                    placeholder=""
                                    disabled={isSelf || lastSuper || rowBusy === r.id}
                                    aria-label={`Role for ${r.name}`}
                                    className="max-w-40"
                                />
                            );
                        },
                    },
                    {
                        key: "isActive",
                        header: "Status",
                        render: (r) => {
                            const isSelf = r.id === user?.id;
                            return (
                                <button
                                    type="button"
                                    disabled={isSelf || rowBusy === r.id}
                                    onClick={() => toggleStatus(r)}
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-60 ${
                                        r.isActive !== false
                                            ? "bg-emerald-500/15 text-emerald-600"
                                            : "bg-slate-500/15 text-slate-500"
                                    }`}
                                >
                                    {r.isActive !== false ? "Active" : "Disabled"}
                                </button>
                            );
                        },
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
                    {
                        key: "actions",
                        header: "",
                        render: (r) => {
                            const isSelf = r.id === user?.id;
                            const lastSuper = r.role === "super_admin" && superCount <= 1;
                            if (isSelf || lastSuper) return null;
                            return (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleting(r)}
                                    aria-label={`Delete ${r.name}`}
                                >
                                    <Trash2 className="h-4 w-4 text-danger" />
                                </Button>
                            );
                        },
                    },
                ]}
            />

            <p className="text-[12.5px] leading-relaxed text-content-muted">
                Names, emails and passwords of other accounts can&rsquo;t be edited through the API.
                An admin changes their own password from Account settings, which rotates their
                session token.
            </p>

            <Modal
                open={creating}
                onClose={() => setCreating(false)}
                title="New admin"
                eyebrow="Access"
                dismissible={!saving}
                footer={
                    <div className="flex justify-end gap-2.5">
                        <Button
                            variant="ghost"
                            onClick={() => setCreating(false)}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button onClick={create} loading={saving}>
                            Create admin
                        </Button>
                    </div>
                }
            >
                <div className="grid gap-4">
                    <Field label="Name" htmlFor="a-name" required>
                        <TextInput
                            id="a-name"
                            value={form.name}
                            onChange={(e) => set("name")(e.target.value)}
                        />
                    </Field>
                    <Field label="Email" htmlFor="a-email" required>
                        <TextInput
                            id="a-email"
                            type="email"
                            autoComplete="off"
                            value={form.email}
                            onChange={(e) => set("email")(e.target.value)}
                        />
                    </Field>
                    <Field
                        label="Password"
                        htmlFor="a-pass"
                        required
                        hint="At least 8 characters. Share it over a secure channel — it can't be read back."
                    >
                        <TextInput
                            id="a-pass"
                            type="password"
                            autoComplete="new-password"
                            value={form.password}
                            onChange={(e) => set("password")(e.target.value)}
                        />
                    </Field>
                    <Field label="Role" htmlFor="a-role">
                        <Select
                            id="a-role"
                            value={form.role}
                            onChange={(e) => set("role")(e.target.value)}
                            options={ROLE_OPTIONS}
                            placeholder=""
                        />
                    </Field>
                </div>
            </Modal>

            <ConfirmDialog
                open={Boolean(deleting)}
                onClose={() => setDeleting(null)}
                onConfirm={confirmDelete}
                busy={busy}
                title={`Delete ${deleting?.name || "admin"}?`}
                description="They lose console access immediately."
            />
        </div>
    );
}
