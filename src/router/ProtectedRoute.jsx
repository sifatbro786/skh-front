import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function BrandSpinner() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface text-content">
            <div className="relative h-14 w-14">
                <span className="absolute inset-0 rounded-full border-2 border-border-subtle" />
                <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-gold" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-content-muted">
                LOADING
            </p>
        </div>
    );
}

/**
 * `requireRole` mirrors the backend's restrictTo(): without it, an `admin` who
 * types /admin/users directly gets the screen and then watches every request
 * 403. Bouncing to the console index is the honest outcome. Cosmetic only —
 * the server is still the authority.
 */
export default function ProtectedRoute({
    children,
    requireAuth = true,
    requireAdmin = false,
    requireRole = null,
}) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return <BrandSpinner />;

    if (requireAuth && !user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }
    if (requireAdmin && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
        return <Navigate to="/" replace />;
    }
    if (requireRole && user?.role !== requireRole) {
        return <Navigate to="/admin" replace />;
    }
    return children;
}
