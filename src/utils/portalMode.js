import { getCurrentUser } from "./auth";

export const PORTAL_MODES = Object.freeze({
  SCHOOL: "school",
  EXAMINATION: "examination",
});

export const EXAM_ROLES = Object.freeze({
  ADMIN: "EXAM_ADMIN",
  CANDIDATE: "EXAM_CANDIDATE",
});

/** @deprecated use EXAM_ROLES.CANDIDATE */
export const EXAM_CANDIDATE_ROLE = EXAM_ROLES.CANDIDATE;

const STORAGE_KEY = "edvora_portal_mode";

export function getPortalMode() {
  try {
    let value = sessionStorage.getItem(STORAGE_KEY);
    if (!value) {
      value = localStorage.getItem(STORAGE_KEY);
      if (value) {
        sessionStorage.setItem(STORAGE_KEY, value);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    if (value === PORTAL_MODES.EXAMINATION) return PORTAL_MODES.EXAMINATION;
  } catch {
    // ignore
  }
  return PORTAL_MODES.SCHOOL;
}

export function setPortalMode(mode) {
  const next =
    mode === PORTAL_MODES.EXAMINATION
      ? PORTAL_MODES.EXAMINATION
      : PORTAL_MODES.SCHOOL;
  try {
    sessionStorage.setItem(STORAGE_KEY, next);
    // Avoid a shared localStorage portal mode clobbering another tab.
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return next;
}

export function getExamRole(userOrRole) {
  if (!userOrRole) return "";
  return typeof userOrRole === "string" ? userOrRole : userOrRole.role || "";
}

export function isExamPortalUser(userOrRole) {
  const role = getExamRole(userOrRole);
  return Object.values(EXAM_ROLES).includes(role);
}

/** @deprecated use isExamPortalUser */
export function isExamCandidate(userOrRole) {
  return isExamPortalUser(userOrRole);
}

export function getExamRoleLabel(role) {
  if (role === EXAM_ROLES.ADMIN) return "Admin";
  if (role === EXAM_ROLES.CANDIDATE) return "Candidate";
  return "Examination";
}

export function getPortalHomePath(mode = getPortalMode(), user = null) {
  if (mode !== PORTAL_MODES.EXAMINATION) return "/admin/dashboard";
  const role = getExamRole(user);
  if (role === EXAM_ROLES.ADMIN) return "/exam/admin/dashboard";
  return "/exam/dashboard";
}

/** Warm the post-login chunks while the auth request is in flight. */
export function prefetchPortalHome(mode = getPortalMode(), user = null) {
  const resolvedUser = user || getCurrentUser();
  if (mode === PORTAL_MODES.EXAMINATION) {
    void import("../pages/exam/ExamLayout");
    const role = getExamRole(resolvedUser);
    if (role === EXAM_ROLES.ADMIN) {
      void import("../pages/exam/admin/AdminDashboard");
    } else {
      void import("../pages/exam/ExamDashboard");
    }
    return;
  }

  void import("../pages/admin/AdminLayout");
  void import("../pages/admin/Dashboard");

  const role = resolvedUser?.role;
  if (role === "SUPER_ADMIN") {
    void import("../pages/admin/dashboards/PrincipalDashboard");
  } else if (role === "SCHOOL_ADMIN") {
    void import("../pages/admin/dashboards/SchoolAdminDashboard");
  } else if (role === "TEACHER") {
    void import("../pages/admin/dashboards/TeacherDashboard");
  } else if (role === "PARENT") {
    void import("../pages/admin/dashboards/ParentDashboard");
  } else if (role === "STUDENT") {
    void import("../pages/admin/dashboards/StudentDashboard");
  }
}
