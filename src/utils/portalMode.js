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
    const value = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, next);
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
