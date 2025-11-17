import TeacherTopBar from "../../Component/Teacher/TeacherTopBar";
import TeacherSideNav from "../../Component/Teacher/TeacherSideNav";
import TeacherQuizCard from "../../Component/Teacher/TeacherQuizCard";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../../lib/apiClient";

export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const classData = location.state?.classData;
  const [quizzes, setQuizzes] = useState([]);
  const [currentClass, setCurrentClass] = useState(classData || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get class from state first, then fallback to localStorage
    const classToUse =
      classData ||
      JSON.parse(localStorage.getItem("currentTeacherClass") || "null");
    if (classToUse) {
      setCurrentClass(classToUse);
      loadQuizzes(classToUse.id);
    } else {
      setLoading(false);
    }
  }, [classData]);

  const loadQuizzes = async (classId) => {
    try {
      setLoading(true);
      const quizzesList = await api.listQuizzes(classId);
      setQuizzes(quizzesList);
    } catch (e) {
      console.error("Failed to load quizzes:", e);
      alert("Failed to load quizzes: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      if (!currentClass) return;

      try {
        await api.deleteQuiz(quizId);
        setQuizzes(quizzes.filter((q) => q.id !== quizId));
      } catch (e) {
        alert("Failed to delete quiz: " + e.message);
      }
    }
  };

  const handleViewResponses = (quiz) => {
    navigate("/Teacher/quiz-responses", {
      state: { quiz, classId: currentClass?.id },
    });
  };
  return (
    <div>
      <TeacherTopBar></TeacherTopBar>
      <div className="flex ">
        <TeacherSideNav></TeacherSideNav>
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="bg-blue-200 h-12 font-bold flex items-center px-5 border-b-2 border-blue-300">
            Quiz
          </div>
          <div className="flex justify-end mr-10">
            <button
              onClick={() => {
                navigate("/Teacher/addQuiz");
              }}
              className=" w-15 h-7 mt-2 px-4 py-1 text-sm font-medium text-white bg-blue-500 rounded-md transition duration-150 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              ADD
            </button>
          </div>
          <div className="flex-1 p-10 pl-20 pr-20 space-y-6">
            {loading ? (
              <div className="text-center text-gray-500 py-10">
                Loading quizzes...
              </div>
            ) : !currentClass ? (
              <div className="text-center text-gray-500 py-10">
                <p className="text-lg mb-2">No class selected</p>
                <p className="text-sm">
                  Please select a class from the homepage first
                </p>
                <button
                  onClick={() => navigate("/Teacher/homePage")}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go to Classes
                </button>
              </div>
            ) : quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <TeacherQuizCard
                  key={quiz.id}
                  date={
                    quiz.created_at
                      ? new Date(quiz.created_at).toLocaleDateString()
                      : "N/A"
                  }
                  title={quiz.title}
                  due={quiz.due_at}
                  possibleScore={quiz.possible_score}
                  onDelete={() => handleDelete(quiz.id)}
                  onViewResponses={() => handleViewResponses(quiz)}
                />
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                No quizzes created yet. Click ADD to create your first quiz.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
