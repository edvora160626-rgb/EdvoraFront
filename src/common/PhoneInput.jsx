import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import {
  COUNTRY_PHONE_OPTIONS,
  DEFAULT_PHONE_CODE,
  findCountryOption,
  normalizePhoneCode,
  normalizePhoneNumber,
} from "../utils/phone";

function PhoneInput({
  phone = "",
  phoneCode = DEFAULT_PHONE_CODE,
  phoneIso2,
  onPhoneChange,
  onPhoneCodeChange,
  onPhoneIso2Change,
  disabled = false,
  placeholder = "Phone number",
  height = 42,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuStyle, setMenuStyle] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const dialCode = normalizePhoneCode(phoneCode);
  const selectedCountry = useMemo(
    () => findCountryOption(dialCode, phoneIso2),
    [dialCode, phoneIso2]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_PHONE_OPTIONS;
    return COUNTRY_PHONE_OPTIONS.filter(
      (country) =>
        country.name.toLowerCase().includes(q) ||
        country.dialCode.includes(q) ||
        country.iso2.toLowerCase().includes(q)
    );
  }, [query]);

  const updateMenuPosition = () => {
    const el = triggerRef.current || rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 6;
    const menuWidth = Math.min(Math.max(rect.width, 300), 360);
    const menuMax = 280;
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const preferUp =
      spaceBelow < Math.min(menuMax, 180) && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      180,
      Math.min(menuMax, preferUp ? spaceAbove - gap : spaceBelow - gap)
    );

    let left = rect.left;
    if (left + menuWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - menuWidth - 12);
    }

    setMenuStyle({
      position: "fixed",
      left,
      width: menuWidth,
      zIndex: 10100,
      maxHeight,
      ...(preferUp
        ? { bottom: window.innerHeight - rect.top + gap, top: "auto" }
        : { top: rect.bottom + gap, bottom: "auto" }),
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
    requestAnimationFrame(() => searchRef.current?.focus());
    const onScrollOrResize = () => updateMenuPosition();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open, filtered.length]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return undefined;
    }

    const onPointerDown = (event) => {
      const inRoot = rootRef.current?.contains(event.target);
      const inMenu = menuRef.current?.contains(event.target);
      if (!inRoot && !inMenu) {
        setOpen(false);
        setQuery("");
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectCountry = (country) => {
    onPhoneCodeChange?.(normalizePhoneCode(country.dialCode));
    onPhoneIso2Change?.(country.iso2);
    setOpen(false);
    setQuery("");
  };

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          role="listbox"
          aria-label="Country phone codes"
          className="phone-code-menu flex flex-col overflow-hidden rounded-xl border border-[color:var(--edvora-border)] shadow-[var(--edvora-glass-shadow-lg)]"
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-[color:var(--edvora-border)] bg-[color:var(--edvora-elevated)] px-3 py-2.5">
            <Search
              size={14}
              className="shrink-0 text-[color:var(--edvora-primary)]"
            />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country or code"
              className="min-w-0 flex-1 bg-transparent text-sm text-[color:var(--edvora-ink-strong)] outline-none placeholder:text-[color:var(--edvora-muted)]"
            />
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto bg-[color:var(--edvora-card)] py-1">
            {filtered.length ? (
              filtered.map((country) => {
                const active =
                  country.iso2 === selectedCountry.iso2 &&
                  country.dialCode === selectedCountry.dialCode;

                return (
                  <li key={`${country.iso2}-${country.dialCode}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => selectCountry(country)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition ${
                        active
                          ? "border-l-4 border-[color:var(--edvora-primary)] bg-[color:var(--edvora-primary)]/15 text-[color:var(--edvora-ink-strong)]"
                          : "border-l-4 border-transparent text-[color:var(--edvora-ink)] hover:bg-[color:var(--edvora-primary-soft)]"
                      }`}
                    >
                      <ReactCountryFlag
                        countryCode={country.iso2}
                        svg
                        style={{
                          width: "1.35em",
                          height: "1.35em",
                          borderRadius: 2,
                        }}
                        title={country.name}
                      />
                      <span className="shrink-0 font-semibold text-[color:var(--edvora-ink-strong)]">
                        +{country.dialCode}
                      </span>
                      <span className="truncate text-xs text-[color:var(--edvora-muted)] sm:text-sm">
                        {country.name}
                      </span>
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-4 text-center text-sm text-[color:var(--edvora-muted)]">
                No countries found
              </li>
            )}
          </ul>
        </div>,
        document.body
      )
    : null;

  return (
    <div
      ref={rootRef}
      className={`relative flex w-full rounded-xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-card)] transition focus-within:border-[color:var(--edvora-primary)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--edvora-primary)_16%,transparent)] ${
        disabled ? "opacity-60" : ""
      }`}
      style={{ height }}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label="Country phone code"
        aria-expanded={open}
        aria-haspopup="listbox"
        title={`${selectedCountry.name} +${selectedCountry.dialCode}`}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev);
        }}
        className="flex w-[118px] shrink-0 items-center gap-1.5 rounded-l-xl border-0 border-r border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-primary-soft)] px-2.5 text-sm font-medium text-[color:var(--edvora-ink-strong)] outline-none disabled:cursor-not-allowed"
      >
        <ReactCountryFlag
          countryCode={selectedCountry.iso2}
          svg
          style={{ width: "1.25em", height: "1.25em", borderRadius: 2 }}
          title={selectedCountry.name}
          aria-label={selectedCountry.name}
        />
        <span className="truncate">+{selectedCountry.dialCode}</span>
        <ChevronDown
          size={14}
          className={`ml-auto shrink-0 text-[color:var(--edvora-primary)] transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={phone}
        onChange={(event) =>
          onPhoneChange?.(normalizePhoneNumber(event.target.value))
        }
        disabled={disabled}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-r-xl bg-transparent px-3 text-[14px] text-[color:var(--edvora-ink-strong)] outline-none placeholder:text-[color:var(--edvora-muted)]"
      />

      {menu}
    </div>
  );
}

export default PhoneInput;
