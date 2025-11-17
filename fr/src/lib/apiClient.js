export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function getToken() {
  return localStorage.getItem("token");
}

async function request(
  path,
  { method = "GET", body, headers = {}, isForm = false } = {}
) {
  const token = getToken();
  const init = {
    method,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  };
  const res = await fetch(`${BASE_URL}${path}`, init);
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const err = await res.json();
      msg = err.error || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

export const api = {
  // Auth
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
  registerAdmin: (email, password, profile = {}) =>
    request("/auth/register-admin", {
      method: "POST",
      body: { email, password, ...profile },
    }),
  me: () => request("/auth/me"),

  // Users
  updateMe: (data) => request("/api/users/me", { method: "PUT", body: data }),
  // Admin user management
  listStudents: () => request("/api/users/students"),
  createStudent: (data) =>
    request("/api/users/students", { method: "POST", body: data }),
  listTeachers: () => request("/api/users/teachers"),
  createTeacher: (data) =>
    request("/api/users/teachers", { method: "POST", body: data }),

  // Classes
  getClasses: () => request("/api/classes"),
  getClass: (id) => request(`/api/classes/${id}`),
  enrollByTeacher: (classId, studentId) =>
    request(`/api/classes/${classId}/enroll/${studentId}`, { method: "POST" }),
  joinClass: (classId) =>
    request(`/api/classes/${classId}/join`, { method: "POST" }),

  // Assignments
  listAssignments: (classId) => request(`/api/classes/${classId}/assignments`),
  createAssignment: (classId, data) =>
    request(`/api/classes/${classId}/assignments`, {
      method: "POST",
      body: data,
    }),
  getAssignment: (id) => request(`/api/assignments/${id}`),
  myAssignmentSubmission: (id) =>
    request(`/api/assignments/${id}/my-submission`),
  submitAssignment: (id, data) =>
    request(`/api/assignments/${id}/submissions`, {
      method: "POST",
      body: data,
    }),

  // Quizzes
  listQuizzes: (classId) => request(`/api/classes/${classId}/quizzes`),
  createQuiz: (classId, data) =>
    request(`/api/classes/${classId}/quizzes`, { method: "POST", body: data }),
  getQuiz: (id) => request(`/api/quizzes/${id}`),
  myQuizSubmission: (id) => request(`/api/quizzes/${id}/my-submission`),
  submitQuiz: (id, data) =>
    request(`/api/quizzes/${id}/submissions`, { method: "POST", body: data }),

  // Files
  uploadFile: async (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/api/files/upload", {
      method: "POST",
      body: form,
      isForm: true,
    });
  },
};
