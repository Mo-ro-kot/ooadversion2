import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Sub-component for a single navigation item
const NavItem = ({ icon, label, isActive = false }) => {
  const baseClasses =
    "flex items-center space-x-3 p-3 rounded-lg font-medium transition duration-150 cursor-pointer";
  const activeClasses = "bg-blue-200 text-blue-800";
  const inactiveClasses = "text-gray-600 hover:bg-gray-100";

  const getIcon = (type) => {
    switch (type) {
      case "classes":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"
            />
          </svg>
        );
      case "general":
        return (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        );
      case "assignment":
        return (
          <svg
            className="w-5 h-5"
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
        );
      case "quiz":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 00-2 2h2m2 0h2m-2 0h-2"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {getIcon(icon)}
      <span>{label}</span>
    </div>
  );
};

const TeacherSideNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="w-60 overflow-y-auto bg-white p-4 space-y-4 border-r border-gray-200 hidden md:block">
      {/* Classes Header */}
      <button
        onClick={() => {
          navigate("/Teacher/homePage");
        }}
        className="flex items-center space-x-3 text-gray-600 font-semibold mb-6"
      >
        <NavItem icon="classes" label="Classes" />
      </button>

      {/* Nav Items */}
      <button
        onClick={() => {
          // Try to get current class from localStorage
          const savedClass = localStorage.getItem("currentTeacherClass");
          if (savedClass) {
            navigate("/Teacher/general", {
              state: { classData: JSON.parse(savedClass) },
            });
          } else {
            navigate("/Teacher/general");
          }
        }}
      >
        <NavItem
          icon="general"
          label="General"
          isActive={
            location.pathname === "/Teacher/general" ||
            location.pathname === "/"
          }
        />
      </button>

      <button
        onClick={() => {
          navigate("/Teacher/assignment");
        }}
      >
        <NavItem
          icon="assignment"
          label="Assignment"
          isActive={location.pathname === "/Teacher/assignment"}
        />
      </button>
      <button
        onClick={() => {
          navigate("/Teacher/quiz");
        }}
      >
        <NavItem
          icon="quiz"
          label="Quiz"
          isActive={location.pathname === "/Teacher/quiz"}
        />
      </button>
    </nav>
  );
};
export default TeacherSideNav;
