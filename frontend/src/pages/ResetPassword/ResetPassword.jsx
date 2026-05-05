import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./ResetPassword.css";

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Falta el token de recuperación.");
        setChecking(false);
        return;
      }

      try {
        await axiosClient.get(
          `/users/reset-password/validate?token=${encodeURIComponent(token)}`
        );
        setValidToken(true);
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "El enlace es inválido o expiró."
        );
        setValidToken(false);
      } finally {
        setChecking(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Completá ambos campos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axiosClient.post("/users/reset-password", {
        token,
        newPassword,
      });

      setMessage(
        data?.message || "Contraseña actualizada correctamente."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "No pudimos restablecer la contraseña."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="reset-page">
      <section className="reset-card">
        <h1>Restablecer contraseña</h1>

        {checking && <p className="reset-subtitle">Validando enlace...</p>}

        {!checking && error && <div className="reset-alert error">{error}</div>}
        {message && <div className="reset-alert success">{message}</div>}

        {!checking && validToken && (
          <>
            <p className="reset-subtitle">
              Elegí una nueva contraseña segura para tu cuenta.
            </p>

            <form onSubmit={handleSubmit} className="reset-form">
              <label htmlFor="newPassword">Nueva contraseña</label>
              <input
                id="newPassword"
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              <button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar nueva contraseña"}
              </button>
            </form>
          </>
        )}

        <div className="reset-links">
          <Link to="/login">Volver al login</Link>
        </div>
      </section>
    </main>
  );
};