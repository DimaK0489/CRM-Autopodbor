import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./services/query-client";
import { useAuth } from "./hooks/useAuth";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import KanbanBoard from "./components/KanbanBoard";
import { AuthProvider } from "./context/AuthContext";

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
