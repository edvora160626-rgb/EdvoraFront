import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";

/**
 * Premium searchable multi-select with removable chips.
 * value: array of option values (string|number)
 * onChange: (values: array) => void
 */
function CustomMultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select…",
  disabled = false,
  isSearchable = true,
  menuPlacement = "auto",
  emptyHint = "Leave empty for all",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [menuStyle, setMenuStyle] = useState(null);
  const [opensUp, setOpensUp] = useState(false);
  const wrapperRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const selectedSet = useMemo(
    () => new Set((value || []).map(String)),
    [value]
  );

  const selectedOptions = useMemo(
    () => options.filter((opt) => selectedSet.has(String(opt.value))),
    [options, selectedSet]
  );

  const allSelected =
    options.length > 0 && selectedOptions.length === options.length;

  const filteredOptions = useMemo(() => {
    if (!isSearchable || !search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter((opt) =>
      String(opt.label || "")
        .toLowerCase()
        .includes(q)
    );
  }, [options, search, isSearchable]);

  const updateMenuPosition = () => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;
    const menuIdeal = 320;
    const menuMin = 220;
    const spaceBelow = window.innerHeight - rect.bottom - 16;
    const spaceAbove = rect.top - 16;

    const preferUp =
      menuPlacement === "top" ||
      (menuPlacement !== "bottom" &&
        (spaceBelow < menuMin ||
          (spaceAbove >= menuMin && spaceAbove > spaceBelow)));

    const available = preferUp ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(
      menuMin,
      Math.min(menuIdeal, Math.max(available - gap, menuMin))
    );

    // If preferred direction still too tight, flip to the larger side
    let openUp = preferUp;
    if (available < menuMin) {
      openUp = spaceAbove >= spaceBelow;
    }

    const finalAvailable = openUp ? spaceAbove : spaceBelow;
    const finalHeight = Math.max(
      180,
      Math.min(menuIdeal, Math.max(finalAvailable - gap, 180))
    );

    setOpensUp(openUp);
    setMenuStyle({
      position: "fixed",
      left: rect.left,
      width: Math.max(rect.width, 280),
      zIndex: 10060,
      maxHeight: finalHeight,
      height: finalHeight,
      ...(openUp
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
  }, [isOpen, filteredOptions.length, isSearchable, selectedOptions.length]);

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

  const toggleValue = (optValue) => {
    const key = String(optValue);
    const next = new Set(selectedSet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    const ordered = options
      .filter((opt) => next.has(String(opt.value)))
      .map((opt) => opt.value);
    onChange?.(ordered);
  };

  const removeValue = (optValue, e) => {
    e?.stopPropagation?.();
    onChange?.((value || []).filter((v) => String(v) !== String(optValue)));
  };

  const clearAll = (e) => {
    e?.stopPropagation?.();
    onChange?.([]);
  };

  const selectAll = (e) => {
    e?.stopPropagation?.();
    onChange?.(options.map((opt) => opt.value));
  };

  const menu = isOpen
    ? createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className="overflow-hidden rounded-2xl border border-[color:var(--edvora-glass-border)] bg-[color:var(--edvora-card)] shadow-[var(--edvora-glass-shadow-lg)] flex flex-col"
        >
          <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2.5 border-b border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-soft)]">
            <span className="text-[11px] font-semibold text-[color:var(--edvora-muted)]">
              {selectedOptions.length
                ? `${selectedOptions.length} of ${options.length} selected`
                : emptyHint}
            </span>
            <div className="flex items-center gap-3 shrink-0">
              {!allSelected && options.length > 0 ? (
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[11px] font-bold text-[color:var(--edvora-primary)] hover:underline"
                >
                  Select all
                </button>
              ) : null}
              {selectedOptions.length > 0 ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[11px] font-bold text-[color:var(--edvora-danger)] hover:underline"
                >
                  Clear all
                </button>
              ) : null}
            </div>
          </div>

          {isSearchable ? (
            <div className="shrink-0 p-2.5 border-b border-[color:var(--edvora-glass-border-soft)]">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--edvora-muted)]"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search classes…"
                  className="w-full h-10 rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] pl-8 pr-3 text-sm text-[color:var(--edvora-ink-strong)] outline-none focus:border-[color:var(--edvora-primary)]"
                />
              </div>
            </div>
          ) : null}

          <div className="overflow-y-auto flex-1 min-h-0 py-1.5">
            {filteredOptions.length === 0 ? (
              <p className="px-3.5 py-4 text-sm text-[color:var(--edvora-muted)]">
                No classes found
              </p>
            ) : (
              filteredOptions.map((opt) => {
                const selected = selectedSet.has(String(opt.value));
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => toggleValue(opt.value)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 text-left text-sm transition ${
                      selected
                        ? "bg-[color:var(--edvora-primary)]/12 text-[color:var(--edvora-ink-strong)]"
                        : "text-[color:var(--edvora-ink)] hover:bg-[color:var(--edvora-glass-soft)]"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                        selected
                          ? "border-[color:var(--edvora-primary)] bg-[color:var(--edvora-primary)] text-white"
                          : "border-[color:var(--edvora-border)] bg-[color:var(--edvora-glass)]"
                      }`}
                    >
                      {selected ? <Check size={12} strokeWidth={3} /> : null}
                    </span>
                    <span className="min-w-0 flex-1 font-medium truncate">
                      {opt.label}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((o) => !o)}
        className={`w-full min-h-[46px] rounded-xl border px-3 py-2 text-left transition outline-none ${
          isOpen
            ? "border-[color:var(--edvora-primary)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--edvora-primary)_16%,transparent)]"
            : "border-[color:var(--edvora-glass-border-soft)] hover:border-[color:var(--edvora-primary)]/40"
        } ${
          disabled
            ? "opacity-60 cursor-not-allowed bg-[color:var(--edvora-elevated)]"
            : "bg-[color:var(--edvora-glass)] backdrop-blur-md cursor-pointer"
        }`}
      >
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1 flex flex-wrap gap-1.5">
            {selectedOptions.length === 0 ? (
              <span className="text-sm text-[color:var(--edvora-muted)] py-1">
                {placeholder}
              </span>
            ) : (
              selectedOptions.map((opt) => (
                <span
                  key={String(opt.value)}
                  className="inline-flex max-w-full items-center gap-1 rounded-lg bg-[color:var(--edvora-primary)]/12 px-2 py-1 text-xs font-semibold text-[color:var(--edvora-primary-deep)] ring-1 ring-[color:var(--edvora-primary)]/20"
                >
                  <span className="truncate">{opt.label}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${opt.label}`}
                    onClick={(e) => removeValue(opt.value, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        removeValue(opt.value, e);
                      }
                    }}
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md text-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary)]/20"
                  >
                    <X size={11} />
                  </span>
                </span>
              ))
            )}
          </div>
          <ChevronDown
            size={16}
            className={`mt-1.5 shrink-0 text-[color:var(--edvora-muted)] transition ${
              isOpen ? (opensUp ? "rotate-0" : "rotate-180") : ""
            }`}
          />
        </div>
      </button>
      {menu}
    </div>
  );
}

export default CustomMultiSelect;
