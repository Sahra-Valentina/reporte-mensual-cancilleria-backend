import { Router } from "express";
import { consultarAuditorias } from "../controllers/auditoria.controller";

const router = Router();

router.get("/", consultarAuditorias);

export default router;
