const CURRENT_USER_KEY = "healora.currentUser";

export const demoHealthProfile = { age: 24, height: "168 cm", weight: 62, bloodGroup: "B+" };

export function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
  try {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY)
      || localStorage.getItem("loggedInUser")
      || localStorage.getItem("user")
      || sessionStorage.getItem("loggedInUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}
