// src/components/admin/Bot.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { FaSyncAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function Bot() {
  const { user } = useAuth();
  const [status, setStatus] = useState({ connected: false, lastSeen: null, qrToken: "" });
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState("");

  // Fetch status
  const fetchStatus = async () => {
    if (!user?.tenant_id) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/app/bot/status", {
        params: { tenant_id: user.tenant_id },
      });
      setStatus(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Não foi possível obter status");
    } finally {
      setLoading(false);
    }
  };

  // Reconnect
  const handleReconnect = async () => {
    if (!user?.tenant_id) return;
    setReconnecting(true);
    setError("");
    try {
      await axios.post("http://localhost:3000/app/bot/status/reconnect", {
        tenant_id: user.tenant_id,
      });
      // aguarda e refaz o fetch
      setTimeout(fetchStatus, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Falha na reconexão");
    } finally {
      setReconnecting(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line
  }, [user]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Bot WhatsApp</h2>

      {loading ? (
        <p>Carregando status do bot...</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            {status.connected ? (
              <FaCheckCircle className="text-green-500" size={20} />
            ) : (
              <FaTimesCircle className="text-red-500" size={20} />
            )}
            <span className="text-lg">
              {status.connected ? "Conectado" : "Desconectado"}
            </span>
            {status.lastSeen && (
              <small className="text-gray-500 dark:text-gray-400 ml-auto">
                Última vez: {new Date(status.lastSeen).toLocaleString()}
              </small>
            )}
          </div>

          {/* QR Code (se desconectado) */}
          {!status.connected && status.qrToken && (
            <div className="flex flex-col items-center">
              <p className="mb-2 text-gray-700 dark:text-gray-300">
                Escaneie este QR Code para conectar:
              </p>
              <img
                src={status.qrToken}
                alt="QR Code do Bot"
                className="w-48 h-48 object-contain bg-white p-2 rounded-md shadow"
              />
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              <FaSyncAlt /> Atualizar
            </button>
            <button
              onClick={handleReconnect}
              disabled={reconnecting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {reconnecting ? "Reconectando..." : "Reconectar Bot"}
            </button>
          </div>

          {error && <p className="text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
