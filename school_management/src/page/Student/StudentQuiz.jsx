import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../lib/apiClient";
import StudentTopBar from "../../Component/Student/StudentTopBar";
import StudentSideNav from "../../Component/Student/StudentSideNav";

export default function StudentQuiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const { quiz: quizIn, classData } = location.state || {};
  const [quiz, setQuiz] = useState(quizIn || null);
  const [student, setStudent] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        if (quizIn?.id) {
          const full = await api.getQuiz(quizIn.id);
          // transform questions/options to fit UI
          setQuiz({
            ...full,
            questions: (full.questions || []).map((q) => ({
              ...q,
              question: q.text,
              optionsData: q.options || [], // Keep full option data with IDs
              options: (q.options || []).map((o) => o.text),
              correctAnswer: (q.options || []).findIndex((o) => o.is_correct),
            })),
            possibleScore: (full.questions || []).reduce(
              (s, q) => s + (q.points || 1),
              0
            ),
            dueDate: full.due_at,
          });
          const sub = await api.myQuizSubmission(quizIn.id);
          if (sub) {
            setSubmission(sub);
            const answerMap = {};
            // Convert option IDs to indices for UI
            (sub.answers || []).forEach((ans) => {
              const question = full.questions.find(
                (q) => q.id === ans.question_id
              );
              if (question) {
                const optionIndex = question.options.findIndex(
                  (o) => o.id === ans.selected_option_id
                );
                answerMap[ans.question_id] =
                  optionIndex !== -1 ? optionIndex : null;
              }
            });
            setAnswers(answerMap);
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [quizIn?.id]);

  const handleAnswerChange = (questionId, answerIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Convert indices to option IDs
      const answersPayload = (quiz.questions || []).map((q) => {
        const answerIndex = answers[q.id];
        const optionId =
          answerIndex !== null && answerIndex !== undefined
            ? q.optionsData[answerIndex]?.id
            : null;
        return {
          question_id: q.id,
          selected_option_id: optionId ?? null,
        };
      });
      const res = await api.submitQuiz(quiz.id, { answers: answersPayload });
      setSubmission(res);
      alert(`Quiz submitted! Your score: ${res.score}`);
      // Optionally refetch quiz or submission details
    } catch (err) {
      alert(err.message || "Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quiz || !classData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No quiz data found.</p>
      </div>
    );
  }

  const isOverdue = quiz?.dueDate ? new Date() > new Date(quiz.dueDate) : false;
  const isGraded =
    submission && submission.score !== null && submission.score !== undefined;

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

            {/* Quiz Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {quiz.title}
              </h1>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <span
                    className={`ml-2 font-semibold ${
                      isOverdue && !submission
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {quiz.dueDate}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Points:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {quiz.possibleScore}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Questions:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {quiz.questions?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Score Display (if graded) */}
            {isGraded && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Your Score
                </h2>
                <div className="flex items-center gap-6 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="text-3xl font-bold text-cyan-600">
                      {submission?.score ?? 0}
                    </p>
                  </div>
                </div>
                {submission?.feedback && (
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

            {/* Quiz Questions */}
            {!isGraded ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {isOverdue && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-semibold">
                      ⚠️ This quiz is overdue
                    </p>
                  </div>
                )}

                {quiz?.questions?.map((question, index) => (
                  <div
                    key={question.id}
                    className="bg-white rounded-lg shadow-md p-6"
                  >
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Question {index + 1}: {question.question}
                    </h3>
                    <div className="space-y-3">
                      {question.options.map((option, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                            answers[question.id] === optIndex
                              ? "border-cyan-500 bg-cyan-50"
                              : "border-gray-200 hover:border-cyan-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={answers[question.id] === optIndex}
                            onChange={() =>
                              handleAnswerChange(question.id, optIndex)
                            }
                            className="mr-3"
                          />
                          <span className="text-gray-900">
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end gap-4 sticky bottom-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/Student/class", { state: { classData } })
                    }
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-300 transition disabled:bg-gray-400"
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : submission
                      ? "Resubmit Quiz"
                      : "Submit Quiz"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Review Your Answers
                </h2>
                {quiz?.questions?.map((question, index) => {
                  // Get student's answer using is_correct from backend
                  const studentAnswer = submission?.answers?.find(
                    (a) => a.question_id === question.id
                  );
                  const isCorrect = studentAnswer?.is_correct ?? false;

                  // Find which option index was selected
                  const selectedOptionId = studentAnswer?.selected_option_id;
                  const selectedOptionIndex = selectedOptionId
                    ? question.optionsData.findIndex(
                        (o) => o.id === selectedOptionId
                      )
                    : -1;

                  return (
                    <div
                      key={question.id}
                      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                        isCorrect ? "border-cyan-500" : "border-red-500"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-gray-900">
                          Question {index + 1}: {question.question}
                        </h3>
                        {isCorrect ? (
                          <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-xs font-semibold rounded-full">
                            Correct
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                            Incorrect
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => {
                          const isStudentAnswer =
                            selectedOptionIndex === optIndex;
                          const isCorrectAnswer =
                            optIndex === question.correctAnswer;

                          return (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg ${
                                isCorrectAnswer
                                  ? "bg-cyan-100 border-2 border-cyan-500"
                                  : isStudentAnswer
                                  ? "bg-red-100 border-2 border-red-500"
                                  : "bg-gray-50"
                              }`}
                            >
                              <span className="text-gray-900">
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </span>
                              {isCorrectAnswer && (
                                <span className="ml-2 text-cyan-700 font-semibold">
                                  ✓ Correct Answer
                                </span>
                              )}
                              {isStudentAnswer && !isCorrectAnswer && (
                                <span className="ml-2 text-red-700 font-semibold">
                                  ✗ Your Answer
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
