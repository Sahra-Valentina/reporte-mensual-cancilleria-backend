import ExcelJS from "exceljs";
import { pool } from "../config/database";
import { extraerDatosConversacion } from "./extraccionDatos.service";

export const generarReporteExcel = async () => {
  const consulta = `
    SELECT
      fecha_y_hora,
      nombre_completo,
      tipo_documento,
      numero_documento,
      correo_electronico,
      numero_telefono,
      conversacion,
      "acepta política"
    FROM public.vw_chatbot_cancilleria_gestionadas
    WHERE fecha_y_hora >= date_trunc(
      'month',
      CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'
    ) AT TIME ZONE 'America/Bogota'
      - INTERVAL '1 month'
    AND fecha_y_hora < date_trunc(
      'month',
      CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'
    ) AT TIME ZONE 'America/Bogota'
    ORDER BY fecha_y_hora ASC
  `;

  const resultado = await pool.query(consulta);

  console.log(
    `Consulta finalizada. Registros encontrados: ${resultado.rows.length}`,
  );

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Reporte mensual");

  worksheet.columns = [
    {
      header: "Fecha y hora",
      key: "fecha_y_hora",
      width: 23,
      style: {
        numFmt: "dd/mm/yyyy hh:mm:ss",
      },
    },
    { header: "Nombre completo", key: "nombre_completo", width: 30 },
    { header: "Tipo de documento", key: "tipo_documento", width: 25 },
    { header: "Número de documento", key: "numero_documento", width: 22 },
    { header: "Correo electrónico", key: "correo_electronico", width: 32 },
    { header: "Número de teléfono", key: "numero_telefono", width: 20 },
    { header: "Conversación", key: "conversacion", width: 60 },
    { header: "Acepta política", key: "acepta_politica", width: 18 },
  ];

  console.time("Procesamiento de registros");

  resultado.rows.forEach((registro) => {});

  resultado.rows.forEach((registro) => {
    const datosExtraidos = extraerDatosConversacion(registro.conversacion);

    worksheet.addRow({
      fecha_y_hora: registro.fecha_y_hora,

      nombre_completo:
        datosExtraidos.nombre_completo !== "No informado"
          ? datosExtraidos.nombre_completo
          : registro.nombre_completo || "No informado",

      tipo_documento:
        datosExtraidos.tipo_documento !== "No informado"
          ? datosExtraidos.tipo_documento
          : registro.tipo_documento || "No informado",

      numero_documento:
        datosExtraidos.numero_documento !== "No informado"
          ? datosExtraidos.numero_documento
          : registro.numero_documento || "No informado",

      correo_electronico:
        datosExtraidos.correo_electronico !== "No informado"
          ? datosExtraidos.correo_electronico
          : registro.correo_electronico || "No informado",

      numero_telefono:
        datosExtraidos.numero_telefono !== "No informado"
          ? datosExtraidos.numero_telefono
          : registro.numero_telefono || "No informado",

      conversacion: registro.conversacion,

      acepta_politica:
        datosExtraidos.acepta_politica !== "No informado"
          ? datosExtraidos.acepta_politica
          : registro["acepta política"] || "No informado",
    });
    console.timeEnd("Procesamiento de registros");
  });

  const encabezado = worksheet.getRow(1);
  encabezado.font = { bold: true, color: { argb: "FFFFFFFF" } };
  encabezado.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1D3763" },
  };
  encabezado.alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  encabezado.height = 30;

  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = {
    from: "A1",
    to: "H1",
  };

  worksheet.eachRow((fila, numeroFila) => {
    if (numeroFila > 1) {
      fila.alignment = {
        vertical: "top",
        wrapText: false,
      };
    }
  });

  console.log("Excel construido correctamente.");
  return workbook;
};
