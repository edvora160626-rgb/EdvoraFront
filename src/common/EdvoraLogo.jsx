import fullLogo from "../assets/edvora-logo.png";
import iconLogo from "../assets/edvora-logo-icon.png";

/**
 * Edvora brand mark.
 * - full: emblem + Edvora wordmark + tagline
 * - icon: emblem only (headers / sidebars)
 */
function EdvoraLogo({
  variant = "full",
  className = "",
  alt = "Edvora — Premium Education for a Better Tomorrow",
  decorative = false,
}) {
  const isIcon = variant === "icon";
  const src = isIcon ? iconLogo : fullLogo;

  const img = (
    <img
      src={src}
      alt={decorative ? "" : alt}
      aria-hidden={decorative ? true : undefined}
      draggable={false}
      decoding="async"
      fetchPriority={isIcon ? "low" : "high"}
      width={isIcon ? 64 : 220}
      height={isIcon ? 64 : 72}
      className={
        isIcon
          ? "edvora-logo block select-none object-contain object-center"
          : ["edvora-logo block select-none object-contain object-center bg-transparent", className]
              .filter(Boolean)
              .join(" ")
      }
      style={
        isIcon
          ? { height: "100%", width: "auto", maxWidth: "none", maxHeight: "100%" }
          : undefined
      }
    />
  );

  if (isIcon) {
    return (
      <span
        className={["inline-flex shrink-0 items-center leading-none", className]
          .filter(Boolean)
          .join(" ")}
      >
        {img}
      </span>
    );
  }

  return img;
}

export default EdvoraLogo;
