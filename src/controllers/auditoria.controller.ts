import { Request, Response } from "express";
import {
  obtenerTotalAuditorias,
  obtenerUltimasAuditorias,
} from "../services/auditoria.service";

export const consultarAuditorias = async (_req: Request, res: Response) => {
  try {
    const total = await obtenerTotalAuditorias();
    const registros = await obtenerUltimasAuditorias();

    res.status(200).json({
      success: true,
      message: "Consulta de auditorías realizada correctamente",
      data: {
        total_registros: total,
        ultimas_auditorias: registros,
      },
    });
  } catch (error) {
    console.error("Error al consultar auditorías:", error);

    res.status(500).json({
      success: false,
      message: "No fue posible consultar las auditorías",
    });
  }
};
