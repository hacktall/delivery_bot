// src/components/user/Atendimento.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function Atendimento() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState({});
  const [sending, setSending] = useState({});

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.tenant_id) return;
      try {
        const res = await axios.get("http://localhost:3000/api/messages", {
          params: { tenant_id: user.tenant_id }
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Erro ao buscar mensagens:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [user]);

  const handleReplyChange = (id, text) => {
    setReplyBody((prev) => ({ ...prev, [id]: text }));
  };

  const sendReply = async (msgId) => {
    const text = replyBody[msgId]?.trim();
    if (!text) return;
    setSending((s) => ({ ...s, [msgId]: true }));
    try {
      await axios.post("http://localhost:3000/api/messages/reply", {
        messageId: msgId,
        user_id: user.id,
        tenant_id: user.tenant_id,
        message: text
      });
      // recarrega mensagens
      const res = await axios.get("http://localhost:3000/api/messages", {
        params: { tenant_id: user.tenant_id }
      });
      setMessages(res.data);
      setReplyBody((p) => ({ ...p, [msgId]: "" }));
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
      alert("Falha ao enviar resposta");
    } finally {
      setSending((s) => ({ ...s, [msgId]: false }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-xl font-bold mb-4">Mensagens Recebidas</h2>
      {loading ? (
        <p>Carregando mensagens...</p>
      ) : messages.length === 0 ? (
        <p className="text-gray-500">Nenhuma mensagem recebida ainda.</p>
      ) : (
        <ul className="space-y-6">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex justify-between">
                <strong>{msg.client_name || msg.client_phone}</strong>
                <span className="text-sm text-gray-500">
                  {new Date(msg.received_at).toLocaleString("pt-BR")}
                </span>
              </div>
              <p className="mt-2 text-gray-800">{msg.message}</p>

              {/* Campo de resposta inline */}
              <div className="mt-4">
                <textarea
                  rows="2"
                  value={replyBody[msg.id] || ""}
                  onChange={(e) => handleReplyChange(msg.id, e.target.value)}
                  placeholder="Digite sua resposta..."
                  className="w-full p-2 border rounded-md"
                />
                <button
                  onClick={() => sendReply(msg.id)}
                  disabled={sending[msg.id]}
                  className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {sending[msg.id] ? "Enviando..." : "Enviar Resposta"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}