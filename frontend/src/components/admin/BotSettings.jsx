// src/components/admin/BotSettings.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function BotSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    welcome_message: "",
    default_response: "",
    active_hours: "08:00 - 18:00",
    enable_auto_reply: true,
    webhook_url: "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      if (!user?.tenant_id) return;
      try {
        const res = await axios.get("http://localhost:3000/app/bot-settings", {
          params: { tenant_id: user.tenant_id },
        });
        if (res.data) {
          setForm((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error("Erro ao carregar configurações", err);
        setError(err.response?.data?.error || "Erro ao carregar configurações");
      }
    }

    fetchSettings();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSaved(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    // Validações cliente
    if (!form.welcome_message.trim() || !form.default_response.trim() || !form.active_hours.trim()) {
      setError("Preencha mensagem de boas-vindas, resposta padrão e horário de funcionamento.");
      return;
    }
    if (!/^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/.test(form.active_hours)) {
      setError("Formato de horário inválido. Use 'HH:MM - HH:MM'.");
      return;
    }
    if (!user?.tenant_id) {
      setError("Tenant não encontrado. Refaça login.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/app/bot-settings", {
        ...form,
        tenant_id: user.tenant_id,
      });
      setSaved(true);
    } catch (err) {
      console.error("Erro ao salvar configurações", err);
      setError(err.response?.data?.error || "Erro ao salvar configurações");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Configurações do Bot</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium">Mensagem de boas-vindas</label>
          <textarea
            name="welcome_message"
            value={form.welcome_message}
            onChange={handleChange}
            className="w-full p-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Resposta padrão</label>
          <input
            name="default_response"
            value={form.default_response}
            onChange={handleChange}
            className="w-full p-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Horário de funcionamento (HH:MM - HH:MM)</label>
          <input
            name="active_hours"
            value={form.active_hours}
            onChange={handleChange}
            placeholder="08:00 - 18:00"
            className="w-full p-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="enable_auto_reply"
            type="checkbox"
            name="enable_auto_reply"
            checked={form.enable_auto_reply}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label htmlFor="enable_auto_reply">Habilitar respostas automáticas</label>
        </div>

        <div>
          <label className="block text-sm font-medium">Webhook URL (opcional)</label>
          <input
            name="webhook_url"
            value={form.webhook_url}
            onChange={handleChange}
            placeholder="https://example.com/webhook"
            className="w-full p-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
          {saved && <p className="text-green-500">Configurações salvas com sucesso.</p>}
        </div>

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>
    </div>
  );
}
