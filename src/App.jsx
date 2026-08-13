// src/App.jsx
import { Route, Routes } from "react-router-dom";
import ClientLayout from "./layouts/ClientLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./router/ProtectedRoute";
import Homepage from "./pages/client/Homepage";
import ProductsPage from "./pages/client/ProductsPage";
import ProductDetailPage from "./pages/client/ProductDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import NotFound from "./components/common/NotFound";
import Overview from "./pages/admin/Overview";
import ProductsManagement from "./pages/admin/ProductsManagement";
import InquiriesManagement from "./pages/admin/InquiriesManagement";
import CertificationsManagement from "./pages/admin/CertificationsManagement";
import CompanySettings from "./pages/admin/CompanySettings";
import PageMetaManagement from "./pages/admin/PageMetaManagement";
import UserManagement from "./pages/admin/UserManagement";
import AccountSettings from "./pages/admin/AccountSettings";
import CompliancePage from "./pages/client/CompliancePage";
import AboutPage from "./pages/client/AboutPage";
import ContactPage from "./pages/client/ContactPage";
import AdminNotFound from "./pages/admin/AdminNotFound";

export default function App() {
    return (
        <Routes>
            <Route element={<ClientLayout />}>
                <Route path="/" element={<Homepage />} />
                {/* Static-ish segments must not be shadowed by /products/:id —
                    React Router ranks the literal path higher, but keep the
                    order explicit for anyone reading the file. */}
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/compliance" element={<CompliancePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Admin console */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute requireAdmin>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Overview />} />
                <Route path="products" element={<ProductsManagement />} />
                <Route path="inquiries" element={<InquiriesManagement />} />
                <Route path="certifications" element={<CertificationsManagement />} />
                <Route path="company" element={<CompanySettings />} />
                {/* "page-meta", not "pagemeta" — adminNav.js links to
                    /admin/page-meta, so the old spelling 404'd from the sidebar. */}
                <Route path="page-meta" element={<PageMetaManagement />} />
                <Route
                    path="users"
                    element={
                        <ProtectedRoute requireRole="super_admin">
                            <UserManagement />
                        </ProtectedRoute>
                    }
                />
                <Route path="settings" element={<AccountSettings />} />

                {/* Fallback */}
                <Route path="*" element={<AdminNotFound />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
