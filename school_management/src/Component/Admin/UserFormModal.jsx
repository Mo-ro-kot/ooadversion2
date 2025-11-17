export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  onGenerateCredentials,
  isEditing,
  userType, // "student" or "teacher"
}) {
  if (!isOpen) return null;

  const themeColors = {
    student: {
      header: "bg-purple-600",
      headerText: "text-white",
      headerSubtext: "text-purple-100",
      button: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-300",
      ring: "focus:ring-purple-500 focus:border-purple-500",
      accentBg: "bg-purple-50",
      accentText: "text-purple-700",
      generateBtn: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    },
    teacher: {
      header: "bg-blue-600",
      headerText: "text-white",
      headerSubtext: "text-blue-100",
      button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300",
      ring: "focus:ring-blue-500 focus:border-blue-500",
      accentBg: "bg-blue-50",
      accentText: "text-blue-700",
      generateBtn: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    },
  };

  const theme = themeColors[userType] || themeColors.student;
  const userLabel = userType.charAt(0).toUpperCase() + userType.slice(1);

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`${theme.header} px-6 py-4 flex items-center justify-between rounded-t-2xl sticky top-0`}
        >
          <div>
            <h2 className={`text-xl font-bold ${theme.headerText}`}>
              {isEditing ? `Edit ${userLabel}` : `Add New ${userLabel}`}
            </h2>
            <p className={`${theme.headerSubtext} text-sm mt-1`}>
              {isEditing
                ? `Update ${userType} information`
                : `Fill in the details to create a new ${userType} account`}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`${theme.headerText} hover:opacity-80 transition`}
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

        {/* Form */}
        <form onSubmit={onSubmit} className="p-8">
          {/* Personal Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
              📋 Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={onInputChange}
                  required
                  className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${theme.ring} outline-none transition`}
                  placeholder="e.g., John Smith"
                />
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={onInputChange}
                  required
                  className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${theme.ring} outline-none transition bg-white`}
                >
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={onInputChange}
                  required
                  className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${theme.ring} outline-none transition`}
                  placeholder="e.g., +1234567890"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={onInputChange}
                  required
                  className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${theme.ring} outline-none transition`}
                  placeholder={`${userType}@example.com`}
                />
              </div>
            </div>
          </div>

          {/* Account Credentials Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                🔐 Account Credentials
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={onGenerateCredentials}
                  className={`px-4 py-2 ${theme.generateBtn} rounded-lg text-sm font-semibold transition flex items-center gap-2`}
                >
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Auto-Generate
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={onInputChange}
                  required
                  className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${theme.ring} outline-none transition font-mono`}
                  placeholder={`${userType}_username`}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={onInputChange}
                  required
                  className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${theme.ring} outline-none transition font-mono`}
                  placeholder="Enter password"
                />
              </div>
            </div>
            {!isEditing && (
              <p
                className={`mt-3 text-sm text-gray-500 ${theme.accentBg} p-3 rounded-lg`}
              >
                💡 <strong>Tip:</strong> Use the Auto-Generate button to create
                secure credentials automatically.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-8 py-3 ${theme.button} text-white rounded-lg font-semibold focus:ring-4 transition shadow-lg`}
            >
              {isEditing ? `Update ${userLabel}` : `Create ${userLabel}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
