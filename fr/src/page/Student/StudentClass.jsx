import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../lib/apiClient";
import StudentTopBar from "../../Component/Student/StudentTopBar";
import StudentSideNav from "../../Component/Student/StudentSideNav";

export default function StudentClass() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialClassData = location.state?.classData;
  const [classData, setClassData] = useState(initialClassData);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState("assignments");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentStudent = JSON.parse(localStorage.getItem("currentStudent"));
    if (!currentStudent) {
      navigate("/Student/login");
      return;
    }
    setStudent(currentStudent);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (!classData?.id) return;
    (async () => {
      try {
        const [alist, qlist] = await Promise.all([
          api.listAssignments(classData.id),
          api.listQuizzes(classData.id),
        ]);
        setAssignments(alist);
        setQuizzes(qlist);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [classData?.id]);

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No class data found.</p>
      </div>
    );
  }

  const getAssignmentStatus = async (assignment) => {
    const submission = await api.myAssignmentSubmission(assignment.id);
    const dueDate = assignment.due_at ? new Date(assignment.due_at) : null;
    const now = new Date();
    if (submission) return submission.grade != null ? "graded" : "submitted";
    if (!dueDate) return "pending";
    if (now > dueDate) return "overdue";
    const daysDiff = (dueDate - now) / (1000 * 60 * 60 * 24);
    return daysDiff <= 3 ? "due-soon" : "pending";
  };

  const getQuizStatus = async (quiz) => {
    const submission = await api.myQuizSubmission(quiz.id);
    const dueDate = quiz.due_at ? new Date(quiz.due_at) : null;
    const now = new Date();
    if (submission) return submission.score != null ? "graded" : "submitted";
    if (!dueDate) return "pending";
    if (now > dueDate) return "overdue";
    const daysDiff = (dueDate - now) / (1000 * 60 * 60 * 24);
    return daysDiff <= 3 ? "due-soon" : "pending";
  };

  const getStatusBadge = (status) => {
    const badges = {
      graded: { bg: "bg-cyan-100", text: "text-cyan-800", label: "Graded" },
      submitted: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Submitted",
      },
      overdue: { bg: "bg-red-100", text: "text-red-800", label: "Overdue" },
      "due-soon": {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Due Soon",
      },
      pending: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Not Started",
      },
    };

    const badge = badges[status] || badges.pending;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  const handleAssignmentClick = (assignment) => {
    navigate("/Student/assignment", { state: { assignment, classData } });
  };

  const handleQuizClick = (quiz) => {
    navigate("/Student/quiz", { state: { quiz, classData } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentTopBar />
      <div className="flex flex-1 overflow-hidden">
        <StudentSideNav />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Class Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg p-6 mb-6 shadow-md">
              <button
                onClick={() => navigate("/Student/dashboard")}
                className="text-white hover:text-cyan-100 mb-4 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Classes
              </button>
              <h1 className="text-3xl font-bold text-white mb-2">
                {classData.name}
              </h1>
              <p className="text-cyan-100">
                {classData.students || 0} students • Created: {classData.date}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-300 mb-6">
              <button
                onClick={() => setActiveTab("assignments")}
                className={`px-6 py-3 font-semibold ${
                  activeTab === "assignments"
                    ? "border-b-2 border-cyan-600 text-cyan-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Assignments ({assignments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("quizzes")}
                className={`px-6 py-3 font-semibold ${
                  activeTab === "quizzes"
                    ? "border-b-2 border-cyan-600 text-cyan-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Quizzes ({quizzes?.length || 0})
              </button>
            </div>

            {/* Content */}
            {activeTab === "assignments" && (
              <div className="space-y-4">
                {!assignments || assignments.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                    No assignments yet
                  </div>
                ) : (
                  assignments.map((assignment) => (
                    <AssignmentRow
                      key={assignment.id}
                      assignment={assignment}
                      onClick={() => handleAssignmentClick(assignment)}
                      getStatus={getAssignmentStatus}
                      getBadge={getStatusBadge}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === "quizzes" && (
              <div className="space-y-4">
                {!quizzes || quizzes.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                    No quizzes yet
                  </div>
                ) : (
                  quizzes.map((quiz) => (
                    <QuizRow
                      key={quiz.id}
                      quiz={quiz}
                      onClick={() => handleQuizClick(quiz)}
                      getStatus={getQuizStatus}
                      getBadge={getStatusBadge}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function AssignmentRow({ assignment, onClick, getStatus, getBadge }) {
  const [status, setStatus] = useState("pending");
  useEffect(() => {
    (async () => {
      try {
        setStatus(await getStatus(assignment));
      } catch {}
    })();
  }, [assignment?.id]);
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {assignment.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {assignment.description?.substring(0, 100)}
            {assignment.description?.length > 100 ? "..." : ""}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Due:{" "}
              {assignment.due_at
                ? new Date(assignment.due_at).toLocaleString()
                : "-"}
            </span>
          </div>
        </div>
        <div>{getBadge(status)}</div>
      </div>
    </div>
  );
}

function QuizRow({ quiz, onClick, getStatus, getBadge }) {
  const [status, setStatus] = useState("pending");
  useEffect(() => {
    (async () => {
      try {
        setStatus(await getStatus(quiz));
      } catch {}
    })();
  }, [quiz?.id]);
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {quiz.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Due: {quiz.due_at ? new Date(quiz.due_at).toLocaleString() : "-"}
            </span>
          </div>
        </div>
        <div>{getBadge(status)}</div>
      </div>
    </div>
  );
}
