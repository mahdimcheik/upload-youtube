import express from "express";

const router = express.Router();

router.get("/upload", (req, res) => {
  res.status(200).send("upload request accept");
});

export default router;
