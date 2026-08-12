// src/pages/auth/ResetPasswordPage.jsx
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi, authErrorMessage } from "../../services/authApi";
import AuthShell, { AuthAlert, AuthField } from "../../components/auth/AuthShell";
import Button from "../../components/ui/Button";

const RULES = [
    { label: "At least 8 characters", test: (v) => v.length >= 8 },
    { label: "One number", test: (v) => /\d/.test(v) },
    { label: "One letter", test: (v) => /[a-zA-Z]/.test(v) },
];

export default function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ password: "", confirm: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const checks = useMemo(
        () => RULES.map((r) => ({ ...r, ok: r.test(form.password) })),
        [form.password],
    );
    // Backend only enforces length >= 8; the extra rules are advisory client-side.
    const canSubmit = form.password.length >= 8 && form.password === form.confirm;

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) return setError("Passwords do not match");
        setError("");
        setBusy(true);
        try {
            await authApi.resetPassword(token, form.password);
            toast.success("Password reset. Sign in with your new password.");
            navigate("/login", { replace: true });
        } catch (err) {
            // 400 = "Token is invalid or has expired" — surface it verbatim.
            setError(authErrorMessage(err, "Could not reset your password"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell
            eyebrow="Account recovery"
            title="Set a new password"
            description="This link works once. Choosing a new password signs out every existing session."
            footer={
                <p>
                    Link expired?{" "}
                    <Link
                        to="/forgot-password"
                        className="font-semibold text-brand-gold hover:underline"
                    >
                        Request a new one
                    </Link>
                </p>
            }
        >
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <AuthAlert message={error} />

                <AuthField
                    id="password"
                    name="password"
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={onChange}
                />

                <AuthField
                    id="confirm"
                    name="confirm"
                    label="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    required
                    value={form.confirm}
                    onChange={onChange}
                />

                <ul className="grid gap-2 sm:grid-cols-3">
                    {checks.map((c) => (
                        <li
                            key={c.label}
                            className={`flex items-center gap-2 text-[12px] transition-colors ${
                                c.ok ? "text-success" : "text-content-subtle"
                            }`}
                        >
                            <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                    c.ok ? "bg-success" : "bg-border-strong"
                                }`}
                                aria-hidden="true"
                            />
                            {c.label}
                        </li>
                    ))}
                </ul>

                <Button type="submit" size="lg" fullWidth loading={busy} disabled={!canSubmit}>
                    Save new password
                </Button>
            </form>
        </AuthShell>
    );
}
