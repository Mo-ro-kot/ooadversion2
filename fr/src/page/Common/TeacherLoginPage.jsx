import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/apiClient";
import { saveAuth } from "../../lib/auth";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token, role, user } = await api.login(username, password);
      if (role !== "teacher") {
        alert("Please use a teacher account to login here.");
        return;
      }
      saveAuth({ token, role, user });
      navigate("/Teacher/homePage");
    } catch (err) {
      alert(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transition duration-300 hover:shadow-indigo-300/50">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150"
              placeholder="Enter your username"
              aria-label="Username"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150"
              placeholder="••••••••"
              aria-label="Password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg text-lg font-bold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/50 focus:outline-none transition duration-150"
          >
            Sign In
          </button>
        </form>

        {/* Admin Login Link */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600 text-sm">
            Are you a student?
            <button
              onClick={() => navigate("/Student/login")}
              className="ml-2 text-green-600 font-semibold hover:text-green-700 transition"
            >
              Login here
            </button>
          </p>
          <p className="text-gray-600 text-sm">
            Are you an admin?
            <button
              onClick={() => navigate("/Admin/login")}
              className="ml-2 text-indigo-600 font-semibold hover:text-indigo-700 transition"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
