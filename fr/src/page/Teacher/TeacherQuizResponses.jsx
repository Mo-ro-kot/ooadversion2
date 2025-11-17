import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TeacherTopBar from "../../Component/Teacher/TeacherTopBar";
import TeacherSideNav from "../../Component/Teacher/TeacherSideNav";
import { api } from "../../lib/apiClient";

export default function QuizResponses() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialQuiz = location.state?.quiz;
  const classId = location.state?.classId;

  // Load real student quiz responses from backend
  const [quiz, setQuiz] = useState(initialQuiz);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialQuiz || !classId) return;
    loadQuizAndSubmissions();
  }, [initialQuiz, classId]);

  const loadQuizAndSubmissions = async () => {
    if (!initialQuiz?.id) return;
    try {
      setLoading(true);
      // Load quiz details with questions
      const quizDetails = await api.getQuiz(initialQuiz.id);
      setQuiz(quizDetails);

      // Load submissions
      const submissions = await api.getQuizSubmissions(initialQuiz.id);

      const studentResponses = submissions.map((sub) => ({
        id: sub.student_id,
        submissionId: sub.id,
        studentName: sub.full_name || sub.username,
        studentEmail: sub.email,
        submittedAt: sub.submitted_at,
        status: "Submitted",
        score: sub.score,
        feedback: sub.feedback || "",
        answers: [], // Quiz answers would need separate endpoint
      }));

      setResponses(studentResponses);
    } catch (e) {
      console.error("Failed to load quiz submissions:", e);
      alert("Failed to load submissions: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const [viewingStudent, setViewingStudent] = useState(null);
  const [gradeScore, setGradeScore] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [activeTab, setActiveTab] = useState("toReturn");

  const handleViewDetail = (response) => {
    setViewingStudent(response);
    setGradeScore(response.score || "");
    setGradeFeedback(response.feedback || "");
  };

  const handleSubmitGrade = (e) => {
    e.preventDefault();

    // Note: Quiz scores are auto-calculated on submission
    // This would only update feedback if backend supports it
    alert(
      "Quiz scores are automatically calculated. Feedback update not yet implemented."
    );

    // Update local state for display
    setResponses(
      responses.map((r) =>
        r.id === viewingStudent.id
          ? { ...r, score: parseInt(gradeScore), feedback: gradeFeedback }
          : r
      )
    );
    setViewingStudent({
      ...viewingStudent,
      score: parseInt(gradeScore),
      feedback: gradeFeedback,
    });
  };

  // Filter responses based on status and grading
  const submittedResponses = responses.filter((r) => r.status === "Submitted");
  const toReturnResponses = submittedResponses.filter((r) => r.score === null);
  const returnedResponses = submittedResponses.filter((r) => r.score !== null);

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No quiz data found.</p>
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
            <p>Loading quiz submissions...</p>
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
          <div className="bg-green-200 h-12 font-bold flex items-center px-5 border-b-2 border-green-300">
            Quiz Responses
          </div>

          <div className="flex-1 p-6">
            {/* Quiz Info */}
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {quiz.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-1">
                    Due: {quiz.dueDate}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Possible Score: {quiz.possibleScore} points
                  </p>
                  {quiz.questions && (
                    <p className="text-sm text-gray-600">
                      Questions: {quiz.questions.length}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => navigate("/Teacher/quiz")}
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
                      ? "border-b-2 border-green-600 text-green-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  To Return ({toReturnResponses.length})
                </button>
                <button
                  onClick={() => setActiveTab("returned")}
                  className={`px-6 py-3 font-semibold ${
                    activeTab === "returned"
                      ? "border-b-2 border-green-600 text-green-600"
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
                <thead className="bg-green-100">
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
                            className="text-green-600 hover:text-green-900"
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
                            {response.score}/{quiz.possibleScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button
                            onClick={() => handleViewDetail(response)}
                            className="text-green-600 hover:text-green-900"
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
                          ? "submissions to review"
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-green-200 px-6 py-4 flex items-center justify-between rounded-t-2xl sticky top-0">
              <h2 className="text-xl font-bold text-gray-900">
                Quiz Submission Details
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
                        ? `${viewingStudent.score}/${quiz.possibleScore}`
                        : "Not graded yet"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quiz Answers */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Quiz Answers
                </h3>
                <div className="space-y-4">
                  {quiz.questions.map((question, qIndex) => {
                    const studentAnswer = viewingStudent.answers.find(
                      (a) => a.questionId === question.id
                    );
                    const isCorrect =
                      studentAnswer?.selectedAnswer === question.correctAnswer;

                    return (
                      <div
                        key={question.id}
                        className={`p-4 rounded-lg border-2 ${
                          isCorrect
                            ? "bg-green-50 border-green-300"
                            : "bg-red-50 border-red-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-gray-800">
                            Question {qIndex + 1}: {question.question}
                          </p>
                          {isCorrect ? (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                              Correct
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                              Incorrect
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 mt-3">
                          {question.options.map((option, optIndex) => {
                            const isStudentAnswer =
                              studentAnswer?.selectedAnswer === optIndex;
                            const isCorrectAnswer =
                              optIndex === question.correctAnswer;

                            return (
                              <div
                                key={optIndex}
                                className={`p-2 rounded ${
                                  isCorrectAnswer
                                    ? "bg-green-200 font-semibold"
                                    : isStudentAnswer
                                    ? "bg-red-200"
                                    : "bg-white"
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {option}
                                {isCorrectAnswer && (
                                  <span className="ml-2 text-green-700">
                                    ✓ Correct Answer
                                  </span>
                                )}
                                {isStudentAnswer && !isCorrectAnswer && (
                                  <span className="ml-2 text-red-700">
                                    ✗ Student's Answer
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                      Score (out of {quiz.possibleScore})
                    </label>
                    <input
                      type="number"
                      id="score"
                      value={gradeScore}
                      onChange={(e) => setGradeScore(e.target.value)}
                      required
                      min="0"
                      max={quiz.possibleScore}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                      placeholder="Provide feedback to the student..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition"
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
