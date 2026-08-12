// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { authApi, authErrorMessage } from "../../services/authApi";
import AuthShell, { AuthAlert, AuthField } from "../../components/auth/AuthShell";
import Button from "../../components/ui/Button";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            await authApi.forgotPassword(email.trim());
            // The backend response is deliberately generic — never branch on
            // whether the account existed, or we leak enumeration here.
            setSent(true);
        } catch (err) {
            // Realistically only 429 or a 502 mail failure reaches this branch.
            setError(authErrorMessage(err, "Could not send the reset link"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell
            eyebrow="Account recovery"
            title={sent ? "Check your inbox" : "Reset your password"}
            description={
                sent
                    ? "If an account with that email exists, a reset link is on its way. The link works once and expires in 15 minutes."
                    : "Enter the email tied to your admin account and we'll send a single-use reset link."
            }
            footer={
                <p>
                    Remembered it?{" "}
                    <Link to="/login" className="font-semibold text-brand-gold hover:underline">
                        Back to sign in
                    </Link>
                </p>
            }
        >
            {sent ? (
                <div className="flex items-start gap-3 rounded-lg border border-border-subtle bg-surface-raised p-5">
                    <MailCheck
                        className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold"
                        aria-hidden="true"
                    />
                    <div className="text-sm leading-relaxed text-content-muted">
                        <p className="font-semibold text-content">Sent to {email}</p>
                        <p className="mt-1">
                            Nothing after a few minutes? Check spam, then{" "}
                            <button
                                type="button"
                                onClick={() => setSent(false)}
                                className="font-semibold text-brand-gold hover:underline"
                            >
                                try another address
                            </button>
                            .
                        </p>
                    </div>
                </div>
            ) : (
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button type="submit" size="lg" fullWidth loading={busy}>
                        Send reset link
                    </Button>
                </form>
            )}
        </AuthShell>
    );
}
