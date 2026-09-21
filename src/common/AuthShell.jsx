import { useEffect, useState } from "react";
import { Moon, Palette, Sun } from "lucide-react";
import EdvoraLogo from "./EdvoraLogo";
import ThemeSettingsDrawer from "./ThemeSettingsDrawer";
import { useTheme } from "../theme/ThemeContext";

/* ─── Clock hook ──────────────────────────────────────────────────── */
function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ─── Abstract dashboard SVG ─────────────────────────────────────── */
function DashboardVisual() {
  return (
    <svg
      viewBox="0 0 480 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="g-chartLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(245,214,155,0)" />
          <stop offset="35%" stopColor="#f5d69b" />
          <stop offset="100%" stopColor="#f5a070" />
        </linearGradient>
        <linearGradient id="g-chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(245,214,155,0.18)" />
          <stop offset="100%" stopColor="rgba(245,214,155,0)" />
        </linearGradient>
        <linearGradient id="g-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(245,214,155,0.9)" />
          <stop offset="100%" stopColor="rgba(245,160,112,0.45)" />
        </linearGradient>
        <linearGradient id="g-progress" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f5d69b" />
          <stop offset="100%" stopColor="#e8956d" />
        </linearGradient>
        <filter id="f-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id="clip-chart"><rect x="20" y="155" width="440" height="130" rx="0"/></clipPath>
      </defs>

      {/* ── Dot grid background ── */}
      {Array.from({ length: 6 }).map((_, r) =>
        Array.from({ length: 10 }).map((_, c) => (
          <circle key={`${r}-${c}`} cx={24 + c * 48} cy={15 + r * 50} r="1"
            fill="rgba(255,255,255,0.06)" />
        ))
      )}

      {/* ════ CARD 1 — Attendance ════ */}
      <rect x="8" y="8" width="224" height="132" rx="12"
        fill="rgba(255,255,255,0.09)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      {/* Label */}
      <text x="22" y="30" fontSize="7.5" fill="rgba(255,255,255,0.45)"
        fontFamily="system-ui,sans-serif" letterSpacing="1.4">ATTENDANCE TODAY</text>
      {/* Big number */}
      <text x="22" y="72" fontSize="36" fontWeight="700" fill="white"
        fontFamily="system-ui,sans-serif" opacity="0.95">94%</text>
      {/* Subtitle */}
      <text x="22" y="88" fontSize="8.5" fill="rgba(255,255,255,0.45)"
        fontFamily="system-ui,sans-serif">312 of 332 students present</text>
      {/* Trend badge */}
      <rect x="22" y="98" width="52" height="18" rx="9"
        fill="rgba(100,220,140,0.18)" stroke="rgba(100,220,140,0.35)" strokeWidth="0.8" />
      <text x="48" y="111" fontSize="8" fill="#7de8a0"
        fontFamily="system-ui,sans-serif" textAnchor="middle">↑ 2.4%</text>
      {/* Mini bar chart */}
      {[16,24,19,30,23,34,27].map((h, i) => (
        <rect key={i} x={156 + i * 10} y={128 - h} width="6" height={h}
          rx="2" fill="url(#g-bar)" opacity="0.75" />
      ))}

      {/* ════ CARD 2 — Staff ════ */}
      <rect x="248" y="8" width="224" height="132" rx="12"
        fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.11)" strokeWidth="1" />
      {/* Live badge — top-right */}
      <rect x="358" y="16" width="100" height="18" rx="9"
        fill="rgba(100,220,140,0.15)" stroke="rgba(100,220,140,0.28)" strokeWidth="0.8" />
      <circle cx="370" cy="25" r="3.5" fill="#7de8a0" opacity="0.85" />
      <text x="378" y="29" fontSize="7.5" fill="#7de8a0"
        fontFamily="system-ui,sans-serif" fontWeight="600">Live · Synced</text>
      {/* Label */}
      <text x="262" y="30" fontSize="7.5" fill="rgba(255,255,255,0.45)"
        fontFamily="system-ui,sans-serif" letterSpacing="1.4">STAFF ON CAMPUS</text>
      {/* Big number */}
      <text x="262" y="72" fontSize="36" fontWeight="700" fill="white"
        fontFamily="system-ui,sans-serif" opacity="0.95">48</text>
      {/* Subtitle */}
      <text x="262" y="88" fontSize="8.5" fill="rgba(255,255,255,0.45)"
        fontFamily="system-ui,sans-serif">Teachers · Admin · Support</text>
      {/* Avatar circles */}
      {["rgba(245,214,155,0.8)","rgba(200,160,180,0.8)","rgba(167,122,149,0.8)","rgba(245,160,112,0.8)","rgba(195,195,215,0.7)"].map((c, i) => (
        <circle key={i} cx={262 + i * 16} cy={112} r="8"
          fill={c} stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
      ))}
      <text x="350" y="116" fontSize="8" fill="rgba(255,255,255,0.4)"
        fontFamily="system-ui,sans-serif">+43 more</text>

      {/* ════ CARD 3 — Chart ════ */}
      <rect x="8" y="152" width="464" height="140" rx="12"
        fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
      {/* Label */}
      <text x="22" y="172" fontSize="7.5" fill="rgba(255,255,255,0.45)"
        fontFamily="system-ui,sans-serif" letterSpacing="1.4">WEEKLY ATTENDANCE TREND</text>
      {/* Grid lines */}
      {[0,1,2,3].map((i) => (
        <line key={i} x1="22" y1={188 + i * 26} x2="460" y2={188 + i * 26}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {/* X-axis labels */}
      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
        <text key={d} x={42 + i * 62} y={282} fontSize="7.5"
          fill="rgba(255,255,255,0.30)" fontFamily="system-ui,sans-serif" textAnchor="middle">{d}</text>
      ))}
      {/* Area + line — clipped to card interior */}
      <g clipPath="url(#clip-chart)">
        <path
          d="M42,248 C55,248 68,220 104,216 C140,212 153,232 180,226 C216,218 229,204 256,200 C282,196 295,216 318,210 C354,202 367,192 394,188 C420,184 433,202 460,198 L460,292 L42,292 Z"
          fill="url(#g-chartFill)" />
        <path
          d="M42,248 C55,248 68,220 104,216 C140,212 153,232 180,226 C216,218 229,204 256,200 C282,196 295,216 318,210 C354,202 367,192 394,188 C420,184 433,202 460,198"
          stroke="url(#g-chartLine)" strokeWidth="2" fill="none"
          strokeLinecap="round" strokeLinejoin="round" filter="url(#f-glow)" />
        {[[42,248],[104,216],[180,226],[256,200],[318,210],[394,188],[460,198]].map(([x,y],i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="4" fill="rgba(255,255,255,0.1)"
              stroke="rgba(245,214,155,0.65)" strokeWidth="1.3" />
            <circle cx={x} cy={y} r="1.8" fill="#f5d69b" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ─── Left panel ─────────────────────────────────────────────────── */
function LeftPanel() {
  const now   = useClock();
  const day   = DAYS[now.getDay()];
  const date  = now.getDate();
  const month = MONTHS[now.getMonth()];
  const year  = now.getFullYear();
  const hh    = String(now.getHours()).padStart(2, "0");
  const mm    = String(now.getMinutes()).padStart(2, "0");
  const ss    = String(now.getSeconds()).padStart(2, "0");

  return (
    <div
      className="relative h-full overflow-hidden select-none"
      style={{
        background: "linear-gradient(145deg,#3d1f33 0%,#5c3050 28%,#7a4d6d 58%,#9b6a8a 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 80% 10%, rgba(245,214,155,0.11) 0%, transparent 55%)" }} />
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 10% 90%, rgba(167,122,149,0.15) 0%, transparent 50%)" }} />

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between gap-4 flex-shrink-0"
        style={{ padding: "20px 28px 0" }}>
        {/* Brand mark only — no card frame */}
        <div className="min-w-0 shrink flex items-center">
          <EdvoraLogo
            variant="full"
            decorative
            className="w-[118px] max-w-[28vw] h-auto drop-shadow-[0_6px_16px_rgba(0,0,0,0.28)]"
          />
        </div>
        {/* Clock pill */}
        <div style={{
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: 999,
          padding: "5px 14px",
          fontFamily: "monospace",
          fontSize: 13,
          fontWeight: 600,
          color: "rgba(255,255,255,0.85)",
          letterSpacing: "0.05em",
          flexShrink: 0,
        }}>
          {hh}
          <span className="clock-colon" style={{ color: "rgba(245,214,155,0.9)" }}>:</span>
          {mm}
          <span className="clock-colon" style={{ color: "rgba(255,255,255,0.3)" }}>:</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>{ss}</span>
        </div>
      </div>

      {/* ── Dashboard visual — fills remaining space ── */}
      <div className="relative z-10 flex-1 min-h-0" style={{ padding: "16px 20px 8px" }}>
        <DashboardVisual />
      </div>

      {/* ── Bottom info bar ── */}
      <div className="relative z-10 flex-shrink-0" style={{ padding: "0 28px 22px" }}>
        <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.18)", marginBottom: 12 }} />
        {/* Date */}
        <div className="flex items-baseline gap-2" style={{ marginBottom: 12 }}>
          <span style={{ fontWeight: 900, color: "white", fontSize: "clamp(34px,4.5vw,52px)", lineHeight: 1 }}>{date}</span>
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, fontWeight: 300 }}>{day}, {month} {year}</span>
        </div>
        {/* Feature lines */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
          {[
            { c: "#f5d69b", t: "Attendance tracking — students & staff" },
            { c: "#c3a0b8", t: "Multi-role access — admin, teacher, parent" },
            { c: "#a0c4e8", t: "Reports & analytics in real time" },
          ].map((item) => (
            <div key={item.t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.c, flexShrink: 0 }} />
              <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.50)", fontWeight: 500, lineHeight: 1 }}>{item.t}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.24)", fontStyle: "italic" }}>
          "Empowering educators, connecting communities."
        </p>
      </div>
    </div>
  );
}

