import { lazy, Suspense, useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import AuthShell from "../common/AuthShell";
import EdvoraLoader from "../common/EdvoraLoader";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { openSnackbar } from "../common/snackbar/snackbar";
import {
  clearAuthError,
  loginUser,
  resetAuthStatus,
} from "../redux/slices/authSlice";

const RegisterModal = lazy(() => import("../components/Register"));

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, isLoggedIn } = useSelector((s) => s.auth);

  const [showRegister,  setShowRegister]  = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);
  const [loginData,     setLoginData]     = useState({ emailid: "", password: "" });
  const [focusedField,  setFocusedField]  = useState(null);

  const loading = status === "loading";

  useEffect(() => {
    if (isLoggedIn && status === "succeeded") {
      navigate("/admin/dashboard");
      dispatch(resetAuthStatus());
    }
  }, [isLoggedIn, status, navigate, dispatch]);

  useEffect(() => {
    if (status === "failed" && error) {
      openSnackbar({ message: error, variant: "error" });
      dispatch(clearAuthError());
      dispatch(resetAuthStatus());
    }
  }, [status, error, dispatch]);

  const handleChange  = (e) => setLoginData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleLogin   = () => {
    if (!loginData.emailid || !loginData.password)
      return openSnackbar({ message: "Please enter email and password", variant: "warning" });
    dispatch(loginUser({ emailid: loginData.emailid, password: loginData.password }));
  };
  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  const fieldBox = (name) => ({
    background:  focusedField === name ? "#fff" : "#fdf8fb",
    border:      `1.5px solid ${focusedField === name ? "#a77a95" : "#e8d5e0"}`,
    boxShadow:   focusedField === name ? "0 0 0 3px rgba(167,122,149,0.10)" : "none",
    transition:  "all 0.18s",
    borderRadius: "12px",
    display: "flex", alignItems: "center", gap: "10px",
    height: "48px", padding: "0 14px",
  });

  return (
    <>
      <AuthShell className={showRegister || loading ? "blur-sm" : ""}>

        {/* ── Brand ── */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#a77a95,#5c3050)", boxShadow: "0 4px 12px rgba(115,83,102,0.35)" }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div>
            <p className="font-black text-[17px] text-[#3d1f33] leading-none tracking-tight">Edvora</p>
            <p className="text-[10px] text-[#a77a95]/60 font-semibold tracking-[0.18em] uppercase mt-0.5">School Management</p>
          </div>
        </div>

        {/* ── Heading ── */}
        <h1 className="text-[26px] font-black text-[#3d1f33] leading-tight">
          Welcome back
        </h1>
        <p className="text-[13px] text-[#735366]/55 mt-1 mb-6 leading-snug">
          Sign in to manage attendance, staff and classes — all in one place.
        </p>

        {/* ── Email ── */}
        <div className="mb-3">
          <label className="block text-[11px] font-bold text-[#735366]/70 mb-1.5 tracking-[0.12em] uppercase">
            Email address
          </label>
          <div style={fieldBox("emailid")}>
            <Mail size={15} style={{ color: "#a77a95", flexShrink: 0 }} />
            <input
              type="email" name="emailid"
              value={loginData.emailid}
              onChange={handleChange} onKeyDown={handleKeyDown}
              onFocus={() => setFocusedField("emailid")}
              onBlur={() => setFocusedField(null)}
              disabled={loading}
              placeholder="you@school.edu"
              autoComplete="email"
              style={{ flex: 1, background: "transparent", fontSize: "13px", color: "#3d1f33", outline: "none", opacity: loading ? 0.6 : 1 }}
            />
          </div>
        </div>

        {/* ── Password ── */}
        <div className="mb-2">
          <label className="block text-[11px] font-bold text-[#735366]/70 mb-1.5 tracking-[0.12em] uppercase">
            Password
          </label>
          <div style={fieldBox("password")}>
            <Lock size={15} style={{ color: "#a77a95", flexShrink: 0 }} />
            <input
              type={showPassword ? "text" : "password"} name="password"
              value={loginData.password}
              onChange={handleChange} onKeyDown={handleKeyDown}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              disabled={loading}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{ flex: 1, background: "transparent", fontSize: "13px", color: "#3d1f33", outline: "none", opacity: loading ? 0.6 : 1 }}
            />
            <button type="button" onClick={() => setShowPassword((p) => !p)}
              disabled={loading}
              style={{ color: "rgba(167,122,149,0.5)", flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: 0 }}
              aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
        </div>

        {/* ── Forgot ── */}
        <div className="flex justify-end mb-5">
          <button type="button" disabled={loading}
            onClick={() => navigate("/forgot-password", { state: loginData.emailid ? { email: loginData.emailid } : undefined })}
            className="text-[12px] font-semibold text-[#a77a95] hover:text-[#5c3050] transition-colors disabled:opacity-50">
            Forgot password?
          </button>
        </div>

        {/* ── Sign in ── */}
        <button type="button" onClick={handleLogin} disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 font-bold text-[14px] text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            height: "50px", borderRadius: "12px",
            background: loading ? "linear-gradient(135deg,#c3a0b8,#9b7a8a)" : "linear-gradient(135deg,#a77a95 0%,#5c3050 100%)",
            boxShadow: loading ? "none" : "0 6px 20px rgba(92,48,80,0.38), 0 2px 6px rgba(115,83,102,0.18)",
          }}>
          {loading
            ? <><Loader2 size={17} className="animate-spin" /> Signing in…</>
            : <>Sign In <ArrowRight size={16}/></>}
        </button>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#e8d5e0]"/>
          <span className="text-[11px] text-[#a77a95]/50 font-medium tracking-wide uppercase">New here?</span>
          <div className="flex-1 h-px bg-[#e8d5e0]"/>
        </div>

        {/* ── Register ── */}
        <button type="button" disabled={loading} onClick={() => setShowRegister(true)}
          className="w-full flex items-center justify-center font-semibold text-[13px] text-[#735366] transition-all hover:bg-[#f3eaf5] active:scale-[0.98] disabled:opacity-50"
          style={{ height: "46px", borderRadius: "12px", border: "1.5px solid #e0cce0", background: "transparent" }}>
          Create an account
        </button>

        {/* ── Footer ── */}
        <p className="text-center text-[11px] text-[#a77a95]/40 mt-5 leading-relaxed px-2">
          Authorised personnel only · Credentials must not be shared
        </p>

      </AuthShell>

      {loading && <EdvoraLoader overlay message="Signing you in…" />}

      {showRegister && (
        <Suspense fallback={null}>
          <RegisterModal onClose={() => setShowRegister(false)} />
        </Suspense>
      )}
    </>
  );
}

export default Login;
