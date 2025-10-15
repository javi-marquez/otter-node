import express from "express";
import { createNewUser } from "../../database/db.js";
const router = express.Router();

router.post("/user/new", async (req, res) => {
  try {
    const newUser = await createNewUser(req.body);
    res.status(200).json({ message: "El usuario se ha creado correctamente" });
  } catch (err) {
    console.error("Error al crear usuario:", err);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

export default router;
