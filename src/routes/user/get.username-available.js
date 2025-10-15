import express from "express";
import { isUsernameAvailable } from "../../database/db.js";
const router = express.Router();

router.get("/user/:userName/available", async (req, res) => {
  try {
    const user = await isUsernameAvailable(req.params.userName);
    res.status(200).json({ res: user });
  } catch (err) {
    console.error("Error al comprobar disponibilidad de username:", err);
    res
      .status(500)
      .json({ error: "Error al comprobar disponibilidad de username" });
  }
});

export default router;
