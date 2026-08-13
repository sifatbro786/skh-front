// src/components/admin/UserMenu.jsx
// Topbar account dropdown. Not built on ui/Modal on purpose — that's a dialog
// (scroll lock, backdrop, focus trap) and this is a menu; locking the page
// behind a 3-item popover would be wrong.
//
// Closes on outside pointerdown and on Escape (returning focus to the trigger).
// `pointerdown` rather than `click` so it also closes when the user starts a
// drag or taps on touch — and because it fires before a sidebar NavLink's click,
// no separate "close on route change" effect is needed (which would be a
// setState-in-effect the project lints against).
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, ChevronDown, LogOut, UserCog } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

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

const ITEM =
    "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-content transition-colors hover:bg-surface-inset focus-visible:bg-surface-inset focus-visible:outline-none";

export default function UserMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const onPointerDown = (event) => {
            if (!wrapRef.current?.contains(event.target)) setOpen(false);
        };
        const onKeyDown = (event) => {
            if (event.key !== "Escape") return;
            setOpen(false);
            triggerRef.current?.focus();
        };

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const signOut = () => {
        setOpen(false);
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div ref={wrapRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={open}
                className="flex items-center gap-2.5 rounded-lg py-1.5 pr-2 pl-1.5 transition-colors hover:bg-surface-inset focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none"
            >
                <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-gold/15 font-heading text-[11px] font-bold text-brand-gold"
                    aria-hidden="true"
                >
                    {initials(user?.name)}
                </span>
                <span className="hidden text-left md:block">
                    <span className="block max-w-36 truncate text-[13px] font-semibold text-content">
                        {user?.name || "Account"}
                    </span>
                    <span className="block text-[10px] tracking-[0.14em] text-content-subtle uppercase">
                        {ROLE_LABEL[user?.role] || user?.role || "—"}
                    </span>
                </span>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-content-subtle transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                />
            </button>

            {open ? (
                <div
                    role="menu"
                    aria-label="Account"
                    className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-[0_24px_60px_-30px_rgba(15,23,42,0.45)]"
                >
                    <div className="border-b border-border-subtle px-3 py-3">
                        <p className="truncate text-[13px] font-semibold text-content">
                            {user?.name || "Signed in"}
                        </p>
                        <p className="truncate text-[12px] text-content-subtle">{user?.email}</p>
                    </div>

                    <Link
                        to="/admin/settings"
                        role="menuitem"
                        onClick={() => setOpen(false)}
                        className={ITEM}
                    >
                        <UserCog className="h-4 w-4 text-content-subtle" aria-hidden="true" />
                        Account settings
                    </Link>

                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                        className={ITEM}
                    >
                        <ArrowUpRight className="h-4 w-4 text-content-subtle" aria-hidden="true" />
                        View public site
                    </a>

                    <button
                        type="button"
                        role="menuitem"
                        onClick={signOut}
                        className={`${ITEM} border-t border-border-subtle text-danger hover:bg-danger/6`}
                    >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        Sign out
                    </button>
                </div>
            ) : null}
        </div>
    );
}
