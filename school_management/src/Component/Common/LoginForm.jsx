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
      gradient: "from-purple-50 to-indigo-100",
      color: "purple",
      hoverShadow: "hover:shadow-indigo-300/50",
      dashboardPath: "/Admin/dashboard",
      registerFn: api.registerAdmin,
      showRegister: true,
    },
    teacher: {
      title: "Teacher",
      gradient: "from-blue-50 to-indigo-100",
      color: "indigo",
      hoverShadow: "hover:shadow-indigo-300/50",
      dashboardPath: "/Teacher/homePage",
      registerFn: null,
      showRegister: false,
    },
    student: {
      title: "Student",
      gradient: "from-cyan-50 to-cyan-100",
      color: "cyan",
      hoverShadow: "hover:shadow-emerald-300/50",
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
      { name: "admin", path: "/Admin/login", label: "Admin" },
    ];
    return roles.filter((r) => r.name !== role);
  };

  const getRoleColor = (roleName) => {
    return roleConfig[roleName]?.color || "blue";
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${config.gradient} flex items-center justify-center p-4`}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transition duration-300 ${config.hoverShadow}`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            {config.title} {isLogin ? "Login" : "Sign Up"}
          </h1>
          <p className="text-gray-500">
            {isLogin
              ? "Welcome back! Please sign in to your account"
              : "Create a new admin account"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent outline-none transition`}
              placeholder="Enter your username"
            />
          </div>

          {!isLogin && (
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent outline-none transition`}
                placeholder="admin@example.com"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent outline-none transition`}
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent outline-none transition`}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${config.color}-500 focus:border-transparent outline-none transition`}
                  placeholder="Confirm your password"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className={`w-full px-6 py-3 bg-${config.color}-600 text-white rounded-lg text-lg font-bold hover:bg-${config.color}-700 focus:ring-4 focus:ring-${config.color}-500/50 transition`}
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* Toggle Login/Signup for Admin */}
        {config.showRegister && (
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
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
                className={`ml-2 text-${config.color}-600 font-semibold hover:text-${config.color}-700 transition`}
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        )}

        {/* Other Role Links */}
        <div className="mt-6 text-center space-y-2">
          {getOtherRoles().map((otherRole) => (
            <p key={otherRole.name} className="text-gray-600 text-sm">
              Are you a {otherRole.label.toLowerCase()}?
              <button
                onClick={() => navigate(otherRole.path)}
                className={`ml-2 text-${getRoleColor(
                  otherRole.name
                )}-600 font-semibold hover:text-${getRoleColor(
                  otherRole.name
                )}-700 transition`}
              >
                Login here
              </button>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
