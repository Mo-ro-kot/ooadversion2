import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/apiClient";
import { saveAuth } from "../../lib/auth";

export default function LoginForm({ role = "student" }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
  });

  // Role-specific configuration
  const roleConfig = {
    admin: {
      title: "Admin",
      gradient: "from-purple-600 via-indigo-600 to-purple-700",
      bgPattern: "from-purple-50 via-indigo-50 to-purple-100",
      color: "purple",
      icon: "👑",
      dashboardPath: "/Admin/dashboard",
      registerFn: api.registerAdmin,
      showRegister: true,
    },
    teacher: {
      title: "Teacher",
      gradient: "from-blue-600 via-indigo-600 to-blue-700",
      bgPattern: "from-blue-50 via-indigo-50 to-blue-100",
      color: "indigo",
      icon: "📚",
      dashboardPath: "/Teacher/homePage",
      registerFn: null,
      showRegister: false,
    },
    student: {
      title: "Student",
      gradient: "from-cyan-600 via-teal-600 to-cyan-700",
      bgPattern: "from-cyan-50 via-teal-50 to-cyan-100",
      color: "cyan",
      icon: "🎓",
      dashboardPath: "/Student/dashboard",
      registerFn: null,
      showRegister: false,
    },
  };

  const config = roleConfig[role] || roleConfig.student;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const {
          token,
          role: userRole,
          user,
        } = await api.login(formData.username, formData.password);

        // Validate role for non-admin logins
        if (role !== "admin" && userRole !== role) {
          alert(`Please use a ${role} account to login here.`);
          return;
        }

        saveAuth({ token, role: userRole, user });
        navigate(config.dashboardPath);
      } else {
        // Registration (only for admin)
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match");
          return;
        }
        if (!formData.username.trim()) {
          alert("Username is required");
          return;
        }
        if (!formData.full_name.trim()) {
          alert("Full name is required");
          return;
        }

        const {
          token,
          role: userRole,
          user,
        } = await config.registerFn(formData.email, formData.password, {
          username: formData.username.trim(),
          full_name: formData.full_name.trim(),
        });
        saveAuth({ token, role: userRole, user });
        navigate(config.dashboardPath);
      }
    } catch (err) {
      alert(err.message || "Request failed");
    }
  };

  const getOtherRoles = () => {
    const roles = [
      { name: "student", path: "/Student/login", label: "Student" },
      { name: "teacher", path: "/Teacher/login", label: "Teacher" },
    ];
    return roles.filter((r) => r.name !== role);
  };

  const getRoleColor = (roleName) => {
    return roleConfig[roleName]?.color || "blue";
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${config.bgPattern} flex items-center justify-center p-4 relative overflow-hidden`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br ${config.gradient} rounded-full opacity-20 blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br ${config.gradient} rounded-full opacity-20 blur-3xl animate-pulse`}
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 relative z-10 border border-white/20">
        {/* Header with Icon */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${config.gradient} shadow-lg mb-4`}
          >
            <span className="text-4xl">{config.icon}</span>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            {config.title} {isLogin ? "Portal" : "Registration"}
          </h1>
          <p className="text-gray-600 text-sm">
            {isLogin
              ? "Welcome back! Sign in to continue"
              : "Create your admin account"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
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
                Username
              </span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-offset-2 focus:ring-current focus:border-transparent outline-none transition-all duration-200 hover:border-gray-300"
              placeholder="Enter your username"
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Email
                </span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-offset-2 focus:ring-current focus:border-transparent outline-none transition-all duration-200 hover:border-gray-300"
                placeholder="admin@example.com"
              />
            </div>
          )}

          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Password
              </span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-offset-2 focus:ring-current focus:border-transparent outline-none transition-all duration-200 hover:border-gray-300"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <>
              <div className="relative">
                <label
                  htmlFor="full_name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Full Name
                  </span>
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-offset-2 focus:ring-current focus:border-transparent outline-none transition-all duration-200 hover:border-gray-300"
                  placeholder="John Doe"
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Confirm Password
                  </span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-offset-2 focus:ring-current focus:border-transparent outline-none transition-all duration-200 hover:border-gray-300"
                  placeholder="Confirm your password"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className={`w-full px-6 py-4 bg-gradient-to-r ${config.gradient} text-white rounded-xl text-lg font-bold hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 mt-6`}
          >
            {isLogin ? "Sign In →" : "Create Account →"}
          </button>
        </form>

        {/* Toggle Login/Signup for Admin */}
        {config.showRegister && (
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({
                    username: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    full_name: "",
                  });
                }}
                className={`ml-2 bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent font-bold hover:underline transition`}
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        )}

        {/* Other Role Links */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500 mb-3 font-semibold">
            SWITCH PORTAL
          </p>
          <div className="flex gap-3 justify-center">
            {getOtherRoles().map((otherRole) => (
              <button
                key={otherRole.name}
                type="button"
                onClick={() => navigate(otherRole.path)}
                className={`flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-200 hover:border-${getRoleColor(
                  otherRole.name
                )}-400 bg-white hover:bg-gradient-to-r hover:${
                  roleConfig[otherRole.name]?.gradient
                } hover:text-white transition-all duration-200 text-sm font-semibold text-gray-700`}
              >
                <span className="block text-lg mb-1">
                  {roleConfig[otherRole.name]?.icon}
                </span>
                {otherRole.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
