import { getUserRole } from "../../utils/auth";
import PrincipalDashboard from "./dashboards/PrincipalDashboard";
import SchoolAdminDashboard from "./dashboards/SchoolAdminDashboard";
import TeacherDashboard from "./dashboards/TeacherDashboard";
import ParentDashboard from "./dashboards/ParentDashboard";
import StudentDashboard from "./dashboards/StudentDashboard";

function Dashboard() {
  const role = getUserRole();

  switch (role) {
    case "SUPER_ADMIN":
      return <PrincipalDashboard />;
    case "SCHOOL_ADMIN":
      return <SchoolAdminDashboard />;
    case "TEACHER":
      return <TeacherDashboard />;
    case "PARENT":
      return <ParentDashboard />;
    case "STUDENT":
      return <StudentDashboard />;
    default:
      return <SchoolAdminDashboard />;
  }
}

export default Dashboard;
