import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, BASE_URL } from "../../lib/apiClient";
import StudentTopBar from "../../Component/Student/StudentTopBar";
import StudentSideNav from "../../Component/Student/StudentSideNav";

export default function StudentAssignment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { assignment: assignmentIn, classData } = location.state || {};
  const [assignment, setAssignment] = useState(assignmentIn || null);
  const [student, setStudent] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const currentStudent = JSON.parse(localStorage.getItem("currentStudent"));
    const token = localStorage.getItem("token");
    if (!currentStudent || !token) {
      navigate("/Student/login");
      return;
    }
    setStudent(currentStudent);
  }, [navigate]);

  useEffect(() => {
    (async () => {
      try {
        if (assignmentIn?.id) {
          const fresh = await api.getAssignment(assignmentIn.id);
          setAssignment(fresh);
          const sub = await api.myAssignmentSubmission(assignmentIn.id);
          if (sub) {
            setSubmission(sub);
            setSubmissionText(sub.text_answer || "");
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [assignmentIn?.id]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionText.trim() && !file) {
      alert("Please provide your work");
      return;
    }
    try {
      let upload = null;
      if (file) upload = await api.uploadFile(file);
      const payload = {
        text_answer: submissionText || null,
        file_url: upload?.file_url || null,
        file_name: upload?.file_name || null,
      };
      const res = await api.submitAssignment(assignment.id, payload);
      setSubmission(res);
      alert("Assignment submitted successfully!");
    } catch (err) {
      alert(err.message || "Submission failed");
    }
  };

  if (!assignment || !classData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No assignment data found.</p>
      </div>
    );
  }

  const isOverdue = assignment?.due_at
    ? new Date() > new Date(assignment.due_at)
    : false;
  const isGraded =
    submission && submission.grade !== null && submission.grade !== undefined;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentTopBar />
      <div className="flex flex-1 overflow-hidden">
        <StudentSideNav />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() =>
                navigate("/Student/class", { state: { classData } })
              }
              className="text-cyan-600 hover:text-cyan-700 mb-6 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Class
            </button>

            {/* Assignment Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {assignment.title}
              </h1>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <span
                    className={`ml-2 font-semibold ${
                      isOverdue && !submission
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {assignment.due_at
                      ? new Date(assignment.due_at).toLocaleString()
                      : "-"}
                  </span>
                </div>
                {/* Points not tracked in backend; omit */}
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Instructions:
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {assignment.description}
                </p>
              </div>
              {assignment.file_name && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Attached File:
                  </h3>
                  <div className="flex items-center gap-2 bg-cyan-50 p-3 rounded-lg border border-cyan-200">
                    <svg
                      className="w-5 h-5 text-cyan-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    <a
                      href={`${BASE_URL}${assignment.file_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-cyan-700 hover:underline"
                    >
                      {assignment.file_name}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Grade Display (if graded) */}
            {isGraded && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Your Grade
                </h2>
                <div className="flex items-center gap-6 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="text-3xl font-bold text-cyan-600">
                      {submission.grade}
                    </p>
                  </div>
                </div>
                {submission.feedback && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Feedback:
                    </p>
                    <p className="text-gray-700 bg-white p-4 rounded-lg border">
                      {submission.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Submission Form */}
            {!isGraded && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {submission ? "Update Your Submission" : "Submit Your Work"}
                </h2>

                {isOverdue && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-800 font-semibold">
                      ⚠️ This assignment is overdue
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="submissionText"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Your Answer
                    </label>
                    <textarea
                      id="submissionText"
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition resize-none"
                      placeholder="Type your answer here..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Attach File (Optional)
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition"
                    />
                    {file && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {file.name}
                      </p>
                    )}
                    {submission?.file_name && !file && (
                      <p className="text-sm text-gray-600 mt-2">
                        Previously submitted: {submission.file_name}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/Student/class", { state: { classData } })
                      }
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-300 transition"
                    >
                      {submission ? "Update Submission" : "Submit Assignment"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* View Submitted Work (if graded) */}
            {isGraded && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Your Submitted Work
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {submission.text_answer || "No text submitted"}
                  </p>
                  {submission.file_name && (
                    <p className="text-sm text-gray-600 mt-4">
                      File: {submission.file_name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
