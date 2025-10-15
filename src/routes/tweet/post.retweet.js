import express from "express";
import { postRetweet } from "../../database/db.js";
const router = express.Router();

router.post("/tweet/:tweetID/retweet/:userID", async (req, res) => {
  try {
    await postRetweet(req.params.tweetID, req.params.userID);
    res.status(200).json({ message: "El retweet se ha añadido" });
  } catch (err) {
    console.error("Error al añadir retweet:", err);
    res.status(500).json({ error: "Error al añadir retweet" });
  }
});

export default router;
