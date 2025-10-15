import express from "express";
import { getUserFeed } from "../../database/db.js";
const router = express.Router();

router.get("/user/:userID/feed", async (req, res) => {
  try {
    const feed = await getUserFeed(req.params.userID);
    res.status(200).json({ res: feed });
  } catch (err) {
    console.error("Error al obtener el feed:", err);
    res.status(500).json({ error: "Error al obtener el feed" });
  }
});

export default router;
