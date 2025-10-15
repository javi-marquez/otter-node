import express from "express";
import { getListOfFolloweds } from "../../database/db.js";
const router = express.Router();

router.get("/user/:userID/followeds", async (req, res) => {
  try {
    const followeds = await getListOfFolloweds(req.params.userID);
    res.status(200).json({ res: followeds });
  } catch (err) {
    console.error("Error al obtener los followeds:", err);
    res.status(500).json({ error: "Error al obtener los followeds" });
  }
});

export default router;
