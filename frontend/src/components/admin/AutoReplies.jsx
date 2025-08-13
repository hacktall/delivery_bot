// src/components/admin/AutoReplies.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function AutoReplies() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ keyword: "", response: "", active: true });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const fetchList = async () => {
    if (!user?.tenant_id) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/app/auto-replies", {
        params: { tenant_id: user.tenant_id },
      });
      setList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [user]);

  const openCreate = () => {
    setForm({ keyword: "", response: "", active: true });
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({ keyword: item.keyword, response: item.response, active: item.active === 1 });
    setEditingId(item.id);
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.keyword.trim() || !form.response.trim()) {
      setError("Preencha palavra-chave e resposta");
      return;
    }
    try {
      if (editingId) {
        await axios.put(`http://localhost:3000/app/auto-replies/${editingId}`, {
          ...form,
        });
      } else {
        await axios.post("http://localhost:3000/app/auto-replies", {
          ...form,
          tenant_id: user.tenant_id,
        });
      }
      setShowForm(false);
      fetchList();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Falha ao salvar");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir esta regra?")) return;
    try {
      await axios.delete(`http://localhost:3000/app/auto-replies/${id}`);
      fetchList();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Respostas Automáticas</h2>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-1 rounded">
          Nova Regra
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : list.length === 0 ? (
        <p>Nenhuma regra cadastrada.</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 text-left">Palavra-chave</th>
              <th className="p-2 text-left">Resposta</th>
              <th className="p-2">Ativa</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-2">{r.keyword}</td>
                <td className="p-2">{r.response}</td>
                <td className="p-2 text-center">{r.active ? "✅" : "❌"}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => openEdit(r)} className="bg-yellow-500 text-white px-2 py-1 rounded">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="bg-red-600 text-white px-2 py-1 rounded">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md w-full space-y-4">
            <h3 className="text-lg font-semibold">
              {editingId ? "Editar Regra" : "Nova Regra"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm">Palavra-chave</label>
                <input
                  value={form.keyword}
                  onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm">Resposta</label>
                <textarea
                  value={form.response}
                  onChange={(e) => setForm((f) => ({ ...f, response: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="h-4 w-4"
                />
                <label>Ativar resposta automática</label>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1">
                  Cancelar
                </button>
                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
                  {editingId ? "Salvar" : "Criar"}
                </button>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
