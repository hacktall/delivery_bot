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
    if (!selectedFile) {
      setMessage("Selecione uma imagem antes de enviar.");
      return;
    }

    const form = new FormData();
    form.append("avatar", selectedFile);

    try {
      const res = await axios.post(`http://localhost:3000/profile/upload/${user.id}`, form);
      const updatedUser = { ...user, profile_picture: res.data.filePath };
      login(updatedUser, true); // Atualiza o contexto
      setMessage("Foto de perfil atualizada!");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao enviar imagem.");
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:3000/users/${user.id}`, {
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
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow p-6 rounded-md space-y-6 border border-gray-200 dark:border-gray-700 transition-all">
      <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">Meu Perfil</h2>

      <div className="flex items-center gap-4">
        <img
          src={
            user?.profile_picture
              ? `http://localhost:3000/uploads/${user.profile_picture}?t=${Date.now()}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}`
          }
          alt="Avatar"
          className="w-16 h-16 rounded-full object-cover border dark:border-gray-600"
        />
        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-2">
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="text-sm text-gray-600 dark:text-gray-300"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
          >
            Salvar
          </button>
        </form>
      </div>

      <form onSubmit={handleUpdateInfo} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Nome:</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Nova senha:</span>
          <input
            type="password"
            name="password"
            placeholder="Deixe em branco para manter a atual"
            value={formData.password}
            onChange={handleChange}
            className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          />
        </label>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
        >
          Atualizar informações
        </button>
      </form>

      <div className="border-t dark:border-gray-600 pt-4">
        <p className="font-semibold">
          Plano atual: <span className="text-blue-700 dark:text-yellow-400">{user.plan || "Free"}</span>
        </p>
        <button className="mt-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors">
          Fazer upgrade
        </button>
      </div>

      {message && (
        <p className="text-sm text-center mt-4 text-green-700 dark:text-green-400">{message}</p>
      )}
    </div>
  );
}
