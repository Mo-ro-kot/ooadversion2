import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import TeacherTopBar from "../../Component/Teacher/TeacherTopBar";
import AdminTopBar from "../../Component/Admin/AdminTopBar";
import StudentTopBar from "../../Component/Student/StudentTopBar";
import { api } from "../../lib/apiClient";

const ProfilePage = ({ role = "teacher" }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "",
    phone: "",
  });
  const [userRole, setUserRole] = useState(role);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const user = await api.me();
      setUserId(user.id);
      setUserRole(user.role || role);
      setFormData({
        fullName: user.full_name || "",
        email: user.email || "",
        gender: user.gender || "",
        phone: user.phone || "",
      });
    } catch (error) {
      console.error("Failed to load user profile:", error);
      alert("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      await api.updateMe({
        full_name: formData.fullName,
        email: formData.email,
        gender: formData.gender,
        phone: formData.phone,
      });

      alert("Profile updated successfully!");
      setIsModalOpen(false);

      // Reload profile data to reflect changes
      await loadUserProfile();
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert(error.message || "Failed to update profile. Please try again.");
    }
  };

  // Theme colors based on role
  const themes = {
    teacher: {
      gradient: "from-blue-50 to-indigo-50",
      button: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300",
      ring: "focus:ring-indigo-500",
    },
    admin: {
      gradient: "from-purple-50 to-violet-50",
      button: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-300",
      ring: "focus:ring-purple-500",
    },
    student: {
      gradient: "from-cyan-50 to-teal-50",
      button: "bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-300",
      ring: "focus:ring-cyan-500",
    },
  };

  const theme = themes[userRole] || themes.teacher;

  const TopBar =
    userRole === "admin"
      ? AdminTopBar
      : userRole === "student"
      ? StudentTopBar
      : TeacherTopBar;
  const backPath =
    userRole === "admin"
      ? "/Admin/dashboard"
      : userRole === "student"
      ? "/Student/dashboard"
      : "/Teacher/homePage";
  const roleLabel = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  if (loading) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient}`}>
      {/* Header */}
      <TopBar />
      <button
        onClick={() => {
          navigate(backPath);
        }}
        className="w-7 h-7 ml-10"
      >
        <svg
          fill="#000000"
          viewBox="0 0 52 52"
          data-name="Layer 1"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path d="M50,24H6.83L27.41,3.41a2,2,0,0,0,0-2.82,2,2,0,0,0-2.82,0l-24,24a1.79,1.79,0,0,0-.25.31A1.19,1.19,0,0,0,.25,25c0,.07-.07.13-.1.2l-.06.2a.84.84,0,0,0,0,.17,2,2,0,0,0,0,.78.84.84,0,0,0,0,.17l.06.2c0,.07.07.13.1.2a1.19,1.19,0,0,0,.09.15,1.79,1.79,0,0,0,.25.31l24,24a2,2,0,1,0,2.82-2.82L6.83,28H50a2,2,0,0,0,0-4Z"></path>
          </g>
        </svg>
      </button>

      {/* Profile Card */}
      <main className=" max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 relative">
          {/* Profile Picture */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&auto=format&fit=crop&w=128&q=80"
                alt="Pory Morokot"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Name and Role */}
          <div className="text-center mt-20 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {formData.fullName.toUpperCase() || "USER NAME"}
            </h1>
            <p className="text-gray-600 text-lg">{roleLabel}</p>
          </div>

          {/* Form Fields */}
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Email */}
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
                value={formData.email}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Gender
              </label>
              <input
                type="text"
                id="gender"
                value={formData.gender}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                value={formData.phone}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </form>

          {/* Edit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className={`${theme.button} text-white px-6 py-2 rounded-lg font-semibold shadow-md transition focus:ring-4`}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0  flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition"
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

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="modal-fullName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="modal-fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${theme.ring} focus:border-transparent outline-none transition`}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="modal-email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="modal-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${theme.ring} focus:border-transparent outline-none transition`}
                />
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="modal-gender"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Gender
                </label>
                <select
                  id="modal-gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${theme.ring} focus:border-transparent outline-none transition`}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="modal-phone"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="modal-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${theme.ring} focus:border-transparent outline-none transition`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 ${theme.button} text-white rounded-lg font-medium focus:ring-4 transition`}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
