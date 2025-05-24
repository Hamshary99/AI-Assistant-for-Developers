import express from "express";
import upload from "../middleware/filesReader.js";
import {
  generateReadme,
  suggestApi,
  explainCode,
  fixCode,
  compareCode,
  getUserRequestHistory,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/generate-readme", upload, generateReadme);
router.post("/suggest-api", suggestApi);
router.post("/explain-code", upload, explainCode);
router.post("/fix-code", upload, fixCode);
router.post("/compare-code", upload, compareCode);

// History endpoint
router.get("/history", getUserRequestHistory);

export default router;
