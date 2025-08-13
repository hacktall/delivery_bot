// src/components/AuthForm.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Regex simples para validação de e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Função para calcular força de senha
function passwordStrength(pass) {
  let score = 0;

  // Regras de pontuação
  if (pass.length >= 8) score += 1;
  if (/[a-z]/.test(pass)) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/\d/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  if (pass.length >= 12) score += 1;

  const levels = [
    { label: "Muito Fraca", color: "text-red-600" },
    { label: "Fraca", color: "text-orange-500" },
    { label: "Média", color: "text-yellow-600" },
    { label: "Forte", color: "text-green-600" },
    { label: "Muito Forte", color: "text-emerald-500" },
    { label: "Excelente", color: "text-blue-600" },
  ];

  return levels[Math.min(score, levels.length - 1)];
}



export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Autofocus no primeiro campo ao montar e ao alternar form
  useEffect(() => {
    inputRef.current?.focus();
  }, [isLogin]);

  // Handlers
  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    setFormData({ name: "", email: "", password: "", remember: false });
    setError("");
  };

  const handleChange = ({ target: { name, value, type, checked } }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validação inline
    if (!emailRegex.test(formData.email)) {
      setError("Formato de e-mail inválido");
      return;
    }
    if (formData.password.length < 6) {
      setError("Senha deve ter ao menos 6 caracteres");
      return;
    }

    const url = isLogin
      ? "http://localhost:3000/auth/login"
      : "http://localhost:3000/auth/register";

    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    try {
      setLoading(true);
      const res = await axios.post(url, payload);
      const { user, token } = res.data;
      login({ ...user, token }, formData.remember);

      // Redireciona com base no tipo de usuário
if (user.role === "superadmin") {
  navigate("/superadmin");
} else if (user.role === "admin") {
  navigate("/admin");
} else {
  navigate("/user"); // ✅ Redireciona corretamente
}

    } catch (err) {
      if (err.response?.status === 401) {
        setError(err.response.data.error || "Credenciais inválidas");
      } else {
        setError(err.response?.data?.error || "Ocorreu um erro. Tente novamente.");
      }
      console.error("Erro no AuthForm:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-6 transition-shadow hover:shadow-lg"
      >
        <h1 className="text-2xl font-bold text-center">{isLogin ? "Login" : "Cadastro"}</h1>
        <div className="border-b border-gray-300 mb-4" />

        {!isLogin && (
          <div>
            <label htmlFor="name" className="block text-gray-700">Nome</label>
            <input
              ref={inputRef}
              id="name"
              type="text"
              name="name"
              placeholder="Nome"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md mt-1"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-gray-700">Email</label>
          <input
            ref={!isLogin ? null : inputRef}
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md mt-1"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-gray-700">Senha</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Senha"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md mt-1"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {formData.password && (
  <p className={`text-sm mt-1 ${passwordStrength(formData.password).color}`}>
    Força da senha: <strong>{passwordStrength(formData.password).label}</strong>
  </p>
)}       
 </div>
        <div className="flex items-center space-x-2">
          <input
            id="remember"
            type="checkbox"
            name="remember"
            checked={formData.remember}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label htmlFor="remember" className="text-gray-700 text-sm">
            Lembrar-me
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition flex justify-center items-center"
        >
          {loading ? <span className="animate-spin">⏳</span> : isLogin ? "Entrar" : "Cadastrar"}
        </button>

        {isLogin && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate("/forgot")}
              className="text-sm text-blue-600 hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>
        )}

        {error && <p className="text-center text-red-600 mt-2">{error}</p>}

        <p className="text-center text-sm mt-4">
          {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
          <button
            type="button"
            onClick={toggleForm}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? "Cadastrar" : "Login"}
          </button>
        </p>
      </form>
    </div>
  );
}