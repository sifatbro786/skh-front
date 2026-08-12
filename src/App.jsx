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
import PageMetaManagement from "./pages/admin/PageMetaManagement";
import UserManagement from "./pages/admin/UserManagement";
import AccountSettings from "./pages/admin/AccountSettings";

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
                <Route path="page-meta" element={<PageMetaManagement />} />

                {/* super_admin gate lives inside UserManagement */}
                <Route path="users" element={<UserManagement />} />
                <Route path="settings" element={<AccountSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
