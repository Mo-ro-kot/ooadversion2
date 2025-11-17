import TeacherTopBar from "../../Component/Teacher/TeacherTopBar";
import TeacherSideNav from "../../Component/Teacher/TeacherSideNav";
import TeacherAssignmentCard from "../../Component/Teacher/TeacherAsssignmentCard";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Assignment() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = () => {
    // Get current class from localStorage
    const savedClass = localStorage.getItem("currentTeacherClass");
    if (savedClass) {
      const classData = JSON.parse(savedClass);
      setCurrentClass(classData);

      // Load fresh class data from classes array
      const classes = JSON.parse(localStorage.getItem("classes")) || [];
      const currentClassData = classes.find((c) => c.id === classData.id);

      if (currentClassData && currentClassData.assignments) {
        setAssignments(currentClassData.assignments);
      } else {
        setAssignments([]);
      }
    } else {
      setAssignments([]);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      if (!currentClass) return;

      // Update class in classes array
      const classes = JSON.parse(localStorage.getItem("classes")) || [];
      const updatedClasses = classes.map((c) => {
        if (c.id === currentClass.id) {
          return {
            ...c,
            assignments: c.assignments.filter((a) => a.id !== id),
          };
        }
        return c;
      });
      localStorage.setItem("classes", JSON.stringify(updatedClasses));

      // Update local state
      setAssignments(assignments.filter((a) => a.id !== id));
    }
  };

  const handleViewResponses = (assignment) => {
    navigate("/Teacher/assignment-responses", {
      state: { assignment, classId: currentClass?.id },
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TeacherTopBar></TeacherTopBar>
      <div className="flex flex-1 overflow-hidden">
        <TeacherSideNav></TeacherSideNav>
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="bg-blue-200 h-12 font-bold flex items-center px-5 border-b-2 border-blue-300">
            Assignment
          </div>
          <div className="flex justify-end mr-10">
            {" "}
            <button
              onClick={() => {
                navigate("/Teacher/addAssignment");
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
            ) : assignments.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No assignments yet. Click ADD to create one.
              </div>
            ) : (
              assignments.map((assignment) => (
                <TeacherAssignmentCard
                  key={assignment.id}
                  date={assignment.createdAt}
                  title={assignment.title}
                  due={assignment.dueDate}
                  possibleScore={assignment.possibleScore}
                  onDelete={() => handleDelete(assignment.id)}
                  onViewResponses={() => handleViewResponses(assignment)}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
