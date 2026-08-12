// src/services/statsApi.js
import api, { clean, apiErrorMessage } from "./api";

const NUMERIC = [
    "partnerFactories",
    "countriesServed",
    "annualShipments",
    "yearsInBusiness",
    "teamMembers",
];

const CONTACT = ["primaryEmail", "inquiryEmail", "bdPhone", "bdAddress", "auPhone", "auAddress"];

const pick = (source = {}, keys) =>
    keys.reduce((acc, k) => {
        if (source[k] !== undefined && source[k] !== null && source[k] !== "") acc[k] = source[k];
        return acc;
    }, {});

export const statsApi = {
    /** GET /api/stats (PUBLIC). Upsert-on-read — never returns null. */
    get: () => api.get("/stats").then((r) => r.data),

    /**
     * PATCH /api/stats (protected).
     * Contact fields MUST be nested under `contactDetails` — the controller
     * flattens them to dot-notation so a partial payload doesn't wipe siblings.
     * Any non-finite or negative number is a 400.
     */
    update: ({ contactDetails, ...numbers } = {}) =>
        api
            .patch("/stats", {
                ...pick(numbers, NUMERIC),
                ...(contactDetails ? { contactDetails: pick(contactDetails, CONTACT) } : {}),
            })
            .then((r) => r.data),
};

/** Homepage counter definitions — label lives here, value comes from the API. */
export const STAT_CARDS = [
    { key: "partnerFactories", label: "Partner Factories", suffix: "+" },
    { key: "countriesServed", label: "Countries Served", suffix: "+" },
    { key: "annualShipments", label: "Annual Shipments", suffix: "+" },
    { key: "teamMembers", label: "Team Members", suffix: "+" },
];

/** Normalises the singleton into the dual-office shape the Footer/Contact use. */
export const toOffices = (stats) => {
    const c = stats?.contactDetails || {};
    return [
        {
            id: "bd",
            label: "Bangladesh — Head Office",
            country: "Bangladesh",
            address: c.bdAddress,
            phone: c.bdPhone,
            email: c.primaryEmail,
        },
        {
            id: "au",
            label: "Australia — Regional Office",
            country: "Australia",
            address: c.auAddress,
            phone: c.auPhone,
            email: c.inquiryEmail,
        },
    ];
};

export const statsErrorMessage = (err, fallback = "Could not update company settings") =>
    apiErrorMessage(err, fallback);

export { clean };
