import express from "express";
import { deleteFollower } from "../../database/db.js";
const router = express.Router();

router.delete("/user/:followerID/follow/:followedID", async (req, res) => {
    try {
      await deleteFollower(req.params.followerID, req.params.followedID);
      res.status(200).json({ message: "El seguimiento se ha borrado" });
    } catch (err) {
      console.error("Error al borrar seguimiento:", err);
      res.status(500).json({ error: "Error al borrar seguimiento" });
    }
  });

export default router;