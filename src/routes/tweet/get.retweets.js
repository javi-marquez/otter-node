import express from "express";
import { getListOfRetweets } from "../../database/db.js";
const router = express.Router();

router.get("/tweet/:tweetID/retweets", async (req, res) => {
  try {
    const retweets = await getListOfRetweets(req.params.tweetID);
    res.status(200).json({ res: retweets });
  } catch (err) {
    console.error("Error al obtener los retweets:", err);
    res.status(500).json({ error: "Error al obtener los retweets" });
  }
});

export default router;
