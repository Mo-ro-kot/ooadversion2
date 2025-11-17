import { useNavigate } from "react-router-dom";

export default function StudentTopBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("currentStudent");
    navigate("/Student/login");
  };

  const student = JSON.parse(localStorage.getItem("currentStudent") || "{}");

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-xl border-b border-cyan-400/30 px-6 py-3">
      <div className="flex items-center">
        <button
          onClick={() => navigate("/Student/dashboard")}
          className="text-2xl font-bold text-white hover:text-cyan-100 transition"
        >
          Student Portal
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-white font-medium">
          {student.fullName || student.username}
        </span>
        <button
          onClick={() => navigate("/Student/profile")}
          className="w-8 h-8 rounded-full bg-white/20 flex justify-center items-center cursor-pointer hover:bg-white/30 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20"
            width="20"
            fill="white"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0 2c-2.673 0-8 1.337-8 4v2h16v-2c0-2.663-5.327-4-8-4z" />
          </svg>
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-white text-cyan-600 text-sm rounded-lg hover:bg-cyan-50 transition font-semibold"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
