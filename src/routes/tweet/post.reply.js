import express from "express";
import { postReply } from "../../database/db.js";
const router = express.Router();

router.post("/tweet/:tweetID/reply", async (req, res) => {
  try {
    await postReply(
      req.params.tweetID,
      Number(req.body.userID),
      req.body.tweetContent
    );
    res.status(200).json({ message: "La respuesta se ha añadido" });
  } catch (err) {
    console.error("Error al añadir like:", err);
    res.status(500).json({ error: "Error al añadir respuesta" });
  }
});

export default router;
