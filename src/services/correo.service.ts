import nodemailer from "nodemailer";
import { construirPlantillaReporte } from "../templates/reporteMensual.template";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface DatosEnvioReporte {
  destinatarios: string[];
  periodo: string;
  cantidadRegistros: number;
  archivoExcel: Buffer;
  nombreArchivo: string;
}

export const enviarReporteMensual = async ({
  destinatarios,
  periodo,
  cantidadRegistros,
  archivoExcel,
  nombreArchivo,
}: DatosEnvioReporte): Promise<void> => {
  const html = construirPlantillaReporte({
    periodo,
    cantidadRegistros,
  });

  await transporter.sendMail({
    from: `"Reportería Cancillería" <${process.env.SMTP_USER}>`,
    to: destinatarios.join(","),
    subject: `Reporte mensual de Cancillería - ${periodo}`,
    html,
    attachments: [
      {
        filename: nombreArchivo,
        content: archivoExcel,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  });

  console.log(`Reporte enviado correctamente a: ${destinatarios.join(", ")}`);
};
