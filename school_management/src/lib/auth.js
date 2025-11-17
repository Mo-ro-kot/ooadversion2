export function saveAuth({ token, role, user }) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("currentUser", JSON.stringify(user));
  // Backward-compatible keys used across pages
  if (role === "student")
    localStorage.setItem("currentStudent", JSON.stringify(user));
  if (role === "teacher")
    localStorage.setItem("currentTeacher", JSON.stringify(user));
  if (role === "admin")
    localStorage.setItem("currentAdmin", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentStudent");
  localStorage.removeItem("currentTeacher");
  localStorage.removeItem("currentAdmin");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getRole() {
  return localStorage.getItem("role");
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser"));
  } catch {
    return null;
  }
}
