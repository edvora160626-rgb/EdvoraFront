/**
 * Active / Inactive segmented filter used on Classes, Subjects, Departments.
 * Colours come from theme CSS vars so light/dark + palette stay consistent.
 */
function StatusFilterSwitch({
  value = "ACTIVE",
  onChange,
  counts = { ACTIVE: 0, INACTIVE: 0 },
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}) {
  return (
    <div className="theme-segment" role="group" aria-label="Status filter">
      <button
        type="button"
        onClick={() => onChange?.("ACTIVE")}
        aria-pressed={value === "ACTIVE"}
        className={`theme-segment-btn is-success ${
          value === "ACTIVE" ? "is-active" : ""
        }`}
      >
        {activeLabel}
        <span className="theme-segment-count">{counts.ACTIVE ?? 0}</span>
      </button>
      <button
        type="button"
        onClick={() => onChange?.("INACTIVE")}
        aria-pressed={value === "INACTIVE"}
        className={`theme-segment-btn is-danger ${
          value === "INACTIVE" ? "is-active" : ""
        }`}
      >
        {inactiveLabel}
        <span className="theme-segment-count">{counts.INACTIVE ?? 0}</span>
      </button>
    </div>
  );
}

export default StatusFilterSwitch;
