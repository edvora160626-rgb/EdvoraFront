import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  applyThemeToDocument,
  COLOR_PRESETS,
  persistTheme,
  readStoredCustomPrimary,
  readStoredMode,
  readStoredPresetId,
  resolveAccentPalette,
} from "./presets";

const ThemeContext = createContext(null);
const ThemeDrawerContext = createContext(null);
const ThemeSettingsDrawer = lazy(() => import("../common/ThemeSettingsDrawer"));

function ThemeDrawerHost() {
  const { drawerOpen } = useThemeDrawer();
  if (!drawerOpen) return null;
  return (
    <Suspense fallback={null}>
      <ThemeSettingsDrawer />
    </Suspense>
  );
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(() => readStoredMode());
  const [presetId, setPresetIdState] = useState(() => readStoredPresetId());
  const [customPrimary, setCustomPrimaryState] = useState(() =>
    readStoredCustomPrimary()
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const palette = useMemo(
    () => resolveAccentPalette(presetId, customPrimary),
    [presetId, customPrimary]
  );

  useEffect(() => {
    applyThemeToDocument(mode, palette);
    persistTheme({ mode, presetId, customPrimary });
  }, [mode, palette, presetId, customPrimary]);

  const setMode = useCallback((next) => {
    setModeState(next === "dark" ? "dark" : "light");
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setPreset = useCallback((id) => {
    setPresetIdState(id);
    if (id !== "custom") setCustomPrimaryState("");
  }, []);

  const setCustomPrimary = useCallback((hex) => {
    const clean = String(hex || "").trim();
    if (!/^#[0-9A-Fa-f]{6}$/.test(clean)) return;
    setCustomPrimaryState(clean.toUpperCase());
    setPresetIdState("custom");
  }, []);

  const resetToBrand = useCallback(() => {
    setModeState("light");
    setPresetIdState("edvora");
    setCustomPrimaryState("");
  }, []);

  const openThemeDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeThemeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === "dark",
      presetId,
      customPrimary,
      palette,
      presets: COLOR_PRESETS,
      openThemeDrawer,
      closeThemeDrawer,
      setMode,
      toggleMode,
      setPreset,
      setCustomPrimary,
      resetToBrand,
    }),
    [
      mode,
      presetId,
      customPrimary,
      palette,
      openThemeDrawer,
      closeThemeDrawer,
      setMode,
      toggleMode,
      setPreset,
      setCustomPrimary,
      resetToBrand,
    ]
  );

  const drawerValue = useMemo(
    () => ({
      drawerOpen,
      closeThemeDrawer,
    }),
    [drawerOpen, closeThemeDrawer]
  );

  return (
    <ThemeContext.Provider value={value}>
      <ThemeDrawerContext.Provider value={drawerValue}>
        {children}
        <ThemeDrawerHost />
      </ThemeDrawerContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export function useThemeDrawer() {
  const ctx = useContext(ThemeDrawerContext);
  if (!ctx) {
    throw new Error("useThemeDrawer must be used within ThemeProvider");
  }
  return ctx;
}
