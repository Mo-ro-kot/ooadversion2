import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../lib/apiClient";
import TeacherTopBar from "../../Component/Teacher/TeacherTopBar";
import TeacherSideNav from "../../Component/Teacher/TeacherSideNav";

export default function TeacherAddQuiz() {
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
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ]);

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

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      question: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: 0,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassId) {
      alert("Please select a class for this quiz.");
      return;
    }
    try {
      const due_at = `${dueDate}T${dueTime}:00`;
      const transformed = (questions || []).map((q) => ({
        text: q.question,
        points: 1,
        options: (q.options || []).map((opt, idx) => ({
          text: opt,
          is_correct: idx === q.correctAnswer,
        })),
      }));
      await api.createQuiz(selectedClassId, {
        title,
        description,
        due_at,
        questions: transformed,
      });
      alert("Quiz created");
      if (initialClassId) {
        const cls = (await api.getClasses()).find(
          (c) => c.id === Number(selectedClassId)
        );
        navigate("/Teacher/general", { state: { classData: cls } });
      } else {
        navigate("/Teacher/quiz");
      }
    } catch (err) {
      alert(err.message || "Failed to create quiz");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TeacherTopBar />
      <div className="flex flex-1 overflow-hidden">
        <TeacherSideNav />
        <main className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
          <div className="bg-green-200 h-12 font-bold flex items-center px-5 border-b-2 border-green-300">
            Create New Quiz
          </div>

          <div className="flex-1 p-6">
            <form
              onSubmit={handleSubmit}
              className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 space-y-6"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
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
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Adding quiz to:</p>
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
                  Quiz Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="Enter quiz title"
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
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Enter quiz description and instructions"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Possible Score */}
              <div>
                <label
                  htmlFor="possibleScore"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Possible Score
                </label>
                <input
                  type="number"
                  id="possibleScore"
                  value={possibleScore}
                  onChange={(e) => setPossibleScore(e.target.value)}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  placeholder="Enter total points for this quiz"
                />
              </div>

              {/* Questions Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Questions</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Question
                  </button>
                </div>

                {/* Question Cards */}
                <div className="space-y-6">
                  {questions.map((q, index) => (
                    <div
                      key={q.id}
                      className="border border-gray-300 rounded-lg p-6 bg-gray-50 relative"
                    >
                      {/* Question Number and Delete Button */}
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-700">
                          Question {index + 1}
                        </h4>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(q.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {/* Question Input */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Question
                        </label>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) =>
                            updateQuestion(q.id, "question", e.target.value)
                          }
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                          placeholder="Enter your question"
                        />
                      </div>

                      {/* Multiple Choice Options */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Answer Options (Select the correct answer)
                        </label>
                        {q.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="flex items-center gap-3"
                          >
                            <input
                              type="radio"
                              name={`correct-${q.id}`}
                              checked={q.correctAnswer === optIndex}
                              onChange={() =>
                                updateQuestion(q.id, "correctAnswer", optIndex)
                              }
                              className="w-5 h-5 text-green-600 focus:ring-green-500"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                updateOption(q.id, optIndex, e.target.value)
                              }
                              required
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                              placeholder={`Option ${String.fromCharCode(
                                65 + optIndex
                              )}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/Teacher/quiz")}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition"
                >
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
