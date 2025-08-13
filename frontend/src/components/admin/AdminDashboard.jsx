// src/components/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuth } from "../../context/AuthContext";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalUsers: 0,
    totalContacts: 0,
    totalTickets: 0,
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Estatísticas totais
        const statsRes = await axios.get("http://localhost:3000/api/admin/stats", {
          params: { tenant_id:1 },
        });
        setStats(statsRes.data);

        // 2. Analytics (gráficos)
        const analyticsRes = await axios.get("http://localhost:3000/api/adm/analytics", {
          params: { tenant_id:1 },
        });
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
        setError("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-10">
      {/* 🔹 Cartões estatísticos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Mensagens Enviadas", value: stats.totalMessages, icon: "✉️" },
          { label: "Operadores", value: stats.totalUsers, icon: "👥" },
          { label: "Contatos", value: stats.totalContacts, icon: "📇" },
          { label: "Tickets", value: stats.totalTickets, icon: "🎫" },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{icon}</span>
              <span className="text-2xl font-bold">{value}</span>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">{label}</p>
          </div>
        ))}
      </div>

      {/* 🔹 Gráfico de linha - Mensagens por semana */}
      <div>
        <h2 className="text-lg font-semibold mb-2 dark:text-white">Mensagens por Semana</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.messagesPerWeek}>
            <XAxis dataKey="semana" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Gráfico de barras - Operadores por semana */}
      <div>
        <h2 className="text-lg font-semibold mb-2 dark:text-white">Operadores Ativos por Semana</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.usersPerWeek}>
            <XAxis dataKey="semana" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Gráfico de pizza - Tipos de usuários */}
      <div className="max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-2 dark:text-white">Distribuição de Papéis</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={analytics.userRoles}
              dataKey="total"
              nameKey="role"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {analytics.userRoles.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
