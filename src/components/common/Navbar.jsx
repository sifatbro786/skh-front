/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
// src/components/common/Navbar.jsx
// Always-dark header (matches Footer's navy) so the white logo and light nav
// text stay readable on every route — no transparent/scroll-dependent state.
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard, Menu, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { NAV_LINKS } from "../../data/siteContent";
import Button from "../ui/Button";

export const RFQ_EVENT = "skh:request-quote";
export const openRfq = (detail = {}) =>
    window.dispatchEvent(new CustomEvent(RFQ_EVENT, { detail }));

const Logo = () => (
    <Link
        to="/"
        className="group flex items-center gap-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50"
        aria-label="SKH Sourcing — home"
    >
        <img
            src="/logo.png"
            alt="SKH Sourcing"
            className="h-9 w-auto shrink-0 sm:h-10"
            draggable="false"
        />
        <span
            className="hidden text-[9px] font-bold tracking-[0.32em] text-content-subtle uppercase sm:block"
            aria-hidden="true"
        >
            Dhaka
            <br />
            Sydney
        </span>
    </Link>
);

export default function Navbar({ onRequestQuote }) {
    const { pathname } = useLocation();
    const { user, isAuthenticated } = useAuth();
    const reduced = useReducedMotion();

    // Header stays solid navy always; scroll only adds depth (shadow), never
    // changes background/text color, so links can never wash out.
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const scrolledRef = useRef(false);

    useEffect(() => {
        const onScroll = () => {
            const next = window.scrollY > 8;
            if (next !== scrolledRef.current) {
                scrolledRef.current = next;
                setScrolled(next);
            }
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => setOpen(false), [pathname]);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const requestQuote = useCallback(() => {
        setOpen(false);
        onRequestQuote ? onRequestQuote() : openRfq({ source: "navbar" });
    }, [onRequestQuote]);

    const linkClass = ({ isActive }) =>
        `relative py-1 text-[13px] font-semibold tracking-wide transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:bg-brand-gold after:transition-all after:duration-300 ${
            isActive
                ? "text-content-inverse after:w-full"
                : "text-content-subtle hover:text-content-inverse after:w-0 hover:after:w-full"
        }`;

    return (
        <>
        <header
            className={`sticky top-0 z-50 border-b border-border-dark bg-surface-dark/95 backdrop-blur-md transition-shadow duration-300 ${
                scrolled ? "shadow-[0_1px_24px_-12px_rgba(0,0,0,0.8)]" : ""
            }`}
        >
            <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
                <Logo />

                <ul className="hidden items-center gap-8 lg:flex">
                    {NAV_LINKS.map((l) => (
                        <li key={l.to}>
                            <NavLink to={l.to} end={l.to === "/"} className={linkClass}>
                                {l.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <Link
                            to="/admin"
                            className="hidden items-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-1.5 pr-4 pl-1.5 transition-colors hover:border-brand-gold/60 sm:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold text-[11px] font-extrabold text-brand-dark">
                                {(user?.name || "A").charAt(0).toUpperCase()}
                            </span>
                            <span className="flex flex-col leading-none">
                                <span className="text-[12px] font-bold text-content-inverse">
                                    Dashboard
                                </span>
                                <span className="mt-0.5 flex items-center gap-1 text-[9px] font-bold tracking-[0.18em] text-brand-gold uppercase">
                                    {user?.role === "super_admin" ? (
                                        <ShieldCheck className="h-2.5 w-2.5" aria-hidden="true" />
                                    ) : (
                                        <LayoutDashboard
                                            className="h-2.5 w-2.5"
                                            aria-hidden="true"
                                        />
                                    )}
                                    {user?.role === "super_admin" ? "Super Admin" : "Admin"}
                                </span>
                            </span>
                        </Link>
                    ) : (
                        <Button size="sm" className="hidden sm:inline-flex" onClick={requestQuote}>
                            Request a quote
                        </Button>
                    )}

                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-content-inverse transition-colors hover:border-brand-gold/60 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50"
                    >
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>
        </header>

        {/* Portaled to <body> — a "fixed" element inside an ancestor with
            backdrop-blur (the header) gets that ancestor as its containing
            block instead of the viewport, collapsing this drawer to 0 height.
            Portaling escapes the header's stacking/filter context entirely. */}
        {createPortal(
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 top-18 z-40 lg:hidden">
                        <motion.div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                        />
                        <motion.div
                            className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col border-l border-border-dark bg-surface-dark"
                            initial={{ x: reduced ? 0 : "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: reduced ? 0 : "100%" }}
                            transition={{ type: "spring", stiffness: 340, damping: 34 }}
                        >
                            <ul className="flex-1 overflow-y-auto px-6 py-6">
                                {NAV_LINKS.map((l, i) => (
                                    <li
                                        key={l.to}
                                        className="border-b border-border-dark last:border-0"
                                    >
                                        <NavLink
                                            to={l.to}
                                            end={l.to === "/"}
                                            className={({ isActive }) =>
                                                `flex items-center justify-between py-4 font-heading text-lg font-bold ${
                                                    isActive
                                                        ? "text-brand-gold"
                                                        : "text-content-inverse"
                                                }`
                                            }
                                        >
                                            {l.label}
                                            <span className="text-[10px] font-bold tracking-[0.2em] text-content-subtle tabular-nums">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>

                            <div className="border-t border-border-dark bg-surface-dark-raised p-6">
                                {isAuthenticated ? (
                                    <Button as={Link} to="/admin" fullWidth variant="primary">
                                        Open dashboard
                                    </Button>
                                ) : (
                                    <Button fullWidth onClick={requestQuote}>
                                        Request a quote
                                    </Button>
                                )}
                                <p className="mt-4 text-[11px] tracking-[0.2em] text-content-subtle uppercase">
                                    inquiry@skhsourcing.com
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>,
            document.body,
        )}
        </>
    );
}
