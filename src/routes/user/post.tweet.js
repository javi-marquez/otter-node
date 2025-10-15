import express from "express";
import { postNewTweet } from "../../database/db.js";
const router = express.Router();

router.post("/user/:userID/tweet", async (req, res) => {
  try {
    await postNewTweet(
      req.params.userID,
      req.body.tweetContent
    );
    res.status(200).json({ message: "El tweet se ha añadido" });
  } catch (err) {
    console.error("Error al añadir tweet:", err);
    res.status(500).json({ error: "Error al añadir tweet" });
  }
});

export default router;
