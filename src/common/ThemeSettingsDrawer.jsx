import { Check, Moon, Palette, RotateCcw, Sun, X } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";

function ThemeSettingsDrawer() {
  const {
    drawerOpen,
    closeThemeDrawer,
    mode,
    setMode,
    presetId,
    presets,
    setPreset,
    customPrimary,
    setCustomPrimary,
    palette,
    resetToBrand,
  } = useTheme();

  return (
    <>
      <button
        type="button"
        aria-hidden={!drawerOpen}
        tabIndex={drawerOpen ? 0 : -1}
        onClick={closeThemeDrawer}
        className={`fixed inset-0 z-[70] bg-[color:var(--edvora-overlay)] backdrop-blur-[2px] transition-opacity duration-300 ${
          drawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 right-0 z-[80] flex h-full w-[min(360px,92vw)] flex-col glass-strong text-[color:var(--edvora-ink)] transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!drawerOpen}
        aria-label="Appearance settings"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[color:var(--edvora-border)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--edvora-primary-soft)] text-[color:var(--edvora-primary)]">
              <Palette size={18} />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-[15px] leading-tight truncate">
                Appearance
              </p>
              <p className="text-[11px] text-[color:var(--edvora-muted)] mt-0.5">
                Theme & brand colours
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeThemeDrawer}
            className="w-9 h-9 rounded-full bg-[color:var(--edvora-primary)] text-white flex items-center justify-center hover:opacity-90"
            aria-label="Close appearance settings"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-7">
          <section>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--edvora-muted)] mb-3">
              Display mode
            </p>
            <div className="theme-segment w-full [&>button]:flex-1">
              <button
                type="button"
                onClick={() => setMode("light")}
                className={`theme-segment-btn h-11 ${
                  mode === "light" ? "is-active" : ""
                }`}
              >
                <Sun size={16} />
                Light
              </button>
              <button
                type="button"
                onClick={() => setMode("dark")}
                className={`theme-segment-btn h-11 ${
                  mode === "dark" ? "is-active" : ""
                }`}
              >
                <Moon size={16} />
                Dark
              </button>
            </div>
          </section>

          <section>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--edvora-muted)] mb-3">
              Colour palette
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {presets.map((preset) => {
                const active = presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setPreset(preset.id)}
                    className={`relative text-left rounded-xl border p-3 transition ${
                      active
                        ? "border-[color:var(--edvora-primary)] ring-2 ring-[color:var(--edvora-primary)]/25 bg-[color:var(--edvora-primary-soft)]"
                        : "border-[color:var(--edvora-border)] hover:border-[color:var(--edvora-primary)]/50 bg-[color:var(--edvora-elevated)]"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 mb-2">
                      <span
                        className="h-4 w-4 rounded-full ring-1 ring-black/10"
                        style={{ background: preset.primaryDeep }}
                      />
                      <span
                        className="h-4 w-4 rounded-full ring-1 ring-black/10"
                        style={{ background: preset.primary }}
                      />
                      <span
                        className="h-4 w-4 rounded-full ring-1 ring-black/10"
                        style={{ background: preset.accent }}
                      />
                    </span>
                    <span className="block text-[12px] font-semibold truncate">
                      {preset.label}
                    </span>
                    {active ? (
                      <span className="absolute top-2 right-2 text-[color:var(--edvora-primary)]">
                        <Check size={14} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--edvora-muted)] mb-3">
              Custom accent
            </p>
            <div className="rounded-xl border border-[color:var(--edvora-border)] bg-[color:var(--edvora-elevated)] p-3.5">
              <div className="flex items-center gap-3">
                <label className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[color:var(--edvora-border)] cursor-pointer shadow-sm">
                  <input
                    type="color"
                    value={
                      presetId === "custom" && customPrimary
                        ? customPrimary
                        : palette.primary
                    }
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="absolute inset-0 h-[150%] w-[150%] -translate-x-[15%] -translate-y-[15%] cursor-pointer border-0 p-0"
                    aria-label="Pick custom primary colour"
                  />
                </label>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">
                    {presetId === "custom" ? "Custom colour" : "Pick your own"}
                  </p>
                  <p className="text-[11px] text-[color:var(--edvora-muted)] mt-0.5 font-mono">
                    {(presetId === "custom" && customPrimary) ||
                      palette.primary}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-[color:var(--edvora-muted)] mt-3 leading-relaxed">
                Surfaces, sidebar, switches, and buttons update for light and
                dark from your chosen palette.
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-[color:var(--edvora-border)] overflow-hidden">
            <div
              className="h-16"
              style={{
                background: `linear-gradient(135deg, ${palette.primaryDeep}, ${palette.primaryHover}, ${palette.primary})`,
              }}
            />
            <div className="p-3.5 bg-[color:var(--edvora-card)]">
              <p className="text-sm font-semibold">Live preview</p>
              <p className="text-[11px] text-[color:var(--edvora-muted)] mt-1">
                Sidebar · buttons · highlights follow this palette
              </p>
              <div className="mt-3 flex gap-2">
                <span
                  className="h-8 flex-1 rounded-lg"
                  style={{ background: palette.primary }}
                />
                <span
                  className="h-8 w-10 rounded-lg"
                  style={{ background: palette.accent }}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="px-5 py-4 border-t border-[color:var(--edvora-border)]">
          <button
            type="button"
            onClick={resetToBrand}
            className="w-full h-11 rounded-xl border border-[color:var(--edvora-border)] text-sm font-semibold inline-flex items-center justify-center gap-2 text-[color:var(--edvora-ink)] hover:bg-[color:var(--edvora-elevated)] transition"
          >
            <RotateCcw size={15} />
            Reset to Edvora Mauve
          </button>
        </div>
      </aside>
    </>
  );
}

export default ThemeSettingsDrawer;
