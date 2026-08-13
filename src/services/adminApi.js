// src/services/adminApi.js
// NOTE: the admin-management endpoints live under /auth/admins, NOT /admins —
// they're declared in authRoutes.js and mounted at /api/auth. All of them are
// restrictTo("super_admin") server-side.
//
// There is deliberately NO generic `update(id, data)`: the backend exposes only
// `PATCH /auth/admins/:id/role` and `PATCH /auth/admins/:id/status`. Name, email
// and password of ANOTHER admin cannot be edited through the API — an admin
// changes their own password via /auth/change-password (AuthContext.changePassword).
import api, { apiErrorMessage } from "./api";

export const adminApi = {
    /** GET /api/auth/admins → { success, count, admins[] } (super_admin only) */
    list: () => api.get("/auth/admins").then((r) => r.data),

    /** POST /api/auth/admins — { name, email, password, role } */
    create: (payload) => api.post("/auth/admins", payload).then((r) => r.data),

    /** PATCH /api/auth/admins/:id/role — { role }. Backend blocks self-demotion
     *  and demoting the last super_admin (both surface as 400). */
    updateRole: (id, role) =>
        api.patch(`/auth/admins/${id}/role`, { role }).then((r) => r.data),

    /** PATCH /api/auth/admins/:id/status — server-side toggle, no body.
     *  Backend blocks deactivating your own account. */
    toggleStatus: (id) => api.patch(`/auth/admins/${id}/status`).then((r) => r.data),

    /** DELETE /api/auth/admins/:id — backend blocks self-delete and last super_admin */
    remove: (id) => api.delete(`/auth/admins/${id}`).then((r) => r.data),

    /** GET /api/auth/me */
    getMe: () => api.get("/auth/me").then((r) => r.data),
};

export const adminErrorMessage = (err, fallback = "Could not complete the request") =>
    apiErrorMessage(err, fallback);

export const ADMIN_ROLES = ["admin", "super_admin"];

export const ROLE_LABELS = {
    admin: "Admin",
    super_admin: "Super Admin",
};
