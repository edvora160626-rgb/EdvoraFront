import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DocumentSeo from "./components/DocumentSeo";
import EdvoraLoader from "./common/EdvoraLoader";
import SnackbarContainer from "./common/snackbar/SnackbarContainer";
import AdminLayout from "./pages/admin/AdminLayout";

const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));
const ForgotPasswordConfirm = lazy(
  () => import("./components/ForgotPasswordConfirm")
);
const OtpVerify = lazy(() => import("./components/OtpVerify"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));

const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const UserRequests = lazy(() => import("./pages/admin/UserRequests"));
const Departments = lazy(() => import("./pages/admin/Departments"));
const DepartmentStaff = lazy(() => import("./pages/admin/DepartmentStaff"));
const Classes = lazy(() => import("./pages/admin/Classes"));
const ClassStudents = lazy(() => import("./pages/admin/ClassStudents"));
const TeacherAttendance = lazy(() => import("./pages/admin/TeacherAttendance"));
const TeacherAttendanceMark = lazy(
  () => import("./pages/admin/TeacherAttendanceMark")
);
const StudentAttendance = lazy(() => import("./pages/admin/StudentAttendance"));
const StudentAttendanceMark = lazy(
  () => import("./pages/admin/StudentAttendanceMark")
);
const BulkAttendanceUpload = lazy(
  () => import("./pages/admin/BulkAttendanceUpload")
);
const AttendanceLogs = lazy(() => import("./pages/admin/AttendanceLogs"));
const UpcomingEvents = lazy(() => import("./pages/admin/UpcomingEvents"));
const EventDetail = lazy(() => import("./pages/admin/EventDetail"));
const TimetableDashboard = lazy(
  () => import("./pages/admin/timetable/TimetableDashboard")
);
const TimetableSettings = lazy(
  () => import("./pages/admin/timetable/TimetableSettings")
);
const TimetableRooms = lazy(
  () => import("./pages/admin/timetable/TimetableRooms")
);
const TimetableAllocations = lazy(
  () => import("./pages/admin/timetable/TimetableAllocations")
);
const ClassTimetableGrid = lazy(
  () => import("./pages/admin/timetable/ClassTimetableGrid")
);
const TeacherTimetable = lazy(
  () => import("./pages/admin/timetable/TeacherTimetable")
);
const RoomTimetable = lazy(
  () => import("./pages/admin/timetable/RoomTimetable")
);
const MyTimetable = lazy(
  () => import("./pages/admin/timetable/MyTimetable")
);

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAEEE9]">
      <EdvoraLoader message="Loading…" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DocumentSeo />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPasswordConfirm />} />
          <Route
            path="/forgot-password/otp-verify"
            element={<OtpVerify />}
          />
          <Route path="/forgot-password/reset" element={<ResetPassword />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="requests" element={<UserRequests />} />
            <Route path="departments" element={<Departments />} />
            <Route
              path="departments/:departmentId"
              element={<DepartmentStaff />}
            />
            <Route path="classes" element={<Classes />} />
            <Route path="classes/:classId" element={<ClassStudents />} />
            <Route path="teacher-attendance" element={<TeacherAttendance />} />
            <Route
              path="teacher-attendance/mark"
              element={<TeacherAttendanceMark />}
            />
            <Route
              path="teacher-attendance/bulk-upload"
              element={<BulkAttendanceUpload type="TEACHER" />}
            />
            <Route
              path="teacher-attendance/logs"
              element={<AttendanceLogs type="TEACHER" />}
            />
            <Route path="student-attendance" element={<StudentAttendance />} />
            <Route
              path="student-attendance/mark/:classId"
              element={<StudentAttendanceMark />}
            />
            <Route
              path="student-attendance/bulk-upload"
              element={<BulkAttendanceUpload type="STUDENT" />}
            />
            <Route
              path="student-attendance/logs"
              element={<AttendanceLogs type="STUDENT" />}
            />
            <Route path="upcoming-events" element={<UpcomingEvents />} />
            <Route
              path="upcoming-events/:eventId"
              element={<EventDetail />}
            />
            <Route path="timetable" element={<TimetableDashboard />} />
            <Route path="timetable/settings" element={<TimetableSettings />} />
            <Route path="timetable/rooms" element={<TimetableRooms />} />
            <Route
              path="timetable/allocations"
              element={<TimetableAllocations />}
            />
            <Route
              path="timetable/class/:classId"
              element={<ClassTimetableGrid />}
            />
            <Route path="timetable/teacher" element={<TeacherTimetable />} />
            <Route
              path="timetable/room/:roomId"
              element={<RoomTimetable />}
            />
            <Route path="timetable/my" element={<MyTimetable />} />
          </Route>
        </Routes>
      </Suspense>
      <SnackbarContainer />
    </BrowserRouter>
  );
}

export default App;
