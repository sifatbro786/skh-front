// src/layouts/DashboardLayout.jsx
// Admin shell: fixed sidebar rail on lg+, off-canvas drawer below. Native
// scrolling (Lenis is client-site only).
//
// Changes in Phase 3:
//  · the topbar title comes from config/adminNav.js instead of a second list
//    that had to be kept in sync by hand
//  · the drawer is a real dialog — Escape closes it, focus moves into it on open
//    and back to the menu button on close
//  · the "New" inquiry count is fetched ONCE here and passed to both Sidebar
//    instances, rather than each of them firing its own request
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Sidebar from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";
import { titleFor } from "../config/adminNav";
import { useAsync } from "../hooks/useAsync";
import { inquiryApi } from "../services/inquiryApi";

export default function DashboardLayout() {
    const { pathname } = useLocation();
    const [drawer, setDrawer] = useState(false);
    const reduce = useReducedMotion();

    const panelRef = useRef(null);
    const menuButtonRef = useRef(null);

    /* `statusCounts` in the list response is a global aggregate, not a filtered
       one — so limit:1 is the cheapest possible way to read the New count. It's
       a snapshot at mount; the Inquiries screen refetches its own numbers. */
    const { data: inquiryData } = useAsync(() => inquiryApi.list({ limit: 1 }), []);
    const badges = { inquiries: inquiryData?.statusCounts?.New || 0 };

    /* Belt-and-braces close on route change (browser back/forward while the
       drawer is open — every in-drawer link already calls onNavigate). This is
       React's documented "adjust state during render" pattern rather than an
       effect, so there's no extra commit and no setState-in-effect. */
    const [seenPath, setSeenPath] = useState(pathname);
    if (seenPath !== pathname) {
        setSeenPath(pathname);
        if (drawer) setDrawer(false);
    }

    /* Scroll lock + Escape + focus, all tied to the drawer being open. */
    useEffect(() => {
        if (!drawer) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKeyDown = (event) => {
            if (event.key === "Escape") setDrawer(false);
        };
        document.addEventListener("keydown", onKeyDown);

        // Park focus inside the panel so the next Tab stays in the drawer.
        const focusTimer = window.setTimeout(() => {
            panelRef.current?.querySelector("a, button")?.focus?.({ preventScroll: true });
        }, 0);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
            window.clearTimeout(focusTimer);
        };
    }, [drawer]);

    const closeDrawer = () => {
        setDrawer(false);
        menuButtonRef.current?.focus?.();
    };

    const panelMotion = reduce
        ? { initial: false }
        : {
              initial: { x: "-100%" },
              animate: { x: 0 },
              exit: { x: "-100%" },
              transition: { type: "tween", duration: 0.22, ease: [0.16, 1, 0.3, 1] },
          };

    return (
        <div className="min-h-screen bg-surface text-content">
            <a
                href="#admin-main"
                className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:rounded-lg focus:bg-surface-dark focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-content-inverse"
            >
                Skip to content
            </a>

            {/* Desktop rail */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
                <Sidebar badges={badges} />
            </aside>

            {/* Mobile off-canvas drawer. The direct child of AnimatePresence has
                to be a motion component, or the panel unmounts before its exit
                animation gets a chance to run. */}
            <AnimatePresence>
                {drawer ? (
                    <motion.div
                        key="admin-drawer"
                        className="fixed inset-0 z-50 lg:hidden"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Admin menu"
                    >
                        <motion.div
                            initial={reduce ? false : { opacity: 0 }}
                            animate={reduce ? undefined : { opacity: 1 }}
                            exit={reduce ? undefined : { opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            onClick={closeDrawer}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            ref={panelRef}
                            {...panelMotion}
                            className="absolute inset-y-0 left-0 w-72 max-w-[80vw]"
                        >
                            <Sidebar
                                badges={badges}
                                onNavigate={() => setDrawer(false)}
                                onClose={closeDrawer}
                            />
                        </motion.div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* Content column */}
            <div className="flex min-h-screen flex-col lg:pl-64">
                <Topbar
                    title={titleFor(pathname)}
                    onMenu={() => setDrawer(true)}
                    menuButtonRef={menuButtonRef}
                />
                <main id="admin-main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
