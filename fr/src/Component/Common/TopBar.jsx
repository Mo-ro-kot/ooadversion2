import { useNavigate } from "react-router-dom";

export default function TopBar({ role = "student" }) {
  const navigate = useNavigate();

  // Role-specific configuration
  const roleConfig = {
    admin: {
      title: "Admin Panel",
      storageKey: "currentAdmin",
      loginPath: "/Admin/login",
      dashboardPath: "/Admin/dashboard",
      profilePath: "/Admin/profile",
      gradient: "bg-white",
      borderColor: "border-purple-200",
      titleColor: "text-purple-600 hover:text-purple-700",
      iconBg: "bg-purple-100 hover:bg-purple-200",
      iconFill: "#9333ea",
      logoutBg: "bg-red-600 hover:bg-red-700",
      logoutText: "text-white",
      textColor: "text-gray-600",
    },
    teacher: {
      title: "Teacher Portal",
      storageKey: "currentTeacher",
      loginPath: "/Teacher/login",
      dashboardPath: "/Teacher/homePage",
      profilePath: "/Teacher/profile",
      gradient: "bg-white",
      borderColor: "border-blue-200",
      titleColor: "text-blue-600 hover:text-blue-700",
      iconBg: "bg-blue-200 hover:bg-blue-300",
      iconFill: "#1b7fed",
      logoutBg: "bg-blue-600 hover:bg-blue-700",
      logoutText: "text-white",
      textColor: "text-gray-600",
    },
    student: {
      title: "Student Portal",
      storageKey: "currentStudent",
      loginPath: "/Student/login",
      dashboardPath: "/Student/dashboard",
      profilePath: "/Student/profile",
      gradient: "bg-gradient-to-r from-cyan-500 to-cyan-600",
      borderColor: "border-cyan-400/30",
      titleColor: "text-white hover:text-cyan-100",
      iconBg: "bg-white/20 hover:bg-white/30",
      iconFill: "white",
      logoutBg: "bg-white hover:bg-cyan-50",
      logoutText: "text-cyan-600",
      textColor: "text-white font-medium",
    },
  };

  const config = roleConfig[role] || roleConfig.student;

  const handleLogout = () => {
    localStorage.removeItem(config.storageKey);
    navigate(config.loginPath);
  };

  const user = JSON.parse(localStorage.getItem(config.storageKey) || "{}");

  return (
    <header
      className={`sticky top-0 z-50 flex justify-between items-center p-4 border-b ${config.borderColor} ${config.gradient} shadow-sm`}
    >
      <div className="flex items-center">
        <button
          onClick={() => navigate(config.dashboardPath)}
          className={`text-2xl font-bold ${config.titleColor} transition`}
        >
          {config.title}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span className={`text-sm ${config.textColor}`}>
          {user.fullName || user.full_name || user.username}
        </span>
        <button
          onClick={() => navigate(config.profilePath)}
          className={`w-8 h-8 rounded-full ${config.iconBg} flex justify-center items-center cursor-pointer transition`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20"
            width="20"
            fill={config.iconFill}
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0 2c-2.673 0-8 1.337-8 4v2h16v-2c0-2.663-5.327-4-8-4z" />
          </svg>
        </button>
        <button
          onClick={handleLogout}
          className={`px-4 py-2 ${config.logoutBg} ${config.logoutText} text-sm rounded-lg transition font-semibold`}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
