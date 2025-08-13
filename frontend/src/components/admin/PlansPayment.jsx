// src/components/admin/PlansPayment.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function PlansPayment() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    if (!user?.tenant_id) return;
    setLoading(true);
    try {
      const [plansRes, currRes, invRes] = await Promise.all([
        axios.get("http://localhost:3000/app/plans"),
        axios.get("http://localhost:3000/app/plan/current", { params: { tenant_id: user.tenant_id } }),
        axios.get("http://localhost:3000/app/invoices", { params: { tenant_id: user.tenant_id } }),
      ]);
      setPlans(plansRes.data);
      setCurrentPlan(currRes.data);
      setInvoices(invRes.data);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados de plano/pagamento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [user]);

  const handleChangePlan = async (planId) => {
    setChanging(true);
    setError("");
    try {
      await axios.post("http://localhost:3000/app/plan/change", {
        tenant_id: user.tenant_id,
        plan_id: planId,
      });
      await fetchAll();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Falha ao mudar plano");
    } finally {
      setChanging(false);
    }
  };

  if (loading) return <p>Carregando planos...</p>;

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Plano & Pagamento</h2>
      {error && <p className="text-red-600">{error}</p>}

      {/* Planos disponíveis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map((p) => {
          const price = Number(p.price);
          return (
            <div
              key={p.id}
              className={`p-6 rounded-lg shadow transition ${
                currentPlan?.id === p.id
                  ? "border-2 border-blue-600 bg-blue-50 dark:bg-blue-900"
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className="text-2xl my-2">R$ {price.toFixed(2)}</p>
              <ul className="list-disc ml-5 text-sm mb-4">
                {JSON.parse(p.features).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              {currentPlan?.id === p.id ? (
                <button disabled className="w-full bg-gray-400 text-white py-2 rounded">Atual</button>
              ) : (
                <button
                  onClick={() => handleChangePlan(p.id)}
                  disabled={changing}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {changing ? "Alterando..." : "Selecionar"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Histórico de faturas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Histórico de Faturas</h3>
        {invoices.length === 0 ? (
          <p>Nenhuma fatura encontrada.</p>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="p-2">ID</th>
                <th className="p-2">Plano</th>
                <th className="p-2">Valor</th>
                <th className="p-2">Emitida em</th>
                <th className="p-2">Pago em</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const amt = Number(inv.amount);
                return (
                  <tr key={inv.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-2">{inv.id}</td>
                    <td className="p-2">{inv.plan_name}</td>
                    <td className="p-2">R$ {amt.toFixed(2)}</td>
                    <td className="p-2">{new Date(inv.issued_at).toLocaleDateString()}</td>
                    <td className="p-2">{inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : "—"}</td>
                    <td className="p-2 capitalize">{inv.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
