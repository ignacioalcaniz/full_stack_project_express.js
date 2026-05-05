import { useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./ForgotPassword.css";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await axiosClient.post("/users/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setMessage(
        data?.message ||
          "Si el correo existe, te enviamos instrucciones para recuperar tu cuenta."
      );
      setEmail("");
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "No pudimos procesar la solicitud."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-page">
      <section className="forgot-card">
        <h1>Recuperar contraseña</h1>
        <p className="forgot-subtitle">
          Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {message && <div className="forgot-alert success">{message}</div>}
        {error && <div className="forgot-alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="forgot-form">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="tuemail@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <div className="forgot-links">
          <Link to="/login">Volver a iniciar sesión</Link>
        </div>
      </section>
    </main>
  );
};