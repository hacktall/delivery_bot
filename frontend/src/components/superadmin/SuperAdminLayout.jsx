import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaBuilding,
  FaWallet,
  FaRegFileAlt,
  FaTicketAlt,
  FaSun,
  FaMoon,
  FaUserCircle, // ✅ IMPORTAR AQUI
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

export default function SuperAdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.documentElement.classList.toggle("dark", newMode);
  };

  const links = [
    { to: "tenants", label: "Inquilinos", icon: <FaBuilding /> },
    { to: "billing", label: "Faturamento", icon: <FaWallet /> },
    { to: "logs", label: "Registros", icon: <FaRegFileAlt /> },
    { to: "tickets", label: "Tickets", icon: <FaTicketAlt /> },
    { to: "profile", label: "Perfil", icon: <FaUserCircle /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <aside className="w-72 bg-white dark:bg-gray-800 shadow-xl border-r dark:border-gray-700 flex flex-col">
  <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
    <div>
      <h1 className="text-xl font-bold text-blue-700 dark:text-blue-300">SuperAdmin</h1>
      {user?.profile_picture && (
        <img
          src={`http://localhost:3000/uploads/${user.profile_picture}`}
          alt="Foto de perfil"
          className="w-10 h-10 rounded-full object-cover mt-2 border border-gray-300 dark:border-gray-600"
        />
      )}
    <p className="text-sm text-gray-600 dark:text-gray-200">
        Bem-vindo, {user?.name}
      </p>
    </div>
    <button
      onClick={handleLogout}
      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
      title="Sair"
    >
      <FaSignOutAlt size={20} />
    </button>
  </div>


        <nav className="flex-1 p-4 space-y-2">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={`/superadmin/${to}`}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-white font-semibold"
                    : "hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                }`
              }
            >
              <span className="text-xl">{icon}</span>
              <span className="text-md">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t dark:border-gray-700">
          <button
  onClick={toggleDarkMode}
  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 transition"
>
  <span className="text-lg" key={darkMode ? "sun" : "moon"}>
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
