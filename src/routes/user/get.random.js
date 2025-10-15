import express from "express";
import { getRandomUsers } from "../../database/db.js";
const router = express.Router();

router.get("/user/random/:limit", async (req, res) => {
  try {
    const random = await getRandomUsers(
      req.query.currentUserID,
      req.params.limit
    );
    res.status(200).json({ res: random });
  } catch (err) {
    console.error("Error al obtener usuarios aleatorios:", err);
    res.status(500).json({ error: "Error al obtener usuarios aleatorios" });
  }
});

export default router;