import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminTopBar from "../../Component/Admin/AdminTopBar";
import AdminSideNav from "../../Component/Admin/AdminSideNav";
import UserFormModal from "../../Component/Admin/UserFormModal";

export default function AdminTeachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
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

    loadTeachers();
  }, [navigate]);

  const loadTeachers = () => {
    const storedTeachers = JSON.parse(localStorage.getItem("teachers")) || [];
    setTeachers(storedTeachers);
  };

  const generateCredentials = () => {
    const username = `teacher${Date.now()}`;
    const password = Math.random().toString(36).slice(-8);
    setFormData((prev) => ({ ...prev, username, password }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingTeacher) {
      // Update existing teacher
      const updatedTeachers = teachers.map((t) =>
        t.id === editingTeacher.id ? { ...t, ...formData } : t
      );
      localStorage.setItem("teachers", JSON.stringify(updatedTeachers));
      setTeachers(updatedTeachers);
    } else {
      // Create new teacher
      const newTeacher = {
        id: Date.now(),
        ...formData,
        role: "teacher",
        createdAt: new Date().toISOString(),
      };
      const updatedTeachers = [...teachers, newTeacher];
      localStorage.setItem("teachers", JSON.stringify(updatedTeachers));
      setTeachers(updatedTeachers);
    }

    closeModal();
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      fullName: teacher.fullName,
      email: teacher.email,
      username: teacher.username,
      password: teacher.password,
      gender: teacher.gender || "",
      phone: teacher.phone || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      const updatedTeachers = teachers.filter((t) => t.id !== id);
      localStorage.setItem("teachers", JSON.stringify(updatedTeachers));
      setTeachers(updatedTeachers);
    }
  };

  const openModal = () => {
    setEditingTeacher(null);
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
    setEditingTeacher(null);
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
                Manage Teachers
              </h1>
              <button
                onClick={openModal}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition"
              >
                + Add Teacher
              </button>
            </div>

            {/* Teachers Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-blue-100">
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
                  {teachers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No teachers found. Click "Add Teacher" to create one.
                      </td>
                    </tr>
                  ) : (
                    teachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {teacher.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {teacher.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {teacher.gender || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {teacher.phone || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {teacher.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {teacher.password}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.id)}
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
        isEditing={!!editingTeacher}
        userType="teacher"
      />
    </div>
  );
}
