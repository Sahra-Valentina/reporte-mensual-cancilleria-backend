import { Router } from "express";
import { pool } from "../config/database";

const router = Router();

router.get("/test", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        NOW() AS fecha_servidor,
        current_database() AS base_datos,
        current_user AS usuario
    `);

    res.status(200).json({
      success: true,
      message: "Conexión a PostgreSQL exitosa",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al conectar con PostgreSQL:", error);

    res.status(500).json({
      success: false,
      message: "No fue posible conectar con PostgreSQL",
    });
  }
});

export default router;
