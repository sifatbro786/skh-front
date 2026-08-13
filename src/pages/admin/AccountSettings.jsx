// src/pages/admin/AccountSettings.jsx
// The signed-in admin's own account.
//
// Scope is set by the API, not by preference: /api/auth exposes `getMe` and
// `changePassword` and nothing else for self-service. There is NO endpoint to
// change your own name, email or role — /auth/admins/:id/role is super_admin
// only and explicitly rejects self-demotion. So identity is read-only here and
// the page says who to ask, rather than shipping fields that can't save.
//
// changePassword goes through AuthContext (not adminApi) because the backend
// rotates the JWT on success — every old token is invalidated via
// passwordChangedAt — and the context is what owns tokenStore. Calling the
// endpoint directly would leave this tab holding a dead token.
import { useState } from "react";
import { KeyRound, Mail, ShieldCheck, UserCog } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { apiErrorMessage } from "../../services/api";
import { ROLE_LABELS } from "../../services/adminApi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { timeAgo } from "../../components/admin/DataTable";
import { Button, Field, TextInput } from "../../components/ui";

const MIN_LENGTH = 8;

function DetailRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3 border-b border-border-subtle py-3.5 last:border-b-0">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" aria-hidden="true" />
            <div className="min-w-0">
                <p className="text-[10px] font-bold tracking-[0.18em] text-content-subtle uppercase">
                    {label}
                </p>
                <p className="mt-0.5 text-[14px] wrap-break-word text-content">{value || "—"}</p>
            </div>
        </div>
    );
}

export default function AccountSettings() {
    const { user, changePassword } = useAuth();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saving, setSaving] = useState(false);

    const tooShort = newPassword.length > 0 && newPassword.length < MIN_LENGTH;
    const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
    const reused = newPassword.length > 0 && newPassword === currentPassword;

    const canSubmit =
        currentPassword &&
        newPassword.length >= MIN_LENGTH &&
        newPassword === confirmPassword &&
        !reused;

    const submit = async () => {
        if (!canSubmit) return;
        setSaving(true);
        try {
            await changePassword(currentPassword, newPassword);
            toast.success("Password changed — this session has been re-issued");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            // 401 here means the CURRENT password was wrong, not that the
            // session expired — the generic interceptor copy would mislead.
            toast.error(
                err?.response?.status === 401
                    ? "Current password is incorrect"
                    : apiErrorMessage(err, "Could not change your password"),
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <AdminPageHeader description="Your own console account. Name, email and role are managed by a super admin." />

            <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
                <section className="rounded-xl border border-border-subtle bg-surface-raised p-5">
                    <div className="flex items-center gap-3">
                        <span
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-gold/12 font-heading text-[15px] font-bold text-brand-gold"
                            aria-hidden="true"
                        >
                            {(user?.name || "?").charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate font-heading text-[15px] font-bold text-content">
                                {user?.name || "—"}
                            </p>
                            <p className="text-[12.5px] text-content-muted">
                                {ROLE_LABELS[user?.role] || user?.role || "—"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5">
                        <DetailRow icon={UserCog} label="Name" value={user?.name} />
                        <DetailRow icon={Mail} label="Email" value={user?.email} />
                        <DetailRow
                            icon={ShieldCheck}
                            label="Role"
                            value={ROLE_LABELS[user?.role] || user?.role}
                        />
                        <DetailRow
                            icon={KeyRound}
                            label="Account created"
                            value={
                                user?.createdAt
                                    ? `${new Date(user.createdAt).toLocaleDateString()} · ${timeAgo(
                                          user.createdAt,
                                      )}`
                                    : "—"
                            }
                        />
                    </div>

                    <p className="mt-5 text-[12.5px] leading-relaxed text-content-muted">
                        To change your name, email or role, ask a super admin — these aren&rsquo;t
                        editable from your own account.
                    </p>
                </section>

                <section className="rounded-xl border border-border-subtle bg-surface-raised p-5 sm:p-6">
                    <h2 className="font-heading text-[15px] font-bold text-content">
                        Change password
                    </h2>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-content-muted">
                        Changing your password signs out every other device — all existing sessions
                        are invalidated and this tab is issued a fresh token.
                    </p>

                    <div className="mt-6 grid max-w-md gap-4">
                        <Field label="Current password" htmlFor="cur-pass" required>
                            <TextInput
                                id="cur-pass"
                                type="password"
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </Field>

                        <Field
                            label="New password"
                            htmlFor="new-pass"
                            required
                            hint={`At least ${MIN_LENGTH} characters.`}
                            error={
                                tooShort
                                    ? `Must be at least ${MIN_LENGTH} characters`
                                    : reused
                                      ? "Choose a password different from your current one"
                                      : undefined
                            }
                        >
                            <TextInput
                                id="new-pass"
                                type="password"
                                autoComplete="new-password"
                                invalid={tooShort || reused}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </Field>

                        <Field
                            label="Confirm new password"
                            htmlFor="confirm-pass"
                            required
                            error={mismatch ? "Passwords don't match" : undefined}
                        >
                            <TextInput
                                id="confirm-pass"
                                type="password"
                                autoComplete="new-password"
                                invalid={mismatch}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </Field>

                        <div className="pt-1">
                            <Button
                                leftIcon={KeyRound}
                                onClick={submit}
                                loading={saving}
                                disabled={!canSubmit}
                            >
                                Update password
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
