import { useNavigate } from "react-router-dom";

export default function AdminTopBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("currentAdmin");
    navigate("/Admin/login");
  };

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center p-4 border-b border-purple-200 bg-white shadow-sm">
      <div className="flex items-center">
        <button
          onClick={() => navigate("/Admin/dashboard")}
          className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition"
        >
          Admin Panel
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {JSON.parse(localStorage.getItem("currentAdmin") || "{}")?.username}
        </span>
        <button
          onClick={() => navigate("/Admin/profile")}
          className="w-8 h-8 rounded-full bg-purple-100 flex justify-center items-center cursor-pointer hover:bg-purple-200 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20"
            width="20"
            fill="#9333ea"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0 2c-2.673 0-8 1.337-8 4v2h16v-2c0-2.663-5.327-4-8-4z" />
          </svg>
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
