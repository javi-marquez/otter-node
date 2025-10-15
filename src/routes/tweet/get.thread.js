import express from "express";
import { getThreadFromTweet } from "../../database/db.js";
const router = express.Router();

router.get("/tweet/:tweetID/thread", async (req, res) => {
  try {
    const thread = await getThreadFromTweet(
      req.params.tweetID,
      req.query.currentUserID
    );
    res.status(200).json({ res: thread });
  } catch (err) {
    console.error("Error al obtener el thread:", err);
    res.status(500).json({ error: "Error al obtener el thread" });
  }
});

export default router;
