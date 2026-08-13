/* eslint-disable react-hooks/set-state-in-effect */
// src/pages/admin/CompanySettings.jsx
// The singleton behind the homepage counters, the footer contact block and the
// About page's accessories/packaging line.
//
// Two contract details worth knowing:
//  · contact fields MUST be nested under `contactDetails` — statsApi flattens
//    them to dot-notation server-side so a partial save doesn't wipe siblings.
//  · every numeric field is rejected with a 400 if it's negative or non-finite,
//    so they're guarded here before the request goes out.
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import { useAsync } from "../../hooks/useAsync";
import { statsApi, statsErrorMessage } from "../../services/statsApi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { Button, Field, TextArea, TextInput } from "../../components/ui";
import { SkeletonText } from "../../components/ui/Skeleton";

const NUMBERS = [
    { key: "partnerFactories", label: "Partner factories" },
    { key: "countriesServed", label: "Countries served" },
    { key: "annualShipments", label: "Annual shipments" },
    { key: "yearsInBusiness", label: "Years in business" },
    { key: "teamMembers", label: "Team members" },
];

const CONTACTS = [
    { key: "primaryEmail", label: "Primary email", type: "email" },
    { key: "inquiryEmail", label: "Inquiry email", type: "email" },
    { key: "bdPhone", label: "Bangladesh phone" },
    { key: "auPhone", label: "Australia phone" },
    { key: "bdAddress", label: "Bangladesh address", textarea: true },
    { key: "auAddress", label: "Australia address", textarea: true },
];

export default function CompanySettings() {
    const { data, loading, retry } = useAsync(() => statsApi.get(), []);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const stats = data?.stats;
        if (!stats) return;
        setForm({
            ...NUMBERS.reduce((acc, f) => ({ ...acc, [f.key]: stats[f.key] ?? 0 }), {}),
            packagingUnit: stats.packagingUnit || "",
            contactDetails: CONTACTS.reduce(
                (acc, f) => ({ ...acc, [f.key]: stats.contactDetails?.[f.key] || "" }),
                {},
            ),
        });
    }, [data]);

    const setNumber = (key, value) => setForm((f) => ({ ...f, [key]: value }));
    const setContact = (key, value) =>
        setForm((f) => ({ ...f, contactDetails: { ...f.contactDetails, [key]: value } }));

    const save = async () => {
        const invalid = NUMBERS.find((f) => {
            const n = Number(form[f.key]);
            return !Number.isFinite(n) || n < 0;
        });
        if (invalid) {
            toast.error(`${invalid.label} must be a non-negative number`);
            return;
        }

        setSaving(true);
        try {
            await statsApi.update({
                ...NUMBERS.reduce((acc, f) => ({ ...acc, [f.key]: Number(form[f.key]) }), {}),
                packagingUnit: form.packagingUnit,
                contactDetails: form.contactDetails,
            });
            toast.success("Company settings saved");
            retry();
        } catch (err) {
            toast.error(statsErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    if (loading || !form) {
        return (
            <div className="space-y-6">
                <AdminPageHeader description="Figures and contact details used across the public site." />
                <SkeletonText lines={10} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <AdminPageHeader
                description="Figures and contact details used across the public site — homepage counters, footer and the About page."
                meta={[
                    {
                        label: "Last updated by",
                        value: data?.stats?.lastUpdatedBy || "—",
                    },
                ]}
                actions={
                    <Button leftIcon={Save} onClick={save} loading={saving}>
                        Save changes
                    </Button>
                }
            />

            <section>
                <h2 className="font-heading text-[13px] font-bold tracking-[0.18em] text-content-subtle uppercase">
                    Figures
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {NUMBERS.map((f) => (
                        <Field key={f.key} label={f.label} htmlFor={`n-${f.key}`}>
                            <TextInput
                                id={`n-${f.key}`}
                                type="number"
                                min={0}
                                value={form[f.key]}
                                onChange={(e) => setNumber(f.key, e.target.value)}
                            />
                        </Field>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="font-heading text-[13px] font-bold tracking-[0.18em] text-content-subtle uppercase">
                    Contact details
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {CONTACTS.map((f) => (
                        <Field
                            key={f.key}
                            label={f.label}
                            htmlFor={`c-${f.key}`}
                            className={f.textarea ? "sm:col-span-1" : ""}
                        >
                            {f.textarea ? (
                                <TextArea
                                    id={`c-${f.key}`}
                                    rows={3}
                                    maxLength={300}
                                    value={form.contactDetails[f.key]}
                                    onChange={(e) => setContact(f.key, e.target.value)}
                                />
                            ) : (
                                <TextInput
                                    id={`c-${f.key}`}
                                    type={f.type || "text"}
                                    maxLength={300}
                                    value={form.contactDetails[f.key]}
                                    onChange={(e) => setContact(f.key, e.target.value)}
                                />
                            )}
                        </Field>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="font-heading text-[13px] font-bold tracking-[0.18em] text-content-subtle uppercase">
                    Production
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field
                        label="Accessories &amp; packaging unit"
                        htmlFor="packaging-unit"
                        hint="Rendered on the About page capability band."
                    >
                        <TextInput
                            id="packaging-unit"
                            maxLength={200}
                            value={form.packagingUnit}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, packagingUnit: e.target.value }))
                            }
                            placeholder="Ruby Printing &amp; Packaging"
                        />
                    </Field>
                </div>
            </section>
        </div>
    );
}
