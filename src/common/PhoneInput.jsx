import { useEffect, useMemo, useRef, useState } from "react";
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
  const rootRef = useRef(null);
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

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
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
    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [open]);

  const selectCountry = (country) => {
    onPhoneCodeChange?.(normalizePhoneCode(country.dialCode));
    onPhoneIso2Change?.(country.iso2);
    setOpen(false);
    setQuery("");
  };

  return (
    <div
      ref={rootRef}
      className={`relative flex w-full rounded-lg border border-[#D0D5DD] bg-white transition focus-within:border-[#A77A95] ${
        disabled ? "opacity-60" : ""
      }`}
      style={{ height }}
    >
      <button
        type="button"
        disabled={disabled}
        aria-label="Country phone code"
        aria-expanded={open}
        title={`${selectedCountry.name} +${selectedCountry.dialCode}`}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev);
        }}
        className="flex w-[118px] shrink-0 items-center gap-1.5 rounded-l-lg border-0 border-r border-[#D0D5DD] bg-[#FAEEE9]/50 px-2.5 text-sm font-medium text-[#735366] outline-none disabled:cursor-not-allowed"
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
          className={`ml-auto shrink-0 text-[#A77A95] transition ${open ? "rotate-180" : ""}`}
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
        className="min-w-0 flex-1 rounded-r-lg bg-transparent px-3 text-[14px] text-[#344054] outline-none"
      />

      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[min(100%,320px)] overflow-hidden rounded-xl border border-[#C3C3D5] bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Search size={14} className="text-[#A77A95] shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country or code"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#735366] outline-none placeholder:text-slate-400"
            />
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length ? (
              filtered.map((country) => {
                const active =
                  country.iso2 === selectedCountry.iso2 &&
                  country.dialCode === selectedCountry.dialCode;

                return (
                  <li key={`${country.iso2}-${country.dialCode}`}>
                    <button
                      type="button"
                      onClick={() => selectCountry(country)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition hover:bg-[#FAEEE9] ${
                        active
                          ? "bg-[#FAEEE9] text-[#735366] border-l-4 border-[#A77A95]"
                          : "text-slate-700 border-l-4 border-transparent"
                      }`}
                    >
                      <ReactCountryFlag
                        countryCode={country.iso2}
                        svg
                        style={{ width: "1.35em", height: "1.35em", borderRadius: 2 }}
                        title={country.name}
                      />
                      <span className="font-semibold text-[#735366] shrink-0">
                        +{country.dialCode}
                      </span>
                      <span className="truncate text-slate-500 text-xs sm:text-sm">
                        {country.name}
                      </span>
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-4 text-center text-sm text-slate-500">
                No countries found
              </li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default PhoneInput;
