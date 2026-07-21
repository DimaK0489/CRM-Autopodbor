import { useState, type ReactNode } from "react";
import { isAuthenticated, setToken, clearToken } from "./api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const [user, setUser] = useState<{ id: string; email: string } | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  function login(token: string, userData: { id: string; email: string }) {
    setToken(token);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsAuth(true);
    setUser(userData);
  }

  function logout() {
    clearToken();
    localStorage.removeItem("user");
    setIsAuth(false);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ isAuth, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
