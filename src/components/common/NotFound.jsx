// src/components/common/NotFound.jsx
// Standalone 404 — rendered outside ClientLayout, so it owns its own chrome.
import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { NAV_LINKS } from "../../data/siteContent";
import Button from "../ui/Button";

export default function NotFound() {
    return (
        <div className="relative flex min-h-screen flex-col bg-surface-dark text-content-inverse">
            {/* Warp-and-weft texture — the same textile grid used on the auth panel */}
            <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.1]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(90deg,#C5A059 0 1px,transparent 1px 16px)," +
                        "repeating-linear-gradient(0deg,#C5A059 0 1px,transparent 1px 16px)",
                }}
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent,#0f172a_75%)]"
            />

            {/* Content */}
            <main className="relative flex flex-1 items-center justify-center px-4 py-16">
                <div className="w-full max-w-xl text-center">
                    <p className="mt-8 font-heading text-[96px] leading-none font-extrabold tracking-[-0.04em] text-content-inverse tabular-nums sm:text-[128px]">
                        4<span className="text-brand-gold">0</span>4
                    </p>

                    <h1 className="mt-4 font-heading text-2xl font-bold text-content-inverse sm:text-3xl">
                        This page has shipped elsewhere
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-content-subtle">
                        The link may be outdated or mistyped. Head back to the homepage, or pick up
                        one of the routes below.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <Button as={Link} to="/" leftIcon={Home}>
                            Back to homepage
                        </Button>
                        <Button
                            as={Link}
                            to="/products"
                            variant="outline"
                            leftIcon={Search}
                            className="border-white/20 text-content-inverse hover:border-brand-gold hover:text-brand-gold"
                        >
                            Browse catalog
                        </Button>
                    </div>

                    {/* Quick route recovery */}
                    <nav className="mt-12 border-t border-border-dark pt-8">
                        <p className="text-[10px] font-bold tracking-[0.28em] text-content-subtle uppercase">
                            Or jump to
                        </p>
                        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                            {NAV_LINKS.filter((l) => l.to !== "/").map((l) => (
                                <li key={l.to}>
                                    <Link
                                        to={l.to}
                                        className="text-sm font-semibold text-content-subtle transition-colors hover:text-brand-gold"
                                    >
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </main>
        </div>
    );
}
