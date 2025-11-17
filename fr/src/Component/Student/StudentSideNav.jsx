import { useNavigate, useLocation } from "react-router-dom";

const NavItem = ({ icon, label, isActive = false }) => {
  const baseClasses =
    "flex items-center space-x-3 p-3 rounded-lg font-medium transition duration-150 cursor-pointer";
  const activeClasses = "bg-cyan-100 text-cyan-800";
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
      case "classes":
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"
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

export default function StudentSideNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="w-60 overflow-y-auto bg-white p-4 space-y-4 border-r border-gray-200 hidden md:block">
      <button onClick={() => navigate("/Student/dashboard")} className="w-full">
        <NavItem
          icon="dashboard"
          label="My Classes"
          isActive={location.pathname === "/Student/dashboard"}
        />
      </button>
    </nav>
  );
}
