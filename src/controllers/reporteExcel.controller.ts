import { Request, Response } from "express";
import { generarReporteExcel } from "../services/reporteExcel.service";

export const descargarReporteExcel = async (_req: Request, res: Response) => {
  try {
    const workbook = await generarReporteExcel();

    const fechaActual = new Date().toISOString().slice(0, 10);
    const nombreArchivo = `reporte_cancilleria_${fechaActual}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nombreArchivo}"`,
    );

    console.time("Tiempo de escritura del Excel");

    await workbook.xlsx.write(res);

    console.timeEnd("Tiempo de escritura del Excel");

    res.end();
  } catch (error) {
    console.error("Error al generar el reporte Excel:", error);

    res.status(500).json({
      success: false,
      message: "No fue posible generar el reporte Excel",
    });
  }
};
