// src/layouts/ClientLayout.jsx
// Hosts the single RFQ modal instance. Any component (Navbar, hero CTA, product
// card, product detail) opens it with openRfq() from src/lib/rfqBus.js — no prop
// drilling, and only one dialog can ever be mounted.
import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import RfqModal from "../components/common/RfqModal";
import { RFQ_EVENT } from "../lib/rfqBus";

export default function ClientLayout() {
    const [rfq, setRfq] = useState(null); // null = closed, object = { productId?, product?, source? }

    useEffect(() => {
        const onOpen = (e) => setRfq(e.detail || {});
        window.addEventListener(RFQ_EVENT, onOpen);
        return () => window.removeEventListener(RFQ_EVENT, onOpen);
    }, []);

    const openRfq = useCallback(() => setRfq({ source: "navbar" }), []);
    const closeRfq = useCallback(() => setRfq(null), []);

    return (
        <div className="flex min-h-screen flex-col bg-surface">
            <Navbar onRequestQuote={openRfq} />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />

            {/* Kept mounted so AnimatePresence can play the exit transition. */}
            <RfqModal open={!!rfq} context={rfq} onClose={closeRfq} />
        </div>
    );
}
