import fullLogo from "../assets/edvora-logo.png";
import iconLogo from "../assets/edvora-logo-icon.png";

/**
 * Edvora brand mark (book + graduate + wordmark).
 * - full: complete logo on a transparent background
 * - icon: mark crop (sidebars, compact headers)
 */
function EdvoraLogo({
  variant = "full",
  className = "",
  alt = "Edvora — Premium Education for a Better Tomorrow",
  decorative = false,
}) {
  const isIcon = variant === "icon";
  const src = isIcon ? iconLogo : fullLogo;

  return (
    <img
      src={src}
      alt={decorative ? "" : alt}
      aria-hidden={decorative ? true : undefined}
      draggable={false}
      className={[
        "block select-none object-contain object-center bg-transparent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export default EdvoraLogo;
