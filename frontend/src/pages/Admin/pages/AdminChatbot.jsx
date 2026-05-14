// src/pages/Admin/pages/AdminChatbot.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { AdminTable } from "../components/AdminTable";
import { AdminModal } from "../components/AdminModal";
import "../components/AdminUI.css";

export function AdminChatbot() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // create modal
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", tags: "" });

  // confirm delete modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // UX
  const [q, setQ] = useState("");
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

  const showToast = useCallback((type, text) => {
    setToast({ type, text });

    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await axiosClient.get("/chatbot/faq");
      const payload = unwrap(res);

      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : [];

      setItems(list);
    } catch (e) {
      setItems([]);
      setErr(e?.response?.data?.error || e.message || "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return Array.isArray(items) ? items : [];

    return (Array.isArray(items) ? items : []).filter((f) => {
      const qq = (f.question || "").toLowerCase();
      const aa = (f.answer || "").toLowerCase();
      const tt = (f.tags || []).join(",").toLowerCase();
      return qq.includes(s) || aa.includes(s) || tt.includes(s);
    });
  }, [items, q]);

  const stats = useMemo(() => {
    const total = Array.isArray(items) ? items.length : 0;
    const shown = Array.isArray(filtered) ? filtered.length : 0;
    const tags = new Set();
    (Array.isArray(items) ? items : []).forEach((x) => (x.tags || []).forEach((t) => tags.add(t)));
    return { total, shown, tags: tags.size };
  }, [items, filtered]);

  const columns = useMemo(
    () => [
      {
        key: "question",
        title: "Pregunta",
        render: (f) => (
          <div style={{ minWidth: 0 }}>
            <div className="truncate" style={{ fontWeight: 950 }} title={f.question}>
              {f.question}
            </div>
            <div className="admin-muted truncate" title={f.answer}>
              {f.answer}
            </div>
          </div>
        ),
      },
      {
        key: "tags",
        title: "Tags",
        nowrap: true,
        render: (f) =>
          f.tags?.length ? (
            <div className="admin-tagrow">
              {f.tags.slice(0, 3).map((t) => (
                <span key={t} className="admin-tag">
                  {t}
                </span>
              ))}
              {f.tags.length > 3 && <span className="admin-tag ghost">+{f.tags.length - 3}</span>}
            </div>
          ) : (
            "—"
          ),
      },
      {
        key: "actions",
        title: "",
        align: "right",
        nowrap: true,
        render: (f) => (
          <div style={{ display: "inline-flex", gap: 10 }}>
            <button
              className="admin-btn secondary"
              disabled={loading}
              type="button"
              onClick={() => {
                setForm({
                  question: f.question || "",
                  answer: f.answer || "",
                  tags: (f.tags || []).join(", "),
                });
                setOpen(true);
              }}
              title="Usar como base"
            >
              Usar base
            </button>

            <button
              className="admin-btn danger"
              disabled={loading}
              type="button"
              onClick={() => {
                setToDelete(f);
                setConfirmOpen(true);
              }}
            >
              Eliminar
            </button>
          </div>
        ),
      },
    ],
    [loading]
  );

  const save = useCallback(async () => {
    try {
      setLoading(true);

      const qq = form.question.trim();
      const aa = form.answer.trim();
      if (!qq || !aa) throw new Error("Question y Answer son requeridos");

      const payload = {
        question: qq,
        answer: aa,
        tags: form.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      await axiosClient.post("/chatbot/faq", payload);

      setOpen(false);
      setForm({ question: "", answer: "", tags: "" });

      await load();
      showToast("ok", "FAQ guardada ✅");
    } catch (e) {
      showToast("danger", e?.response?.data?.error || e.message || "Error");
    } finally {
      setLoading(false);
    }
  }, [form, load, showToast]);

  const confirmDelete = useCallback(async () => {
    if (!toDelete?._id) return;

    try {
      setLoading(true);
      await axiosClient.delete(`/chatbot/faq/${toDelete._id}`);
      setConfirmOpen(false);
      setToDelete(null);
      await load();
      showToast("ok", "FAQ eliminada 🧹");
    } catch (e) {
      showToast("danger", e?.response?.data?.error || e.message || "Error");
    } finally {
      setLoading(false);
    }
  }, [toDelete, load, showToast]);

  const preview = useMemo(() => {
    const qq = form.question.trim();
    const aa = form.answer.trim();
    if (!qq && !aa) return null;

    const tags = form.tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return { question: qq || "—", answer: aa || "—", tags };
  }, [form]);

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div>
          <h1 className="admin-h1">Chatbot</h1>
          <p className="admin-sub">Entrenamiento “controlado” con FAQs.</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="admin-btn secondary" onClick={load} disabled={loading} type="button">
            {loading ? "Cargando..." : "Refrescar"}
          </button>
          <button
            className="admin-btn primary"
            onClick={() => {
              setForm({ question: "", answer: "", tags: "" });
              setOpen(true);
            }}
            disabled={loading}
            type="button"
          >
            Nueva FAQ
          </button>
        </div>
      </div>

      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          <div style={{ fontWeight: 950 }}>{toast.text}</div>
        </div>
      )}

      {err && <div className="admin-alert danger">❌ {err}</div>}

      <div className="admin-card admin-chatbot-hero">
        <div className="admin-chatbot-hero-top">
          <div>
            <div style={{ fontWeight: 950, color: "#0f172a" }}>Base de conocimiento</div>
            <div className="admin-muted" style={{ marginTop: 4 }}>
              Total: <b>{stats.total}</b> · Mostrando: <b>{stats.shown}</b> · Tags únicos: <b>{stats.tags}</b>
            </div>
          </div>

          <div className="admin-chatbot-hero-actions">
            <input
              className="admin-input"
              placeholder="Buscar por pregunta, respuesta o tag…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="admin-btn secondary" type="button" onClick={() => setQ("")} disabled={!q}>
              Limpiar
            </button>
          </div>
        </div>

        <div className="admin-chatbot-grid">
          <div className="admin-chatbot-table">
            <AdminTable columns={columns} rows={filtered} empty="No hay FAQs." />
          </div>

          <div className="admin-chatbot-side">
            <div className="admin-card" style={{ borderRadius: 18 }}>
              <div style={{ fontWeight: 950, color: "#0f172a" }}>Tips PRO</div>
              <div className="admin-muted" style={{ marginTop: 8, lineHeight: 1.45 }}>
                • Usá tags: <b>envíos</b>, <b>pagos</b>, <b>devoluciones</b>, <b>pedidos</b>.<br />
                • Preguntas cortas y claras mejoran el match.<br />
                • Respuestas “paso a paso” quedan premium.
              </div>

              <div className="admin-sep" />

              <button className="admin-btn primary" type="button" onClick={() => setOpen(true)} disabled={loading}>
                + Agregar FAQ
              </button>
            </div>

            <div className="admin-card" style={{ borderRadius: 18 }}>
              <div style={{ fontWeight: 950, color: "#0f172a" }}>Estado</div>
              <div className="admin-muted" style={{ marginTop: 8 }}>
                {loading ? "Sincronizando con backend…" : "OK · Listo para responder"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdminModal
        open={open}
        title="Nueva FAQ"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="admin-btn secondary" onClick={() => setOpen(false)} type="button">
              Cancelar
            </button>
            <button className="admin-btn primary" onClick={save} disabled={loading} type="button">
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </>
        }
      >
        <div className="admin-chatbot-modalgrid">
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Question</div>
            <input
              className="admin-input"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Ej: ¿Dónde veo mis pedidos?"
            />

            <div style={{ fontWeight: 900, margin: "12px 0 6px" }}>Answer</div>
            <textarea
              className="admin-input"
              style={{ height: 160, paddingTop: 10 }}
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="Ej: Entrá a Mi Perfil → Mis compras…"
            />

            <div style={{ fontWeight: 900, margin: "12px 0 6px" }}>Tags (coma)</div>
            <input
              className="admin-input"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="pedidos, compras, envíos"
            />
          </div>

          <div className="admin-chatbot-preview">
            <div style={{ fontWeight: 950, color: "#0f172a" }}>Preview</div>
            <div className="admin-muted" style={{ marginTop: 6 }}>
              Así lo vería el usuario en Libby.
            </div>

            <div className="admin-preview-card">
              <div className="admin-preview-q">
                <span className="pill">User</span>
                <span style={{ fontWeight: 950, marginLeft: 8 }}>{preview?.question || "—"}</span>
              </div>

              <div className="admin-preview-a">
                <span className="pill ok">Libby</span>
                <div style={{ marginTop: 8, whiteSpace: "pre-wrap", fontWeight: 850 }}>
                  {preview?.answer || "—"}
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                {preview?.tags?.length ? (
                  <div className="admin-tagrow">
                    {preview.tags.map((t) => (
                      <span className="admin-tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="admin-muted">Sin tags</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={confirmOpen}
        title="Eliminar FAQ"
        onClose={() => {
          setConfirmOpen(false);
          setToDelete(null);
        }}
        footer={
          <>
            <button
              className="admin-btn secondary"
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                setToDelete(null);
              }}
            >
              Cancelar
            </button>
            <button className="admin-btn danger" type="button" onClick={confirmDelete} disabled={loading}>
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
          </>
        }
      >
        <div className="admin-muted">
          Vas a eliminar esta FAQ de forma permanente:
          <div className="admin-confirm-box">
            <div style={{ fontWeight: 950, color: "#0f172a" }}>{toDelete?.question || "—"}</div>
            <div className="admin-muted truncate" title={toDelete?.answer}>
              {toDelete?.answer || ""}
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}



