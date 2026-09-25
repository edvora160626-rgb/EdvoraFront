import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import DocumentSeo from "./components/DocumentSeo";
import EdvoraLoader from "./common/EdvoraLoader";
import SnackbarContainer from "./common/snackbar/SnackbarContainer";
import Login from "./components/Login";
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const ExamLayout = lazy(() => import("./pages/exam/ExamLayout"));
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
const Subjects = lazy(() => import("./pages/admin/Subjects"));
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
const ClassTimetableGrid = lazy(
  () => import("./pages/admin/timetable/ClassTimetableGrid")
);
const TeacherTimetable = lazy(
  () => import("./pages/admin/timetable/TeacherTimetable")
);
const RoomTimetable = lazy(
  () => import("./pages/admin/timetable/RoomTimetable")
);
const MyTimetable = lazy(() => import("./pages/admin/timetable/MyTimetable"));

const ExamDashboard = lazy(() => import("./pages/exam/ExamDashboard"));
const StudyMaterial = lazy(() => import("./pages/exam/StudyMaterial"));
const PracticeTests = lazy(() => import("./pages/exam/PracticeTests"));
const ScheduleTest = lazy(() => import("./pages/exam/ScheduleTest"));
const Certificates = lazy(() => import("./pages/exam/Certificates"));
const Forum = lazy(() => import("./pages/exam/Forum"));
const Support = lazy(() => import("./pages/exam/Support"));
const Help = lazy(() => import("./pages/exam/Help"));
const AllTests = lazy(() => import("./pages/exam/AllTests"));
const AllResults = lazy(() => import("./pages/exam/AllResults"));
const TestValidation = lazy(() => import("./pages/exam/test/TestValidation"));
const TestDetails = lazy(() => import("./pages/exam/test/TestDetails"));
const TestPage = lazy(() => import("./pages/exam/test/TestPage"));
const ResultPage = lazy(() => import("./pages/exam/test/ResultPage"));

const AdminDashboard = lazy(() => import("./pages/exam/admin/AdminDashboard"));
const AdminCreateAdmin = lazy(
  () => import("./pages/exam/admin/AdminCreateAdmin")
);
const AdminCandidates = lazy(
  () => import("./pages/exam/admin/AdminCandidates")
);
const AdminQuestions = lazy(() => import("./pages/exam/admin/AdminQuestions"));
const AdminTests = lazy(() => import("./pages/exam/admin/AdminTests"));
const AdminExamWindows = lazy(
  () => import("./pages/exam/admin/AdminExamWindows")
);
const AdminTestEnrollments = lazy(
  () => import("./pages/exam/admin/AdminTestEnrollments")
);
const AdminStudyMaterial = lazy(
  () => import("./pages/exam/admin/AdminStudyMaterial")
);
const AdminSubjects = lazy(() => import("./pages/exam/admin/AdminSubjects"));
const AdminEvaluation = lazy(
  () => import("./pages/exam/admin/AdminEvaluation")
);
const AdminResults = lazy(() => import("./pages/exam/admin/AdminResults"));
const AdminEventLog = lazy(() => import("./pages/exam/admin/AdminEventLog"));
const AdminSupportTickets = lazy(
  () => import("./pages/exam/admin/AdminSupportTickets")
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
          <Route path="/forgot-password/otp-verify" element={<OtpVerify />} />
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
            <Route path="subjects" element={<Subjects />} />
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
            <Route path="upcoming-events/:eventId" element={<EventDetail />} />
            <Route path="timetable" element={<TimetableDashboard />} />
            <Route path="timetable/settings" element={<TimetableSettings />} />
            <Route path="timetable/rooms" element={<TimetableRooms />} />
            <Route
              path="timetable/class/:classId"
              element={<ClassTimetableGrid />}
            />
            <Route path="timetable/teacher" element={<TeacherTimetable />} />
            <Route path="timetable/room/:roomId" element={<RoomTimetable />} />
            <Route path="timetable/my" element={<MyTimetable />} />
          </Route>

          <Route path="/exam" element={<ExamLayout />}>
            <Route path="dashboard" element={<ExamDashboard />} />
            <Route path="study-material" element={<StudyMaterial />} />
            <Route path="practice" element={<PracticeTests />} />
            <Route path="schedule-test" element={<ScheduleTest />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="forum" element={<Forum />} />
            <Route path="support" element={<Support />} />
            <Route path="help" element={<Help />} />
            <Route path="tests" element={<AllTests />} />
            <Route path="results" element={<AllResults />} />
            <Route path="test-validation" element={<TestValidation />} />
            <Route path="test-details" element={<TestDetails />} />
            <Route path="test-page" element={<TestPage />} />
            <Route path="result" element={<ResultPage />} />

            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/create-admin" element={<AdminCreateAdmin />} />
            <Route path="admin/candidates" element={<AdminCandidates />} />
            <Route path="admin/questions" element={<AdminQuestions />} />
            <Route
              path="admin/tests/configuration"
              element={<AdminTests />}
            />
            <Route
              path="admin/tests/exam-windows"
              element={<AdminExamWindows />}
            />
            <Route
              path="admin/tests/proctor-acceptance"
              element={<Navigate to="/exam/admin/tests/exam-windows" replace />}
            />
            <Route
              path="admin/tests/enrollments"
              element={<AdminTestEnrollments />}
            />
            <Route path="admin/subjects" element={<AdminSubjects />} />
            <Route
              path="admin/subjects/study-material"
              element={<AdminStudyMaterial />}
            />

            {/* Legacy paths */}
            <Route
              path="admin/study-material"
              element={
                <Navigate to="/exam/admin/subjects/study-material" replace />
              }
            />
            <Route
              path="admin/setup/subjects"
              element={<Navigate to="/exam/admin/subjects" replace />}
            />
            <Route
              path="admin/reports/evaluation"
              element={<AdminEvaluation />}
            />
            <Route path="admin/reports/results" element={<AdminResults />} />
            <Route
              path="admin/reports/event-log"
              element={<AdminEventLog />}
            />
            <Route
              path="admin/reports/support"
              element={<AdminSupportTickets />}
            />

            {/* Legacy flat admin paths → Nextestify-style modules */}
            <Route
              path="admin/users"
              element={<Navigate to="/exam/admin/create-admin" replace />}
            />
            <Route
              path="admin/tests"
              element={
                <Navigate to="/exam/admin/tests/configuration" replace />
              }
            />
            <Route
              path="admin/results"
              element={<Navigate to="/exam/admin/reports/results" replace />}
            />

            <Route
              path="proctor/*"
              element={<Navigate to="/exam/admin/dashboard" replace />}
            />
          </Route>
        </Routes>
      </Suspense>
      <SnackbarContainer />
    </BrowserRouter>
  );
}

export default App;
