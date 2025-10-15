import express from "express";
const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    res.status(200).json({ message: "SERVER UP" });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Unexpected error" });
  }
});

export default router;
