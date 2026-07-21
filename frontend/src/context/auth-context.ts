import { createContext } from "react";

export interface AuthContextType {
  isAuth: boolean;
  user: { id: string; email: string } | null;
  login: (token: string, user: { id: string; email: string }) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
