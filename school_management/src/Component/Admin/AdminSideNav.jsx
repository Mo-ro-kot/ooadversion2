import { useNavigate, useLocation } from "react-router-dom";

const NavItem = ({ icon, label, isActive = false }) => {
  const baseClasses =
    "flex items-center space-x-3 p-3 rounded-lg font-medium transition duration-150 cursor-pointer";
  const activeClasses = "bg-purple-200 text-purple-800";
  const inactiveClasses = "text-gray-600 hover:bg-gray-100";

  const getIcon = (type) => {
    switch (type) {
      case "dashboard":
        return (
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
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        );
      case "students":
        return (
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        );
      case "teachers":
        return (
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {getIcon(icon)}
      <span>{label}</span>
    </div>
  );
};

export default function AdminSideNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="w-60 overflow-y-auto bg-white p-4 space-y-4 border-r border-gray-200 hidden md:block">
      <button onClick={() => navigate("/Admin/dashboard")} className="w-full">
        <NavItem
          icon="dashboard"
          label="Dashboard"
          isActive={location.pathname === "/Admin/dashboard"}
        />
      </button>

      <button onClick={() => navigate("/Admin/students")} className="w-full">
        <NavItem
          icon="students"
          label="Students"
          isActive={location.pathname === "/Admin/students"}
        />
      </button>

      <button onClick={() => navigate("/Admin/teachers")} className="w-full">
        <NavItem
          icon="teachers"
          label="Teachers"
          isActive={location.pathname === "/Admin/teachers"}
        />
      </button>
    </nav>
  );
}
