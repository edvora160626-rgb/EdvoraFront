import fullLogo from "../assets/edvora-logo.png";
import iconLogo from "../assets/edvora-logo-icon.png";

/**
 * Edvora brand mark.
 * - full: icon + wordmark + tagline (transparent PNG — works on light & dark UI)
 * - icon: graduation/book mark only
 */
function EdvoraLogo({
  variant = "full",
  className = "",
  alt = "Edvora — Premium Education for a Better Tomorrow",
  decorative = false,
}) {
  const src = variant === "icon" ? iconLogo : fullLogo;

  return (
    <img
      src={src}
      alt={decorative ? "" : alt}
      aria-hidden={decorative ? true : undefined}
      draggable={false}
      className={`block object-contain bg-transparent ${className}`}
    />
  );
}

export default EdvoraLogo;
