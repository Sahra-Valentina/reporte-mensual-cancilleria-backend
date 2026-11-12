import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { iniciarReporteMensual } from "./jobs/reporteMensual.job";

const PORT = process.env.PORT || 3001;

console.log("APP CARGADA CORRECTAMENTE");

app.get("/prueba-servidor", (_req, res) => {
  res.json({
    success: true,
    message: "El servidor y Express están funcionando"
  });
});

app.listen(PORT, () => {
  console.log("------------------------------------------");
  console.log(" AUDITORÍA DE CANCILLERÍA");
  console.log("------------------------------------------");
  console.log(`Servidor ejecutándose en puerto: ${PORT}`);
  console.log("------------------------------------------");

  iniciarReporteMensual();
});

