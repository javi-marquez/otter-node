import express from "express";
import { getUser } from "../../database/db.js";
const router = express.Router();

router.get("/user/:userId", async (req, res) => {
  try {
    const user = await getUser(req.params.userId, req.query.currentUserID);
    res.status(200).json({ res: user });
  } catch (err) {
    console.error("Error al obtener usuario:", err);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

export default router;
