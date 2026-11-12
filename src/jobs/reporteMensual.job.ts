import cron from "node-cron";
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

export const iniciarReporteMensual = () => {
  cron.schedule(
    "0 8 1 * *",
    async () => {
      console.log("Iniciando generación del reporte mensual...");

      try {
        const destinatarios = (process.env.SMTP_DESTINATARIOS || "")
          .split(",")
          .map((correo) => correo.trim().toLowerCase())
          .filter(Boolean);

        if (destinatarios.length === 0) {
          throw new Error("No hay destinatarios configurados.");
        }

        const workbook = await generarReporteExcel();

        const archivoExcel = await workbook.xlsx.writeBuffer();
        const cantidadRegistros = workbook.worksheets[0].rowCount - 1;

        const { periodo, periodoArchivo } = obtenerPeriodoAnterior();

        const nombreArchivo = `reporte_cancilleria_${periodoArchivo}.xlsx`;

        await enviarReporteMensual({
          destinatarios,
          periodo,
          cantidadRegistros,
          archivoExcel: Buffer.from(archivoExcel),
          nombreArchivo,
        });

        console.log(`Reporte mensual enviado correctamente: ${periodo}`);
      } catch (error) {
        console.error("Error en la automatización del reporte mensual:", error);
      }
    },
    {
      timezone: "America/Bogota",
    },
  );

  console.log(
    "Programador mensual iniciado. Próxima ejecución: día 1 a las 8:00 a. m.",
  );
};
