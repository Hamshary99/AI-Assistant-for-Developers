import express from "express";
import { getUserHistory } from "../db/dbService.js";
import { marked } from "marked";

const webRouter = express.Router();

// Home page route
webRouter.get("/", async (req, res) => {
  try {
    const history = await getUserHistory(5);
    res.render("index", {
      title: "Gemini Code Helper",
      activePage: "home",
      history: history,
    });
  } catch (error) {
    console.error("Error rendering home page:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Failed to load home page",
      activePage: "",
    });
  }
});

// Generate README page
webRouter.get("/generate-readme", async (req, res) => {
  try {
    const history = await getUserHistory(5);
    res.render("readme", {
      title: "Generate README",
      activePage: "readme",
      history: history,
    });
  } catch (error) {
    console.error("Error rendering README page:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Failed to load README page",
      activePage: "",
    });
  }
});

// Suggest API page
webRouter.get("/suggest-api", async (req, res) => {
  try {
    const history = await getUserHistory(5);
    res.render("suggest-api", {
      title: "Suggest API",
      activePage: "api",
      history: history,
    });
  } catch (error) {
    console.error("Error rendering API page:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Failed to load API page",
      activePage: "",
    });
  }
});

// Explain code page
webRouter.get("/explain-code", async (req, res) => {
  try {
    const history = await getUserHistory(5);
    res.render("explain-code", {
      title: "Explain Code",
      activePage: "explain",
      history: history,
    });
  } catch (error) {
    console.error("Error rendering explain page:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Failed to load explain page",
      activePage: "",
    });
  }
});

// Fix code page
webRouter.get("/fix-code", async (req, res) => {
  try {
    const history = await getUserHistory(5);
    res.render("fix-code", {
      title: "Fix Code",
      activePage: "fix",
      history: history,
    });
  } catch (error) {
    console.error("Error rendering fix page:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Failed to load fix page",
      activePage: "",
    });
  }
});

// View all history
webRouter.get("/history", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const history = await getUserHistory(limit);
    res.render("history", {
      title: "Request History",
      activePage: "history",
      history: history,
      currentPage: parseInt(req.query.page) || 1,
      totalPages: Math.ceil(history.length / limit),
      marked: marked, // Pass marked to the template
    });
  } catch (error) {
    console.error("Error rendering history page:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Failed to load history page",
      activePage: "",
    });
  }
});

export default webRouter;
