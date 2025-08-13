// src/components/admin/Contacts.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function downloadCSV(rows, filename = "contacts.csv") {
  const headers = ["id", "name", "email", "phone", "notes", "created_at"];
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => `"${(r[h] ?? "").toString().replace(/"/g, '""')}"`).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function Contacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const fetchContacts = async () => {
    if (!user?.tenant_id) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/app/contacts", {
  params: { 
    tenant_id: user.tenant_id, q, limit,offset: page * limit }});
      setContacts(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Erro ao buscar contatos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line
  }, [user, page]);

  // search debounce simple
  useEffect(() => {
    const t = setTimeout(() => { setPage(0); fetchContacts(); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [q]);

  const openCreate = () => {
    setForm({ name: "", email: "", phone: "", notes: "" });
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const openEdit = (c) => {
    setForm({ name: c.name || "", email: c.email || "", phone: c.phone || "", notes: c.notes || "" });
    setEditingId(c.id);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || form.name.length < 2) { setError("Nome inválido"); return; }

    try {
      if (editingId) {
        await axios.put(`http://localhost:3000/app/contacts/${editingId}`, { ...form });
      } else {
        await axios.post("http://localhost:3000/app/contacts", { ...form, tenant_id: user.tenant_id });
      }
      setShowForm(false);
      fetchContacts();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Erro ao salvar contato");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir contato?")) return;
    try {
      await axios.delete(`http://localhost:3000/app/contacts/${id}`);
      fetchContacts();
    } catch (err) {
      console.error("Erro ao excluir:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Contatos / Clientes</h2>
        <div className="flex gap-2">
          <button onClick={() => downloadCSV(contacts)} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">Exportar CSV</button>
          <button onClick={openCreate} className="bg-blue-600 text-white px-3 py-1 rounded">Novo Contato</button>
        </div>
      </div>

      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, email ou telefone" className="p-2 border rounded flex-1"/>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : contacts.length === 0 ? (
        <p>Nenhum contato encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Telefone</th>
                <th className="p-2 text-left">Notas</th>
                <th className="p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.email}</td>
                  <td className="p-2">{c.phone}</td>
                  <td className="p-2">{c.notes}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => openEdit(c)} className="bg-yellow-500 text-white px-2 py-1 rounded">Editar</button>
                    <button onClick={() => handleDelete(c.id)} className="bg-red-600 text-white px-2 py-1 rounded">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* pagination */}
      <div className="flex items-center justify-between mt-4">
        <div>{total} contatos</div>
        <div className="flex gap-2">
          <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p-1))} className="px-3 py-1 bg-gray-200 rounded">Anterior</button>
          <button disabled={(page+1)*limit >= total} onClick={() => setPage(p => p+1)} className="px-3 py-1 bg-gray-200 rounded">Próximo</button>
        </div>
      </div>

      {/* modal/form */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-2">{editingId ? "Editar Contato" : "Novo Contato"}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm">Nome</label>
                <input className="w-full p-2 border rounded" value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm">Email</label>
                <input className="w-full p-2 border rounded" value={form.email} onChange={(e) => setForm(f => ({...f, email: e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm">Telefone</label>
                <input className="w-full p-2 border rounded" value={form.phone} onChange={(e) => setForm(f => ({...f, phone: e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm">Notas</label>
                <textarea className="w-full p-2 border rounded" value={form.notes} onChange={(e) => setForm(f => ({...f, notes: e.target.value}))} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">{editingId ? "Salvar" : "Criar"}</button>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
