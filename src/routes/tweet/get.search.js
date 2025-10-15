import express from "express";
import { getSearchTweet } from "../../database/db.js";
const router = express.Router();

router.get("/tweet/search", async (req, res) => {
  try {
    const search = await getSearchTweet(
      req.query.searchWord,
      req.query.currentUserID
    );
    res.status(200).json({ res: search });
  } catch (err) {
    console.error("Error al hacer la búsqueda:", err);
    res.status(500).json({ error: "Error al hacer la búsqueda" });
  }
});

export default router;