import { Request, Response } from "express";
import { generarReporteExcel } from "../services/reporteExcel.service";
import { enviarReporteMensual } from "../services/correo.service";

const obtenerPeriodoAnterior = () => {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const anio = Number(partes.find((p) => p.type === "year")?.value);
  const mes = Number(partes.find((p) => p.type === "month")?.value);

  const primerDia = new Date(Date.UTC(anio, mes - 2, 1));
  const ultimoDia = new Date(Date.UTC(anio, mes - 1, 0));

  const formatoFecha = (fecha: Date) => {
    const dia = String(fecha.getUTCDate()).padStart(2, "0");
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
    const anio = fecha.getUTCFullYear();

    return `${dia}/${mes}/${anio}`;
  };

  return {
    periodo: `${formatoFecha(primerDia)} al ${formatoFecha(ultimoDia)}`,
    periodoArchivo: `${primerDia.getUTCFullYear()}-${String(
      primerDia.getUTCMonth() + 1,
    ).padStart(2, "0")}`,
  };
};

export const enviarReportePrueba = async (_req: Request, res: Response) => {
  try {
    const destinatarios = (process.env.SMTP_DESTINATARIOS || "")
      .split(",")
      .map((correo) => correo.trim().toLowerCase())
      .filter(Boolean);

    if (destinatarios.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay destinatarios configurados.",
      });
    }

    const correos = [
      ...new Set(
        destinatarios
          .filter(
            (correo: unknown): correo is string => typeof correo === "string",
          )
          .map((correo: string) => correo.trim().toLowerCase()),
      ),
    ];

    const correosInvalidos = correos.filter(
      (correo) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo),
    );

    if (correos.length === 0 || correosInvalidos.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Hay destinatarios vacíos o con formato de correo inválido.",
        correosInvalidos,
      });
    }

    const workbook = await generarReporteExcel();

    const archivoExcel = await workbook.xlsx.writeBuffer();
    const cantidadRegistros = workbook.worksheets[0].rowCount - 1;

    const { periodo, periodoArchivo } = obtenerPeriodoAnterior();

    const nombreArchivo = `reporte_cancilleria_${periodoArchivo}.xlsx`;

    await enviarReporteMensual({
      destinatarios: correos,
      periodo,
      cantidadRegistros,
      archivoExcel: Buffer.from(archivoExcel),
      nombreArchivo,
    });

    return res.status(200).json({
      success: true,
      message: "Reporte enviado correctamente",
      periodo,
      cantidadRegistros,
      destinatarios,
    });
  } catch (error) {
    console.error("Error al enviar el reporte de prueba:", error);

    return res.status(500).json({
      success: false,
      message: "No fue posible enviar el reporte de prueba",
    });
  }
};
