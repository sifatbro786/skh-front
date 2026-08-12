// src/components/client/home/TrustStrip.jsx
// Compliance logo bar. Placed high on the page on purpose — a B2B buyer scans
// for audit marks before they scan the catalogue.
//
// Falls back to COMPLIANCE_STANDARDS (inside CertMarquee) when the API is empty
// or errors, so the strip is never a blank band on a fresh deployment.
import { certificationApi } from "../../../services/certificationApi";
import { useAsync } from "../../../hooks/useAsync";
import CertMarquee from "../../ui/CertMarquee";

export default function TrustStrip() {
    const { data } = useAsync(() => certificationApi.list(), []);
    const certifications = data?.certifications || [];

    return (
        <section className="border-y border-border-subtle bg-surface-raised py-4">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-10 lg:px-8">
                <p className="shrink-0 text-[10px] font-bold tracking-[0.24em] text-content-subtle uppercase lg:max-w-44 lg:leading-relaxed">
                    Audited &amp; certified to
                </p>
                <div className="min-w-0 flex-1">
                    <CertMarquee items={certifications} />
                </div>
            </div>
        </section>
    );
}
