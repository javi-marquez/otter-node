import express from "express";
import { getListOfFollowers } from "../../database/db.js";
const router = express.Router();

router.get("/user/:userID/followers", async (req, res) => {
  try {
    const followers = await getListOfFollowers(req.params.userID);
    res.status(200).json({ res: followers });
  } catch (err) {
    console.error("Error al obtener los followers:", err);
    res.status(500).json({ error: "Error al obtener los followers" });
  }
});

export default router;