/* ─── Mobile clock banner ─────────────────────────────────────────── */
function MobileClock() {
  const now   = useClock();
  const hh    = String(now.getHours()).padStart(2, "0");
  const mm    = String(now.getMinutes()).padStart(2, "0");
  const ss    = String(now.getSeconds()).padStart(2, "0");
  const day   = DAYS[now.getDay()];
  const date  = now.getDate();
  const month = MONTHS[now.getMonth()];

  return (
    <div className="flex items-center justify-between w-full rounded-2xl mb-5 flex-shrink-0"
      style={{ background: "linear-gradient(135deg,#5c3050,#9b6a8a)", padding: "11px 16px" }}>
      <div className="flex items-center gap-2.5 min-w-0">
        <EdvoraLogo
          variant="icon"
          decorative
          className="h-8 w-8 flex-shrink-0"
        />
        <div className="min-w-0">
          <p style={{ color: "white", fontWeight: 700, fontSize: 13, lineHeight: 1 }}>Edvora</p>
          <p style={{ color: "rgba(255,255,255,0.52)", fontSize: 10, marginTop: 2 }}>{day}, {date} {month}</p>
        </div>
      </div>
      <p style={{ fontFamily: "monospace", fontWeight: 700, color: "white", fontSize: 17, letterSpacing: "0.05em" }}>
        {hh}
        <span className="clock-colon" style={{ color: "rgba(245,214,155,0.9)" }}>:</span>
        {mm}
        <span className="clock-colon" style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>:</span>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{ss}</span>
      </p>
    </div>
  );
}

