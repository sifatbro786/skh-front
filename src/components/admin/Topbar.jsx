// src/components/admin/Topbar.jsx
// Sticky admin header. The route-derived title is the page's <h1> — pages render
// description + actions under it via AdminPageHeader, so no screen ends up with
// two competing headings.
import { Menu } from "lucide-react";
import UserMenu from "./UserMenu";

export default function Topbar({ title = "Admin", onMenu, menuButtonRef }) {
    return (
        <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface-raised/85 backdrop-blur-md">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
                <button
                    ref={menuButtonRef}
                    type="button"
                    onClick={onMenu}
                    aria-label="Open menu"
                    className="-ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-lg text-content-muted transition-colors hover:bg-surface-inset hover:text-content focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:outline-none lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="h-1.5 w-1.5 shrink-0 bg-brand-gold" aria-hidden="true" />
                    <h1 className="truncate font-heading text-[17px] font-bold tracking-[-0.01em] text-content sm:text-lg">
                        {title}
                    </h1>
                </div>

                <span className="hidden h-6 w-px bg-border-subtle sm:block" aria-hidden="true" />

                <UserMenu />
            </div>
        </header>
    );
}
