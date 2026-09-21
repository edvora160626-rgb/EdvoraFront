import { Suspense, useEffect, useMemo, useState } from "react";
import {
  NavigationType,
  Outlet,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import { LogOut, Menu, Moon, Palette, Sun, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import EdvoraLoader from "../../common/EdvoraLoader";
import EdvoraLogo from "../../common/EdvoraLogo";
import LogoutModal from "../../common/LogoutModal";
import ProfileModal from "../../common/ProfileModal";
import ThemeSettingsDrawer from "../../common/ThemeSettingsDrawer";
import { useTheme } from "../../theme/ThemeContext";
import { logoutUser } from "../../redux/slices/authSlice";
import { ExamSessionProvider } from "./context/ExamSessionContext";
import ExamSidebarNav from "./ExamSidebarNav";
import { ADMIN_NAV, CANDIDATE_NAV } from "./examNav";
import {
  EXAM_ROLES,
  getExamRole,
  getExamRoleLabel,
  getPortalHomePath,
  isExamPortalUser,
  PORTAL_MODES,
  setPortalMode,
} from "../../utils/portalMode";
import { openSnackbar } from "../../common/snackbar/snackbar";

function ExamLayoutInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const { isDark, toggleMode, openThemeDrawer } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const isLiveTest = location.pathname === "/exam/test-page";
  const role = getExamRole(user);
  const roleLabel = getExamRoleLabel(role);
  const isNestedNav = role === EXAM_ROLES.ADMIN;

  const navItems = useMemo(() => {
    if (role === EXAM_ROLES.ADMIN) return ADMIN_NAV;
    return CANDIDATE_NAV;
  }, [role]);

  useEffect(() => {
    if (!isLoggedIn) {
      setPortalMode(PORTAL_MODES.EXAMINATION);
      navigate("/", { replace: true });
      return;
    }
    if (!isExamPortalUser(user)) {
      openSnackbar({
        message:
          "School accounts cannot access the Examination portal. Use an examination account.",
        variant: "error",
      });
      setPortalMode(PORTAL_MODES.SCHOOL);
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    const home = getPortalHomePath(PORTAL_MODES.EXAMINATION, user);
    const path = location.pathname;
    const isWrongRolePath =
      (role === EXAM_ROLES.ADMIN && !path.startsWith("/exam/admin")) ||
      (role === EXAM_ROLES.CANDIDATE && path.startsWith("/exam/admin"));

    if (!isWrongRolePath) return;

    if (navigationType === NavigationType.Pop) {
      dispatch(logoutUser());
      setPortalMode(PORTAL_MODES.EXAMINATION);
      navigate("/", { replace: true });
      return;
    }

    navigate(home, { replace: true });
  }, [
    isLoggedIn,
    user,
    navigate,
    location.pathname,
    role,
    navigationType,
    dispatch,
  ]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogoutConfirm = async () => {
    await dispatch(logoutUser());
    setLogoutModalOpen(false);
    setPortalMode(PORTAL_MODES.EXAMINATION);
    navigate("/");
  };

  const sidebarContent = (
    <>
      <div className="p-5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <EdvoraLogo
              variant="icon"
              decorative
              className="h-11 w-11 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-lg font-bold text-white leading-tight truncate">
                Edvora
              </p>
              <p className="text-[11px] text-[color:var(--edvora-accent)]/90 truncate">
                {roleLabel} Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="hidden min-[1024px]:flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMode}
                className="w-9 h-9 rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/15 flex items-center justify-center"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                type="button"
                onClick={openThemeDrawer}
                className="w-9 h-9 rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/15 flex items-center justify-center"
                aria-label="Open appearance settings"
              >
                <Palette size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={closeSidebar}
              className="p-2 rounded-lg hover:bg-white/10 min-[1024px]:hidden shrink-0"
              aria-label="Close menu"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 py-2 overflow-y-auto">
        <ExamSidebarNav
          nested={isNestedNav}
          items={navItems}
          roleLabel={roleLabel}
          onNavigate={closeSidebar}
          onOpenProfile={() => {
            setProfileModalOpen(true);
            closeSidebar();
          }}
        />
      </div>

      <div className="mt-auto border-t border-white/10 p-4">
        <button
          type="button"
          onClick={() => setLogoutModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </>
  );

  if (!isLoggedIn || !isExamPortalUser(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-page">
        <EdvoraLoader message="Redirecting…" />
      </div>
    );
  }

  if (isLiveTest) {
    return (
      <div className="min-h-dvh theme-page overflow-x-hidden">
        <main className="min-h-dvh overflow-y-auto overscroll-contain rs-page">
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center">
                <EdvoraLoader message="Loading exam…" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
        <ThemeSettingsDrawer />
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-hidden theme-page flex flex-col min-[1024px]:flex-row max-w-full">
      <header className="sticky top-0 z-30 bg-[color:var(--edvora-card)]/90 backdrop-blur-md border-b border-[color:var(--edvora-border)] shadow-[var(--edvora-shadow-sm)] min-[1024px]:hidden">
        <div className="flex items-center justify-between h-12 sm:h-14 px-3 xs:px-4 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <EdvoraLogo
              variant="icon"
              decorative
              className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
            />
            <span className="rs-body font-bold text-[color:var(--edvora-ink)] truncate">
              {roleLabel} Portal
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleMode}
              className="w-9 h-9 rounded-xl text-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-soft)] flex items-center justify-center"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              onClick={openThemeDrawer}
              className="w-9 h-9 rounded-xl text-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-soft)] flex items-center justify-center"
              aria-label="Open appearance settings"
            >
              <Palette size={18} />
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rs-icon-btn text-[color:var(--edvora-primary)] hover:bg-[color:var(--edvora-primary-soft)]"
              aria-label="Open menu"
            >
              <Menu className="w-[1.15em] h-[1.15em] text-[clamp(18px,4vw,22px)]" />
            </button>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[color:var(--edvora-overlay)] backdrop-blur-[2px] min-[1024px]:hidden"
          onClick={closeSidebar}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`theme-sidebar fixed top-0 left-0 z-50 flex h-full w-[min(292px,88vw)] shrink-0 flex-col overflow-hidden rounded-tr-[28px] rounded-br-[28px] text-white transition-transform duration-300 ease-in-out min-[1024px]:relative min-[1024px]:z-auto min-[1024px]:translate-x-0 min-[1024px]:my-3 min-[1024px]:ml-3 min-[1024px]:h-[calc(100dvh-24px)] ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full min-[1024px]:translate-x-0"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-tr-[28px] rounded-br-[28px]">
          <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-[color:var(--edvora-accent)]/20" />
          <div className="absolute bottom-20 -left-10 h-32 w-32 rounded-full bg-white/10" />
        </div>
        <div className="relative flex h-full flex-col">{sidebarContent}</div>
      </aside>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain overflow-x-hidden rs-page min-w-0 min-[1024px]:pr-6 [@media(min-width:1750px)]:px-16">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center">
              <EdvoraLoader message="Loading…" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      <ThemeSettingsDrawer />

      <LogoutModal
        open={logoutModalOpen}
        title="Logout Confirmation"
        description="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutModalOpen(false)}
      />

      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
}

export default function ExamLayout() {
  return (
    <ExamSessionProvider>
      <ExamLayoutInner />
    </ExamSessionProvider>
  );
}