/* ─── Shell — exactly 100dvh, zero page scroll ───────────────────── */
function AuthShell({ children, className = "" }) {
  const { isDark, toggleMode, openThemeDrawer } = useTheme();

  return (
    <div
      className={`${className} theme-page`}
      style={{
        width: "100%",
        height: "100dvh",
        display: "flex",
        overflow: "hidden",
      }}
    >
      <div className="hidden lg:block" style={{ flex: 1, minWidth: 0, height: "100%" }}>
        <LeftPanel />
      </div>

      <div
        className="flex flex-col items-center justify-center relative glass-strong"
        style={{
          width: "100%",
          maxWidth: 480,
          flexShrink: 0,
          height: "100%",
          overflowY: "auto",
          padding: "24px 40px",
          borderLeft: "1px solid var(--edvora-glass-border-soft)",
        }}
      >
        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={toggleMode}
            className="w-9 h-9 rounded-xl border border-[color:var(--edvora-border)] text-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-soft)] flex items-center justify-center"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            onClick={openThemeDrawer}
            className="w-9 h-9 rounded-xl border border-[color:var(--edvora-border)] text-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-soft)] flex items-center justify-center"
            aria-label="Open appearance settings"
          >
            <Palette size={16} />
          </button>
        </div>

        <div style={{ width: "100%", maxWidth: 400 }}>
          <div className="lg:hidden">
            <MobileClock />
          </div>
          {children}
        </div>
      </div>

      <ThemeSettingsDrawer />
    </div>
  );
}

export default AuthShell;
