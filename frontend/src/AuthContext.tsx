import { createContext, useContext, useState, type ReactNode } from "react";
import { isAuthenticated, setToken, clearToken } from "./api";

interface AuthContextType {
  isAuth: boolean;
  user: { id: string; email: string } | null;
  login: (token: string, user: { id: string; email: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
