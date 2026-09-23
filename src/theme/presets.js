/** Edvora brand default + curated accent presets (mauve stays default). */

export const EDVORA_MAUVE = {
  id: "edvora",
  label: "Edvora Mauve",
  primary: "#A77A95",
  primaryHover: "#8F6580",
  primaryDeep: "#735366",
  accent: "#F5D69B",
};

export const COLOR_PRESETS = [
  EDVORA_MAUVE,
  {
    id: "plum",
    label: "Deep Plum",
    primary: "#8B5A7A",
    primaryHover: "#734863",
    primaryDeep: "#5A3750",
    accent: "#E8C9A0",
  },
  {
    id: "rose",
    label: "Soft Rose",
    primary: "#C4879A",
    primaryHover: "#A86E82",
    primaryDeep: "#8A5768",
    accent: "#F2D4A8",
  },
  {
    id: "slate",
    label: "Dusty Slate",
    primary: "#7A6F8A",
    primaryHover: "#645A72",
    primaryDeep: "#4E455A",
    accent: "#D4C4A8",
  },
  {
    id: "teal",
    label: "Muted Teal",
    primary: "#6B8F8A",
    primaryHover: "#567570",
    primaryDeep: "#425B57",
    accent: "#E0CFA0",
  },
  {
    id: "navy",
    label: "Indigo Night",
    primary: "#6B6B9A",
    primaryHover: "#56567F",
    primaryDeep: "#424265",
    accent: "#E5D4A8",
  },
];

const STORAGE_MODE = "edvora_theme_mode";
const STORAGE_PRESET = "edvora_color_preset";
const STORAGE_CUSTOM = "edvora_custom_primary";

export function readStoredMode() {
  try {
    const v = localStorage.getItem(STORAGE_MODE);
    if (v === "dark" || v === "light") return v;
  } catch {
    /* ignore */
  }
  return "light";
}

export function readStoredPresetId() {
  try {
    return localStorage.getItem(STORAGE_PRESET) || "edvora";
  } catch {
    return "edvora";
  }
}

export function readStoredCustomPrimary() {
  try {
    return localStorage.getItem(STORAGE_CUSTOM) || "";
  } catch {
    return "";
  }
}

export function persistTheme({ mode, presetId, customPrimary }) {
  try {
    localStorage.setItem(STORAGE_MODE, mode);
    localStorage.setItem(STORAGE_PRESET, presetId);
    if (customPrimary) localStorage.setItem(STORAGE_CUSTOM, customPrimary);
    else localStorage.removeItem(STORAGE_CUSTOM);
  } catch {
    /* ignore */
  }
}

