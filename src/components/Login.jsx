import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import AuthShell from "../common/AuthShell";
import EdvoraLoader from "../common/EdvoraLoader";
import EdvoraLogo from "../common/EdvoraLogo";
import {
  NavigationType,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { openSnackbar } from "../common/snackbar/snackbar";
import {
  clearAuthError,
  loginUser,
  logoutUser,
  resetAuthStatus,
} from "../redux/slices/authSlice";
import {
  getPortalHomePath,
  getPortalMode,
  PORTAL_MODES,
  setPortalMode,
} from "../utils/portalMode";

const RegisterModal = lazy(() => import("../components/Register"));
const ExamRegisterModal = lazy(() => import("../components/ExamRegister"));

function PortalModeSwitch({ mode, onChange, disabled }) {
  const options = [
    { id: PORTAL_MODES.SCHOOL, label: "School" },
    { id: PORTAL_MODES.EXAMINATION, label: "Examination" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Portal mode"
      className="mb-3.5 grid grid-cols-2 gap-0.5 rounded-lg border border-[#ead9e3] bg-[#faf4f8] p-0.5"
    >
      {options.map((opt) => {
        const active = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(opt.id)}
            className={`relative rounded-md min-h-[1.85rem] px-2 text-[11px] font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 ${
              active
                ? "bg-white text-[#5c3050] shadow-sm"
                : "text-[#a77a95]/75 hover:text-[#735366]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const { status, error, isLoggedIn } = useSelector((s) => s.auth);
  const justLoggedInRef = useRef(false);

  const [portalMode, setMode] = useState(() => getPortalMode());
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ emailid: "", password: "" });
  const [focusedField, setFocusedField] = useState(null);

  const loading = status === "loading";
  const isExam = portalMode === PORTAL_MODES.EXAMINATION;

  useEffect(() => {
    if (status === "failed") {
      justLoggedInRef.current = false;
    }
  }, [status]);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Fresh login submit → enter portal (login stays in history for Back)
    if (status === "succeeded" && justLoggedInRef.current) {
      justLoggedInRef.current = false;
      const user = JSON.parse(localStorage.getItem("user") || "null");
      navigate(getPortalHomePath(portalMode, user));
      dispatch(resetAuthStatus());
      return;
    }

    // Existing session opened on "/" → go home (covers refresh / bookmark)
    if (status === "succeeded") {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      navigate(getPortalHomePath(portalMode, user), { replace: true });
      dispatch(resetAuthStatus());
      return;
    }

    // Browser Back landed on login while still signed in → clear session
    if (status !== "loading" && navigationType === NavigationType.Pop) {
      dispatch(logoutUser());
      dispatch(resetAuthStatus());
    }
  }, [isLoggedIn, status, navigate, dispatch, portalMode, navigationType]);

  useEffect(() => {
    if (status === "failed" && error) {
      openSnackbar({ message: error, variant: "error" });
      dispatch(clearAuthError());
      dispatch(resetAuthStatus());
    }
  }, [status, error, dispatch]);

  const handleModeChange = (next) => {
    const saved = setPortalMode(next);
    setMode(saved);
    setShowRegister(false);
  };

  const handleChange = (e) =>
    setLoginData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleLogin = () => {
    if (!loginData.emailid || !loginData.password)
      return openSnackbar({
        message: "Please enter email and password",
        variant: "warning",
      });
    setPortalMode(portalMode);
    justLoggedInRef.current = true;
    dispatch(
      loginUser({
        emailid: loginData.emailid,
        password: loginData.password,
        portalMode,
      })
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  const fieldBox = (name) => ({
    background: focusedField === name ? "#fff" : "#fdf8fb",
    border: `1.5px solid ${focusedField === name ? "#a77a95" : "#e8d5e0"}`,
    boxShadow:
      focusedField === name ? "0 0 0 3px rgba(167,122,149,0.10)" : "none",
    transition: "all 0.18s",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minHeight: "var(--rs-input-h)",
    height: "var(--rs-input-h)",
    padding: "0 14px",
  });

  return (
    <>
      <AuthShell className={showRegister || loading ? "blur-sm" : ""}>
        <div className="mb-3 flex flex-col items-start gap-1.5">
          <EdvoraLogo
            variant="full"
            className="h-[2.35rem] w-auto max-w-[118px]"
          />
          <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#a77a95]/75">
            {isExam ? "Examination Portal" : "School Management"}
          </span>
        </div>

        <PortalModeSwitch
          mode={portalMode}
          onChange={handleModeChange}
          disabled={loading}
        />

        <h1 className="text-[1.2rem] font-bold tracking-tight text-[#3d1f33] leading-tight">
          Welcome back
        </h1>
        <p className="text-[12px] text-[#735366]/60 mt-1 mb-3.5 leading-snug max-w-[28ch]">
          {isExam
            ? "Sign in to practice tests, take exams and view results."
            : "Sign in to manage attendance, staff and classes — all in one place."}
        </p>

        <div className="mb-2.5">
          <label className="block text-[10px] font-bold text-[#735366]/65 mb-1 tracking-[0.14em] uppercase">
            Email address
          </label>
          <div style={fieldBox("emailid")}>
            <Mail size={15} style={{ color: "#a77a95", flexShrink: 0, width: "clamp(13px,3vw,15px)", height: "clamp(13px,3vw,15px)" }} />
            <input
              type="email"
              name="emailid"
              value={loginData.emailid}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocusedField("emailid")}
              onBlur={() => setFocusedField(null)}
              disabled={loading}
              placeholder={isExam ? "you@student.edu" : "you@school.edu"}
              autoComplete="email"
              className="rs-body"
              style={{
                flex: 1,
                background: "transparent",
                color: "#3d1f33",
                outline: "none",
                opacity: loading ? 0.6 : 1,
                border: "none",
              }}
            />
          </div>
        </div>

        <div className="mb-1.5">
          <label className="block text-[10px] font-bold text-[#735366]/65 mb-1 tracking-[0.14em] uppercase">
            Password
          </label>
          <div style={fieldBox("password")}>
            <Lock size={15} style={{ color: "#a77a95", flexShrink: 0, width: "clamp(13px,3vw,15px)", height: "clamp(13px,3vw,15px)" }} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={loginData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              disabled={loading}
              placeholder="••••••••"
              autoComplete="current-password"
              className="rs-body"
              style={{
                flex: 1,
                background: "transparent",
                color: "#3d1f33",
                outline: "none",
                opacity: loading ? 0.6 : 1,
                border: "none",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              disabled={loading}
              style={{
                color: "rgba(167,122,149,0.5)",
                flexShrink: 0,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end mb-3.5">
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              navigate("/forgot-password", {
                state: loginData.emailid
                  ? { email: loginData.emailid }
                  : undefined,
              })
            }
            className="text-[11px] font-semibold text-[#a77a95] hover:text-[#5c3050] transition-colors disabled:opacity-50"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="rs-btn rs-btn-primary w-full"
          style={{
            background: loading
              ? "linear-gradient(135deg,#c3a0b8,#9b7a8a)"
              : "linear-gradient(135deg,#a77a95 0%,#5c3050 100%)",
            boxShadow: loading
              ? "none"
              : "0 6px 20px rgba(92,48,80,0.38), 0 2px 6px rgba(115,83,102,0.18)",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign In <ArrowRight size={16} />
            </>
          )}
        </button>

        {!isExam ? (
          <>
            <div className="flex items-center gap-2.5 my-3.5">
              <div className="flex-1 h-px bg-[#e8d5e0]" />
              <span className="text-[9px] text-[#a77a95]/55 font-semibold tracking-[0.14em] uppercase">
                New here?
              </span>
              <div className="flex-1 h-px bg-[#e8d5e0]" />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => setShowRegister(true)}
              className="rs-btn rs-btn-ghost w-full"
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5 my-3.5">
              <div className="flex-1 h-px bg-[#e8d5e0]" />
              <span className="text-[9px] text-[#a77a95]/55 font-semibold tracking-[0.14em] uppercase">
                New candidate?
              </span>
              <div className="flex-1 h-px bg-[#e8d5e0]" />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => setShowRegister(true)}
              className="rs-btn rs-btn-ghost w-full"
            >
              Create examination account
            </button>
          </>
        )}

        <p className="text-center text-[10px] text-[#a77a95]/45 mt-3.5 leading-relaxed px-1">
          {isExam
            ? "Examination accounts are separate from school login · Credentials must not be shared"
            : "Authorised personnel only · Credentials must not be shared"}
        </p>
      </AuthShell>

      {loading && <EdvoraLoader overlay message="Signing you in…" />}

      {showRegister && (
        <Suspense fallback={null}>
          {isExam ? (
            <ExamRegisterModal onClose={() => setShowRegister(false)} />
          ) : (
            <RegisterModal onClose={() => setShowRegister(false)} />
          )}
        </Suspense>
      )}
    </>
  );
}

export default Login;
