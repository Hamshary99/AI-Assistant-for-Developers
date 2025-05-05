import express from "express";
import { getUserHistory } from "../db/dbService.js";

const router = express.Router();

// Home page route
router.get("/", async (req, res) => {
  try {
    const history = await getUserHistory(5);
    res.render("index", {
      title: "Gemini Code Helper",
      activePage: "home",
      history: history,
    });
  } catch (error) {
    console.error("Error rendering home page:", error);
    res.status(500).render("error", { message: "Failed to load home page" });
  }
});

// Generate README page
router.get("/generate-readme", async (req, res) => {
  try {
    const history = await getUserHistory(5);
    res.render("readme", {
      title: "Generate README",
      activePage: "readme",
      history: history,
    });
  } catch (error) {
    console.error("Error rendering README page:", error);
    res.status(500).render("error", { message: "Failed to load README page" });
  }
});

// Suggest API page
router.get("/suggest-api", async (req, res) => {
  try {
    const history = await getUserHistory(5);
    res.render("api", {
      title: "Suggest API",
      activePage: "api",
      history: history,
    });
  } catch (error) {
    console.error("Error rendering API page:", error);
    res.status(500).render("error", { message: "Failed to load API page" });
  }
});

// Explain code page
router.get("/explain-code", async (req, res) => {
  try {
    const history = await getUserHistory(5);
    res.render("explain", {
      title: "Explain Code",
      activePage: "explain",
      history: history,
    });
  } catch (error) {
    console.error("Error rendering explain page:", error);
    res.status(500).render("error", { message: "Failed to load explain page" });
  }
});

// Fix code page
router.get("/fix-code", async (req, res) => {
  try {
    const history = await getUserHistory(5);
    res.render("fix", {
      title: "Fix Code",
      activePage: "fix",
      history: history,
    });
  } catch (error) {
    console.error("Error rendering fix page:", error);
    res.status(500).render("error", { message: "Failed to load fix page" });
  }
});

// View all history
router.get("/history", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const history = await getUserHistory(limit);
    res.render("history", {
      title: "Request History",
      activePage: "history",
      history: history,
    });
  } catch (error) {
    console.error("Error rendering history page:", error);
    res.status(500).render("error", { message: "Failed to load history page" });
  }
});

export default router;
