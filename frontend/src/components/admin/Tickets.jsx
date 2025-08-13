import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Ticketsadmin() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);

  const updateStatus = async (id, newStatus) => {
  try {
    await axios.patch(`http://localhost:3000/app/tickets/${id}`, {
      status: newStatus
    });
    fetchTickets(); // Atualiza lista após mudar status
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
  }
};

  
  
  
  
  
  const fetchTickets = async () => {
  if (!user?.tenant_id) return;

  try {
    const res = await axios.get('http://localhost:3000/app/tickets', {
      params: { tenant_id: user.tenant_id }
    });
    setTickets(res.data);
  } catch (err) {
    console.error('Erro ao buscar tickets:', err);
  }
};

useEffect(() => {
  fetchTickets();
}, [user]);


  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Tickets de Suporte</h2>
      {tickets.map((ticket) => (
        <div key={ticket.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-bold">{ticket.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{ticket.message}</p>
              <small className="text-sm text-gray-400">Enviado por: {ticket.user_name}</small>
            </div>
            <select
              className="bg-gray-100 dark:bg-gray-700 text-sm rounded px-2 py-1"
              value={ticket.status}
              onChange={(e) => updateStatus(ticket.id, e.target.value)}
            >
              <option value="aberto">Aberto</option>
              <option value="em_andamento">Em andamento</option>
              <option value="resolvido">Resolvido</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
