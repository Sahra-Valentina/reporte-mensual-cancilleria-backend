import { Router } from "express";
import { descargarReporteExcel } from "../controllers/reporteExcel.controller";
import { enviarReportePrueba } from "../controllers/correo.controller";

const router = Router();

router.get("/descargar", descargarReporteExcel);
router.post("/enviar-prueba", enviarReportePrueba);

export default router;
