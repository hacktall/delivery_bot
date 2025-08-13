import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    password: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("avatar", selectedFile);

    try {
      const res = await axios.post(`http://localhost:3000/profile/upload/${user.id}`, form);
      const updatedUser = { ...user, profile_picture: res.data.filePath };
      login(updatedUser, true);
      setMessage("Foto de perfil atualizada!");
    } catch (err) {
      setMessage("Erro ao enviar imagem.");
    }
  };

  const handleUpdateInfo = async () => {
    try {
      await axios.put(`http://localhost:3000/users/${user.id}`, {
        name: formData.name,
        password: formData.password || undefined,
      });

      const updatedUser = { ...user, name: formData.name };
      login(updatedUser, true);
      setMessage("Dados atualizados com sucesso!");
    } catch (err) {
      setMessage("Erro ao atualizar informações.");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-850 text-gray-800 dark:text-gray-100 shadow p-6 rounded-md space-y-4 transition-colors">
      <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">Meu Perfil</h2>

      <div className="flex items-center gap-4">
        <img
          src={
            user?.profile_picture
              ? `http://localhost:3000/uploads/${user.profile_picture}?t=${Date.now()}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
          }
          alt="Avatar"
          className="w-16 h-16 rounded-full object-cover border dark:border-gray-600"
        />
        <form onSubmit={handleUpload} className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="text-sm text-gray-700 dark:text-gray-200 bg-transparent"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors">
            Salvar
          </button>
        </form>
      </div>

      <div className="space-y-2">
        <label className="block">
          Nome:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 mt-1 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          />
        </label>

        <label className="block">
          Nova senha:
          <input
            type="password"
            name="password"
            placeholder="Deixe em branco para manter a atual"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 mt-1 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          />
        </label>

        <button
          onClick={handleUpdateInfo}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
        >
          Atualizar informações
        </button>
      </div>

      <div className="border-t dark:border-gray-600 pt-4 mt-4">
        <p className="font-semibold">
          Plano atual: <span className="text-blue-700 dark:text-blue-300">{user.plan || "Free"}</span>
        </p>
        <button className="mt-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors">
          Fazer upgrade
        </button>
      </div>

      {message && (
        <p className="text-sm text-center text-green-600 dark:text-green-400 mt-2">{message}</p>
      )}
    </div>
  );
}
