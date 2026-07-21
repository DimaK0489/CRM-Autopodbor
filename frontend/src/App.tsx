import { useState } from "react";
import { Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuth) {
    if (showRegister) {
      return <RegisterPage onSwitchToLogin={() => setShowRegister(false)} />;
    }
    return <LoginPage onSwitchToRegister={() => setShowRegister(true)} />;
  }

  return (
    <div>
      {/* Desktop header */}
      <div className="fixed top-4 right-4 z-50 hidden sm:flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.email}</span>
        <button
          type="button"
          onClick={logout}
          className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
        >
          Выйти
        </button>
      </div>

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex sm:hidden items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <span className="text-sm font-semibold text-gray-900">
          CRM Автоподбор
        </span>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="fixed top-12 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 shadow-md sm:hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 truncate">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      )}

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
