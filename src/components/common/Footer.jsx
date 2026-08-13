// src/components/common/Footer.jsx
// Dual-office footer. Stats + certifications are fetched once here (both public)
// and degrade to siteContent fallbacks on failure — the footer renders on every
// page, so it must never block or throw on a cold API.
// Desktop layout: brand (left) · quick links (center) · offices (right).
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { statsApi, toOffices } from "../../services/statsApi";
import { certificationApi } from "../../services/certificationApi";
import {
    NAV_LINKS,
    OFFICES_FALLBACK,
    OFFICE_TIMEZONES,
    SITE,
    SOCIAL_LINKS,
} from "../../data/siteContent";

/** Pure helper (not a hook) so it can be called inside .map() safely. */
const officeClock = (now, timeZone) => {
    const time = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
    }).format(now);
    const hour = Number(time.slice(0, 2)) % 24;
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone }).format(now);
    return { time, open: weekday !== "Sun" && hour >= 9 && hour < 18 };
};

const STANDARDS_FALLBACK = [
    { title: "OEKO-TEX® 100" },
    { title: "GOTS" },
    { title: "BSCI" },
    { title: "WRAP" },
    { title: "GRS" },
];

const OfficeBlock = ({ office, now }) => {
    const { time, open } = officeClock(now, OFFICE_TIMEZONES[office.id] || "UTC");
    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold tracking-[0.28em] text-brand-gold uppercase">
                    {office.id === "bd" ? "Dhaka HQ" : "Sydney Hub"}
                </span>
                <span
                    className="flex items-center gap-1.5 text-[11px] text-content-subtle tabular-nums"
                    title={open ? "Open now" : "Outside business hours"}
                >
                    <span
                        className={`h-1.5 w-1.5 rounded-full ${
                            open ? "bg-success" : "bg-content-subtle/50"
                        }`}
                        aria-hidden="true"
                    />
                    {time}
                </span>
            </div>
            <address className="mt-4 space-y-3 text-sm not-italic text-content-subtle">
                <span className="flex gap-2.5">
                    <MapPin
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold"
                        aria-hidden="true"
                    />
                    <span className="leading-relaxed">{office.address}</span>
                </span>
                <a
                    href={`tel:${String(office.phone).replace(/\s+/g, "")}`}
                    className="flex items-center gap-2.5 tabular-nums transition-colors hover:text-content-inverse"
                >
                    <Phone className="h-4 w-4 shrink-0 text-brand-gold" aria-hidden="true" />
                    {office.phone}
                </a>
                <a
                    href={`mailto:${office.email}`}
                    className="flex items-center gap-2.5 transition-colors hover:text-content-inverse"
                >
                    <Mail className="h-4 w-4 shrink-0 text-brand-gold" aria-hidden="true" />
                    {office.email}
                </a>
            </address>
        </div>
    );
};

export default function Footer() {
    const [offices, setOffices] = useState(OFFICES_FALLBACK);
    const [certs, setCerts] = useState([]);
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30_000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        let active = true;
        Promise.allSettled([statsApi.get(), certificationApi.list()]).then(([s, c]) => {
            if (!active) return;
            if (s.status === "fulfilled" && s.value?.stats?.contactDetails) {
                const live = toOffices(s.value.stats);
                setOffices(
                    OFFICES_FALLBACK.map((fb) => {
                        const hit = live.find((o) => o.id === fb.id) || {};
                        return {
                            ...fb,
                            ...Object.fromEntries(Object.entries(hit).filter(([, v]) => v)),
                        };
                    }),
                );
            }
            if (c.status === "fulfilled") setCerts(c.value?.certifications || []);
        });
        return () => {
            active = false;
        };
    }, []);

    const year = useMemo(() => new Date().getFullYear(), []);
    const standards = certs.length ? certs.slice(0, 5) : STANDARDS_FALLBACK;

    return (
        <footer className="bg-surface-dark text-content-inverse">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-12">
                    {/* Brand — left */}
                    <div className="lg:col-span-3">
                        <img
                            src="/logo.png"
                            alt="SKH Sourcing"
                            className="h-11 w-auto"
                            draggable="false"
                        />
                        <p className="mt-5 max-w-xs text-sm leading-relaxed text-content-subtle">
                            {SITE.tagline}. Inspected by our own QC team before anything ships.
                        </p>
                        <p className="mt-6 text-[11px] tracking-[0.24em] text-content-subtle uppercase tabular-nums">
                            A decade of sourcing · {SITE.domains[0]}
                        </p>
                        <div className="mt-6 flex items-center gap-3">
                            {SOCIAL_LINKS.map(({ id, label, icon: Icon, href }) => (
                                <a
                                    key={id}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-content-subtle transition-colors hover:border-brand-gold hover:text-brand-gold"
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick links + standards — center */}
                    <div className="grid grid-cols-2 gap-8 lg:col-span-4 lg:justify-items-center">
                        <div>
                            <h3 className="text-[10px] font-bold tracking-[0.28em] text-brand-gold uppercase">
                                Explore
                            </h3>
                            <ul className="mt-5 space-y-3 text-sm text-content-subtle">
                                {NAV_LINKS.map((l) => (
                                    <li key={l.to}>
                                        <Link
                                            to={l.to}
                                            className="transition-colors hover:text-brand-gold"
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-bold tracking-[0.28em] text-brand-gold uppercase">
                                Standards
                            </h3>
                            <ul className="mt-5 space-y-3 text-sm text-content-subtle">
                                {standards.map((c) => (
                                    <li key={c._id || c.title}>{c.title}</li>
                                ))}
                            </ul>
                            <Link
                                to="/compliance"
                                className="mt-4 inline-block text-[11px] font-bold tracking-[0.2em] text-brand-gold uppercase hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                    </div>

                    {/* Offices — right */}
                    <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:gap-6">
                        {offices.map((office) => (
                            <OfficeBlock key={office.id} office={office} now={now} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-border-dark">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-[12px] text-content-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <p>© {year} SKH Sourcing. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="hover:text-brand-gold">
                            Privacy
                        </Link>
                        <Link to="/terms" className="hover:text-brand-gold">
                            Terms
                        </Link>
                        <Link to="/contact" className="hover:text-brand-gold">
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
