import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeacherTopBar from "../../Component/Teacher/TeacherTopBar";

const HomePage = () => {
  // Fix: Call useNavigate as a function
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [editingClass, setEditingClass] = useState(null);
  const [editClassName, setEditClassName] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  // Handler for "Create class" button
  const handleCreateClass = () => {
    setIsModalOpen(true);
  };

  const handleSubmitClass = (e) => {
    e.preventDefault();
    if (newClassName.trim()) {
      const newClass = {
        id: Date.now(),
        name: newClassName,
        status: "In progress",
        students: 0,
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        statusColor: "text-blue-700",
        assignments: [],
        quizzes: [],
      };
      const updatedClasses = [...classData, newClass];
      saveClasses(updatedClasses);
      setNewClassName("");
      setIsModalOpen(false);
    }
  };

  const handleEditClass = (classItem) => {
    setEditingClass(classItem);
    setEditClassName(classItem.name);
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (editClassName.trim()) {
      const updatedClasses = classData.map((item) =>
        item.id === editingClass.id ? { ...item, name: editClassName } : item
      );
      saveClasses(updatedClasses);
      setIsEditModalOpen(false);
      setEditingClass(null);
      setEditClassName("");
    }
  };

  const handleDeleteClass = (classId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this class? All assignments and quizzes in this class will also be deleted."
      )
    ) {
      const updatedClasses = classData.filter((item) => item.id !== classId);
      saveClasses(updatedClasses);
    }
  };

  const handleClassClick = (classItem) => {
    console.log("Navigating to class with data:", classItem);
    console.log("Class ID:", classItem.id);
    // Save to localStorage for persistence
    localStorage.setItem("currentTeacherClass", JSON.stringify(classItem));
    navigate("/Teacher/general", { state: { classData: classItem } });
  };

  const handleToggleStatus = (classId) => {
    const updatedClasses = classData.map((item) => {
      if (item.id === classId) {
        const newStatus =
          item.status === "In progress" ? "Completed" : "In progress";
        return {
          ...item,
          status: newStatus,
          statusColor:
            newStatus === "In progress" ? "text-blue-700" : "text-red-700",
        };
      }
      return item;
    });
    saveClasses(updatedClasses);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortedData = () => {
    if (!sortBy) return classData;

    return [...classData].sort((a, b) => {
      let aValue, bValue;

      if (sortBy === "status") {
        aValue = a.status;
        bValue = b.status;
      } else if (sortBy === "date") {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Table Data - Load from localStorage
  const [classData, setClassData] = useState([]);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = () => {
    const storedClasses = JSON.parse(localStorage.getItem("classes")) || [];
    setClassData(storedClasses);
  };

  const saveClasses = (classes) => {
    localStorage.setItem("classes", JSON.stringify(classes));
    setClassData(classes);
  };

  return (
    <div>
      <TeacherTopBar />
      <button
        onClick={() => {
          navigate("/Teacher/assignment");
        }}
      >
        testing{" "}
      </button>
      <div className=" p-5 md:p-7">
        {/* Header with search and profile icon */}

        {/* Welcome section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          {/* Text */}
          <div className="w-full md:w-1/2">
            <h1 className="font-black text-2xl sm:text-3xl md:text-4xl mb-4 text-gray-800">
              WELCOME, PORY MOROKOT!
            </h1>
            <p className="font-semibold text-sm md:text-base leading-relaxed text-gray-600">
              Our students are the hope of our country’s future. Each one
              carries the potential to shape the world with curiosity, courage,
              and compassion. Through learning, they build not only their own
              dreams but the destiny of our nation.
            </p>
          </div>
        </section>

        {/* Table */}
        <section className="mt-10 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm bg-blue-100 shadow-lg rounded-lg">
            <thead className="bg-blue-300 font-bold text-gray-800">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th
                  className="p-3 text-left cursor-pointer hover:bg-blue-400 transition"
                  onClick={() => handleSort("status")}
                >
                  Status
                  <span className="ml-1">
                    {sortBy === "status"
                      ? sortOrder === "asc"
                        ? "▲"
                        : "▼"
                      : "⌵"}
                  </span>
                </th>
                <th className="p-3 text-left cursor-pointer">
                  Total Student <span className="ml-1"></span>
                </th>
                <th
                  className="p-3 text-left cursor-pointer hover:bg-blue-400 transition"
                  onClick={() => handleSort("date")}
                >
                  Created date
                  <span className="ml-1">
                    {sortBy === "date"
                      ? sortOrder === "asc"
                        ? "▲"
                        : "▼"
                      : "⌵"}
                  </span>
                </th>

                <th className="p-3 text-right font-semibold">
                  Create class
                  <span
                    className="inline-block bg-blue-300 rounded-md px-2 py-0.5 cursor-pointer text-base hover:bg-blue-500 hover:text-white transition duration-200 ml-2"
                    aria-label="Create class"
                    onClick={handleCreateClass}
                  >
                    +
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {classData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    <p className="text-lg mb-2">No classes yet</p>
                    <p className="text-sm">
                      Click the + button above to create your first class
                    </p>
                  </td>
                </tr>
              ) : (
                getSortedData().map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-blue-200 hover:bg-blue-50 transition duration-150"
                  >
                    <td className="p-3 text-blue-700 cursor-pointer hover:text-blue-900 font-medium">
                      <span onClick={() => handleClassClick(item)}>
                        {item.name}
                      </span>
                      <button
                        onClick={() => handleEditClass(item)}
                        className="ml-2 inline-block align-middle hover:scale-110 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="14"
                          width="14"
                          fill="#4a4a4a"
                          className="hover:fill-gray-900"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 17.25V21h3.75L17.807 9.943l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.41l-2.34-2.34a1.003 1.003 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                    </td>
                    <td
                      className={`p-3 ${item.statusColor} font-semibold cursor-pointer hover:underline`}
                      onClick={() => handleToggleStatus(item.id)}
                      title="Click to toggle status"
                    >
                      {item.status}
                    </td>
                    <td className="p-3 text-gray-700">
                      {item.students} students
                    </td>
                    <td className="p-3 text-gray-700">{item.date}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteClass(item.id)}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>

      {/* Create Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-blue-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                Create New Class
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleSubmitClass} className="p-6 space-y-6">
              <div>
                <label
                  htmlFor="className"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Class Name
                </label>
                <input
                  type="text"
                  id="className"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., OOAD_ITE_M2_2025-2056"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-blue-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Class Name
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
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

            <form onSubmit={handleSubmitEdit} className="p-6 space-y-6">
              <div>
                <label
                  htmlFor="editClassName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Class Name
                </label>
                <input
                  type="text"
                  id="editClassName"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., OOAD_ITE_M2_2025-2056"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
