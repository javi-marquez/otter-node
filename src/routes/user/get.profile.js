import express from "express";
import { getUserProfileTweets } from "../../database/db.js";
const router = express.Router();

router.get("/user/:userID/profile", async (req, res) => {
  try {
    const profile = await getUserProfileTweets(
      req.params.userID,
      req.query.currentUserID
    );
    res.status(200).json({ res: profile });
  } catch (err) {
    console.error("Error al obtener la timeline del usuario:", err);
    res.status(500).json({ error: "Error al obtener la timeline del usuario" });
  }
});

export default router;
