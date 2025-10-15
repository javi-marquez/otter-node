import express from "express";
import { getRepliesFromTweet } from "../../database/db.js";
const router = express.Router();

router.get("/tweet/:tweetID/replies", async (req, res) => {
  try {
    const replies = await getRepliesFromTweet(
      req.params.tweetID,
      req.query.currentUserID
    );
    res.status(200).json({ res: replies });
  } catch (err) {
    console.error("Error al obtener las respuestas:", err);
    res.status(500).json({ error: "Error al obtener las respuestas" });
  }
});

export default router;
