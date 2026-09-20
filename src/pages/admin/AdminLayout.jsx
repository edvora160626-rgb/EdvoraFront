import { Suspense, useEffect, useState } from "react";
import {
  NavLink,
  NavigationType,
  Outlet,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import {
  BookOpen,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Moon,
  Palette,
  PanelLeftClose,
  Sun,
  UserRound,
  UserRoundCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getUserRole } from "../../utils/auth";
import { getRoleConfig } from "../../utils/rolePermissions";
import EdvoraLoader from "../../common/EdvoraLoader";
import EdvoraLogo from "../../common/EdvoraLogo";
import LogoutModal from "../../common/LogoutModal";
import ProfileModal from "../../common/ProfileModal";
import ThemeSettingsDrawer from "../../common/ThemeSettingsDrawer";
import { useTheme } from "../../theme/ThemeContext";
import { logoutUser } from "../../redux/slices/authSlice";
import {
  getPortalHomePath,
  isExamPortalUser,
  PORTAL_MODES,
  setPortalMode,
} from "../../utils/portalMode";
import { openSnackbar } from "../../common/snackbar/snackbar";

const ROLE_DISPLAY = {
  SUPER_ADMIN: "Principal",
  SCHOOL_ADMIN: "School Admin",
  TEACHER: "Teacher",
  STUDENT: "Student",
  PARENT: "Parent",
};

const NAV_ITEMS = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/requests",
    label: "User Requests",
    icon: ClipboardList,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"],
  },
  {
    to: "/admin/departments",
    label: "Departments",
    icon: Building2,
    roles: ["SCHOOL_ADMIN"],
  },
  {
    to: "/admin/classes",
    label: "Classes",
    icon: BookOpen,
    roles: ["SCHOOL_ADMIN"],
  },
  {
    to: "/admin/subjects",
    label: "Subjects",
    icon: Library,
    roles: ["SCHOOL_ADMIN"],
  },
  {
    to: "/admin/timetable",
    label: "Timetable",
    icon: CalendarClock,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN"],
  },
  {
    to: "/admin/timetable/my",
    label: "My Timetable",
    icon: CalendarClock,
    roles: ["TEACHER", "STUDENT", "PARENT"],
  },
  {
    to: "/admin/teacher-attendance",
    label: "Teacher Attendance",
    icon: ClipboardCheck,
    roles: ["SCHOOL_ADMIN"],
  },
  {
    to: "/admin/student-attendance",
    label: "Student Attendance",
    icon: UserRoundCheck,
    roles: ["TEACHER"],
  },
  {
    to: "/admin/upcoming-events",
    label: "Upcoming Events",
    icon: CalendarDays,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
];

const SIDEBAR_WIDTH = 288;

function getInitials(firstName = "", lastName = "") {
  const first = String(firstName || "").trim()[0] || "";
  const last = String(lastName || "").trim()[0] || "";
  return (first + last).toUpperCase() || "U";
}

