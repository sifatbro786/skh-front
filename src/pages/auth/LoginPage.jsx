// src/pages/auth/LoginPage.jsx
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authErrorMessage } from "../../services/authApi";
import AuthShell, { AuthAlert, AuthField } from "../../components/auth/AuthShell";
import Button from "../../components/ui/Button";

export default function LoginPage() {
    const { login, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/admin";

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    // Session already hydrated — never show the form to an authenticated admin.
    if (!isLoading && isAuthenticated) return <Navigate to={from} replace />;

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            await login(form.email.trim(), form.password);
            navigate(from, { replace: true });
        } catch (err) {
            // Backend copy is user-safe (invalid credentials / deactivated / 429).
            setError(authErrorMessage(err, "Could not sign you in"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell
            eyebrow="Admin console"
            title="Sign in"
            description="Access the SKH Sourcing catalog, RFQ pipeline and site content."
            footer={
                <p>
                    Locked out?{" "}
                    <Link
                        to="/forgot-password"
                        className="font-semibold text-brand-gold hover:underline"
                    >
                        Reset your password
                    </Link>
                </p>
            }
        >
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <AuthAlert message={error} />

                <AuthField
                    id="email"
                    name="email"
                    label="Work email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@skhsourcing.com"
                    required
                    value={form.email}
                    onChange={onChange}
                />

                <AuthField
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={onChange}
                    hint={
                        <Link
                            to="/forgot-password"
                            className="text-[11px] font-semibold text-brand-gold hover:underline"
                        >
                            Forgot?
                        </Link>
                    }
                />

                <Button type="submit" size="lg" fullWidth loading={busy}>
                    Sign in
                </Button>

                <p className="text-center text-[12px] text-content-subtle">
                    Sessions expire after 7 days, or immediately when a password changes.
                </p>
            </form>
        </AuthShell>
    );
}
