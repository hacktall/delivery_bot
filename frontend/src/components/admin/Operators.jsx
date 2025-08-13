// src/components/admin/Operators.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function Operators() {
  const { user } = useAuth();
  const [ops, setOps] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const fetchOps = async () => {
    if (!user?.tenant_id) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/app/operators", {
        params: {
          tenant_id: user.tenant_id,
          q,
          limit,
          offset: page * limit,
        },
      });
      setOps(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Erro ao buscar operadores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOps();
    // eslint-disable-next-line
  }, [user, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      fetchOps();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [q]);

  const openCreate = () => {
    setForm({ name: "", email: "", password: "" });
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (o) => {
    setForm({ name: o.name, email: o.email, password: "" });
    setEditingId(o.id);
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || form.name.length < 2) return setError("Nome inválido");
    if (!form.email) return setError("Email obrigatório");
    if (!editingId && form.password.length < 6) return setError("Senha mínima 6 caracteres");

    try {
      if (editingId) {
        await axios.put(`http://localhost:3000/app/operators/${editingId}`, form);
      } else {
        await axios.post("http://localhost:3000/app/operators", {
          ...form,
          tenant_id: user.tenant_id,
        });
      }
      setShowForm(false);
      fetchOps();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Erro ao salvar operador");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir este operador?")) return;
    try {
      await axios.delete(`http://localhost:3000/app/operators/${id}`);
      fetchOps();
    } catch (err) {
      console.error("Erro ao excluir:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Operadores</h2>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-1 rounded">
          Novo Operador
        </button>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nome ou email"
        className="w-full p-2 border rounded mb-2"
      />

      {loading ? (
        <p>Carregando...</p>
      ) : ops.length === 0 ? (
        <p>Nenhum operador encontrado.</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 text-left">Nome</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2">Criado em</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {ops.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-2">{o.name}</td>
                <td className="p-2">{o.email}</td>
                <td className="p-2">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => openEdit(o)} className="bg-yellow-500 text-white px-2 py-1 rounded">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(o.id)} className="bg-red-600 text-white px-2 py-1 rounded">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Paginação */}
      <div className="flex justify-between items-center mt-2">
        <div>{total} operadores</div>
        <div className="space-x-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            disabled={(page + 1) * limit >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      </div>

      {/* Modal/Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md w-full space-y-4">
            <h3 className="text-lg font-semibold">
              {editingId ? "Editar Operador" : "Novo Operador"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm">Nome</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              {!editingId && (
                <div>
                  <label className="block text-sm">Senha</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2">
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
