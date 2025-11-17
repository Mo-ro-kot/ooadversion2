import React from "react";

const TeacherAssignmentCard = ({
  date,
  title,
  due,
  possibleScore,
  onDelete,
  onViewResponses,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-blue-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {/* Assignment Icon */}
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span className="font-semibold text-gray-700">Assignment</span>
        </div>
        <span className="text-xs text-gray-400">{date}</span>
      </div>

      <div className="p-4 bg-blue-50/50 rounded-md border border-blue-200">
        <h2 className="text-xl font-bold mb-2 text-gray-800">{title}</h2>
        <p className="text-sm text-red-500 mb-2">Due {due}</p>
        <p className="text-sm text-gray-700 font-semibold mb-4">
          Points: {possibleScore}
        </p>

        <div className="flex gap-2">
          <button
            onClick={onViewResponses}
            className="mt-2 px-4 py-1 text-sm font-medium text-white bg-green-500 rounded-md transition duration-150 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            View Responses
          </button>
        </div>
      </div>
      <div className="w-full flex justify-end">
        <button
          onClick={onDelete}
          className="m-2 px-4 py-1 text-sm font-medium text-white bg-red-500 rounded-md transition duration-150 hover:bg-red-600 focus:outline-none focus:ring-red-500/50"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TeacherAssignmentCard;
