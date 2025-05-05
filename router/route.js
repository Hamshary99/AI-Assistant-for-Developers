import express from "express";
import {
  generateReadme,
  suggestApi,
  explainCode,
  fixCode,
  compareCode,
  getUserRequestHistory,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/generate-readme", generateReadme);
router.post("/suggest-api", suggestApi);
router.post("/explain-code", explainCode);
router.post("/fix-code", fixCode);
router.post("/compare-code", compareCode);

// History endpoint
router.get("/history", getUserRequestHistory);

export default router;
