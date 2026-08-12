// src/data/siteContent.js
// Static marketing copy. Nothing here is editable from the CMS by design —
// numbers, contacts and certifications come from the API instead.
import {
    Shirt,
    Scissors,
    Factory,
    ShieldCheck,
    Leaf,
    Ship,
    Search,
    FileCheck2,
    PackageCheck,
    Handshake,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

export const SITE = {
    name: "SKH Sourcing",
    tagline: "End-to-end apparel sourcing from Bangladesh",
    domains: ["www.skhsourcing.com", "www.skhsourcing.org"],
    established: 2014,
};

export const HERO = {
    title: "Your sourcing partner for apparel that ships on time",
    subtitle:
        "Knitwear, woven, denim and home textiles produced across a vetted network of compliant factories — with in-house quality inspection at every stage.",
    primaryCta: { label: "Request a Quote", action: "rfq" },
    secondaryCta: { label: "Browse Catalog", to: "/products" },
    trustLine: "Trusted by importers across Australia, Europe, North America and the Middle East.",
};

/* ------------------------------- Services ------------------------------- */

export const SERVICES = [
    {
        id: "product-development",
        icon: Shirt,
        title: "Product Development",
        body: "From mood board or tech pack to approved sample — pattern making, fit sessions and costing handled by our merchandising team.",
    },
    {
        id: "fabric-sourcing",
        icon: Scissors,
        title: "Fabric & Trim Sourcing",
        body: "Direct mill relationships for knits, wovens and denim, plus a full accessories chain for labels, tapes, zippers and packaging.",
    },
    {
        id: "production",
        icon: Factory,
        title: "Production Management",
        body: "Factory allocation matched to your MOQ and lead time, with daily line monitoring and milestone reporting through shipment.",
    },
    {
        id: "quality",
        icon: ShieldCheck,
        title: "Quality Inspection",
        body: "Inline and final AQL inspections by our own QC team — never self-certified by the factory — with photo-documented reports.",
    },
    {
        id: "sustainable",
        icon: Leaf,
        title: "Sustainable Fabrics",
        body: "BCI and organic cotton, LENZING™ EcoVero™, recycled polyester and TENCEL™, with traceable documentation on request.",
    },
    {
        id: "logistics",
        icon: Ship,
        title: "Logistics & Compliance",
        body: "Consolidation, documentation and freight coordination, plus buyer-mandated social and technical audit support.",
    },
];

/* ------------------------------- Process -------------------------------- */

export const PROCESS = [
    {
        step: "01",
        icon: Search,
        title: "Inquiry & Costing",
        body: "Share a tech pack or reference. We return factory options, indicative pricing and lead times within one business day.",
    },
    {
        step: "02",
        icon: FileCheck2,
        title: "Sampling & Approval",
        body: "Proto, fit and PP samples with fabric and trim cards, revised until the buyer signs off on the golden sample.",
    },
    {
        step: "03",
        icon: Factory,
        title: "Bulk Production",
        body: "Booked capacity, TNA-tracked milestones and inline QC, with weekly WIP reports from cut to finish.",
    },
    {
        step: "04",
        icon: PackageCheck,
        title: "Inspection & Shipment",
        body: "Final AQL inspection, carton audit and documentation, then handover to your nominated forwarder.",
    },
];

/* ------------------------------ Milestones ------------------------------ */

export const MILESTONES = [
    {
        year: "2014",
        title: "Founded in Dhaka",
        body: "Started as a buying house serving two European importers.",
    },
    {
        year: "2017",
        title: "Denim & outerwear added",
        body: "Expanded the vetted factory network beyond basic knitwear.",
    },
    {
        year: "2020",
        title: "In-house QC team",
        body: "Brought quality inspection fully in-house instead of outsourcing to third parties.",
    },
    {
        year: "2022",
        title: "Sustainable line",
        body: "Introduced BCI, organic cotton and recycled polyester programmes.",
    },
    {
        year: "2024",
        title: "Australia office",
        body: "Opened the Liverpool, NSW office to serve the APAC market directly.",
    },
];

/* -------------------------------- Director ------------------------------ */

export const DIRECTOR = {
    name: "MD. Abdul Manzur Kazal",
    role: "Director",
    email: "kazal@skhsourcing.com",
    photo: "/director.jpg", // static public asset
    bio: [
        "SKH Sourcing was built on a simple conviction: buyers deserve a sourcing partner who is accountable for what leaves the factory floor, not just for placing the order.",
        "Two decades in the Bangladesh apparel industry taught us that reliability comes from three things — the right factory for the right product, quality checks we own ourselves, and communication that never leaves a buyer guessing.",
    ],
};

/* ----------------------------- Promise trio ----------------------------- */

export const PROMISES = [
    {
        icon: ShieldCheck,
        title: "Quality we own",
        body: "Our own QC signs off every shipment. No self-certified factory reports.",
    },
    {
        icon: Handshake,
        title: "One point of contact",
        body: "A dedicated merchandiser from costing through delivery — no handoffs.",
    },
    {
        icon: Ship,
        title: "Dates we hold",
        body: "TNA-tracked production with weekly reporting, so slippage is visible early.",
    },
];

/* --------------------------- Reference content -------------------------- */

export const SUSTAINABLE_FABRICS = [
    { name: "BCI Cotton", note: "Better Cotton Initiative sourced" },
    { name: "Organic Cotton", note: "GOTS-certified supply chain" },
    { name: "LENZING™ EcoVero™", note: "Certified viscose" },
    { name: "Recycled Polyester", note: "GRS-traceable rPET" },
    { name: "TENCEL™ Lyocell", note: "Closed-loop production" },
];

export const TARGET_MARKETS = ["Australia", "Europe", "North America", "Middle East", "Asia"];

/** Fallback only — the live values come from GET /api/stats via toOffices(). */
export const OFFICES_FALLBACK = [
    {
        id: "bd",
        label: "Bangladesh — Head Office",
        address:
            "House 2, 5th Floor, Road 2, Badda Gudaraghat (Gulshan-Badda Link Road), Badda, Dhaka 1212, Bangladesh",
        phone: "+880 1842 770200",
        email: "kazal@skhsourcing.com",
    },
    {
        id: "au",
        label: "Australia — Regional Office",
        address: "Unit 30, Block B, 1 Anderson Avenue, Liverpool, NSW 2170, Australia",
        phone: "+61 480 687 273",
        email: "inquiry@skhsourcing.com",
    },
];

/** TODO: swap these placeholder URLs for the real profiles/number. */
export const SOCIAL_LINKS = [
    {
        id: "facebook",
        label: "Facebook",
        icon: FaFacebookF,
        href: "https://facebook.com/skhsourcing",
    },
    {
        id: "instagram",
        label: "Instagram",
        icon: FaInstagram,
        href: "https://instagram.com/skhsourcing",
    },
    { id: "whatsapp", label: "WhatsApp", icon: FaWhatsapp, href: "https://wa.me/8801842770200" },
];

export const NAV_LINKS = [
    { to: "/", label: "Home", slug: "home" },
    { to: "/products", label: "Products", slug: "products" },
    // { to: "/services", label: "Services", slug: "services" },
    { to: "/compliance", label: "Compliance", slug: "compliance" },
    { to: "/about", label: "About", slug: "about" },
    { to: "/contact", label: "Contact", slug: "contact" },
];

/** Office timezones for the footer's operational clock. Keyed by toOffices() id. */
export const OFFICE_TIMEZONES = { bd: "Asia/Dhaka", au: "Australia/Sydney" };

/** Fallback marquee items until certifications are seeded. */
export const COMPLIANCE_STANDARDS = [
    { name: "OEKO-TEX® Standard 100" },
    { name: "GOTS" },
    { name: "BSCI" },
    { name: "WRAP" },
    { name: "GRS" },
    { name: "Sedex / SMETA" },
    { name: "BCI" },
];
