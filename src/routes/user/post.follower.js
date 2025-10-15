import express from "express";
import { postFollower } from "../../database/db.js";
const router = express.Router();

router.post("/user/:followerID/follow/:followedID", async (req, res) => {
    try {
      await postFollower(req.params.followerID, req.params.followedID);
      res.status(200).json({ message: "El seguimiento se ha añadido" });
    } catch (err) {
      console.error("Error al añadir seguimiento:", err);
      res.status(500).json({ error: "Error al añadir seguimiento" });
    }
  });

export default router;