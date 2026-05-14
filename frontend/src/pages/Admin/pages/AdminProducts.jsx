import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import { AdminToolbar } from "../components/AdminToolbar";
import { AdminTable } from "../components/AdminTable";
import { AdminPagination } from "../components/AdminPagination";
import { AdminModal } from "../components/AdminModal";
import { downloadBlob } from "../components/downloadBlob";
import "../components/AdminUI.css";

const EMPTY_FORM = {
  nombre: "",
  descripcion: "",
  precio: 0,
  stock: 0,
  categoria: "general",
  imagen: "",
};

export function AdminProducts() {
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [data, setData] = useState({ items: [], total: 0, page: 1, limit });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulk, setBulk] = useState({
    scope: "all",
    mode: "percent",
    value: 10,
    category: "",
    ids: "",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

  const showToast = useCallback((type, text) => {
    setToast({ type, text });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3000);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await axiosClient.get("/admin/products", {
        params: { page, limit, q, categoria },
      });

      const payload = unwrap(res);
      setData(payload || { items: [], total: 0, page, limit });
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Error");
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, categoria]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_FORM);
  }, []);

  const openCreate = useCallback(() => {
    resetForm();
    setOpen(true);
  }, [resetForm]);

  const openEdit = useCallback((p) => {
    setEditing(p);
    setForm({
      nombre: p.nombre || "",
      descripcion: p.descripcion || "",
      precio: Number(p.precio || 0),
      stock: Number(p.stock || 0),
      categoria: p.categoria || "general",
      imagen: p.imagen || "",
    });
    setOpen(true);
  }, []);

  const askDelete = useCallback((product) => {
    setPendingDelete(product);
    setConfirmOpen(true);
  }, []);

  const closeDelete = useCallback(() => {
    setPendingDelete(null);
    setConfirmOpen(false);
  }, []);

  const validateForm = useCallback(() => {
    if (!form.nombre?.trim()) throw new Error("Nombre requerido.");
    if (form.nombre.trim().length < 3) throw new Error("El nombre debe tener al menos 3 caracteres.");
    if (!Number.isFinite(Number(form.precio))) throw new Error("Precio inválido.");
    if (Number(form.precio) < 0) throw new Error("El precio no puede ser negativo.");
    if (!Number.isFinite(Number(form.stock))) throw new Error("Stock inválido.");
    if (Number(form.stock) < 0) throw new Error("El stock no puede ser negativo.");
  }, [form]);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete?._id) return;

    try {
      setLoading(true);
      await axiosClient.delete(`/admin/products/${pendingDelete._id}`);
      showToast("ok", "Producto eliminado correctamente.");
      closeDelete();

      if ((data.items || []).length === 1 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        await load();
      }
    } catch (e) {
      showToast("danger", e?.response?.data?.error || e.message || "Error al eliminar.");
    } finally {
      setLoading(false);
    }
  }, [pendingDelete, closeDelete, showToast, load, data.items, page]);

  const save = useCallback(async () => {
    try {
      setLoading(true);
      validateForm();

      const payload = {
        ...form,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion?.trim() || "",
        categoria: form.categoria?.trim() || "general",
        imagen: form.imagen?.trim() || "",
        precio: Number(form.precio),
        stock: Number(form.stock),
      };

      if (editing?._id) {
        await axiosClient.put(`/admin/products/${editing._id}`, payload);
        showToast("ok", "Producto actualizado correctamente.");
      } else {
        await axiosClient.post("/admin/products", payload);
        showToast("ok", "Producto creado correctamente.");
      }

      setOpen(false);
      resetForm();
      await load();
    } catch (e) {
      showToast("danger", e?.response?.data?.error || e.message || "Error al guardar.");
    } finally {
      setLoading(false);
    }
  }, [editing, form, load, resetForm, showToast, validateForm]);

  const exportType = useCallback(async (type, format) => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/admin/extra/export/${type}`, {
        params: { format },
        responseType: "blob",
      });
      downloadBlob(res, `${type}.${format}`);
      showToast("ok", `Export ${format.toUpperCase()} listo.`);
    } catch (e) {
      showToast("danger", e?.response?.data?.error || e.message || "Error al exportar.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const importCsv = useCallback(async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      await axiosClient.post("/admin/extra/import/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await load();
      showToast("ok", "Importación completada.");
    } catch (e) {
      showToast("danger", e?.response?.data?.error || e.message || "Error al importar.");
    } finally {
      setLoading(false);
    }
  }, [load, showToast]);

  const validateBulk = useCallback(() => {
    const value = Number(bulk.value);

    if (!Number.isFinite(value)) {
      throw new Error("El valor debe ser numérico.");
    }

    if (bulk.mode === "absolute" && value < 0) {
      throw new Error("El precio fijo no puede ser negativo.");
    }

    if (bulk.mode === "percent" && value <= -100) {
      throw new Error("El porcentaje no puede ser menor o igual a -100%.");
    }

    if (bulk.scope === "category" && !bulk.category.trim()) {
      throw new Error("Indicá una categoría.");
    }

    if (bulk.scope === "ids") {
      const ids = bulk.ids
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (!ids.length) {
        throw new Error("Indicá al menos un ID.");
      }
    }
  }, [bulk]);

  const runBulk = useCallback(async () => {
    try {
      setLoading(true);
      setBulkResult(null);
      validateBulk();

      const payload = {
        scope: bulk.scope,
        mode: bulk.mode,
        value: Number(bulk.value),
        category: bulk.scope === "category" ? bulk.category.trim() : undefined,
        ids:
          bulk.scope === "ids"
            ? bulk.ids
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
      };

      const res = await axiosClient.post("/admin/extra/bulk/update-prices", payload);
      const result = unwrap(res);

      setBulkResult(result);
      await load();

      const modified = result?.modified ?? result?.count ?? 0;
      showToast("ok", `Actualización masiva aplicada. Productos modificados: ${modified}.`);
    } catch (e) {
      showToast("danger", e?.response?.data?.error || e.message || "Error en bulk update.");
    } finally {
      setLoading(false);
    }
  }, [bulk, load, showToast, validateBulk]);

  const columns = useMemo(
    () => [
      {
        key: "nombre",
        title: "Producto",
        render: (p) => (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#f1f5f9",
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                flexShrink: 0,
              }}
            >
              {p.imagen ? (
                <img
                  src={p.imagen}
                  alt={p.nombre || "producto"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : null}
            </div>

            <div style={{ minWidth: 0 }}>
              <div className="truncate" style={{ fontWeight: 950 }} title={p.nombre}>
                {p.nombre}
              </div>
              <div
                className="truncate"
                style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}
                title={p.categoria}
              >
                {p.categoria || "—"}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "precio",
        title: "Precio",
        nowrap: true,
        render: (p) => `$${Number(p.precio || 0).toLocaleString("es-AR")}`,
      },
      {
        key: "stock",
        title: "Stock",
        nowrap: true,
        render: (p) => (
          <span className={`pill ${p.stock <= 0 ? "danger" : p.stock <= 5 ? "warn" : "ok"}`}>
            {p.stock}
          </span>
        ),
      },
      {
        key: "createdAt",
        title: "Alta",
        nowrap: true,
        render: (p) => (p.createdAt ? new Date(p.createdAt).toLocaleDateString("es-AR") : "—"),
      },
      {
        key: "actions",
        title: "Acciones",
        align: "right",
        nowrap: true,
        render: (p) => (
          <div style={{ display: "inline-flex", gap: 10 }}>
            <button className="admin-btn secondary" disabled={loading} onClick={() => openEdit(p)} type="button">
              Editar
            </button>
            <button className="admin-btn danger" disabled={loading} onClick={() => askDelete(p)} type="button">
              Eliminar
            </button>
          </div>
        ),
      },
    ],
    [loading, openEdit, askDelete]
  );

  const previewImage = form.imagen?.trim();

  return (
    <div className="admin-page">
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.text}</div>}

      <div className="admin-head">
        <div>
          <h1 className="admin-h1">Productos</h1>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="admin-btn secondary"
            onClick={() => {
              setBulkResult(null);
              setBulkOpen(true);
            }}
            disabled={loading}
            type="button"
          >
            Bulk precios
          </button>
          <button className="admin-btn primary" onClick={openCreate} disabled={loading} type="button">
            Nuevo
          </button>
        </div>
      </div>

      {err && <div className="admin-alert danger">❌ {err}</div>}

      <AdminToolbar
        left={
          <>
            <input
              className="admin-input"
              placeholder="Buscar..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <input
              className="admin-input"
              placeholder="Categoría..."
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
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

            <label
              className="admin-btn secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            >
              Import CSV
              <input
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])}
              />
            </label>
          </>
        }
        right={
          <>
            <button className="admin-btn secondary" onClick={() => exportType("products", "csv")} disabled={loading} type="button">
              Export CSV
            </button>
            <button className="admin-btn secondary" onClick={() => exportType("products", "pdf")} disabled={loading} type="button">
              Export PDF
            </button>
            <AdminPagination page={data.page} limit={data.limit} total={data.total} onPage={setPage} />
          </>
        }
      />

      <AdminTable columns={columns} rows={Array.isArray(data.items) ? data.items : []} empty="No hay productos." />

      <AdminModal
        open={open}
        title={editing ? "Editar producto" : "Nuevo producto"}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        footer={
          <>
            <button
              className="admin-btn secondary"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              type="button"
            >
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
            <div className="admin-grid2">
              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Nombre</div>
                <input
                  className="admin-input"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Categoría</div>
                <input
                  className="admin-input"
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                />
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Precio</div>
                <input
                  className="admin-input"
                  type="number"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
                />
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Stock</div>
                <input
                  className="admin-input"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Imagen (URL)</div>
              <input
                className="admin-input"
                value={form.imagen}
                onChange={(e) => setForm({ ...form, imagen: e.target.value })}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Descripción</div>
              <textarea
                className="admin-input"
                style={{ height: 110, paddingTop: 10 }}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-chatbot-preview">
            <div className="admin-card">
              <div style={{ fontWeight: 950, color: "#0f172a" }}>Vista previa</div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800, marginTop: 4 }}>
                Cómo se vería el producto dentro del panel.
              </div>

              <div className="admin-preview-card" style={{ marginTop: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 14,
                      background: "#f1f5f9",
                      overflow: "hidden",
                      border: "1px solid #e5e7eb",
                      flexShrink: 0,
                    }}
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div className="truncate" style={{ fontWeight: 950 }}>
                      {form.nombre?.trim() || "Nombre del producto"}
                    </div>
                    <div className="truncate" style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}>
                      {form.categoria?.trim() || "general"}
                    </div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span className="pill ok">
                        ${Number(form.precio || 0).toLocaleString("es-AR")}
                      </span>
                      <span
                        className={`pill ${
                          Number(form.stock) <= 0
                            ? "danger"
                            : Number(form.stock) <= 5
                            ? "warn"
                            : "ok"
                        }`}
                      >
                        Stock: {Number(form.stock || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12, fontSize: 13, color: "#475569", fontWeight: 700 }}>
                  {form.descripcion?.trim() || "La descripción del producto aparecerá acá."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={bulkOpen}
        title="Bulk update precios"
        onClose={() => setBulkOpen(false)}
        footer={
          <>
            <button className="admin-btn secondary" onClick={() => setBulkOpen(false)} type="button">
              Cerrar
            </button>
            <button className="admin-btn primary" onClick={runBulk} disabled={loading} type="button">
              {loading ? "Aplicando..." : "Aplicar"}
            </button>
          </>
        }
      >
        <div className="admin-grid2">
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Scope</div>
            <select
              className="admin-select"
              value={bulk.scope}
              onChange={(e) => setBulk({ ...bulk, scope: e.target.value })}
            >
              <option value="all">Todos los productos</option>
              <option value="category">Por categoría</option>
              <option value="ids">Por IDs</option>
            </select>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Mode</div>
            <select
              className="admin-select"
              value={bulk.mode}
              onChange={(e) => setBulk({ ...bulk, mode: e.target.value })}
            >
              <option value="percent">Porcentaje</option>
              <option value="absolute">Precio fijo</option>
            </select>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>
              {bulk.mode === "percent" ? "Porcentaje" : "Precio fijo"}
            </div>
            <input
              className="admin-input"
              type="number"
              value={bulk.value}
              onChange={(e) => setBulk({ ...bulk, value: Number(e.target.value) })}
            />
          </div>

          {bulk.scope === "category" && (
            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Categoría exacta</div>
              <input
                className="admin-input"
                value={bulk.category}
                onChange={(e) => setBulk({ ...bulk, category: e.target.value })}
                placeholder="Ej: Novela"
              />
            </div>
          )}
        </div>

        {bulk.scope === "ids" && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>IDs separados por coma</div>
            <textarea
              className="admin-input"
              style={{ height: 90, paddingTop: 10 }}
              value={bulk.ids}
              onChange={(e) => setBulk({ ...bulk, ids: e.target.value })}
            />
          </div>
        )}

        <div style={{ marginTop: 10, fontSize: 12, color: "#64748b", fontWeight: 800 }}>
          <p>Porcentaje: +10 sube 10% | -10 baja 10%. Precio fijo: setea todos los seleccionados al valor indicado.</p>
        </div>

        {bulkResult && (
          <div className="admin-alert ok" style={{ marginTop: 12 }}>
            ✅ {bulkResult.message || "Actualización aplicada."}
            <br />
            Matched: {bulkResult.matched ?? "—"} · Modified: {bulkResult.modified ?? bulkResult.count ?? "—"}
          </div>
        )}
      </AdminModal>

      <AdminModal
        open={confirmOpen}
        title="Eliminar producto"
        onClose={closeDelete}
        footer={
          <>
            <button className="admin-btn secondary" onClick={closeDelete} type="button">
              Cancelar
            </button>
            <button className="admin-btn danger" onClick={confirmDelete} disabled={loading} type="button">
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
          </>
        }
      >
        <div className="admin-confirm-box">
          <div style={{ fontWeight: 950, color: "#0f172a" }}>
            ¿Seguro que querés eliminar este producto?
          </div>
          <div style={{ marginTop: 8, color: "#475569", fontWeight: 800 }}>
            {pendingDelete?.nombre || "Producto seleccionado"}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#64748b", fontWeight: 800 }}>
            Esta acción impacta en el catálogo y no debería hacerse sin confirmación.
          </div>
        </div>
      </AdminModal>
    </div>
  );
}

