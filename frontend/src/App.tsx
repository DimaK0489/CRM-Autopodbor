import { useState } from "react";
import { X } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 hidden sm:flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4 shadow-sm h-16">
        <span className="text-xl font-bold text-gray-900">CRM Автоподбор</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm shadow-sm select-none">
              {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {user?.email}
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="fixed top-0 left-0 right-0 z-50 flex sm:hidden items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shadow-sm h-12">
        <span className="text-sm font-semibold text-gray-900">
          CRM Автоподбор
        </span>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="focus:outline-none transition-transform active:scale-95"
        >
          {mobileMenuOpen ? (
            <div className="p-1 rounded-lg text-gray-500 hover:bg-gray-100">
              <X size={20} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-xs shadow-sm border border-blue-600">
              {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
            </div>
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed top-12 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 shadow-md sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 truncate max-w-[70%]">
              <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-xs flex-shrink-0">
                {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="text-sm text-gray-500 truncate">
                {user?.email}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex-shrink-0"
            >
              Выйти
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 pt-20 sm:pt-24 px-4 sm:px-6">
        <KanbanBoard />
      </main>
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
