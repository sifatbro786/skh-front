// src/components/client/compliance/StandardsList.jsx
// The standards register, in the catalog's line-sheet language: dotted leaders +
// mono status column. Deliberately NOT numbered — this is a set, not a sequence.
//
// Each row is cross-referenced against the live certifications so the status
// column tells the buyer something true ("we can hand you the PDF" vs "ask us"),
// instead of repeating the name in a different font.
import { COMPLIANCE_STANDARDS } from "../../../data/siteContent";

/** "OEKO-TEX® Standard 100" and "Oeko Tex Standard 100" must match. */
const norm = (value = "") =>
    String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "");

const findCert = (name, certifications) => {
    const target = norm(name);
    if (target.length < 3) return null;
    return (
        certifications.find((cert) => {
            const title = norm(cert.title);
            // Bidirectional: the seeded title may be longer ("GOTS 6.0 Scope
            // Certificate") or shorter ("GOTS") than the marketing name.
            return title.length >= 3 && (title.includes(target) || target.includes(title));
        }) || null
    );
};

export default function StandardsList({
    standards = COMPLIANCE_STANDARDS,
    certifications = [],
    className = "",
}) {
    if (!standards.length) return null;

    return (
        <ul className={`grid gap-x-12 sm:grid-cols-2 ${className}`}>
            {standards.map((standard) => {
                const name = standard.name || standard.title;
                const cert = findCert(name, certifications);
                const hasPdf = Boolean(cert?.pdfPath);

                return (
                    <li
                        key={name}
                        className="flex items-baseline gap-3 border-b border-border-subtle/70 py-3.5"
                    >
                        <span
                            className={`h-3.5 w-0.5 shrink-0 ${
                                cert ? "bg-brand-gold" : "bg-border-strong"
                            }`}
                            aria-hidden="true"
                        />
                        <span className="text-[13.5px] font-medium text-content">{name}</span>
                        <span
                            className="mb-1 min-w-4 flex-1 border-b border-dotted border-border-strong"
                            aria-hidden="true"
                        />
                        <span
                            className={`font-mono text-[11px] tracking-[0.08em] whitespace-nowrap uppercase ${
                                hasPdf ? "text-brand-gold" : "text-content-subtle"
                            }`}
                        >
                            {hasPdf ? "PDF on file" : cert ? "Certified" : "On request"}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}
