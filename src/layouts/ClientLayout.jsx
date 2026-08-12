/* eslint-disable no-unused-vars */
// src/layouts/ClientLayout.jsx
// Hosts the RFQ modal so any component (Navbar, product card, hero CTA) can open
// it by dispatching RFQ_EVENT — no prop drilling, no context for a single modal.
import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar, { RFQ_EVENT } from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function ClientLayout() {
    const [rfq, setRfq] = useState(null); // null = closed, object = { productId?, source? }

    useEffect(() => {
        const onOpen = (e) => setRfq(e.detail || {});
        window.addEventListener(RFQ_EVENT, onOpen);
        return () => window.removeEventListener(RFQ_EVENT, onOpen);
    }, []);

    const openRfq = useCallback(() => setRfq({ source: "navbar" }), []);

    return (
        <div className="flex min-h-screen flex-col bg-surface">
            <Navbar onRequestQuote={openRfq} />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            {/* Phase 2: <RfqModal open={!!rfq} context={rfq} onClose={() => setRfq(null)} /> */}
        </div>
    );
}
