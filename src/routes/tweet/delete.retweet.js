import express from "express";
import { deleteRetweet } from "../../database/db.js";
const router = express.Router();

router.delete("/tweet/:tweetID/retweet/:userID", async (req, res) => {
  try {
    await deleteRetweet(req.params.tweetID, req.params.userID);
    res.status(200).json({ message: "El retweet se ha borrado" });
  } catch (err) {
    console.error("Error al borrar retweet:", err);
    res.status(500).json({ error: "Error al borrar retweet" });
  }
});

export default router;
