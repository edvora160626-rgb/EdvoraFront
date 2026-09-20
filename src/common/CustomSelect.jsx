import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

const PRIMARY_SOLID = "var(--edvora-primary, #A77A95)";
const SECONDARY = "var(--edvora-secondary, #C3C3D5)";
const TEXT = "var(--edvora-ink, #735366)";
const MUTED = "var(--edvora-muted, #98A2B3)";
const BORDER = "var(--edvora-border, #D0D5DD)";
const CARD = "var(--edvora-card, #fff)";
const ELEVATED = "var(--edvora-elevated, #F2F4F7)";

function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  isDisabled = false,
  isLoading = false,
  isSearchable = false,
  formatOptionLabel,
  menuPlacement = "auto",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [menuStyle, setMenuStyle] = useState(null);
  const wrapperRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const controlDisabled = disabled || isDisabled || isLoading;

  const selectedValue =
    value !== null && typeof value === "object" ? value.value : value;
  const valuesMatch = (optionValue) =>
    optionValue != null &&
    selectedValue != null &&
    String(optionValue) === String(selectedValue);
  const selectedOption = options.find((item) => valuesMatch(item.value));

  const filteredOptions =
    isSearchable && search.trim()
      ? options.filter((option) =>
          String(option.label || "")
            .toLowerCase()
            .includes(search.trim().toLowerCase())
        )
      : options;

  const updateMenuPosition = () => {
    const el = wrapperRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const gap = 6;
    const menuMax = 220;
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const preferUp =
      menuPlacement === "top" ||
      (menuPlacement === "auto" &&
        spaceBelow < Math.min(menuMax, 140) &&
        spaceAbove > spaceBelow);

    const maxHeight = Math.max(
      120,
      Math.min(menuMax, preferUp ? spaceAbove - gap : spaceBelow - gap)
    );

    setMenuStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 10050,
      maxHeight,
      ...(preferUp
        ? { bottom: window.innerHeight - rect.top + gap, top: "auto" }
        : { top: rect.bottom + gap, bottom: "auto" }),
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();
    if (isSearchable) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }

    const onScrollOrResize = () => updateMenuPosition();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [isOpen, filteredOptions.length, isSearchable]);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      return;
    }

    const handleClickOutside = (event) => {
      const inTrigger = wrapperRef.current?.contains(event.target);
      const inMenu = menuRef.current?.contains(event.target);
      if (!inTrigger && !inMenu) setIsOpen(false);
    };

    const handleKey = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange?.(option);
    setIsOpen(false);
  };

  const menu = isOpen
    ? createPortal(
        <div
          ref={menuRef}
          style={{
            ...menuStyle,
            background: CARD,
            border: `1px solid ${SECONDARY}`,
            borderRadius: "10px",
            boxShadow: "0 12px 36px rgba(115,83,102,.22)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {isSearchable ? (
            <div
              style={{
                padding: "8px",
                borderBottom: `1px solid ${BORDER}`,
                background: ELEVATED,
              }}
            >
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                style={{
                  width: "100%",
                  height: "34px",
                  borderRadius: "8px",
                  border: `1px solid ${BORDER}`,
                  padding: "0 10px",
                  outline: "none",
                  fontSize: "13px",
                  color: TEXT,
                  background: CARD,
                }}
              />
            </div>
          ) : null}

          <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {isLoading ? (
              <div style={{ padding: "10px 12px", color: MUTED }}>
                Loading…
              </div>
            ) : filteredOptions.length === 0 ? (
              <div style={{ padding: "10px 12px", color: MUTED }}>
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const selected = valuesMatch(option.value);

                return (
                  <div
                    key={String(option.value)}
                    onClick={() => handleSelect(option)}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      background: selected ? PRIMARY_SOLID : "transparent",
                      color: selected ? "#fff" : TEXT,
                      transition: ".15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.background = ELEVATED;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {typeof formatOptionLabel === "function"
                      ? formatOptionLabel(option)
                      : option.label}
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        fontFamily: "sans-serif",
      }}
    >
      <div
        onClick={() => !controlDisabled && setIsOpen((open) => !open)}
        style={{
          height: "38px",
          border: `1px solid ${isOpen ? PRIMARY_SOLID : BORDER}`,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          cursor: controlDisabled ? "not-allowed" : "pointer",
          background: controlDisabled ? ELEVATED : CARD,
          color: selectedOption ? TEXT : MUTED,
          boxShadow: isOpen ? `0 0 0 1px ${PRIMARY_SOLID}` : "none",
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
            lineHeight: 1,
          }}
        >
          ▼
        </span>
      </div>

      {menu}
    </div>
  );
}

export default CustomSelect;
