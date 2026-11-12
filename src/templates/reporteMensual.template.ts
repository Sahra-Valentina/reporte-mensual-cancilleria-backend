interface DatosCorreo {
  periodo: string;
  cantidadRegistros: number;
}

export const construirPlantillaReporte = ({
  periodo,
  cantidadRegistros
}: DatosCorreo): string => {

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte mensual de Cancillería</title>
  </head>

  <body style="
    margin: 0;
    padding: 30px 10px;
    background-color: #F3F5F8;
    font-family: Arial, Helvetica, sans-serif;
    color: #333333;
  ">

    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="max-width: 650px; margin: 0 auto; background-color: #FFFFFF;"
    >

      <!-- ENCABEZADO -->
      <tr>
        <td style="
          background-color: #1D3763;
          padding: 30px 35px;
          text-align: center;
        ">
          <h1 style="
            margin: 0;
            color: #FFFFFF;
            font-size: 23px;
            font-weight: bold;
          ">
            REPORTE MENSUAL
          </h1>

          <p style="
            margin: 10px 0 0;
            color: #FFFFFF;
            font-size: 14px;
          ">
            Ministerio de Relaciones Exteriores
          </p>
        </td>
      </tr>

<!-- FRANJA COLORES COLOMBIA - COMPATIBLE CON OUTLOOK -->
<tr>
  <td style="padding: 0; font-size: 0; line-height: 0;">
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="border-collapse: collapse;"
    >
      <tr>
        <td
          width="50%"
          height="6"
          bgcolor="#FCD116"
          style="background-color: #FCD116; height: 6px; font-size: 0;"
        >&nbsp;</td>

        <td
          width="25%"
          height="6"
          bgcolor="#003893"
          style="background-color: #003893; height: 6px; font-size: 0;"
        >&nbsp;</td>

        <td
          width="25%"
          height="6"
          bgcolor="#CE1126"
          style="background-color: #CE1126; height: 6px; font-size: 0;"
        >&nbsp;</td>
      </tr>
    </table>
  </td>
</tr>

      <!-- CONTENIDO -->
      <tr>
        <td style="padding: 35px;">

          <h2 style="
            margin: 0 0 20px;
            color: #1D3763;
            font-size: 20px;
          ">
            Reporte de gestión mensual
          </h2>

          <p style="
            font-size: 15px;
            line-height: 1.7;
            margin: 0 0 18px;
          ">
            Cordial saludo,
          </p>

          <p style="
            font-size: 15px;
            line-height: 1.7;
            margin: 0 0 22px;
          ">
            Por medio del presente correo se comparte el reporte mensual
            de las conversaciones gestionadas a través del chatbot de
            Cancillería, correspondiente al siguiente periodo:
          </p>

          <!-- PERIODO -->
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="background-color: #F3F5F8; margin-bottom: 20px;"
          >
            <tr>
              <td style="padding: 20px; text-align: center;">
                <p style="
                  margin: 0 0 8px;
                  color: #666666;
                  font-size: 13px;
                ">
                  PERIODO REPORTADO
                </p>

                <p style="
                  margin: 0;
                  color: #1D3763;
                  font-size: 19px;
                  font-weight: bold;
                ">
                  ${periodo}
                </p>
              </td>
            </tr>
          </table>

          <!-- TOTAL REGISTROS -->
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="margin-bottom: 25px;"
          >
            <tr>
              <td style="
                padding: 18px;
                border: 1px solid #DCE2EA;
                text-align: center;
              ">
                <p style="
                  margin: 0 0 8px;
                  color: #666666;
                  font-size: 13px;
                ">
                  TOTAL DE REGISTROS
                </p>

                <p style="
                  margin: 0;
                  color: #1D3763;
                  font-size: 28px;
                  font-weight: bold;
                ">
                  ${cantidadRegistros.toLocaleString("es-CO")}
                </p>
              </td>
            </tr>
          </table>

          <p style="
            font-size: 15px;
            line-height: 1.7;
            margin: 0 0 18px;
          ">
            Se adjunta el archivo Excel con el detalle de los registros
            correspondientes al periodo indicado para su consulta y
            seguimiento.
          </p>

          <p style="
            font-size: 15px;
            line-height: 1.7;
            margin: 0;
          ">
            Cordialmente,<br>
            <strong style="color: #1D3763;">
              Sistema de Reportería Automatizada
            </strong><br>
            Ministerio de Relaciones Exteriores
          </p>

        </td>
      </tr>

      <!-- PIE DE CORREO -->
      <tr>
        <td style="
          background-color: #F3F5F8;
          padding: 20px 30px;
          text-align: center;
        ">
          <p style="
            margin: 0;
            color: #666666;
            font-size: 11px;
            line-height: 1.6;
          ">
            Este es un mensaje generado automáticamente.
            Por favor, no responda a este correo.
          </p>
        </td>
      </tr>

    </table>
  </body>
  </html>
  `;
};
