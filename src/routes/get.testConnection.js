import express from "express";
import { testConnection } from "../database/db.js";
const router = express.Router();

router.get("/test-connection", async (req, res) => {
  try {
    testConnection();
    res.status(200).json({ message: "Conexión exitosa" });
  } catch (err) {
    console.error("Error al conectar a la base de datos:", err);
    res.status(500).json({ error: "Error al conectar a la base de datos" });
  }
});

export default router;
