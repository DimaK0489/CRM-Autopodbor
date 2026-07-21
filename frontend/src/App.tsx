import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./query-client";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "./useAuth";
import KanbanBoard from "./KanbanBoard";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

function AppContent() {
  const { isAuth, user, logout } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (!isAuth) {
    if (showRegister) {
      return <RegisterPage onSwitchToLogin={() => setShowRegister(false)} />;
    }
    return <LoginPage onSwitchToRegister={() => setShowRegister(true)} />;
  }

  return (
    <div>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.email}</span>
        <button
          type="button"
          onClick={logout}
          className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
        >
          Выйти
        </button>
      </div>
      <KanbanBoard />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
