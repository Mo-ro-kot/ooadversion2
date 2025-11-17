import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TeacherTopBar from "../../Component/Teacher/TeacherTopBar";
import TeacherSideNav from "../../Component/Teacher/TeacherSideNav";
import { api, BASE_URL } from "../../lib/apiClient";

export default function AssignmentResponses() {
  const location = useLocation();
  const navigate = useNavigate();
  const assignment = location.state?.assignment;
  const classId = location.state?.classId;

  // Load real student responses from backend
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assignment || !classId) return;
    loadSubmissions();
  }, [assignment, classId]);

  const loadSubmissions = async () => {
    if (!assignment?.id) return;
    try {
      setLoading(true);
      const submissions = await api.getAssignmentSubmissions(assignment.id);

      const studentResponses = submissions.map((sub) => ({
        id: sub.student_id,
        submissionId: sub.id,
        studentName: sub.full_name || sub.username,
        studentEmail: sub.email,
        submittedAt: sub.submitted_at,
        status: "Submitted",
        score: sub.grade,
        feedback: sub.feedback || "",
        submissionText: sub.text || "",
        submissionFile: sub.file_url,
        submissionFileName: sub.file_name,
      }));

      setResponses(studentResponses);
    } catch (e) {
      console.error("Failed to load submissions:", e);
      alert("Failed to load submissions: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const [viewingStudent, setViewingStudent] = useState(null);
  const [gradeScore, setGradeScore] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [activeTab, setActiveTab] = useState("toReturn"); // "toReturn" or "returned"

  const handleViewDetail = (response) => {
    setViewingStudent(response);
    setGradeScore(response.score || "");
    setGradeFeedback(response.feedback || "");
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();

    try {
      await api.gradeAssignmentSubmission(
        assignment.id,
        viewingStudent.submissionId,
        {
          grade: parseInt(gradeScore) || null,
          feedback: gradeFeedback || null,
        }
      );

      // Update local state
      setResponses(
        responses.map((r) =>
          r.id === viewingStudent.id
            ? { ...r, score: parseInt(gradeScore), feedback: gradeFeedback }
            : r
        )
      );
      // Update the viewing student with new data
      setViewingStudent({
        ...viewingStudent,
        score: parseInt(gradeScore),
        feedback: gradeFeedback,
      });

      alert("Grade submitted successfully!");
    } catch (err) {
      alert("Failed to submit grade: " + err.message);
    }
  };

  // Filter responses based on status and grading
  const submittedResponses = responses.filter((r) => r.status === "Submitted");
  const toReturnResponses = submittedResponses.filter((r) => r.score === null);
  const returnedResponses = submittedResponses.filter((r) => r.score !== null);

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No assignment data found.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TeacherTopBar />
        <div className="flex flex-1 overflow-hidden">
          <TeacherSideNav />
          <main className="flex-1 flex items-center justify-center">
            <p>Loading submissions...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TeacherTopBar />
      <div className="flex flex-1 overflow-hidden">
        <TeacherSideNav />
        <main className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
          <div className="bg-blue-200 h-12 font-bold flex items-center px-5 border-b-2 border-blue-300">
            Assignment Responses
          </div>

          <div className="flex-1 p-6">
            {/* Assignment Info */}
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {assignment.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-1">
                    Due: {assignment.dueDate}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Possible Score: {assignment.possibleScore} points
                  </p>
                  {assignment.description && (
                    <p className="text-sm text-gray-700 mt-2">
                      {assignment.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => navigate("/Teacher/assignment")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  ← Back
                </button>
              </div>
            </div>

            {/* Tabs for Submitted Sections */}
            <div className="max-w-6xl mx-auto mb-4">
              <div className="flex border-b border-gray-300">
                <button
                  onClick={() => setActiveTab("toReturn")}
                  className={`px-6 py-3 font-semibold ${
                    activeTab === "toReturn"
                      ? "border-b-2 border-indigo-600 text-indigo-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  To Return ({toReturnResponses.length})
                </button>
                <button
                  onClick={() => setActiveTab("returned")}
                  className={`px-6 py-3 font-semibold ${
                    activeTab === "returned"
                      ? "border-b-2 border-indigo-600 text-indigo-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Returned ({returnedResponses.length})
                </button>
              </div>
            </div>

            {/* Responses Table */}
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Submitted At
                    </th>
                    {activeTab === "returned" && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Score
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeTab === "toReturn" &&
                    toReturnResponses.map((response) => (
                      <tr key={response.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {response.studentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {response.studentEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {response.submittedAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button
                            onClick={() => handleViewDetail(response)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Detail
                          </button>
                        </td>
                      </tr>
                    ))}

                  {activeTab === "returned" &&
                    returnedResponses.map((response) => (
                      <tr key={response.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {response.studentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {response.studentEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {response.submittedAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-semibold">
                            {response.score}/{assignment.possibleScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button
                            onClick={() => handleViewDetail(response)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Detail
                          </button>
                        </td>
                      </tr>
                    ))}

                  {((activeTab === "toReturn" &&
                    toReturnResponses.length === 0) ||
                    (activeTab === "returned" &&
                      returnedResponses.length === 0)) && (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No{" "}
                        {activeTab === "toReturn"
                          ? "submissions to grade"
                          : "graded submissions"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* View Detail Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-200 px-6 py-4 flex items-center justify-between rounded-t-2xl sticky top-0">
              <h2 className="text-xl font-bold text-gray-900">
                Submission Details
              </h2>
              <button
                onClick={() => setViewingStudent(null)}
                className="text-gray-700 hover:text-gray-900 transition"
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

            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Student Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">
                      {viewingStudent.studentName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">
                      {viewingStudent.studentEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Submitted At</p>
                    <p className="font-medium text-gray-900">
                      {viewingStudent.submittedAt}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="font-medium text-gray-900">
                      {viewingStudent.score !== null
                        ? `${viewingStudent.score}/${assignment.possibleScore}`
                        : "Not graded yet"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Assignment Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Title</p>
                    <p className="font-medium text-gray-900">
                      {assignment.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-gray-900">
                      {assignment.description || "No description provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="text-gray-900">{assignment.dueDate}</p>
                  </div>
                </div>
              </div>

              {/* Submission */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Submitted Work
                </h3>
                {viewingStudent.submissionText && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-600 mb-2 font-semibold">
                      Text Submission:
                    </p>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {viewingStudent.submissionText}
                    </p>
                  </div>
                )}
                {viewingStudent.submissionFile ? (
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-10 h-10 text-gray-600"
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
                      <div>
                        <p className="font-medium text-gray-900">
                          {viewingStudent.submissionFileName ||
                            "Submitted file"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Submitted document
                        </p>
                      </div>
                    </div>
                    <a
                      href={`${BASE_URL}${viewingStudent.submissionFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Download
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500">No file submitted</p>
                )}
              </div>

              {/* Grade Section */}
              <form onSubmit={handleSubmitGrade} className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {viewingStudent.score !== null
                    ? "Edit Grade"
                    : "Grade Submission"}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="score"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Score (out of {assignment.possibleScore})
                    </label>
                    <input
                      type="number"
                      id="score"
                      value={gradeScore}
                      onChange={(e) => setGradeScore(e.target.value)}
                      required
                      min="0"
                      max={assignment.possibleScore}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="feedback"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Feedback (Optional)
                    </label>
                    <textarea
                      id="feedback"
                      value={gradeFeedback}
                      onChange={(e) => setGradeFeedback(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                      placeholder="Provide feedback to the student..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition"
                  >
                    {viewingStudent.score !== null
                      ? "Update Grade"
                      : "Submit Grade"}
                  </button>
                </div>
              </form>

              {/* Display Current Feedback (if graded) */}
              {viewingStudent.score !== null && viewingStudent.feedback && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Current Feedback
                  </h3>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-gray-900">{viewingStudent.feedback}</p>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setViewingStudent(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
