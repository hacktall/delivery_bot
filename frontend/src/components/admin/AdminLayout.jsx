// src/components/admin/AdminLayout.jsx
import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  FaSignOutAlt, FaHome, FaRobot, FaCog, FaAddressBook,
  FaUsers, FaReply, FaTicketAlt, FaWallet, FaMoon, FaSun
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useDarkMode } from "../../hooks/userDarkMode";

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [darkMode, toggleDarkMode] = useDarkMode();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const links = [
    { to: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { to: "bot", label: "Bot WhatsApp", icon: <FaRobot /> },
    { to: "configuracoes-bot", label: "Configurações do Bot", icon: <FaCog /> },
    { to: "contatos", label: "Contatos/Clientes", icon: <FaAddressBook /> },
    { to: "operadores", label: "Operadores", icon: <FaUsers /> },
    { to: "respostas", label: "Respostas Automáticas", icon: <FaReply /> },
    { to: "tickets", label: "Tickets de Suporte", icon: <FaTicketAlt /> },
    { to: "pagamento", label: "Plano & Pagamento", icon: <FaWallet /> },,
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <aside className="w-72 bg-white dark:bg-gray-850 shadow-lg border-r dark:border-gray-700 flex flex-col">
        <div className="p-5 flex items-center justify-between border-b dark:border-gray-700">
          <div>
            <h1 className="text-xl font-bold text-green-700 dark:text-green-300">Admin</h1>
            <p className="text-sm text-gray-500 dark:text-gray-300">Olá, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sair da conta"
            className="text-gray-500 dark:text-gray-300 hover:text-red-600 transition"
          >
            <FaSignOutAlt size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={`/admin/${to}`}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-green-100 dark:bg-green-700 text-green-800 dark:text-white font-semibold"
                    : "hover:bg-green-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`
              }
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t dark:border-gray-700">
          <button
        onClick={toggleDarkMode}
        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 transition"
      >
        <span className="text-lg" >
          {darkMode ? <FaSun /> : <FaMoon />}
        </span>
        {darkMode ? "Modo Claro" : "Modo Escuro"}
      </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
