import TeacherTopBar from "../../Component/Teacher/TeacherTopBar";
import TeacherSideNav from "../../Component/Teacher/TeacherSideNav";
import TeacherQuizCard from "../../Component/Teacher/TeacherQuizCard";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Quiz() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = () => {
    // Get current class from localStorage
    const savedClass = localStorage.getItem("currentTeacherClass");
    if (savedClass) {
      const classData = JSON.parse(savedClass);
      setCurrentClass(classData);

      // Load fresh class data from classes array
      const classes = JSON.parse(localStorage.getItem("classes")) || [];
      const currentClassData = classes.find((c) => c.id === classData.id);

      if (currentClassData && currentClassData.quizzes) {
        setQuizzes(currentClassData.quizzes);
      } else {
        setQuizzes([]);
      }
    } else {
      setQuizzes([]);
    }
  };

  const handleDelete = (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      if (!currentClass) return;

      // Update class in classes array
      const classes = JSON.parse(localStorage.getItem("classes")) || [];
      const updatedClasses = classes.map((c) => {
        if (c.id === currentClass.id) {
          return {
            ...c,
            quizzes: c.quizzes.filter((q) => q.id !== quizId),
          };
        }
        return c;
      });
      localStorage.setItem("classes", JSON.stringify(updatedClasses));

      // Update local state
      setQuizzes(quizzes.filter((q) => q.id !== quizId));
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
            {!currentClass ? (
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
                  date={new Date(quiz.createdAt).toLocaleDateString()}
                  title={quiz.title}
                  due={quiz.dueDate}
                  possibleScore={quiz.possibleScore}
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
