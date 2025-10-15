import express from "express";
import { getListOfLikes } from "../../database/db.js";
const router = express.Router();

router.get("/tweet/:tweetID/likes", async (req, res) => {
  try {
    const likes = await getListOfLikes(req.params.tweetID);
    res.status(200).json({ res: likes });
  } catch (err) {
    console.error("Error al obtener los likes:", err);
    res.status(500).json({ error: "Error al obtener los likes" });
  }
});

export default router;
