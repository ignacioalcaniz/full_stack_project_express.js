import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Shield,
  CalendarDays,
  User2,
  ShoppingBag,
  Heart,
  Bell,
  MapPin,
  Save,
  RefreshCcw,
  LockKeyhole,
  Smartphone,
  KeyRound,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/useAuthStore";
import "./Perfil.css";

function normalizeForm(user) {
  return {
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    age: user?.age ?? "",
    avatarUrl: user?.avatarUrl || "",
    phone: user?.phone || "",
    address: user?.address || "",
    preferences: {
      newsletter: Boolean(user?.preferences?.newsletter ?? true),
      notifications: Boolean(user?.preferences?.notifications ?? true),
      publicProfile: Boolean(user?.preferences?.publicProfile ?? false),
    },
    securityPreferences: {
      loginAlerts: Boolean(user?.securityPreferences?.loginAlerts ?? true),
      purchaseAlerts: Boolean(user?.securityPreferences?.purchaseAlerts ?? true),
    },
  };
}

const initialPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export const Perfil = () => {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const globalLoading = useAuthStore((s) => s.loading);

  const fileInputRef = useRef(null);

  const [form, setForm] = useState(() => normalizeForm(user));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [securitySaving, setSecuritySaving] = useState(false);

  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpPending, setOtpPending] = useState(false);

  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    document.title = "Mi perfil - THE LIBRARY";
  }, []);

  useEffect(() => {
    setForm(normalizeForm(user));
  }, [user]);

  const previewName =
    `${form.first_name || ""} ${form.last_name || ""}`.trim() || "Cliente";

  const initials = `${(form.first_name || user?.first_name || "C")[0] || "C"}${
    (form.last_name || user?.last_name || "")[0] || ""
  }`.toUpperCase();

  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-AR")
    : "—";

  const dirty = useMemo(() => {
    if (!user) return false;
    const original = normalizeForm(user);
    const comparableCurrent = {
      ...form,
      securityPreferences: original.securityPreferences,
    };
    return JSON.stringify(original) !== JSON.stringify(comparableCurrent);
  }, [user, form]);

  const securityDirty = useMemo(() => {
    if (!user) return false;
    const current = {
      loginAlerts: Boolean(form.securityPreferences.loginAlerts),
      purchaseAlerts: Boolean(form.securityPreferences.purchaseAlerts),
    };
    const original = {
      loginAlerts: Boolean(user.securityPreferences?.loginAlerts ?? true),
      purchaseAlerts: Boolean(user.securityPreferences?.purchaseAlerts ?? true),
    };
    return JSON.stringify(current) !== JSON.stringify(original);
  }, [form.securityPreferences, user]);

  if (!user) {
    return (
      <main className="perfil-page">
        <div className="perfil-shell">
          <section className="perfil-main-card">
            <h1 className="perfil-title">Mi perfil</h1>
            <p className="perfil-muted">No pudimos cargar los datos del usuario.</p>
          </section>
        </div>
      </main>
    );
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("La foto debe ser una imagen válida.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen no debe superar 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setForm((prev) => ({ ...prev, avatarUrl: result }));
      setError("");
      setMessage("");
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setForm(normalizeForm(user));
    setError("");
    setMessage("");
    setOtpCode("");
    setOtpPending(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      age: Number(form.age),
      avatarUrl: form.avatarUrl || "",
      phone: form.phone.trim(),
      address: form.address.trim(),
      preferences: {
        newsletter: Boolean(form.preferences.newsletter),
        notifications: Boolean(form.preferences.notifications),
        publicProfile: Boolean(form.preferences.publicProfile),
      },
    };

    const res = await updateProfile(payload);

    if (!res?.success) {
      setError(res?.error || "No se pudo guardar el perfil.");
      setSaving(false);
      return;
    }

    await checkAuth();
    setMessage("✅ Perfil actualizado correctamente.");
    setSaving(false);
  };

  const handleSaveSecurity = async () => {
    try {
      setSecuritySaving(true);
      setError("");
      setMessage("");

      await axiosClient.patch("/users/profile/security", {
        loginAlerts: Boolean(form.securityPreferences.loginAlerts),
        purchaseAlerts: Boolean(form.securityPreferences.purchaseAlerts),
      });

      await checkAuth();
      setMessage("✅ Preferencias de seguridad actualizadas.");
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          e?.message ||
          "No se pudieron guardar las preferencias de seguridad."
      );
    } finally {
      setSecuritySaving(false);
    }
  };

  const startEmailProtection = async () => {
    try {
      setOtpSending(true);
      setError("");
      setMessage("");
      setOtpCode("");

      await axiosClient.post("/users/2fa/setup");
      setOtpPending(true);
      setMessage("✅ Te enviamos un código por email para activar la verificación.");
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          e?.message ||
          "No pudimos iniciar la activación."
      );
    } finally {
      setOtpSending(false);
    }
  };

  const verifyEmailProtection = async () => {
    try {
      setOtpVerifying(true);
      setError("");
      setMessage("");

      const res = await axiosClient.post("/users/2fa/verify", {
        code: otpCode.trim(),
      });

      await checkAuth();
      setOtpPending(false);
      setOtpCode("");
      setMessage(res?.data?.message || "✅ Verificación por email activada.");
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Código inválido.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handlePasswordField = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));

    if (passwordError) setPasswordError("");
    if (passwordMessage) setPasswordMessage("");
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordMessage("");

    const currentPassword = passwordForm.currentPassword.trim();
    const newPassword = passwordForm.newPassword.trim();
    const confirmPassword = passwordForm.confirmPassword.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Completá todos los campos de contraseña.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      setPasswordSaving(true);

      await axiosClient.patch("/users/profile/password", {
        currentPassword,
        newPassword,
      });

      setPasswordForm(initialPasswordForm);
      setPasswordMessage("✅ Contraseña actualizada correctamente.");
    } catch (e) {
      setPasswordError(
        e?.response?.data?.error ||
          e?.message ||
          "No se pudo cambiar la contraseña."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <main className="perfil-page">
      <div className="perfil-shell">
        <section className="perfil-main-card">
          <div className="perfil-top">
            <div>
              <span className="perfil-badge">Cuenta personal</span>
              <h1 className="perfil-title">Mi perfil</h1>
              <p className="perfil-subtitle">
                Gestioná tu información, preferencias, seguridad y accesos de tu cuenta en THE LIBRARY.
              </p>
            </div>

            <div className="perfil-actions">
              <Link to="/tienda/mis-compras" className="perfil-btn primary">
                <ShoppingBag size={18} />
                <span>Mis compras</span>
              </Link>

              <button
                type="button"
                className="perfil-btn secondary"
                onClick={handleReset}
                disabled={
                  (!dirty && !securityDirty) ||
                  saving ||
                  securitySaving ||
                  globalLoading
                }
              >
                <RefreshCcw size={18} />
                <span>Restablecer</span>
              </button>

              <button
                type="button"
                className="perfil-btn success"
                onClick={handleSave}
                disabled={!dirty || saving || globalLoading}
              >
                <Save size={18} />
                <span>{saving ? "Guardando..." : "Guardar cambios"}</span>
              </button>
            </div>
          </div>

          {error && <div className="perfil-alert danger">{error}</div>}
          {message && <div className="perfil-alert ok">{message}</div>}

          <div className="perfil-hero">
            <div className="perfil-avatar-wrap">
              <button
                type="button"
                className="perfil-avatar-btn"
                onClick={handleAvatarClick}
              >
                {form.avatarUrl ? (
                  <img
                    src={form.avatarUrl}
                    alt={previewName}
                    className="perfil-avatar-image"
                  />
                ) : (
                  <div className="perfil-avatar-big">{initials}</div>
                )}

                <span className="perfil-avatar-edit">
                  <Camera size={16} />
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </div>

            <div className="perfil-hero-info">
              <h2 className="perfil-name">{previewName}</h2>
              <p className="perfil-email">{user.email}</p>

              <div className="perfil-pills">
                <span className={`perfil-pill ${user.role === "admin" ? "ok" : ""}`}>
                  <Shield size={14} />
                  {user.role || "user"}
                </span>

                <span className="perfil-pill ghost">
                  <CalendarDays size={14} />
                  Desde {createdAt}
                </span>

                {dirty && <span className="perfil-pill warn">Cambios sin guardar</span>}
              </div>
            </div>
          </div>

          <div className="perfil-grid">
            <article className="perfil-card-section">
              <div className="perfil-section-head">
                <User2 size={18} />
                <h3>Información personal</h3>
              </div>

              <div className="perfil-form-grid">
                <div className="perfil-field">
                  <label>Nombre</label>
                  <input
                    className="perfil-input"
                    value={form.first_name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, first_name: e.target.value }))
                    }
                  />
                </div>

                <div className="perfil-field">
                  <label>Apellido</label>
                  <input
                    className="perfil-input"
                    value={form.last_name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, last_name: e.target.value }))
                    }
                  />
                </div>

                <div className="perfil-field">
                  <label>Edad</label>
                  <input
                    className="perfil-input"
                    type="number"
                    min="13"
                    max="120"
                    value={form.age}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, age: e.target.value }))
                    }
                  />
                </div>

                <div className="perfil-field">
                  <label>Email</label>
                  <input className="perfil-input disabled" value={user.email} disabled />
                </div>

                <div className="perfil-field">
                  <label>Teléfono</label>
                  <input
                    className="perfil-input"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+54 351..."
                  />
                </div>

                <div className="perfil-field">
                  <label>Dirección</label>
                  <input
                    className="perfil-input"
                    value={form.address}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Ciudad, provincia..."
                  />
                </div>

                <div className="perfil-field full">
                  <label>Foto de perfil (URL opcional)</label>
                  <input
                    className="perfil-input"
                    value={form.avatarUrl}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, avatarUrl: e.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
            </article>

            <article className="perfil-card-section">
              <div className="perfil-section-head">
                <Bell size={18} />
                <h3>Preferencias</h3>
              </div>

              <div className="perfil-settings-list">
                <label className="perfil-setting-row">
                  <div>
                    <strong>Newsletter</strong>
                    <p>Recibir novedades, ofertas y lanzamientos.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.preferences.newsletter}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          newsletter: e.target.checked,
                        },
                      }))
                    }
                  />
                </label>

                <label className="perfil-setting-row">
                  <div>
                    <strong>Notificaciones</strong>
                    <p>Alertas sobre compras y movimientos de la cuenta.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.preferences.notifications}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: e.target.checked,
                        },
                      }))
                    }
                  />
                </label>

                <label className="perfil-setting-row">
                  <div>
                    <strong>Perfil público</strong>
                    <p>Mostrar una presencia más visible dentro de futuras funciones sociales.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.preferences.publicProfile}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          publicProfile: e.target.checked,
                        },
                      }))
                    }
                  />
                </label>
              </div>
            </article>

            <article className="perfil-card-section">
              <div className="perfil-section-head">
                <LockKeyhole size={18} />
                <h3>Cuenta y seguridad</h3>
              </div>

              <div className="perfil-short-list">
                <div className="perfil-short-item">
                  <span>Email principal</span>
                  <strong>{user.email}</strong>
                </div>

                <div className="perfil-short-item">
                  <span>Autenticación</span>
                  <strong>JWT + Refresh Cookie</strong>
                </div>

                <div className="perfil-short-item">
                  <span>Estado de sesión</span>
                  <strong>Protegida</strong>
                </div>

                <div className="perfil-short-item">
                  <span>Verificación por email</span>
                  <strong>{user.twoFAEnabled ? "Activa" : "No configurada"}</strong>
                </div>
              </div>

              <div className="perfil-settings-list">
                <label className="perfil-setting-row">
                  <div>
                    <strong>Alertas de login</strong>
                    <p>Recibir avisos sobre inicios de sesión importantes.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.securityPreferences.loginAlerts}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        securityPreferences: {
                          ...prev.securityPreferences,
                          loginAlerts: e.target.checked,
                        },
                      }))
                    }
                  />
                </label>

                <label className="perfil-setting-row">
                  <div>
                    <strong>Alertas de compra</strong>
                    <p>Recibir confirmaciones y alertas relacionadas a pedidos.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.securityPreferences.purchaseAlerts}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        securityPreferences: {
                          ...prev.securityPreferences,
                          purchaseAlerts: e.target.checked,
                        },
                      }))
                    }
                  />
                </label>
              </div>

              <div className="perfil-inline-actions">
                <button
                  type="button"
                  className="perfil-btn secondary"
                  onClick={handleSaveSecurity}
                  disabled={!securityDirty || securitySaving}
                >
                  {securitySaving ? "Guardando..." : "Guardar seguridad"}
                </button>
              </div>

              <div className="perfil-2fa-box">
                <strong>Protección adicional por email</strong>
                <p>
                  Agrega una segunda validación por código enviado a tu correo para accesos sensibles.
                </p>

                {!user.twoFAEnabled && !otpPending && (
                  <div className="perfil-inline-actions">
                    <button
                      type="button"
                      className="perfil-btn secondary"
                      onClick={startEmailProtection}
                      disabled={otpSending}
                    >
                      <Smartphone size={18} />
                      <span>{otpSending ? "Enviando..." : "Activar verificación por email"}</span>
                    </button>
                  </div>
                )}

                {otpPending && (
                  <div className="perfil-2fa-form">
                    <label>Ingresá el código recibido por email</label>
                    <input
                      className="perfil-input"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                    />

                    <div className="perfil-inline-actions">
                      <button
                        type="button"
                        className="perfil-btn success"
                        onClick={verifyEmailProtection}
                        disabled={otpVerifying || otpCode.trim().length !== 6}
                      >
                        <span>{otpVerifying ? "Verificando..." : "Confirmar código"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="perfil-2fa-box" style={{ marginTop: "18px" }}>
                <strong style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <KeyRound size={16} />
                  Cambiar contraseña
                </strong>
                <p>
                  Actualizá tu contraseña actual por una nueva más segura.
                </p>

                {passwordError && (
                  <div className="perfil-alert danger" style={{ marginTop: "10px" }}>
                    {passwordError}
                  </div>
                )}

                {passwordMessage && (
                  <div className="perfil-alert ok" style={{ marginTop: "10px" }}>
                    {passwordMessage}
                  </div>
                )}

                <div className="perfil-form-grid" style={{ marginTop: "12px" }}>
                  <div className="perfil-field full">
                    <label>Contraseña actual</label>
                    <input
                      className="perfil-input"
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordField}
                      placeholder="Ingresá tu contraseña actual"
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="perfil-field">
                    <label>Nueva contraseña</label>
                    <input
                      className="perfil-input"
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordField}
                      placeholder="Nueva contraseña"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="perfil-field">
                    <label>Confirmar nueva contraseña</label>
                    <input
                      className="perfil-input"
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordField}
                      placeholder="Repetí la nueva contraseña"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="perfil-inline-actions">
                  <button
                    type="button"
                    className="perfil-btn secondary"
                    onClick={handleChangePassword}
                    disabled={passwordSaving}
                  >
                    {passwordSaving ? "Actualizando..." : "Cambiar contraseña"}
                  </button>
                </div>
              </div>
            </article>

            <article className="perfil-card-section">
              <div className="perfil-section-head">
                <Heart size={18} />
                <h3>Accesos rápidos</h3>
              </div>

              <div className="perfil-quick-links">
                <Link to="/tienda/mis-compras" className="perfil-quick-card">
                  <ShoppingBag size={18} />
                  <div>
                    <strong>Mis compras</strong>
                    <p>Revisá tus últimos pedidos y su historial.</p>
                  </div>
                </Link>

                <Link to="/tienda/libros" className="perfil-quick-card">
                  <Heart size={18} />
                  <div>
                    <strong>Explorar catálogo</strong>
                    <p>Descubrí nuevos libros y seguí comprando.</p>
                  </div>
                </Link>

                <Link to="/tienda" className="perfil-quick-card">
                  <MapPin size={18} />
                  <div>
                    <strong>Volver al inicio</strong>
                    <p>Accedé rápido a lo destacado y lo más buscado.</p>
                  </div>
                </Link>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
};
