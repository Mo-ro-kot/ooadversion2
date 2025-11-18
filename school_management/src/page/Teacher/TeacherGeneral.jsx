import TeacherTopBar from "../../Component/Teacher/TeacherTopBar";
import TeacherSideNav from "../../Component/Teacher/TeacherSideNav";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TeacherAssignmentCard from "../../Component/Teacher/TeacherAsssignmentCard";
import TeacherQuizCard from "../../Component/Teacher/TeacherQuizCard";
import { api } from "../../lib/apiClient";

// --- Sub-component for the tab navigation ---
const TabItem = ({ label, isActive, onClick }) => {
  const activeClasses = "text-blue-600 font-bold border-b-2 border-blue-600";
  const inactiveClasses = "text-gray-600 hover:text-blue-600";

  return (
    <div
      className={`mr-6 pb-2 cursor-pointer transition duration-150 ${
        isActive ? activeClasses : inactiveClasses
      }`}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

const General = () => {
  // State to track the active tab. Default to 'Posts'.
  const [activeTab, setActiveTab] = useState("Posts");
  const location = useLocation();
  const navigate = useNavigate();
  const classData = location.state?.classData;
  const [currentClass, setCurrentClass] = useState(classData || null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (classData) {
      setCurrentClass(classData);
      loadClassData(classData.id);
    }
  }, [classData]);

  const loadClassData = async (classId) => {
    try {
      setLoading(true);
      const [classInfo, students, assignmentsList, quizzesList] =
        await Promise.all([
          api.getClass(classId),
          api.getClassStudents(classId),
          api.listAssignments(classId),
          api.listQuizzes(classId),
        ]);

      setCurrentClass(classInfo);
      setEnrolledStudents(
        students.map((s) => ({
          id: s.id,
          name: s.full_name || s.username,
          username: s.username,
          email: s.email,
        }))
      );
      setAssignments(assignmentsList);
      setQuizzes(quizzesList);
    } catch (e) {
      console.error("Failed to load class data:", e);
      alert("Failed to load class data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId, studentName) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${studentName} from this class?`
      )
    ) {
      try {
        await api.removeStudentFromClass(currentClass.id, studentId);
        await loadClassData(currentClass.id);
      } catch (err) {
        alert("Failed to remove student: " + err.message);
      }
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await api.deleteAssignment(assignmentId);
        await loadClassData(currentClass.id);
      } catch (err) {
        alert("Failed to delete assignment: " + err.message);
      }
    }
  };

  const handleUpdateAssignment = async (assignmentId, updateData) => {
    try {
      await api.updateAssignment(assignmentId, updateData);
      await loadClassData(currentClass.id);
    } catch (err) {
      alert("Failed to update assignment: " + err.message);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await api.deleteQuiz(quizId);
        await loadClassData(currentClass.id);
      } catch (err) {
        alert("Failed to delete quiz: " + err.message);
      }
    }
  };

  const handleViewAssignmentResponses = (assignment) => {
    navigate("/Teacher/assignment-responses", {
      state: { assignment, classId: currentClass.id },
    });
  };

  const handleViewQuizResponses = (quiz) => {
    navigate("/Teacher/quiz-responses", {
      state: { quiz, classId: currentClass.id },
    });
  };

  // --- Content Renderers ---

  // Renders the Posts section content
  const renderPosts = () => {
    if (!currentClass) {
      return (
        <div className="text-center py-10 text-red-500">
          <p className="text-lg mb-2">Error: No class data available</p>
          <p className="text-sm">Please navigate back to the class list</p>
          <button
            onClick={() => navigate("/Teacher/homePage")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Classes
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Add Assignment/Quiz buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() =>
              navigate("/Teacher/addAssignment", {
                state: { classId: currentClass.id },
              })
            }
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Assignment
          </button>
          <button
            onClick={() =>
              navigate("/Teacher/addQuiz", {
                state: { classId: currentClass.id },
              })
            }
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Quiz
          </button>
        </div>

        {/* Display assignments and quizzes */}
        {assignments.length === 0 && quizzes.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg mb-2">No assignments or quizzes yet</p>
            <p className="text-sm">
              Please create your first assignment or quiz
            </p>
          </div>
        ) : (
          <>
            {assignments.map((assignment) => (
              <TeacherAssignmentCard
                key={assignment.id}
                date={new Date(assignment.created_at).toLocaleDateString()}
                title={assignment.title}
                due={assignment.due_at}
                possibleScore={assignment.possible_score}
                onDelete={() => handleDeleteAssignment(assignment.id)}
                onViewResponses={() =>
                  handleViewAssignmentResponses(assignment)
                }
                onUpdate={(data) => handleUpdateAssignment(assignment.id, data)}
              />
            ))}
            {quizzes.map((quiz) => (
              <TeacherQuizCard
                key={quiz.id}
                date={new Date(quiz.created_at).toLocaleDateString()}
                title={quiz.title}
                due={quiz.due_at}
                possibleScore={quiz.possible_score}
                onDelete={() => handleDeleteQuiz(quiz.id)}
                onViewResponses={() => handleViewQuizResponses(quiz)}
              />
            ))}
          </>
        )}
      </div>
    );
  };

  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyLink = () => {
    const classCode = currentClass?.id;
    navigator.clipboard.writeText(classCode.toString()).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Renders the Students Roster section content
  const renderStudents = () => (
    <div className="max-w-5xl mx-auto bg-white rounded-lg p-6 shadow-md border border-blue-100">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-2">
        Student
      </h2>

      {/* Class Code Section */}
      <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Class Join Code
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white">
            <div className="text-xs text-gray-500 mb-1">Class Code</div>
            <div className="text-2xl font-bold text-blue-600 tracking-wider">
              {currentClass?.id}
            </div>
          </div>
          <button
            onClick={handleCopyLink}
            className={`px-6 py-2 rounded-lg font-semibold transition duration-200 ${
              copySuccess
                ? "bg-green-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {copySuccess ? "✓ Copied!" : "Copy Code"}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Share this code with students to let them join your class.
        </p>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              kick out
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {enrolledStudents.length === 0 ? (
            <tr>
              <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                No students enrolled yet. Share the class code to invite
                students.
              </td>
            </tr>
          ) : (
            enrolledStudents.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-gray-50 transition duration-100"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.email || student.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() =>
                      handleRemoveStudent(student.id, student.name)
                    }
                    className="text-red-600 hover:text-red-800 transition"
                    title="Remove student from class"
                  >
                    <svg
                      width="30px"
                      height="30px"
                      viewBox="0 0 512 512"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#ff0000"
                      stroke="#ff0000"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        <path
                          fill="#ff0000"
                          d="M199 103v50h-78v30h270v-30h-78v-50H199zm18 18h78v32h-78v-32zm-79.002 80l30.106 286h175.794l30.104-286H137.998zm62.338 13.38l.64 8.98 16 224 .643 8.976-17.956 1.283-.64-8.98-16-224-.643-8.976 17.956-1.283zm111.328 0l17.955 1.284-.643 8.977-16 224-.64 8.98-17.956-1.284.643-8.977 16-224 .64-8.98zM247 215h18v242h-18V215z"
                        ></path>
                      </g>
                    </svg>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <TeacherTopBar></TeacherTopBar>
      <div className="flex">
        <TeacherSideNav></TeacherSideNav>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600">Loading class data...</p>
            </div>
          ) : (
            <>
              {/* Class Info Header */}
              {currentClass && (
                <div className="bg-blue-100 rounded-lg p-4 mb-6 border-l-4 border-blue-600">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {currentClass.name}
                  </h2>
                  <div className="flex gap-6 text-sm text-gray-700">
                    <span className="font-semibold">
                      Status:{" "}
                      <span
                        className={
                          currentClass.status === "completed"
                            ? "text-green-600"
                            : "text-blue-600"
                        }
                      >
                        {currentClass.status}
                      </span>
                    </span>
                    <span className="font-semibold">
                      Students: {enrolledStudents.length}
                    </span>
                    <span className="font-semibold">
                      Created:{" "}
                      {new Date(currentClass.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Tab Navigation (Posts / Students) */}
              <div className="flex border-b border-gray-300 mb-6 max-w-5xl mx-auto">
                <TabItem
                  label="Posts"
                  isActive={activeTab === "Posts"}
                  onClick={() => setActiveTab("Posts")}
                />
                <TabItem
                  label="Students"
                  isActive={activeTab === "Students"}
                  onClick={() => setActiveTab("Students")}
                />
              </div>

              {/* Conditionally Render Content */}
              {activeTab === "Posts" && renderPosts()}
              {activeTab === "Students" && renderStudents()}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default General;
