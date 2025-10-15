import express from "express";
import { postLike } from "../../database/db.js";
const router = express.Router();

router.post("/tweet/:tweetID/like/:userID", async (req, res) => {
  try {
    await postLike(req.params.tweetID, req.params.userID);
    res.status(200).json({ message: "El like se ha añadido" });
  } catch (err) {
    console.error("Error al añadir like:", err);
    res.status(500).json({ error: "Error al añadir like" });
  }
});

export default router;
