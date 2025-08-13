// src/components/UserAccount.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserAccount() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Bem-vindo(a), {user?.name || "usuário"}!</h1>
        <p className="text-gray-600 mb-2">Email: <strong>{user?.email}</strong></p>
        <p className="text-gray-600 mb-4">Tipo: <strong>{user?.role}</strong></p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
