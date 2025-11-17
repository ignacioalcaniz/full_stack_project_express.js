// src/controllers/admin.logs.controller.js
import * as LogsService from "../services/admin.logs.services.js";

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: Listar logs administrativos
 *     tags: [Admin Logs]
 *     parameters:
 *       - name: adminId
 *         in: query
 *       - name: from
 *         in: query
 *       - name: to
 *         in: query
 *       - name: action
 *         in: query
 *     responses:
 *       200:
 *         description: Lista de logs
 */
export const getLogs = async (req, res, next) => {
  try {
    const logs = await LogsService.listLogs(req.query);
    res.status(200).json(logs);
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /admin/logs/export:
 *   get:
 *     summary: Exportar logs a CSV o PDF
 *     tags: [Admin Logs]
 *     parameters:
 *       - name: format
 *         in: query
 *         schema:
 *           type: string
 *           enum: [csv, pdf]
 */
export const exportLogs = async (req, res, next) => {
  try {
    const format = req.query.format || "csv";
    const { filename, contentType, stream } = await LogsService.exportLogs(format);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
};
