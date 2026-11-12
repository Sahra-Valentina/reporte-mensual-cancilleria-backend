import express from "express";
import cors from "cors";
import databaseRoutes from "./routes/database.routes";
import auditoriaRoutes from "./routes/auditoria.routes";
import reporteExcelRoutes from "./routes/reporteExcel.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/database", databaseRoutes);
app.use("/api/auditoria", auditoriaRoutes);
app.use("/api/reportes", reporteExcelRoutes);
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API de Auditoría de Cancillería funcionando correctamente",
    application: "Automatización de Reportes Mensuales",
    status: "Online"
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "El servidor está activo",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/test", (_req, res) => {
  res.json({
    success: true,
    message: "Las rutas de Express funcionan correctamente"
  });
});

export default app;
