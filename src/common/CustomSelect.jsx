import { useState, useRef, useEffect } from "react";

const PRIMARY = "#A77A95";
const PRIMARY_HOVER = "#8F6580";
const SECONDARY = "#C3C3D5";
const SECONDARY_SOFT = "#E8E8F0";
const TEXT = "#735366";
const BORDER = "#D0D5DD";

function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  isDisabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const controlDisabled = disabled || isDisabled;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedValue =
    value !== null && typeof value === "object" ? value.value : value;
  const valuesMatch = (optionValue) =>
    optionValue != null &&
    selectedValue != null &&
    String(optionValue) === String(selectedValue);
  const selectedOption = options.find((item) => valuesMatch(item.value));

  const handleSelect = (option) => {
    onChange?.(option);
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        fontFamily: "sans-serif",
      }}
    >
      {/* Select Box */}
      <div
        onClick={() => !controlDisabled && setIsOpen(!isOpen)}
        style={{
          height: "38px",
          border: `1px solid ${isOpen ? PRIMARY : BORDER}`,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          cursor: controlDisabled ? "not-allowed" : "pointer",
          background: controlDisabled ? "#F2F4F7" : "#fff",
          color: selectedOption ? TEXT : "#98A2B3",
          boxShadow: isOpen ? `0 0 0 1px ${PRIMARY}` : "none",
          transition: "0.2s",
        }}
      >
        <span
          title={selectedOption?.label || placeholder}
          style={{
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            paddingRight: "8px",
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <span
          style={{
            color: SECONDARY,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "0.2s",
            fontSize: "14px",
          }}
        >
          ▼
        </span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "42px",
            width: "100%",
            background: "#fff",
            border: `1px solid ${SECONDARY}`,
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(115,83,102,.15)",
            overflow: "hidden",
            zIndex: 1000,
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {options.length === 0 ? (
            <div
              style={{
                padding: "10px 12px",
                color: "#999",
              }}
            >
              No options found
            </div>
          ) : (
            options.map((option) => {
              const selected = valuesMatch(option.value);

              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    background: selected ? PRIMARY : "#fff",
                    color: selected ? "#fff" : TEXT,
                    transition: ".15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!selected)
                      e.currentTarget.style.background = SECONDARY;
                  }}
                  onMouseLeave={(e) => {
                    if (!selected)
                      e.currentTarget.style.background = "#fff";
                  }}
                >
                  {option.label}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;