import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { AdminToolbar } from "../components/AdminToolbar";
import { AdminTable } from "../components/AdminTable";
import { AdminPagination } from "../components/AdminPagination";
import { AdminModal } from "../components/AdminModal";
import "../components/AdminUI.css";

export function AdminUsers() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [data, setData] = useState({ items: [], total: 0, page: 1, limit });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [nextRole, setNextRole] = useState("");

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

  const showToast = useCallback((type, text) => {
    setToast({ type, text });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await axiosClient.get(
        `/admin/users?page=${page}&limit=${limit}&q=${encodeURIComponent(q)}&role=${encodeURIComponent(role)}`
      );

      const payload = unwrap(res);
      setData(payload || { items: [], total: 0, page, limit });
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Error");
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, role]);

  useEffect(() => {
    load();
  }, [load]);

  const askChangeRole = useCallback((user, roleTarget) => {
    setSelectedUser(user);
    setNextRole(roleTarget);
    setConfirmMode("role");
    setConfirmOpen(true);
  }, []);

  const askDelete = useCallback((user) => {
    setSelectedUser(user);
    setConfirmMode("delete");
    setConfirmOpen(true);
  }, []);

  const closeConfirm = useCallback(() => {
    setSelectedUser(null);
    setNextRole("");
    setConfirmMode("");
    setConfirmOpen(false);
  }, []);

  const confirmAction = useCallback(async () => {
    if (!selectedUser?._id) return;

    try {
      setLoading(true);

      if (confirmMode === "role") {
        await axiosClient.put(`/admin/users/${selectedUser._id}/role`, {
          role: nextRole,
        });
        showToast("ok", `Rol actualizado a "${nextRole}".`);
      }

      if (confirmMode === "delete") {
        await axiosClient.delete(`/admin/users/${selectedUser._id}`);
        showToast("ok", "Usuario eliminado correctamente.");
      }

      closeConfirm();
      await load();
    } catch (e) {
      showToast("danger", e?.response?.data?.error || e.message || "Error");
    } finally {
      setLoading(false);
    }
  }, [selectedUser, confirmMode, nextRole, closeConfirm, load, showToast]);

  const columns = useMemo(
    () => [
      {
        key: "email",
        title: "Email",
        render: (u) => (
          <span className="truncate" title={u.email}>
            {u.email}
          </span>
        ),
      },
      {
        key: "name",
        title: "Nombre",
        render: (u) => `${u.first_name || ""} ${u.last_name || ""}`.trim() || "—",
      },
      {
        key: "role",
        title: "Rol",
        nowrap: true,
        render: (u) => <span className={`pill ${u.role === "admin" ? "ok" : ""}`}>{u.role}</span>,
      },
      {
        key: "createdAt",
        title: "Alta",
        nowrap: true,
        render: (u) => (u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-AR") : "—"),
      },
      {
        key: "actions",
        title: "Acciones",
        align: "right",
        nowrap: true,
        render: (u) => (
          <div style={{ display: "inline-flex", gap: 10 }}>
            <button
              className="admin-btn secondary"
              disabled={loading}
              onClick={() => askChangeRole(u, u.role === "admin" ? "user" : "admin")}
              type="button"
            >
              {u.role === "admin" ? "Bajar a user" : "Hacer admin"}
            </button>
            <button
              className="admin-btn danger"
              disabled={loading}
              onClick={() => askDelete(u)}
              type="button"
            >
              Eliminar
            </button>
          </div>
        ),
      },
    ],
    [askChangeRole, askDelete, loading]
  );

  return (
    <div className="admin-page">
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.text}</div>}

      <div className="admin-head">
        <div>
          <h1 className="admin-h1">Usuarios</h1>
          <p className="admin-sub">Búsqueda, roles y gestión.</p>
        </div>
        <button className="admin-btn primary" onClick={load} disabled={loading} type="button">
          {loading ? "Cargando..." : "Refrescar"}
        </button>
      </div>

      {err && <div className="admin-alert danger">❌ {err}</div>}

      <AdminToolbar
        left={
          <>
            <input
              className="admin-input"
              placeholder="Buscar por email/nombre..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select className="admin-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Todos</option>
              <option value="user">user</option>
              <option value="admin">admin</option>
              <option value="premium">premium</option>
            </select>
            <button
              className="admin-btn secondary"
              onClick={() => {
                setPage(1);
                load();
              }}
              disabled={loading}
              type="button"
            >
              Buscar
            </button>
          </>
        }
        right={<AdminPagination page={data.page} limit={data.limit} total={data.total} onPage={setPage} />}
      />

      <AdminTable columns={columns} rows={Array.isArray(data.items) ? data.items : []} empty="No hay usuarios." />

      <AdminModal
        open={confirmOpen}
        title={confirmMode === "delete" ? "Eliminar usuario" : "Cambiar rol"}
        onClose={closeConfirm}
        footer={
          <>
            <button className="admin-btn secondary" onClick={closeConfirm} type="button">
              Cancelar
            </button>
            <button
              className={confirmMode === "delete" ? "admin-btn danger" : "admin-btn primary"}
              onClick={confirmAction}
              disabled={loading}
              type="button"
            >
              {loading
                ? confirmMode === "delete"
                  ? "Eliminando..."
                  : "Actualizando..."
                : confirmMode === "delete"
                ? "Eliminar"
                : "Confirmar"}
            </button>
          </>
        }
      >
        <div className="admin-confirm-box">
          <div style={{ fontWeight: 950, color: "#0f172a" }}>
            {confirmMode === "delete"
              ? "¿Seguro que querés eliminar este usuario?"
              : `¿Seguro que querés cambiar el rol a "${nextRole}"?`}
          </div>

          <div style={{ marginTop: 10, color: "#475569", fontWeight: 800 }}>
            {selectedUser?.email || "Usuario seleccionado"}
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: "#64748b", fontWeight: 800 }}>
            {confirmMode === "delete"
              ? "Esta acción afecta el acceso del usuario y no debería hacerse sin confirmación."
              : "El cambio impacta directamente en los permisos del panel."}
          </div>
        </div>
      </AdminModal>
    </div>
  );
}

