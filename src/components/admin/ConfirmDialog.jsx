// src/components/admin/ConfirmDialog.jsx
// Every destructive admin action routes through this — one place for the
// "are you sure" copy, the in-flight lock and the danger styling.
//
// `dismissible={!busy}` matters: Modal's focus trap + scroll lock stay engaged
// while the DELETE is in flight, so a stray Escape can't leave the caller
// holding a half-finished mutation.
import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    busy = false,
    title = "Are you sure?",
    description,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    tone = "danger",
}) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            description={description}
            size="sm"
            dismissible={!busy}
            closeOnBackdrop={!busy}
            footer={
                <div className="flex justify-end gap-2.5">
                    <Button variant="ghost" onClick={onClose} disabled={busy}>
                        {cancelLabel}
                    </Button>
                    <Button variant={tone} onClick={onConfirm} loading={busy}>
                        {confirmLabel}
                    </Button>
                </div>
            }
        >
            <p className="text-[14px] leading-relaxed text-content-muted">
                This can&rsquo;t be undone.
            </p>
        </Modal>
    );
}
