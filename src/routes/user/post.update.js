import express from "express";
import { updateUser } from "../../database/db.js";
const router = express.Router();

router.post("/user/:userID/update", async (req, res) => {
  try {
    await updateUser(req.params.userID, req.body);
    res
      .status(200)
      .json({ message: "El usuario se ha actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

export default router;
