import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import "./register.css";

const validatePassword = (pwd) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pwd);

export const Register = () => {
  const navigate = useNavigate();
  const captchaRef = useRef(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    age: "",
    email: "",
    password: "",
    captchaToken: "",
  });

  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingBtn, setLoadingBtn] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validatePassword(form.password)) {
      return setError(
        "Contraseña insegura (mínimo 8 caracteres, mayúscula, minúscula, número y símbolo)."
      );
    }

    if (!form.captchaToken) {
      return setError("Debés completar el captcha.");
    }

    setLoadingBtn(true);

    try {
      const payload = { ...form, age: Number(form.age) };

      const res = await axiosClient.post("/users/register", payload, {
        headers: { "x-captcha-token": form.captchaToken },
      });

      if (res.status === 201) {
        setSuccess("✅ Cuenta creada correctamente. Ahora podés iniciar sesión.");
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.details)
          ? err.response.data.details.join(" · ")
          : "") ||
        "Error creando la cuenta";

      setError(msg);

      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
      }

      setForm((prev) => ({ ...prev, captchaToken: "" }));
    } finally {
      setLoadingBtn(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Crear cuenta</h2>
        <p className="auth-subtitle">Accedé a compras, perfil y beneficios</p>

        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-field">
            <label>Nombre</label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={onChange}
              required
            />
          </div>

          <div className="auth-field">
            <label>Apellido</label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={onChange}
              required
            />
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              className={
                form.email.length > 3
                  ? "input-valid"
                  : form.email === ""
                  ? ""
                  : "input-invalid"
              }
              onChange={onChange}
              required
            />
          </div>

          <div className="auth-field">
            <label>Edad</label>
            <input
              type="number"
              name="age"
              min="13"
              max="120"
              value={form.age}
              onChange={onChange}
              required
            />
          </div>

          <div className="auth-field">
            <label>Contraseña</label>
            <input
              type={showPwd ? "text" : "password"}
              name="password"
              value={form.password}
              className={
                validatePassword(form.password)
                  ? "input-valid"
                  : form.password === ""
                  ? ""
                  : "input-invalid"
              }
              onChange={onChange}
              required
            />
            <span
              className="input-icon"
              onClick={() => setShowPwd(!showPwd)}
            >
              {showPwd ? "🙈" : "👁️"}
            </span>
          </div>

          <div className="captcha-box">
            <HCaptcha
              sitekey={process.env.REACT_APP_HCAPTCHA_SITEKEY}
              onVerify={(token) =>
                setForm((prev) => ({ ...prev, captchaToken: token }))
              }
              ref={captchaRef}
            />
          </div>

          <button className="auth-button" disabled={loadingBtn}>
            {loadingBtn ? "Creando..." : "Registrarse"}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tenés cuenta?{" "}
          <button className="auth-link" onClick={() => navigate("/login")}>
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
};





