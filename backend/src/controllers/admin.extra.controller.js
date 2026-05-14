import * as AdminExtraService from "../services/admin.extra.services.js";
import { createResponse } from "../utils/user.utils.js";

function pickFormat(req) {
  const fmt = (req.query.format || "csv").toString().toLowerCase();
  return fmt === "pdf" ? "pdf" : "csv";
}

export const exportProducts = async (req, res, next) => {
  try {
    const format = pickFormat(req);
    const { filename, contentType, stream } =
      await AdminExtraService.exportProducts(format);

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);
    return stream.pipe(res);
  } catch (err) {
    req.logger?.error?.(`❌ Export products failed: ${err.message}`);
    next(err);
  }
};

export const exportUsers = async (req, res, next) => {
  try {
    const format = pickFormat(req);
    const { filename, contentType, stream } =
      await AdminExtraService.exportUsers(format);

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);
    return stream.pipe(res);
  } catch (err) {
    req.logger?.error?.(`❌ Export users failed: ${err.message}`);
    next(err);
  }
};

export const exportSales = async (req, res, next) => {
  try {
    const format = pickFormat(req);
    const { filename, contentType, stream } =
      await AdminExtraService.exportSales(format, req.query);

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);
    return stream.pipe(res);
  } catch (err) {
    req.logger?.error?.(`❌ Export sales failed: ${err.message}`);
    next(err);
  }
};

export const bulkUpdatePrices = async (req, res, next) => {
  try {
    const result = await AdminExtraService.bulkUpdatePrices(req.body);

    req.logger?.info?.(
      `💹 Bulk price update executed: ${JSON.stringify(result)}`
    );

    return createResponse(res, 200, result);
  } catch (err) {
    req.logger?.error?.(`❌ Bulk price update failed: ${err.message}`);
    next(err);
  }
};

export const deleteInactiveUsers = async (req, res, next) => {
  try {
    const { days = 90, dryRun = true } = req.body || {};
    const result = await AdminExtraService.deleteInactiveUsers({
      days,
      dryRun,
    });

    req.logger?.info?.(`🧹 Inactive users cleanup: ${JSON.stringify(result)}`);
    return createResponse(res, 200, result);
  } catch (err) {
    req.logger?.error?.(`❌ Inactive users cleanup failed: ${err.message}`);
    next(err);
  }
};

export const importProductsCsv = async (req, res, next) => {
  try {
    if (!req.file?.path) {
      return res.status(400).json({
        error: "Subí un archivo CSV con el campo 'file'.",
      });
    }

    const result = await AdminExtraService.importProductsFromCSV(req.file.path);

    req.logger?.info?.(`📥 Import products CSV: ${JSON.stringify(result)}`);

    return createResponse(res, 201, result);
  } catch (err) {
    req.logger?.error?.(`❌ Import products failed: ${err.message}`);
    next(err);
  }
};

