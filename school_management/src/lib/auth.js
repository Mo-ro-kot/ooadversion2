export function saveAuth({ token, role, user }) {
  // Store role-specific tokens to support multiple tabs with different roles
  localStorage.setItem(`token_${role}`, token);
  localStorage.setItem(`user_${role}`, JSON.stringify(user));

  // Also store in generic keys for backward compatibility
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
  // Clear role-specific tokens
  localStorage.removeItem("token_student");
  localStorage.removeItem("token_teacher");
  localStorage.removeItem("token_admin");
  localStorage.removeItem("user_student");
  localStorage.removeItem("user_teacher");
  localStorage.removeItem("user_admin");
}

function getRoleFromPath() {
  const path = window.location.pathname;
  if (path.startsWith("/Admin")) return "admin";
  if (path.startsWith("/Teacher")) return "teacher";
  if (path.startsWith("/Student")) return "student";
  return null;
}

export function getToken() {
  // Try to get role-specific token based on current route
  const role = getRoleFromPath();
  if (role) {
    const roleToken = localStorage.getItem(`token_${role}`);
    if (roleToken) return roleToken;
  }
  // Fallback to generic token
  return localStorage.getItem("token");
}

export function getRole() {
  // Detect role from current path
  const pathRole = getRoleFromPath();
  if (pathRole) {
    // Verify this role has a token
    const roleToken = localStorage.getItem(`token_${pathRole}`);
    if (roleToken) return pathRole;
  }
  // Fallback to stored role
  return localStorage.getItem("role");
}

export function getCurrentUser() {
  try {
    // Try to get role-specific user based on current route
    const role = getRoleFromPath();
    if (role) {
      const roleUser = localStorage.getItem(`user_${role}`);
      if (roleUser) return JSON.parse(roleUser);
    }
    // Fallback to generic user
    return JSON.parse(localStorage.getItem("currentUser"));
  } catch {
    return null;
  }
}
