import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Erro ao buscar tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este ticket?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/tickets/${id}`);
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Erro ao excluir ticket:", err);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:3000/api/tickets/${id}`, { status: newStatus });
      fetchTickets(); // recarrega
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-6 rounded shadow transition-colors">
      <h2 className="text-2xl font-bold mb-4">Lista de Tickets</h2>
      {loading ? (
        <p>Carregando tickets...</p>
      ) : tickets.length === 0 ? (
        <p>Nenhum ticket encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-left text-gray-800 dark:text-gray-100">
                <th className="p-2">ID</th>
                <th className="p-2">Título</th>
                <th className="p-2">Descrição</th>
                <th className="p-2">Status</th>
                <th className="p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="p-2">{ticket.id}</td>
                  <td className="p-2">{ticket.titulo}</td>
                  <td className="p-2">{ticket.descricao}</td>
                  <td className="p-2 capitalize">{ticket.status}</td>
                  <td className="p-2 space-x-2">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded p-1"
                    >
                      <option value="aberto">Aberto</option>
                      <option value="em andamento">Em andamento</option>
                      <option value="fechado">Fechado</option>
                    </select>
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
