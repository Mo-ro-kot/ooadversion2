import React from "react";

const TeacherQuizCard = ({
  date,
  title,
  due,
  possibleScore,
  onDelete,
  onViewResponses,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-green-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {/* Quiz Icon */}
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <span className="font-semibold text-gray-700">Quiz</span>
        </div>
        <span className="text-xs text-gray-400">{date}</span>
      </div>

      <div className="p-4 bg-green-50/50 rounded-md border border-green-200">
        <h2 className="text-xl font-bold mb-2 text-gray-800">{title}</h2>
        <p className="text-sm text-red-500 mb-2">Due {due}</p>
        <p className="text-sm text-gray-600 mb-4">Points: {possibleScore}</p>

        <button
          onClick={onViewResponses}
          className="mt-2 px-4 py-1 text-sm font-medium text-white bg-green-500 rounded-md transition duration-150 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500/50"
        >
          View Responses
        </button>
      </div>
      <div className="w-full flex justify-end">
        <button
          onClick={onDelete}
          className="m-2 px-4 py-1 text-sm font-medium text-white bg-red-500 rounded-md transition duration-150 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TeacherQuizCard;