function SideNav({ onNavigate, onOpenProfile, compact = false }) {
  const role = getUserRole();
  const user = useSelector((state) => state.auth.user);
  const items = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  );
  const displayRole = ROLE_DISPLAY[role] || role;

  return (
    <nav className={`space-y-1 ${compact ? "px-2" : "px-3"}`}>
      <button
        type="button"
        onClick={onOpenProfile}
        className={`mb-3 flex w-full items-center rounded-2xl border border-white/15 bg-white/10 text-left transition hover:bg-white/15 ${
          compact ? "justify-center p-2.5" : "gap-3 px-3.5 py-3.5"
        }`}
        title="Profile"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[color:var(--edvora-accent)] to-[color:var(--edvora-primary)] text-sm font-bold text-white shadow-md">
          {user ? (
            getInitials(user.firstName, user.lastName)
          ) : (
            <UserRound size={18} />
          )}
        </span>
        {!compact ? (
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-white truncate">
              {user
                ? [user.firstName, user.lastName].filter(Boolean).join(" ")
                : "Profile"}
            </span>
            <span className="block text-xs text-white/65 truncate">
              {displayRole || "View profile"}
            </span>
          </span>
        ) : null}
      </button>

      {!compact ? (
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
          Navigation
        </p>
      ) : null}

      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to.endsWith("/dashboard")}
          replace
          onClick={onNavigate}
          title={label}
          className={({ isActive }) =>
            `group flex items-center rounded-2xl text-sm font-medium transition-all duration-200 ${
              compact ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
            } ${
              isActive
                ? "bg-white text-[color:var(--edvora-primary-deep)] shadow-lg shadow-black/10"
                : "text-white/85 hover:bg-white/10 hover:text-white"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isActive
                    ? "bg-[color:var(--edvora-primary)]/15 text-[color:var(--edvora-primary)]"
                    : "bg-white/10 text-white group-hover:bg-white/15"
                }`}
              >
                <Icon size={18} />
              </span>
              {!compact ? <span className="truncate">{label}</span> : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function AdminLayout() {
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const dispatch = useDispatch();
  const { isDark, toggleMode, openThemeDrawer } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  });
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  });
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { portalTitle } = getRoleConfig();
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const role = getUserRole();
  const displayRole = ROLE_DISPLAY[role] || role;

  useEffect(() => {
    if (!isLoggedIn) {
      setPortalMode(PORTAL_MODES.SCHOOL);
      navigate("/", { replace: true });
      return;
    }
    if (isExamPortalUser(user)) {
      if (navigationType === NavigationType.Pop) {
        dispatch(logoutUser());
        setPortalMode(PORTAL_MODES.EXAMINATION);
        navigate("/", { replace: true });
        return;
      }
      openSnackbar({
        message:
          "Examination accounts cannot access the School portal. Switch to Examination.",
        variant: "error",
      });
      setPortalMode(PORTAL_MODES.EXAMINATION);
      navigate(getPortalHomePath(PORTAL_MODES.EXAMINATION, user), {
        replace: true,
      });
    }
  }, [isLoggedIn, user, navigate, navigationType, dispatch]);

  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && sidebarOpen && !isDesktop) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, isDesktop]);

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebarOnMobile = () => {
    if (!isDesktop) setSidebarOpen(false);
  };

  if (!isLoggedIn || isExamPortalUser(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-page">
        <EdvoraLoader message="Redirecting…" />
      </div>
    );
  }

  const handleLogoutConfirm = async () => {
    await dispatch(logoutUser());
    setLogoutModalOpen(false);
    navigate("/");
  };

  const handleOpenProfile = () => {
    setProfileModalOpen(true);
    closeSidebarOnMobile();
  };

  return (
    <div className="h-screen overflow-hidden theme-page flex flex-col">
      <header className="shrink-0 z-30 border-b border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass-strong)]/90 backdrop-blur-xl saturate-[165%] shadow-[var(--edvora-glass-shadow)]">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-5">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] text-[color:var(--edvora-primary)] shadow-sm transition hover:border-[color:var(--edvora-primary)]/35 hover:bg-[color:var(--edvora-primary)]/8"
              aria-label={sidebarOpen ? "Collapse navigation" : "Expand navigation"}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <PanelLeftClose size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <EdvoraLogo
                variant="icon"
                decorative
                className="h-10 w-10 shrink-0 rounded-xl ring-1 ring-[color:var(--edvora-glass-border-soft)]"
              />
              <div className="min-w-0 hidden sm:block">
                <p className="text-sm font-bold tracking-tight text-[color:var(--edvora-ink-strong)] truncate">
                  Edvora
                </p>
                <p className="text-[11px] font-medium text-[color:var(--edvora-muted)] truncate">
                  {portalTitle}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleMode}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[color:var(--edvora-primary)] transition hover:bg-[color:var(--edvora-primary)]/10"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              onClick={openThemeDrawer}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[color:var(--edvora-primary)] transition hover:bg-[color:var(--edvora-primary)]/10"
              aria-label="Open appearance settings"
              title="Appearance"
            >
              <Palette size={18} />
            </button>
            <button
              type="button"
              onClick={handleOpenProfile}
              className="ml-0.5 flex items-center gap-2 rounded-2xl border border-[color:var(--edvora-glass-border-soft)] bg-[color:var(--edvora-glass)] py-1.5 pl-1.5 pr-2.5 sm:pr-3 transition hover:border-[color:var(--edvora-primary)]/30"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color:var(--edvora-primary)] text-[11px] font-bold text-white">
                {getInitials(user?.firstName, user?.lastName)}
              </span>
              <span className="hidden sm:block min-w-0 text-left">
                <span className="block text-xs font-semibold text-[color:var(--edvora-ink-strong)] truncate max-w-[120px]">
                  {user?.firstName}
                </span>
                <span className="block text-[10px] text-[color:var(--edvora-muted)] truncate">
                  {displayRole}
                </span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Push sidebar — no overlay, main content resizes */}
        <aside
          className="theme-sidebar relative shrink-0 overflow-hidden text-white transition-[width] duration-300 ease-out"
          style={{ width: sidebarOpen ? SIDEBAR_WIDTH : 0 }}
          aria-hidden={!sidebarOpen}
        >
          <div
            className="flex h-full flex-col"
            style={{ width: SIDEBAR_WIDTH }}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-12 h-48 w-48 rounded-full bg-[color:var(--edvora-accent)]/25 blur-2xl" />
              <div className="absolute bottom-24 -left-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            </div>

            <div className="relative flex items-center gap-3 p-5 pb-3">
              <EdvoraLogo
                variant="icon"
                decorative
                className="h-11 w-11 shrink-0 rounded-2xl ring-1 ring-white/20"
              />
              <div className="min-w-0">
                <p className="text-lg font-bold text-white leading-tight truncate">
                  Edvora
                </p>
                <p className="text-[11px] text-white/65 truncate">{portalTitle}</p>
              </div>
            </div>

            <div className="relative flex-1 min-h-0 overflow-y-auto py-2">
              <SideNav
                onNavigate={closeSidebarOnMobile}
                onOpenProfile={handleOpenProfile}
              />
            </div>

            <div className="relative border-t border-white/10 p-4">
              <button
                type="button"
                onClick={() => {
                  closeSidebarOnMobile();
                  setLogoutModalOpen(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main
          className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden rs-page transition-[flex-basis,width] duration-300 ease-out"
          data-sidebar={sidebarOpen ? "expanded" : "compressed"}
        >
          <div
            className={`w-full min-h-full transition-[padding,max-width] duration-300 ease-out ${
              sidebarOpen
                ? "max-w-[1600px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
                : "max-w-none px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:px-10 2xl:px-12"
            }`}
          >
            <Suspense
              fallback={
                <div className="flex min-h-[50vh] items-center justify-center">
                  <EdvoraLoader message="Loading…" />
                </div>
              }
            >
              <Outlet context={{ sidebarOpen, isDesktop }} />
            </Suspense>
          </div>
        </main>
      </div>

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

export default AdminLayout;
