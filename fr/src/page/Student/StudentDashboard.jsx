import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/apiClient";
import StudentTopBar from "../../Component/Student/StudentTopBar";
import StudentSideNav from "../../Component/Student/StudentSideNav";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    const currentStudent = JSON.parse(localStorage.getItem("currentStudent"));
    const token = localStorage.getItem("token");
    if (!currentStudent || !token) {
      navigate("/Student/login");
      return;
    }
    setStudent(currentStudent);
    (async () => {
      try {
        const classes = await api.getClasses();
        setEnrolledClasses(classes);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [navigate]);

  const handleJoinClass = async () => {
    if (!joinCode.trim()) {
      alert("Please enter a class code");
      return;
    }
    try {
      await api.joinClass(joinCode.trim());
      const classes = await api.getClasses();
      setEnrolledClasses(classes);
      setJoinCode("");
      setShowJoinModal(false);
      alert("Successfully joined class!");
    } catch (e) {
      alert(e.message || "Failed to join class");
    }
  };

  const handleClassClick = (classData) => {
    navigate("/Student/class", { state: { classData } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentTopBar />
      <div className="flex flex-1 overflow-hidden">
        <StudentSideNav />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition flex items-center gap-2"
              >
                + Join Class
              </button>
            </div>

            {/* Classes Grid */}
            {enrolledClasses.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  No Classes Yet
                </h2>
                <p className="text-gray-500 mb-4">
                  Get started by joining a class with a class code from your
                  teacher
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledClasses.map((classData) => (
                  <div
                    key={classData.id}
                    onClick={() => handleClassClick(classData)}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-6">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {classData.name}
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Created:{" "}
                        {classData.created_at
                          ? new Date(classData.created_at).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-green-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Join a Class</h2>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinCode("");
                }}
                className="text-gray-700 hover:text-gray-900 transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label
                  htmlFor="joinCode"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Class Code
                </label>
                <input
                  type="text"
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="Enter class code from teacher"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Ask your teacher for the class code
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode("");
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinClass}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition"
                >
                  Join Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
