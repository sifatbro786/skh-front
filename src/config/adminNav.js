// src/config/adminNav.js
// Single source of truth for the admin shell: the sidebar renders it, the topbar
// derives its title from it, and route-gating reads its `roles`.
//
// `ready: false` means the screen isn't built yet — the item renders as a
// disabled row with a "Soon" tag instead of a link, so nobody lands on the
// in-shell 404 by clicking their own sidebar. Flip the flag in the same commit
// that adds the route.
//
// Phase 3: every screen is now built, so all rows are ready. The `to` values
// here are canonical — App.jsx must match them exactly. Note the Page SEO row
// points at /admin/page-meta, while the route was previously registered as
// "pagemeta" (i.e. /admin/pagemeta), so this sidebar link 404'd. App.jsx is
// corrected to "page-meta" in the same commit.
import {
    BadgeCheck,
    Building2,
    Inbox,
    LayoutDashboard,
    Search,
    Shirt,
    UserCog,
    Users,
} from "lucide-react";

export const ADMIN_NAV = [
    {
        section: "Dashboard",
        items: [
            {
                to: "/admin",
                end: true, // index route — without this it matches every /admin/*
                label: "Overview",
                icon: LayoutDashboard,
                title: "Overview",
                ready: true,
            },
        ],
    },
    {
        section: "Catalog",
        items: [
            {
                to: "/admin/products",
                label: "Products",
                icon: Shirt,
                title: "Products",
                ready: true,
            },
            {
                to: "/admin/inquiries",
                label: "Inquiries",
                icon: Inbox,
                title: "Inquiries",
                badge: "inquiries", // key into the badges map from DashboardLayout
                ready: true,
            },
            {
                to: "/admin/certifications",
                label: "Certifications",
                icon: BadgeCheck,
                title: "Certifications",
                ready: true,
            },
        ],
    },
    {
        section: "Site",
        items: [
            {
                to: "/admin/company",
                label: "Company",
                icon: Building2,
                title: "Company Settings",
                ready: true,
            },
            {
                to: "/admin/page-meta",
                label: "Page SEO",
                icon: Search,
                title: "Page SEO",
                ready: true,
            },
        ],
    },
    {
        section: "Access",
        items: [
            {
                to: "/admin/users",
                label: "Admin Users",
                icon: Users,
                title: "Admin Users",
                roles: ["super_admin"], // mirrors the backend restrictTo()
                ready: true,
            },
            {
                to: "/admin/settings",
                label: "Account",
                icon: UserCog,
                title: "Account Settings",
                ready: true,
            },
        ],
    },
];

export const ADMIN_NAV_ITEMS = ADMIN_NAV.flatMap((group) => group.items);

/** Hiding the row is cosmetic — the server still enforces the role. */
export const canSee = (item, role) => !item.roles || item.roles.includes(role);

/** Sections with nothing visible for this role are dropped entirely. */
export const navForRole = (role) =>
    ADMIN_NAV.map((group) => ({
        ...group,
        items: group.items.filter((item) => canSee(item, role)),
    })).filter((group) => group.items.length);

/**
 * Longest-prefix match, so /admin/products/new still reads "Products" and the
 * `end` index route doesn't swallow everything under /admin.
 */
export const titleFor = (pathname) => {
    const match = ADMIN_NAV_ITEMS.filter((item) =>
        item.end
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(`${item.to}/`),
    ).sort((a, b) => b.to.length - a.to.length)[0];

    return match?.title || "Admin";
};
