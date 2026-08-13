// src/components/admin/Sidebar.jsx
// Rendered twice by DashboardLayout: as the fixed desktop rail and inside the
// mobile drawer. It owns no layout of its own beyond `h-full` — positioning is
// the layout's job, so the same component works in both slots.
//
// Nav rows come from config/adminNav.js. Unbuilt screens render as disabled rows
// rather than links; role-gated rows are filtered out (cosmetic only — the
// backend still enforces restrictTo()).
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { navForRole } from "../../config/adminNav";

const ROLE_LABEL = { super_admin: "Super Admin", admin: "Admin" };

const initials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "SK";

const ROW =
    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors";

function NavRow({ item, badge, onNavigate }) {
    const Icon = item.icon;

    if (!item.ready) {
        return (
            <li>
                <span
                    aria-disabled="true"
                    title="Not built yet"
                    className={`${ROW} cursor-not-allowed text-white/25`}
                >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1 truncate">{item.label}</span>
                    <span className="rounded border border-white/15 px-1.5 py-px font-mono text-[9px] tracking-[0.12em] uppercase">
                        Soon
                    </span>
                </span>
            </li>
        );
    }

    return (
        <li>
            <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                    `${ROW} ${
                        isActive
                            ? "bg-white/8 text-content-inverse"
                            : "text-content-subtle hover:bg-white/5 hover:text-content-inverse"
                    } focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none`
                }
            >
                {({ isActive }) => (
                    <>
                        {/* Selvedge node — the same device the client site uses. */}
                        <span
                            className={`absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 bg-brand-gold transition-opacity ${
                                isActive ? "opacity-100" : "opacity-0"
                            }`}
                            aria-hidden="true"
                        />
                        <Icon
                            className={`h-4 w-4 shrink-0 transition-colors ${
                                isActive
                                    ? "text-brand-gold"
                                    : "text-white/40 group-hover:text-brand-gold"
                            }`}
                            aria-hidden="true"
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                        {badge ? (
                            <span className="rounded-full bg-brand-gold/15 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-gold tabular-nums">
                                {badge > 99 ? "99+" : badge}
                            </span>
                        ) : null}
                    </>
                )}
            </NavLink>
        </li>
    );
}

export default function Sidebar({ onNavigate, onClose, badges = {} }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const groups = navForRole(user?.role);

    const signOut = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="flex h-full flex-col border-r border-border-dark bg-surface-dark">
            {/* Brand */}
            <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border-dark px-5">
                <NavLink
                    to="/admin"
                    end
                    onClick={onNavigate}
                    className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                >
                    <img src="/logo.png" alt="" className="h-8 w-auto" draggable="false" />
                    <span className="font-heading text-[11px] font-bold tracking-[0.24em] text-white/50 uppercase">
                        Console
                    </span>
                </NavLink>

                {onClose ? (
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close menu"
                        className="-mr-1 grid h-9 w-9 place-items-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-content-inverse focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none lg:hidden"
                    >
                        <X className="h-4.5 w-4.5" />
                    </button>
                ) : null}
            </div>

            {/* Nav */}
            <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-5">
                {groups.map((group, index) => (
                    <div key={group.section} className={index ? "mt-6" : ""}>
                        <p className="px-3 pb-2 font-heading text-[10px] font-bold tracking-[0.26em] text-white/30 uppercase">
                            {group.section}
                        </p>
                        <ul className="space-y-0.5">
                            {group.items.map((item) => (
                                <NavRow
                                    key={item.to}
                                    item={item}
                                    badge={item.badge ? badges[item.badge] : 0}
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* User + exits */}
            <div className="shrink-0 border-t border-border-dark p-3">
                <div className="flex items-center gap-3 rounded-lg px-2 py-2">
                    <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-gold/15 font-heading text-[12px] font-bold text-brand-gold"
                        aria-hidden="true"
                    >
                        {initials(user?.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-content-inverse">
                            {user?.name || "Signed in"}
                        </p>
                        <p className="truncate text-[11px] tracking-[0.12em] text-white/35 uppercase">
                            {ROLE_LABEL[user?.role] || user?.role || "—"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={signOut}
                        aria-label="Sign out"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-danger focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
