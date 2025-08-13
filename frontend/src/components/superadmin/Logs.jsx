import React, { useEffect, useState } from "react";
import axios from "axios";

// Gerar mensagens estruturadas 
function formatLogMessage(log) { 
  const data = new Date(log.timestamp).toLocaleString(); 
  return `[${data}] ${log.user_email} → ${log.acao}`;
}

// EXPORTAÇÕES -------------------------

function exportAsCSV(data, filename = "logs.csv") {
  const rows = [
    ["ID", "Email", "Ação", "Data/Hora"],
    ...data.map(log => [
      log.id,
      log.user_email, 
      log.acao, 
      new Date(log.timestamp).toLocaleString(), 
    ]),
  ];
  const blob = new Blob([rows.map(r => r.join(",")).join("\n")], {
    type: "text/csv",
  });
  downloadBlob(blob, filename);
}

function exportAsJSON(data, filename = "logs.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  downloadBlob(blob, filename);
}

function exportAsTXT(data, filename = "logs.txt") {
  const lines = data.map(formatLogMessage).join("\n");
  const blob = new Blob([lines], { type: "text/plain" }); 
  downloadBlob(blob, filename); 
} 

function downloadBlob(blob, filename) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// COMPONENTE ----------------------------

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    email: "", 
    acao: "", 
    inicio: "", 
    fim: "",
  });

  useEffect(() => {
    const timeout = setTimeout(() => fetchLogs(), 400);
    return () => clearTimeout(timeout);
  }, [filters.email, filters.acao]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/logs", {
        params: filters,
      });
      setLogs(res.data);
    } catch (err) { 
      console.error("Erro ao buscar logs:", err); 
    } finally { 
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-gray-800 dark:text-gray-100 transition-colors">
      <h2 className="text-2xl font-bold mb-4">Registros de Ações</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input name="email" type="text" value={filters.email} onChange={handleChange} placeholder="Filtrar por e-mail" className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-2 rounded" /> 
        <input name="acao" type="text" value={filters.acao} onChange={handleChange} placeholder="Filtrar por ação" className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-2 rounded" /> 
        <input name="inicio" type="date" value={filters.inicio} onChange={handleChange} className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-2 rounded" /> 
        <input name="fim" type="date" value={filters.fim} onChange={handleChange} className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-2 rounded" />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <button onClick={fetchLogs} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Aplicar Filtros</button>
        <button onClick={() => exportAsCSV(logs)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Exportar CSV</button>
        <button onClick={() => exportAsJSON(logs)} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Exportar JSON</button>
        <button onClick={() => exportAsTXT(logs)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Exportar TXT</button> 
      </div> 
 
      {loading ? (
        <p>Carregando logs...</p>
      ) : logs.length === 0 ? (
        <p>Nenhum log encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-left text-gray-800 dark:text-gray-100">
                <th className="p-2">ID</th>
                <th className="p-2">Email</th>
                <th className="p-2">Ação</th>
                <th className="p-2">Data/Hora</th>
              </tr>
            </thead> 
            <tbody> 
              {logs.map((log) => ( 
                <tr key={log.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="p-2">{log.id}</td>
                  <td className="p-2">{log.user_email}</td>
                  <td className="p-2">{log.acao}</td>
                  <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody> 
          </table> 
        </div> 
      )}
    </div>
  ); 
} 