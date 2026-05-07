import * as LogsService from "../services/admin.logs.services.js";
import { createResponse } from "../utils/user.utils.js";

/**
 * @swagger
 * tags:
 *   name: Admin Logs
 *   description: Auditoría de acciones del panel de administración
 */

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: Listar logs administrativos (paginado)
 *     tags: [Admin Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: adminId
 *         in: query
 *         description: Filtrar por ID de admin (ObjectId)
 *         schema:
 *           type: string
 *       - name: action
 *         in: query
 *         description: Filtrar por acción (regex, case-insensitive)
 *         schema:
 *           type: string
 *       - name: q
 *         in: query
 *         description: Búsqueda general (action/route/method/ip)
 *         schema:
 *           type: string
 *       - name: statusCode
 *         in: query
 *         description: Filtrar por statusCode exacto (ej 200, 401, 500)
 *         schema:
 *           type: integer
 *       - name: from
 *         in: query
 *         description: Fecha desde (YYYY-MM-DD o ISO)
 *         schema:
 *           type: string
 *       - name: to
 *         in: query
 *         description: Fecha hasta (YYYY-MM-DD o ISO)
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Página (1..n)
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Items por página (10..100)
 *         schema:
 *           type: integer
 *           default: 25
 *     responses:
 *       200:
 *         description: Lista paginada de logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
export const getLogs = async (req, res, next) => {
  try {
    const {
      adminId = "",
      action = "",
      from = "",
      to = "",
      q = "",
      statusCode = "",
      page = "1",
      limit = "25",
    } = req.query;

    const data = await LogsService.listLogs({
      adminId: adminId || undefined,
      action: action || undefined,
      from: from || undefined,
      to: to || undefined,
      q: q || undefined,
      statusCode: statusCode || undefined,
      page,
      limit,
    });

    return createResponse(res, 200, data);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /admin/logs/export:
 *   get:
 *     summary: Exportar logs a CSV o PDF (con filtros)
 *     tags: [Admin Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: format
 *         in: query
 *         description: Formato de exportación
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, pdf]
 *           default: csv
 *       - name: adminId
 *         in: query
 *         schema:
 *           type: string
 *       - name: action
 *         in: query
 *         schema:
 *           type: string
 *       - name: q
 *         in: query
 *         schema:
 *           type: string
 *       - name: statusCode
 *         in: query
 *         schema:
 *           type: integer
 *       - name: from
 *         in: query
 *         schema:
 *           type: string
 *       - name: to
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archivo exportado
 *         content:
 *           text/csv: {}
 *           application/pdf: {}
 */
export const exportLogs = async (req, res, next) => {
  try {
    const {
      format = "csv",
      adminId = "",
      action = "",
      from = "",
      to = "",
      q = "",
      statusCode = "",
    } = req.query;

    const out = await LogsService.exportLogs({
      format: String(format).toLowerCase(),
      adminId: adminId || undefined,
      action: action || undefined,
      from: from || undefined,
      to: to || undefined,
      q: q || undefined,
      statusCode: statusCode || undefined,
    });

    res.setHeader("Content-Disposition", `attachment; filename="${out.filename}"`);
    res.setHeader("Content-Type", out.contentType);
    return out.stream.pipe(res);
  } catch (err) {
    next(err);
  }
};

