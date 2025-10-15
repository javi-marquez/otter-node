import express from "express";
import { deleteLike } from "../../database/db.js";
const router = express.Router();

router.delete("/tweet/:tweetID/like/:userID", async (req, res) => {
  try {
    await deleteLike(req.params.tweetID, req.params.userID);
    res.status(200).json({ message: "El like se ha borrado" });
  } catch (err) {
    console.error("Error al borrar like:", err);
    res.status(500).json({ error: "Error al borrar like" });
  }
});

export default router;
