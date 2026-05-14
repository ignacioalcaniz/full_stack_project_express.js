import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import "./login.css";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const login = useAuthStore((s) => s.login);
  const clearPendingLoginOtp = useAuthStore((s) => s.clearPendingLoginOtp);
  const emailOtpRequired = useAuthStore((s) => s.emailOtpRequired);
  const pendingLoginToken = useAuthStore((s) => s.pendingLoginToken);
  const pendingLoginEmail = useAuthStore((s) => s.pendingLoginEmail);

  const redirectTo = location.state?.from || "/tienda";

  const otpRefs = useRef(Array.from({ length: OTP_LENGTH }, () => null));

  const [form, setForm] = useState({
    email: "",
    password: "",
    code: "",
  });

  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(RESEND_SECONDS);
  const [otpInfoMessage, setOtpInfoMessage] = useState("");

  const otpCode = useMemo(() => otpDigits.join(""), [otpDigits]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, code: otpCode }));
  }, [otpCode]);

  useEffect(() => {
    if (!emailOtpRequired) return;

    setResendCountdown(RESEND_SECONDS);
    setOtpInfoMessage("");

    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [emailOtpRequired, pendingLoginToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (error) {
      setError("");
    }
  };

  const focusOtpIndex = (index) => {
    const input = otpRefs.current[index];
    if (input) input.focus();
  };

  const clearOtpInputs = () => {
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setForm((prev) => ({ ...prev, code: "" }));
  };

  const handleOtpDigitChange = (index, rawValue) => {
    const value = rawValue.replace(/\D/g, "");

    if (!value) {
      const nextDigits = [...otpDigits];
      nextDigits[index] = "";
      setOtpDigits(nextDigits);
      if (error) setError("");
      return;
    }

    if (value.length > 1) {
      const pasted = value.slice(0, OTP_LENGTH).split("");
      const nextDigits = Array(OTP_LENGTH).fill("");

      pasted.forEach((digit, idx) => {
        nextDigits[idx] = digit;
      });

      setOtpDigits(nextDigits);
      setError("");

      const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      focusOtpIndex(nextIndex);
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = value;
    setOtpDigits(nextDigits);
    setError("");

    if (index < OTP_LENGTH - 1) {
      focusOtpIndex(index + 1);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otpDigits[index]) {
        const nextDigits = [...otpDigits];
        nextDigits[index] = "";
        setOtpDigits(nextDigits);
      } else if (index > 0) {
        focusOtpIndex(index - 1);
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      focusOtpIndex(index - 1);
    }

    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusOtpIndex(index + 1);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const nextDigits = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, idx) => {
      nextDigits[idx] = digit;
    });

    setOtpDigits(nextDigits);
    setError("");

    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    focusOtpIndex(nextIndex);
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingBtn(true);

    try {
      const result = await login({
        email: form.email,
        password: form.password,
      });

      if (result?.emailOtpRequired) {
        clearOtpInputs();
        setOtpInfoMessage("");
        setTimeout(() => focusOtpIndex(0), 0);
        return;
      }

      if (!result?.success) {
        setError(result?.error || "Error iniciando sesión");
        return;
      }

      const role = result?.user?.role;

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Error iniciando sesión";

      setError(msg);
    } finally {
      setLoadingBtn(false);
    }
  };

  const handleSubmitOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingBtn(true);

    try {
      const result = await login({
        pendingLoginToken,
        otpCode,
      });

      if (!result?.success) {
        setError(result?.error || "El código ingresado es incorrecto o expiró.");
        clearOtpInputs();

        setTimeout(() => {
          focusOtpIndex(0);
        }, 0);

        return;
      }

      const role = result?.user?.role;

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "El código ingresado es incorrecto o expiró.";

      setError(msg);
      clearOtpInputs();

      setTimeout(() => {
        focusOtpIndex(0);
      }, 0);
    } finally {
      setLoadingBtn(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0 || resending) return;

    setResending(true);
    setError("");
    setOtpInfoMessage("");

    try {
      const result = await login({
        email: pendingLoginEmail || form.email,
        password: form.password,
      });

      if (result?.emailOtpRequired) {
        clearOtpInputs();
        setOtpInfoMessage("Te enviamos un nuevo código. Usá solo el último.");
        setResendCountdown(RESEND_SECONDS);
        setTimeout(() => focusOtpIndex(0), 0);
      } else if (!result?.success) {
        setError(result?.error || "No se pudo reenviar el código.");
      }
    } catch {
      setError("No se pudo reenviar el código.");
    } finally {
      setResending(false);
    }
  };

  const goBackToLogin = () => {
    clearPendingLoginOtp();
    clearOtpInputs();
    setError("");
    setOtpInfoMessage("");
    setResendCountdown(RESEND_SECONDS);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          {emailOtpRequired ? "Verificación por email" : "Bienvenido"}
        </h2>

        <p className="auth-subtitle">
          {emailOtpRequired
            ? `Ingresá el código de 6 dígitos enviado a ${pendingLoginEmail || form.email}`
            : "Iniciá sesión para continuar"}
        </p>

        {emailOtpRequired && (
          <p className="otp-info">
            Usá solo el <strong>último código</strong> enviado. Si pediste otro,
            los anteriores ya no funcionan.
          </p>
        )}

        {otpInfoMessage && <div className="auth-success">{otpInfoMessage}</div>}

        {error && (
          <div
            className="auth-error"
            role="alert"
            aria-live="polite"
            style={{ marginBottom: "14px" }}
          >
            {error}
          </div>
        )}

        {!emailOtpRequired ? (
          <form className="auth-form" onSubmit={handleSubmitPassword}>
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="tuemail@ejemplo.com"
                value={form.email}
                onChange={handleChange}
                className={
                  form.email.length > 3
                    ? "input-valid"
                    : form.email.length === 0
                    ? ""
                    : "input-invalid"
                }
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label>Contraseña</label>
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className={
                  form.password.length >= 8
                    ? "input-valid"
                    : form.password.length === 0
                    ? ""
                    : "input-invalid"
                }
                required
                autoComplete="current-password"
              />
              <span
                className="input-icon"
                onClick={() => setShowPwd(!showPwd)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setShowPwd((prev) => !prev);
                  }
                }}
              >
                {showPwd ? "🙈" : "👁️"}
              </span>
            </div>

            <div style={{ marginTop: "-2px", marginBottom: "8px", textAlign: "right" }}>
              <Link
                to="/forgot-password"
                className="auth-link"
                style={{ fontSize: "14px", fontWeight: 700 }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button className="auth-button" disabled={loadingBtn}>
              {loadingBtn ? "Ingresando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSubmitOtp}>
            <div className="auth-field">
              <label>Código de verificación</label>

              <div className="otp-grid" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    className={`otp-box ${digit ? "otp-box-filled" : ""}`}
                    value={digit}
                    maxLength={1}
                    onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    aria-label={`Dígito ${index + 1} del código`}
                  />
                ))}
              </div>
            </div>

            <button
              className="auth-button"
              disabled={loadingBtn || otpCode.length !== OTP_LENGTH}
            >
              {loadingBtn ? "Verificando..." : "Confirmar código"}
            </button>

            <button
              type="button"
              className="auth-link resend-link"
              onClick={handleResendCode}
              disabled={resending || resendCountdown > 0 || loadingBtn}
            >
              {resending
                ? "Reenviando..."
                : resendCountdown > 0
                ? `Reenviar código en ${resendCountdown}s`
                : "Reenviar código"}
            </button>

            <button
              type="button"
              className="auth-button auth-button-secondary"
              onClick={goBackToLogin}
              disabled={loadingBtn || resending}
            >
              Volver
            </button>
          </form>
        )}

        {!emailOtpRequired && (
          <p className="auth-footer">
            ¿No tenés cuenta?{" "}
            <button
              type="button"
              className="auth-link"
              onClick={() => navigate("/register")}
            >
              Crear cuenta
            </button>
          </p>
        )}
      </div>
    </div>
  );
};








