// src/components/user/Historico.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";


export default function Historico() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
 



  useEffect(() => {
    const fetchAllMessages = async () => {
      try {
  const res = await axios.get("http://localhost:3000/api/messages", {
  params: { userId: user.id }
});
        setMessages(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMessages();
  }, []);

  useEffect(() => {
    const lower = query.toLowerCase();
    const filteredMsgs = messages.filter(
      (msg) =>
        msg.sender_name?.toLowerCase().includes(lower) ||
        msg.phone?.toLowerCase().includes(lower) ||
        msg.body?.toLowerCase().includes(lower)
    );
    setFiltered(filteredMsgs);
  }, [query, messages]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Histórico de Conversas</h2>
      <input
        type="text"
        placeholder="Buscar por cliente, telefone ou conteúdo..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 p-2 w-full border rounded-md"
      />

      {loading ? (
        <p>Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">Nenhuma conversa encontrada.</p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((msg) => (
            <li
              key={msg.id}
              className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex justify-between">
                <strong>{msg.sender_name || msg.phone}</strong>
                <span className="text-sm text-gray-500">
                  {new Date(msg.created_at).toLocaleString("pt-BR")}
                </span>
              </div>
              <p className="mt-2 text-gray-800">{msg.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
