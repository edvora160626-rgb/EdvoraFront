import { lazy, Suspense } from "react";

const CustomDatePickerInner = lazy(() => import("./CustomDatePickerInner"));

function DateFallback({
  value = "",
  onChange,
  placeholder = "dd-MM-yyyy",
  maxDate,
  minDate,
  disabled = false,
}) {
  return (
    <input
      type="date"
      value={value || ""}
      max={maxDate || undefined}
      min={minDate || undefined}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange?.(event.target.value)}
      className="h-[38px] w-full rounded-md border border-[#D0D5DD] bg-white px-2 text-sm text-[#344054] disabled:cursor-not-allowed disabled:bg-[#f5f5f5] disabled:text-[#9ca3af]"
    />
  );
}

function CustomDatePicker(props) {
  return (
    <Suspense fallback={<DateFallback {...props} />}>
      <CustomDatePickerInner {...props} />
    </Suspense>
  );
}

export default CustomDatePicker;
