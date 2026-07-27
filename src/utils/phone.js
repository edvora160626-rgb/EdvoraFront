export const DEFAULT_PHONE_CODE = "91";

export const COUNTRY_PHONE_OPTIONS = [
  { iso2: "IN", name: "India", dialCode: "91" },
  { iso2: "US", name: "United States", dialCode: "1" },
  { iso2: "CA", name: "Canada", dialCode: "1" },
  { iso2: "GB", name: "United Kingdom", dialCode: "44" },
  { iso2: "AU", name: "Australia", dialCode: "61" },
  { iso2: "AE", name: "United Arab Emirates", dialCode: "971" },
  { iso2: "SG", name: "Singapore", dialCode: "65" },
  { iso2: "MY", name: "Malaysia", dialCode: "60" },
  { iso2: "LK", name: "Sri Lanka", dialCode: "94" },
  { iso2: "BD", name: "Bangladesh", dialCode: "880" },
  { iso2: "NP", name: "Nepal", dialCode: "977" },
  { iso2: "PK", name: "Pakistan", dialCode: "92" },
  { iso2: "SA", name: "Saudi Arabia", dialCode: "966" },
  { iso2: "QA", name: "Qatar", dialCode: "974" },
  { iso2: "KW", name: "Kuwait", dialCode: "965" },
  { iso2: "OM", name: "Oman", dialCode: "968" },
  { iso2: "BH", name: "Bahrain", dialCode: "973" },
  { iso2: "DE", name: "Germany", dialCode: "49" },
  { iso2: "FR", name: "France", dialCode: "33" },
  { iso2: "IT", name: "Italy", dialCode: "39" },
  { iso2: "ES", name: "Spain", dialCode: "34" },
  { iso2: "NL", name: "Netherlands", dialCode: "31" },
  { iso2: "IE", name: "Ireland", dialCode: "353" },
  { iso2: "NZ", name: "New Zealand", dialCode: "64" },
  { iso2: "ZA", name: "South Africa", dialCode: "27" },
  { iso2: "NG", name: "Nigeria", dialCode: "234" },
  { iso2: "KE", name: "Kenya", dialCode: "254" },
  { iso2: "JP", name: "Japan", dialCode: "81" },
  { iso2: "CN", name: "China", dialCode: "86" },
  { iso2: "KR", name: "South Korea", dialCode: "82" },
  { iso2: "BR", name: "Brazil", dialCode: "55" },
  { iso2: "MX", name: "Mexico", dialCode: "52" },
];

export function normalizePhoneCode(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits || DEFAULT_PHONE_CODE;
}

export function normalizePhoneNumber(value) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 15);
}

/** Prefer India when dial code is 91; otherwise first dial-code match. */
export function findCountryOption(dialCode, iso2) {
  const code = normalizePhoneCode(dialCode);
  const iso = String(iso2 || "").trim().toUpperCase();

  if (iso) {
    const byIso = COUNTRY_PHONE_OPTIONS.find(
      (country) =>
        country.iso2 === iso && (!code || country.dialCode === code)
    );
    if (byIso) return byIso;

    const byIsoOnly = COUNTRY_PHONE_OPTIONS.find(
      (country) => country.iso2 === iso
    );
    if (byIsoOnly) return byIsoOnly;
  }

  if (code === "91") {
    return (
      COUNTRY_PHONE_OPTIONS.find((country) => country.iso2 === "IN") ||
      COUNTRY_PHONE_OPTIONS[0]
    );
  }

  return (
    COUNTRY_PHONE_OPTIONS.find((country) => country.dialCode === code) ||
    COUNTRY_PHONE_OPTIONS[0]
  );
}

/** Emoji fallback — UI should prefer react-country-flag SVG (Resilink pattern). */
export function countryFlag(iso2) {
  return String(iso2 || "")
    .toUpperCase()
    .replace(/[A-Z]/g, (character) =>
      String.fromCodePoint(character.charCodeAt(0) + 127397)
    );
}

export function formatPhoneDisplay(phone, phoneCode = DEFAULT_PHONE_CODE) {
  const number = String(phone ?? "").trim();
  if (!number) return "—";
  return `+${normalizePhoneCode(phoneCode)} ${number}`;
}
