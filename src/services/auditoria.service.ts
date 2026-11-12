import { pool } from "../config/database";
import { extraerDatosConversacion } from "./extraccionDatos.service";

export const obtenerTotalAuditorias = async () => {
  const consulta = `
    SELECT COUNT(*) AS total
    FROM public.vw_chatbot_cancilleria_gestionadas
  `;

  const resultado = await pool.query(consulta);

  return Number(resultado.rows[0].total);
};

export const obtenerUltimasAuditorias = async () => {
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
    ORDER BY fecha_y_hora DESC
    LIMIT 10
  `;

  const resultado = await pool.query(consulta);

  const registros = resultado.rows.map((registro) => {
    const datosExtraidos = extraerDatosConversacion(registro.conversacion);

    return {
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

      "acepta política":
        datosExtraidos.acepta_politica !== "No informado"
          ? datosExtraidos.acepta_politica
          : registro["acepta política"] || "No informado",
    };
  });

  return registros;
};
