import fullLogo from "../assets/edvora-logo.png";
import iconLogo from "../assets/edvora-logo-icon.png";

/**
 * Edvora brand mark (book + graduate + wordmark).
 * - full: complete logo artwork with designed background
 * - icon: square crop of the mark (sidebars, favicon)
 *
 * Background is part of the artwork — do not force transparency.
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
        "block select-none object-contain object-center",
        isIcon ? "aspect-square" : "aspect-[1024/682]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export default EdvoraLogo;
