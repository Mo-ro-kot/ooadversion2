import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminTopBar from "../../Component/Admin/AdminTopBar";
import AdminSideNav from "../../Component/Admin/AdminSideNav";
import UserFormModal from "../../Component/Admin/UserFormModal";

export default function AdminStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    gender: "",
    phone: "",
  });

  useEffect(() => {
    // Check if admin is logged in
    const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin"));
    if (!currentAdmin) {
      navigate("/Admin/login");
      return;
    }

    loadStudents();
  }, [navigate]);

  const loadStudents = () => {
    const storedStudents = JSON.parse(localStorage.getItem("students")) || [];
    setStudents(storedStudents);
  };

  const generateCredentials = () => {
    const username = `student${Date.now()}`;
    const password = Math.random().toString(36).slice(-8);
    setFormData((prev) => ({ ...prev, username, password }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingStudent) {
      // Update existing student
      const updatedStudents = students.map((s) =>
        s.id === editingStudent.id ? { ...s, ...formData } : s
      );
      localStorage.setItem("students", JSON.stringify(updatedStudents));
      setStudents(updatedStudents);
    } else {
      // Create new student
      const newStudent = {
        id: Date.now(),
        ...formData,
        role: "student",
        createdAt: new Date().toISOString(),
      };
      const updatedStudents = [...students, newStudent];
      localStorage.setItem("students", JSON.stringify(updatedStudents));
      setStudents(updatedStudents);
    }

    closeModal();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      email: student.email,
      username: student.username,
      password: student.password,
      gender: student.gender || "",
      phone: student.phone || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      const updatedStudents = students.filter((s) => s.id !== id);
      localStorage.setItem("students", JSON.stringify(updatedStudents));
      setStudents(updatedStudents);
    }
  };

  const openModal = () => {
    setEditingStudent(null);
    setFormData({
      fullName: "",
      email: "",
      username: "",
      password: "",
      gender: "",
      phone: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({
      fullName: "",
      email: "",
      username: "",
      password: "",
      gender: "",
      phone: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminTopBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSideNav />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Students
              </h1>
              <button
                onClick={openModal}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition"
              >
                + Add Student
              </button>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Password
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No students found. Click "Add Student" to create one.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.gender || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.phone || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {student.password}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        onInputChange={handleInputChange}
        onGenerateCredentials={generateCredentials}
        isEditing={!!editingStudent}
        userType="student"
      />
    </div>
  );
}
