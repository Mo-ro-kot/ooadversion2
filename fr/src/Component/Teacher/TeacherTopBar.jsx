import { useNavigate } from "react-router-dom";

export default function TeacherTopBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("currentTeacher");
    navigate("/Teacher/login");
  };

  const teacher = JSON.parse(localStorage.getItem("currentTeacher") || "{}");

  return (
    <>
      <header className="sticky top-0 z-50 flex justify-between items-center p-4 border-b border-blue-200 bg-white shadow-sm">
        <button
          onClick={() => {
            navigate("/Teacher/homePage");
          }}
          className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition"
        >
          Teacher Portal
        </button>
        <input
          type="text"
          placeholder="Search for class"
          className="ml-20 w-96 h-10 rounded-full border-2 border-blue-300 px-4 text-sm focus:outline-none focus:border-blue-500 transition duration-150"
        />
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {teacher.fullName || teacher.username}
          </span>
          <button
            onClick={() => {
              navigate("/Teacher/profile");
            }}
            className="w-8 h-8 rounded-full bg-blue-200 flex justify-center items-center cursor-pointer hover:bg-blue-300 transition duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              width="20"
              fill="#1b7fed"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0 2c-2.673 0-8 1.337-8 4v2h16v-2c0-2.663-5.327-4-8-4z" />
            </svg>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Logout
          </button>
        </div>
      </header>
    </>
  );
}
