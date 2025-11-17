import "./index.css";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import TeacherAssignment from "./page/Teacher/TeacherAssignment";
import TeacherLoginPage from "./page/Common/TeacherLoginPage";
import TeacherHomePage from "./page/Teacher/TeacherHomePage";
import TeacherProfile from "./page/Teacher/TeacherProfile";
import TeacherGeneral from "./page/Teacher/TeacherGeneral";
import TeacherAddAssignment from "./page/Teacher/TeacherAddAssignment";
import TeacherQuiz from "./page/Teacher/TeacherQuiz";
import TeacherAddQuiz from "./page/Teacher/TeacherAddQuiz";
import TeacherAssignmentResponses from "./page/Teacher/TeacherAssignmentResponses";
import TeacherQuizResponses from "./page/Teacher/TeacherQuizResponses";
import AdminLoginPage from "./page/Admin/AdminLoginPage";
import AdminDashboard from "./page/Admin/AdminDashboard";
import AdminStudents from "./page/Admin/AdminStudents";
import AdminTeachers from "./page/Admin/AdminTeachers";
import AdminProfile from "./page/Admin/AdminProfile";
import StudentLoginPage from "./page/Student/StudentLoginPage";
import StudentDashboard from "./page/Student/StudentDashboard";
import StudentClass from "./page/Student/StudentClass";
import StudentAssignment from "./page/Student/StudentAssignment";
import StudentQuiz from "./page/Student/StudentQuiz";
import StudentProfile from "./page/Student/StudentProfile";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/Teacher/login" replace></Navigate>}
        ></Route>
        <Route path="/Teacher/login" element={<TeacherLoginPage />}></Route>
        <Route path="/Teacher/homePage" element={<TeacherHomePage />}></Route>
        <Route path="/Teacher/profile" element={<TeacherProfile />}></Route>
        <Route
          path="/Teacher/assignment"
          element={<TeacherAssignment />}
        ></Route>
        <Route path="/Teacher/general" element={<TeacherGeneral />}></Route>
        <Route
          path="/Teacher/addAssignment"
          element={<TeacherAddAssignment />}
        ></Route>
        <Route path="/Teacher/quiz" element={<TeacherQuiz />}></Route>
        <Route path="/Teacher/addQuiz" element={<TeacherAddQuiz />}></Route>
        <Route
          path="/Teacher/assignment-responses"
          element={<TeacherAssignmentResponses />}
        ></Route>
        <Route
          path="/Teacher/quiz-responses"
          element={<TeacherQuizResponses />}
        ></Route>

        {/* Admin Routes */}
        <Route path="/Admin/login" element={<AdminLoginPage />}></Route>
        <Route path="/Admin/dashboard" element={<AdminDashboard />}></Route>
        <Route path="/Admin/students" element={<AdminStudents />}></Route>
        <Route path="/Admin/teachers" element={<AdminTeachers />}></Route>
        <Route path="/Admin/profile" element={<AdminProfile />}></Route>

        {/* Student Routes */}
        <Route path="/Student/login" element={<StudentLoginPage />}></Route>
        <Route path="/Student/dashboard" element={<StudentDashboard />}></Route>
        <Route path="/Student/class" element={<StudentClass />}></Route>
        <Route
          path="/Student/assignment"
          element={<StudentAssignment />}
        ></Route>
        <Route path="/Student/quiz" element={<StudentQuiz />}></Route>
        <Route path="/Student/profile" element={<StudentProfile />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
