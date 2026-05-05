// src/pages/Admin/pages/AdminSettings.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import "../components/AdminUI.css";

const DEFAULT_FORM = {
  maintenanceMode: false,
  passwordPolicy: "medium",
  inactiveUserDays: 90,
  rateLimitMax: 100,
  externalIntegrations: {
    whatsappWebhook: "",
    emailProvider: "",
  },
};

function deepEqual(a, b) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

function clampNumber(value, { min, max, fallback }) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

  const showToast = useCallback((kind, message) => {
    setToast({ kind, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const normalizeFromBackend = useCallback((s) => {
    return {
      maintenanceMode: Boolean(s?.maintenanceMode),
      passwordPolicy: s?.passwordPolicy || "medium",
      inactiveUserDays: clampNumber(s?.inactiveUserDays, { min: 1, max: 3650, fallback: 90 }),
      rateLimitMax: clampNumber(s?.rateLimitMax, { min: 10, max: 5000, fallback: 100 }),
      externalIntegrations: {
        whatsappWebhook: (s?.externalIntegrations?.whatsappWebhook || "").trim(),
        emailProvider: (s?.externalIntegrations?.emailProvider || "").trim(),
      },
    };
  }, []);

  const validate = useCallback((f) => {
    const issues = [];

    if (!["weak", "medium", "strong"].includes(f.passwordPolicy)) {
      issues.push("Password policy inválida.");
    }

    const inactive = Number(f.inactiveUserDays);
    if (!Number.isFinite(inactive) || inactive < 1 || inactive > 3650) {
      issues.push("inactiveUserDays debe estar entre 1 y 3650.");
    }

    const rl = Number(f.rateLimitMax);
    if (!Number.isFinite(rl) || rl < 10 || rl > 5000) {
      issues.push("rateLimitMax debe estar entre 10 y 5000.");
    }

    return issues;
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await axiosClient.get("/admin/settings");
      const s = unwrap(res);

      setSettings(s);
      setForm(normalizeFromBackend(s));
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Error");
      showToast("danger", e?.response?.data?.error || e.message || "Error");
    } finally {
      setLoading(false);
    }
  }, [normalizeFromBackend, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const baseline = useMemo(() => normalizeFromBackend(settings), [settings, normalizeFromBackend]);
  const isDirty = useMemo(() => !deepEqual(form, baseline), [form, baseline]);

  const issues = useMemo(() => validate(form), [form, validate]);
  const canSave = isDirty && issues.length === 0 && !loading;

  const pills = useMemo(() => {
    return [
      {
        label: "Maintenance",
        value: form.maintenanceMode ? "ON" : "OFF",
        kind: form.maintenanceMode ? "warn" : "ok",
      },
      { label: "Password", value: form.passwordPolicy, kind: "ghost" },
      { label: "Inactive", value: `${Number(form.inactiveUserDays)} días`, kind: "ghost" },
      { label: "Rate limit", value: `${Number(form.rateLimitMax)} req/min`, kind: "ghost" },
    ];
  }, [form]);

  const save = useCallback(async () => {
    try {
      const errs = validate(form);
      if (errs.length) {
        showToast("danger", errs[0]);
        return;
      }

      setLoading(true);
      setErr(null);

      const payload = {
        maintenanceMode: Boolean(form.maintenanceMode),
        passwordPolicy: form.passwordPolicy,
        inactiveUserDays: clampNumber(form.inactiveUserDays, { min: 1, max: 3650, fallback: 90 }),
        rateLimitMax: clampNumber(form.rateLimitMax, { min: 10, max: 5000, fallback: 100 }),
        externalIntegrations: {
          whatsappWebhook: (form.externalIntegrations?.whatsappWebhook || "").trim(),
          emailProvider: (form.externalIntegrations?.emailProvider || "").trim(),
        },
      };

      const res = await axiosClient.put("/admin/settings", payload);
      const s = unwrap(res);

      setSettings(s);
      setForm(normalizeFromBackend(s));
      showToast("ok", "Settings guardadas.");
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || "Error";
      setErr(msg);
      showToast("danger", msg);
    } finally {
      setLoading(false);
    }
  }, [form, normalizeFromBackend, showToast, validate]);

  const resetToSaved = useCallback(() => {
    setForm(baseline);
    showToast("ok", "Cambios descartados.");
  }, [baseline, showToast]);

  return (
    <div className="admin-page">
      {toast && <div className={`admin-toast ${toast.kind}`}>{toast.message}</div>}

      <div className="admin-head">
        <div>
          <h1 className="admin-h1">Settings</h1>
          
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="admin-btn secondary" onClick={load} disabled={loading} type="button">
            {loading ? "Cargando..." : "Refrescar"}
          </button>

          <button className="admin-btn secondary" onClick={resetToSaved} disabled={!isDirty || loading} type="button">
            Descartar cambios
          </button>

          <button className="admin-btn primary" onClick={save} disabled={!canSave} type="button">
            {loading ? "Guardando..." : isDirty ? "Guardar cambios" : "Guardado"}
          </button>
        </div>
      </div>

      {err && <div className="admin-alert danger">❌ {err}</div>}

      <div className="admin-card">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 950, color: "#0f172a" }}>Resumen</div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {pills.map((p) => (
              <span
                key={p.label}
                className={`pill ${p.kind === "warn" ? "warn" : p.kind === "ok" ? "ok" : ""}`}
                title={p.label}
              >
                {p.label}: {p.value}
              </span>
            ))}

            {isDirty && (
              <span className="pill warn" title="Hay cambios sin guardar">
                Cambios pendientes
              </span>
            )}
          </div>
        </div>

        {issues.length > 0 && (
          <div className="admin-alert danger" style={{ marginTop: 12 }}>
            ❌ {issues[0]}
          </div>
        )}

        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          <div
            className="admin-card"
            style={{
              borderRadius: 18,
              background: form.maintenanceMode ? "rgba(245,158,11,.08)" : "white",
              borderColor: form.maintenanceMode ? "rgba(245,158,11,.22)" : "#e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 950, color: "#0f172a" }}>Maintenance mode</div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, marginTop: 4 }}>
                  
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className={`pill ${form.maintenanceMode ? "warn" : "ok"}`}>
                  {form.maintenanceMode ? "ON" : "OFF"}
                </span>
                <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 900 }}>
                  <input
                    type="checkbox"
                    checked={form.maintenanceMode}
                    onChange={(e) => setForm((p) => ({ ...p, maintenanceMode: e.target.checked }))}
                  />
                  Activar
                </label>
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ borderRadius: 18 }}>
            <div style={{ fontWeight: 950, color: "#0f172a" }}>Seguridad</div>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, marginTop: 4 }}>
             
            </div>

            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Password policy</div>
                <select
                  className="admin-select"
                  value={form.passwordPolicy}
                  onChange={(e) => setForm((p) => ({ ...p, passwordPolicy: e.target.value }))}
                >
                  <option value="weak">weak</option>
                  <option value="medium">medium</option>
                  <option value="strong">strong</option>
                </select>
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Días usuario inactivo</div>
                <input
                  className="admin-input"
                  type="number"
                  min={1}
                  max={3650}
                  value={form.inactiveUserDays}
                  onChange={(e) => setForm((p) => ({ ...p, inactiveUserDays: e.target.value }))}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Rate limit máximo (req/min)</div>
                <input
                  className="admin-input"
                  type="number"
                  min={10}
                  max={5000}
                  value={form.rateLimitMax}
                  onChange={(e) => setForm((p) => ({ ...p, rateLimitMax: e.target.value }))}
                />
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, marginTop: 6 }}>
                
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ borderRadius: 18 }}>
            <div style={{ fontWeight: 950, color: "#0f172a" }}>Integraciones</div>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, marginTop: 4 }}>
              Parámetros para integrar WhatsApp / Email sin tocar código.
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>WhatsApp webhook</div>
                <input
                  className="admin-input"
                  placeholder="https://..."
                  value={form.externalIntegrations.whatsappWebhook}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      externalIntegrations: { ...p.externalIntegrations, whatsappWebhook: e.target.value },
                    }))
                  }
                />
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Email provider</div>
                <input
                  className="admin-input"
                  placeholder="resend | sendgrid | smtp"
                  value={form.externalIntegrations.emailProvider}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      externalIntegrations: { ...p.externalIntegrations, emailProvider: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ borderRadius: 18 }}>
            <div style={{ fontWeight: 950, color: "#0f172a" }}>Estado</div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: "#64748b", fontWeight: 900 }}>Documento Settings</span>
                <span style={{ fontWeight: 950, color: "#0f172a" }}>
                  {settings?._id ? "OK" : "No inicializado"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: "#64748b", fontWeight: 900 }}>Última actualización</span>
                <span style={{ fontWeight: 950, color: "#0f172a" }}>
                  {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleString("es-AR") : "—"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: "#64748b", fontWeight: 900 }}>Creado</span>
                <span style={{ fontWeight: 950, color: "#0f172a" }}>
                  {settings?.createdAt ? new Date(settings.createdAt).toLocaleString("es-AR") : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

