import { AlertTriangle, Trash2 } from "lucide-react";
import EdvoraLoader from "./EdvoraLoader";

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  icon: Icon,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const IconComponent = Icon || (tone === "danger" ? Trash2 : AlertTriangle);
  const iconWrapClass =
    tone === "danger"
      ? "bg-[color:var(--edvora-danger-soft)] text-[color:var(--edvora-danger)]"
      : tone === "warning"
        ? "bg-[color:var(--edvora-warning-soft)] text-[color:var(--edvora-warning)]"
        : "bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-primary)]";

  const confirmClass =
    tone === "warning"
      ? "bg-[color:var(--edvora-warning)] text-[color:var(--edvora-on-solid)] hover:brightness-95"
      : tone === "primary"
        ? "theme-btn-primary"
        : "bg-[color:var(--edvora-danger)] text-white hover:brightness-95";

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-[color:var(--edvora-overlay)] backdrop-blur-md p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close confirmation"
        onClick={loading ? undefined : onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative w-full max-w-[420px] glass-strong rounded-2xl overflow-hidden shadow-[var(--edvora-glass-shadow-lg)]"
      >
        <div className="px-5 pt-5 pb-2">
          <span
            className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${iconWrapClass}`}
          >
            <IconComponent size={20} />
          </span>
          <h3
            id="confirm-modal-title"
            className="text-lg font-semibold text-[color:var(--edvora-ink-strong)]"
          >
            {title}
          </h3>
          {description ? (
            <p className="mt-2 text-sm text-[color:var(--edvora-muted)] leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>

        <div className="px-5 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-[40px] px-4 rounded-xl border border-[color:var(--edvora-glass-border-soft)] text-[color:var(--edvora-ink)] text-sm font-medium hover:bg-[color:var(--edvora-glass-soft)] disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`h-[40px] px-5 rounded-xl text-sm font-semibold disabled:opacity-60 shadow-md ${confirmClass}`}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>

      {loading ? <EdvoraLoader overlay message="Processing…" /> : null}
    </div>
  );
}

export default ConfirmModal;
