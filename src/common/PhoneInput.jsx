import {
  COUNTRY_PHONE_OPTIONS,
  DEFAULT_PHONE_CODE,
  countryFlag,
  normalizePhoneCode,
  normalizePhoneNumber,
} from "../utils/phone";

function PhoneInput({
  phone = "",
  phoneCode = DEFAULT_PHONE_CODE,
  onPhoneChange,
  onPhoneCodeChange,
  disabled = false,
  placeholder = "Phone number",
  height = 42,
}) {
  const dialCode = normalizePhoneCode(phoneCode);
  const selectedCountry =
    COUNTRY_PHONE_OPTIONS.find((country) => country.dialCode === dialCode) ||
    COUNTRY_PHONE_OPTIONS[0];

  return (
    <div
      className={`flex w-full rounded-lg border border-[#D0D5DD] bg-white transition focus-within:border-[#A77A95] ${
        disabled ? "opacity-60" : ""
      }`}
      style={{ height }}
    >
      <select
        value={`${selectedCountry.iso2}-${selectedCountry.dialCode}`}
        onChange={(event) => {
          const selected = COUNTRY_PHONE_OPTIONS.find(
            (country) =>
              `${country.iso2}-${country.dialCode}` === event.target.value
          );
          onPhoneCodeChange?.(
            normalizePhoneCode(selected?.dialCode || DEFAULT_PHONE_CODE)
          );
        }}
        disabled={disabled}
        aria-label="Country phone code"
        title={`${selectedCountry.name} +${selectedCountry.dialCode}`}
        className="w-[124px] shrink-0 cursor-pointer rounded-l-lg border-0 border-r border-[#D0D5DD] bg-[#FAEEE9]/50 px-2 text-sm font-medium text-[#735366] outline-none disabled:cursor-not-allowed"
      >
        {COUNTRY_PHONE_OPTIONS.map((country) => (
          <option
            key={`${country.iso2}-${country.dialCode}`}
            value={`${country.iso2}-${country.dialCode}`}
          >
            {countryFlag(country.iso2)} +{country.dialCode} {country.name}
          </option>
        ))}
      </select>
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
    </div>
  );
}

export default PhoneInput;