function hexToRgb(hex) {
  const h = String(hex || "").replace("#", "").trim();
  if (h.length !== 6) return { r: 167, g: 122, b: 149 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export function mixHex(hex, withHex, amount) {
  const a = hexToRgb(hex);
  const b = hexToRgb(withHex);
  const t = Math.max(0, Math.min(1, amount));
  return rgbToHex(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t
  );
}

export function darkenHex(hex, amount = 0.15) {
  return mixHex(hex, "#000000", amount);
}

export function lightenHex(hex, amount = 0.85) {
  return mixHex(hex, "#FFFFFF", amount);
}

export function buildPaletteFromPrimary(primary, accent = "#F5D69B") {
  const p = String(primary || EDVORA_MAUVE.primary).toUpperCase();
  return {
    primary: p,
    primaryHover: darkenHex(p, 0.12),
    primaryDeep: darkenHex(p, 0.28),
    accent: String(accent || EDVORA_MAUVE.accent).toUpperCase(),
  };
}

export function resolveAccentPalette(presetId, customPrimary) {
  if (presetId === "custom" && customPrimary) {
    return buildPaletteFromPrimary(customPrimary);
  }
  const preset =
    COLOR_PRESETS.find((item) => item.id === presetId) || EDVORA_MAUVE;
  return {
    primary: preset.primary,
    primaryHover: preset.primaryHover,
    primaryDeep: preset.primaryDeep,
    accent: preset.accent,
  };
}

/** Apply CSS variables for mode + accent to <html>. */
export function applyThemeToDocument(mode, palette) {
  const root = document.documentElement;
  const isDark = mode === "dark";

  root.dataset.theme = isDark ? "dark" : "light";
  root.style.colorScheme = isDark ? "dark" : "light";

  const soft = isDark
    ? mixHex(palette.primary, "#1A1218", 0.82)
    : lightenHex(palette.primary, 0.9);
  const softStrong = isDark
    ? mixHex(palette.primary, "#1A1218", 0.7)
    : lightenHex(palette.primary, 0.82);
  const border = isDark
    ? mixHex(palette.primary, "#2A1F26", 0.55)
    : mixHex(palette.primary, "#C3C3D5", 0.45);
  const surface = isDark ? mixHex(palette.primary, "#100C12", 0.9) : soft;
  const card = isDark ? mixHex(palette.primary, "#1A1218", 0.86) : "#FFFFFF";
  const elevated = isDark ? mixHex(palette.primary, "#221A20", 0.72) : softStrong;
  const ink = isDark ? lightenHex(palette.primary, 0.82) : palette.primaryDeep;
  const inkMuted = isDark
    ? mixHex(palette.primary, "#E8D5DF", 0.42)
    : mixHex(palette.primaryDeep, palette.primary, 0.35);
  const sidebarFrom = isDark
    ? darkenHex(palette.primaryDeep, 0.12)
    : palette.primaryDeep;
  const sidebarVia = palette.primaryHover;
  const sidebarTo = palette.primary;
  const rgb = hexToRgb(palette.primary);

  const vars = {
    "--edvora-primary": palette.primary,
    "--edvora-primary-hover": palette.primaryHover,
    "--edvora-primary-deep": palette.primaryDeep,
    "--edvora-primary-soft": soft,
    "--edvora-primary-muted": soft,
    "--edvora-primary-border": border,
    "--edvora-secondary": isDark ? "#6B5F72" : "#C3C3D5",
    "--edvora-secondary-soft": isDark ? "#3A3038" : "#E8E8F0",
    "--edvora-accent": palette.accent,
    "--edvora-accent-bright": palette.accent,
    "--edvora-accent-soft": soft,
    "--edvora-accent-hover": darkenHex(palette.accent, 0.15),
    "--edvora-surface": surface,
    "--edvora-surface-tint": soft,
    "--edvora-card": card,
    "--edvora-elevated": elevated,
    "--edvora-ink": ink,
    "--edvora-ink-strong": isDark ? "#FFF8FB" : darkenHex(palette.primaryDeep, 0.2),
    "--edvora-muted": inkMuted,
    "--edvora-border": border,
    "--edvora-overlay": isDark
      ? "rgba(10, 6, 10, 0.55)"
      : "rgba(115, 83, 102, 0.4)",
    "--edvora-sidebar-from": sidebarFrom,
    "--edvora-sidebar-via": sidebarVia,
    "--edvora-sidebar-to": sidebarTo,
    "--edvora-shadow": isDark
      ? "0 10px 40px rgba(0,0,0,0.45)"
      : "0 10px 40px rgba(115, 83, 102, 0.12)",
    "--edvora-shadow-sm": isDark
      ? "0 2px 12px rgba(0,0,0,0.35)"
      : "0 2px 12px rgba(115, 83, 102, 0.08)",
    "--edvora-glass": isDark
      ? "rgba(34, 26, 32, 0.55)"
      : "rgba(255, 255, 255, 0.52)",
    "--edvora-glass-strong": isDark
      ? "rgba(42, 33, 40, 0.72)"
      : "rgba(255, 255, 255, 0.72)",
    "--edvora-glass-soft": isDark
      ? "rgba(255, 255, 255, 0.06)"
      : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    "--edvora-glass-border": isDark
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(255, 255, 255, 0.55)",
    "--edvora-glass-border-soft": isDark
      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`
      : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`,
    "--edvora-glass-blur": isDark ? "12px" : "10px",
    "--edvora-glass-saturate": isDark ? "150%" : "165%",
    "--edvora-glass-shadow": isDark
      ? "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)"
      : "0 8px 32px rgba(115,83,102,0.1), inset 0 1px 0 rgba(255,255,255,0.55)",
    "--edvora-glass-shadow-lg": isDark
      ? "0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)"
      : "0 20px 60px rgba(115,83,102,0.16), inset 0 1px 0 rgba(255,255,255,0.45)",
    "--edvora-success": isDark ? "#34d399" : "#059669",
    "--edvora-success-soft": isDark
      ? "rgba(52, 211, 153, 0.16)"
      : "rgba(5, 150, 105, 0.12)",
    "--edvora-success-ink": isDark ? "#6ee7b7" : "#047857",
    "--edvora-danger": isDark ? "#f87171" : "#dc2626",
    "--edvora-danger-soft": isDark
      ? "rgba(248, 113, 113, 0.16)"
      : "rgba(220, 38, 38, 0.12)",
    "--edvora-danger-ink": isDark ? "#fca5a5" : "#b91c1c",
    "--edvora-warning": isDark ? "#fbbf24" : "#d97706",
    "--edvora-warning-soft": isDark
      ? "rgba(251, 191, 36, 0.16)"
      : "rgba(217, 119, 6, 0.12)",
    "--edvora-warning-ink": isDark ? "#fcd34d" : "#b45309",
    "--edvora-on-solid": isDark ? "#0f0a0d" : "#ffffff",
    "--edvora-switch-track": isDark
      ? `color-mix(in srgb, ${palette.primary} 28%, #221a20)`
      : `color-mix(in srgb, ${palette.primary} 14%, #ffffff)`,
    "--edvora-switch-track-off": isDark
      ? "color-mix(in srgb, #c9b2bf 22%, #221a20)"
      : "color-mix(in srgb, #8f6580 18%, #ffffff)",
    "--color-primary": palette.primary,
    "--color-primary-hover": palette.primaryHover,
    "--color-primary-deep": palette.primaryDeep,
    "--color-primary-soft": soft,
    "--color-primary-muted": soft,
    "--color-primary-border": border,
    "--color-secondary": isDark ? "#6B5F72" : "#C3C3D5",
    "--color-secondary-soft": isDark ? "#3A3038" : "#E8E8F0",
    "--color-accent": palette.accent,
    "--color-accent-bright": palette.accent,
    "--color-accent-soft": soft,
    "--color-accent-hover": darkenHex(palette.accent, 0.15),
    "--color-surface": surface,
    "--color-surface-tint": soft,
    "--color-card": card,
    "--color-textPrimary": ink,
    "--color-textSecondary": palette.primary,
    "--color-ink": ink,
    "--color-muted": inkMuted,
  };

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", palette.primary);
}
