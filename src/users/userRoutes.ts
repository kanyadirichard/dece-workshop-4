import express from "express";

const router = express.Router();

let lastReceivedMessage: string | null = null;
let lastSentMessage: string | null = null;

router.get("/getLastReceivedMessage", (req, res) => {
  res.json({ result: lastReceivedMessage });
});

router.get("/getLastSentMessage", (req, res) => {
  res.json({ result: lastSentMessage });
});

export default router;
