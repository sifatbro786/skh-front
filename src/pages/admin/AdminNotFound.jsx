// src/pages/admin/AdminNotFound.jsx
// Nested under /admin so a stale bookmark or a not-yet-built screen keeps the
// shell instead of dropping the user on the public 404 with no way back.
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

export default function AdminNotFound() {
    return (
        <EmptyState
            icon={Compass}
            title="No such screen"
            description="That admin route doesn't exist — it may have been renamed, or the screen isn't built yet."
            action={
                <Button as={Link} to="/admin" variant="outline">
                    Back to overview
                </Button>
            }
        />
    );
}
