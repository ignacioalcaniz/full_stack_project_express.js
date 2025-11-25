import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";

export const Login = () => {
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded mb-4"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-3 border rounded mb-6"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-800">
          Entrar
        </button>
      </form>
    </div>
  );
};
