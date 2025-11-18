import React, { useState } from "react";

const TeacherAssignmentCard = ({
  date,
  title,
  due,
  possibleScore,
  onDelete,
  onViewResponses,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newDueDate, setNewDueDate] = useState("");
  const [newDueTime, setNewDueTime] = useState("");

  const formatDateTime = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-US", options);
  };

  const handleUpdateDueDate = () => {
    if (newDueDate) {
      const dueDatetime = newDueTime
        ? `${newDueDate}T${newDueTime}:00`
        : `${newDueDate}T23:59:59`;
      onUpdate({ due_at: dueDatetime });
      setIsEditing(false);
      setNewDueDate("");
      setNewDueTime("");
    }
  };
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

        {!isEditing ? (
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm text-red-500 font-medium">
              Due: {formatDateTime(due)}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800"
              title="Edit due date"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="mb-3 p-3 bg-white rounded border border-blue-300">
            <p className="text-xs text-gray-600 mb-2">Update Due Date</p>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm flex-shrink-0"
              />
              <input
                type="time"
                value={newDueTime}
                onChange={(e) => setNewDueTime(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm flex-shrink-0"
              />
              <button
                type="button"
                onClick={handleUpdateDueDate}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 cursor-pointer flex-shrink-0"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setNewDueDate("");
                  setNewDueTime("");
                }}
                className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500 cursor-pointer flex-shrink-0"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
