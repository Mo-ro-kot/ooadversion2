import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../lib/apiClient";
import TeacherTopBar from "../../Component/Teacher/TeacherTopBar";
import TeacherSideNav from "../../Component/Teacher/TeacherSideNav";

export default function AddAssignment() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialClassId = location.state?.classId;

  const [selectedClassId, setSelectedClassId] = useState(initialClassId || "");
  const [classes, setClasses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [possibleScore, setPossibleScore] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.getClasses();
        setClasses(list);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassId) {
      alert("Please select a class for this assignment.");
      return;
    }
    try {
      let upload = null;
      if (file) {
        upload = await api.uploadFile(file);
      }
      const due_at = `${dueDate}T${dueTime}:00`;
      await api.createAssignment(selectedClassId, {
        title,
        description,
        due_at,
        possible_score: Number(possibleScore),
        file_url: upload?.file_url || null,
        file_name: upload?.file_name || null,
      });
      alert("Assignment created");
      if (initialClassId) {
        const cls = (await api.getClasses()).find(
          (c) => c.id === Number(selectedClassId)
        );
        navigate("/Teacher/general", { state: { classData: cls } });
      } else {
        navigate("/Teacher/assignment");
      }
    } catch (err) {
      alert(err.message || "Failed to create assignment");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TeacherTopBar />
      <div className="flex flex-1 overflow-hidden">
        <TeacherSideNav />
        <main className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
          <div className="bg-blue-200 h-12 font-bold flex items-center px-5 border-b-2 border-blue-300">
            Create New Assignment
          </div>

          <div className="flex-1 p-6">
            <form
              onSubmit={handleSubmit}
              className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 space-y-6"
            >
              {/* Class Selection - only show if not coming from class page */}
              {!initialClassId && (
                <div>
                  <label
                    htmlFor="class"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Select Class *
                  </label>
                  <select
                    id="class"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">-- Select a class --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Class Name Display - show if coming from class page */}
              {initialClassId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">
                    Adding assignment to:
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {classes.find((c) => c.id === initialClassId)?.name ||
                      "Selected Class"}
                  </p>
                </div>
              )}

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Assignment Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="Enter assignment title"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Enter assignment description and instructions"
                />
              </div>

              {/* Due Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dueTime"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Due Time
                  </label>
                  <input
                    type="time"
                    id="dueTime"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Possible Score */}
              <div>
                <label
                  htmlFor="possibleScore"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Possible Score (Points)
                </label>
                <input
                  type="number"
                  id="possibleScore"
                  value={possibleScore}
                  onChange={(e) => setPossibleScore(e.target.value)}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., 100"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Attach File (Optional)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-2 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, or images (MAX. 10MB)
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>
                {file && (
                  <div className="mt-3 text-sm text-gray-700 bg-blue-50 px-4 py-2 rounded-lg flex items-center justify-between">
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/Teacher/assignment")}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
