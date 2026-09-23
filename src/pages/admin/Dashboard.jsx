import { lazy, Suspense } from "react";
import { getUserRole } from "../../utils/auth";
import EdvoraLoader from "../../common/EdvoraLoader";

const PrincipalDashboard = lazy(() => import("./dashboards/PrincipalDashboard"));
const SchoolAdminDashboard = lazy(
  () => import("./dashboards/SchoolAdminDashboard")
);
const TeacherDashboard = lazy(() => import("./dashboards/TeacherDashboard"));
const ParentDashboard = lazy(() => import("./dashboards/ParentDashboard"));
const StudentDashboard = lazy(() => import("./dashboards/StudentDashboard"));

const ROLE_DASHBOARD = {
  SUPER_ADMIN: PrincipalDashboard,
  SCHOOL_ADMIN: SchoolAdminDashboard,
  TEACHER: TeacherDashboard,
  PARENT: ParentDashboard,
  STUDENT: StudentDashboard,
};

function DashboardFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <EdvoraLoader message="Loading dashboard…" />
    </div>
  );
}

function Dashboard() {
  const role = getUserRole();
  const Page = ROLE_DASHBOARD[role] || SchoolAdminDashboard;

  return (
    <Suspense fallback={<DashboardFallback />}>
      <Page />
    </Suspense>
  );
}

export default Dashboard;
