// Utility functions
const showLoading = () => {
  document.querySelector(".loading").style.display = "block";
  document.querySelector(".output-section").style.display = "none";
};

const hideLoading = () => {
  document.querySelector(".loading").style.display = "none";
  document.querySelector(".output-section").style.display = "block";
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

// Download function for README
const downloadMarkdown = (content, filename = "README.md") => {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Function to render unified diff with diff2html
const renderUnifiedDiff = (udiff, container) => {
  if (!udiff) {
    container.innerHTML = "<p>No changes required</p>";
    return;
  }

  // Ensure the diff has the correct format if it doesn't start with the file headers
  const formattedDiff = udiff.startsWith("---")
    ? udiff
    : `--- a/original.js\n+++ b/modified.js\n${udiff}`;

  // Create diff2html configuration
  const config = {
    drawFileList: true,
    matching: "lines",
    outputFormat: "line-by-line",
    highlight: true,
    renderNothingWhenEmpty: false,
    diffStyle: "word",
    colorScheme:
      document.querySelector("html").getAttribute("data-theme") === "dark"
        ? "dark"
        : "light",
  };

  // Create diff2html UI instance
  const diff2htmlUi = new Diff2HtmlUI(container, formattedDiff, config);

  // Add custom CSS classes for better visibility
  container.classList.add("diff-container");

  // Render the diff
  diff2htmlUi.draw();
  diff2htmlUi.highlightCode();
};

// Function to parse and render unified diff in a simple, readable format
const renderCustomDiff = (udiff, container) => {
  // Clear any existing content first
  container.innerHTML = "";

  if (!udiff) {
    container.innerHTML = "<p>No changes required</p>";
    return;
  }

  // Create a new container for the diff
  const diffContainer = document.createElement("div");
  diffContainer.className = "simple-diff";

  // Parse the diff
  const lines = udiff.split("\n");

  // Skip file headers and hunks
  const startIndex = lines.findIndex(
    (line) =>
      !line.startsWith("---") &&
      !line.startsWith("+++") &&
      !line.startsWith("@@")
  );

  let inModifiedSection = false;
  let outputContent = "";

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.startsWith("@@")) continue;

    const lineContent = line.substring(1).trimEnd(); // Remove the first character and trailing spaces

    if (line.startsWith("-")) {
      inModifiedSection = true;
      // Skip removed lines
    } else if (line.startsWith("+")) {
      outputContent += `<div class="code-line added">
        <code>${escapeHtml(lineContent)}</code>
        ${
          inModifiedSection
            ? '<span class="inline-comment">← Fixed: This line was modified</span>'
            : ""
        }
      </div>`;
      inModifiedSection = false;
    } else {
      outputContent += `<div class="code-line unchanged">
        <code>${escapeHtml(lineContent)}</code>
      </div>`;
    }
  }

  diffContainer.innerHTML = outputContent;
  container.appendChild(diffContainer);
};

// Helper function to escape HTML
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Form handlers
const handleReadmeForm = async (e) => {
  e.preventDefault();
  const description = document.getElementById("projectDescription").value;

  showLoading();
  try {
    const response = await fetch("/api/generate-readme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectDescription: description }),
    });

    const data = await response.json();
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = marked.parse(data.data.content);

    // Store the raw markdown for download
    resultDiv.dataset.markdown = data.data.content;

    // Setup download button
    document.getElementById("downloadBtn").onclick = () => {
      downloadMarkdown(data.data.content);
    };

    hideLoading();
  } catch (error) {
    console.error("Error:", error);
    hideLoading();
    alert("Failed to generate README. Please try again.");
  }
};

const handleApiForm = async (e) => {
  e.preventDefault();
  const requirements = document.getElementById("requirements").value;
  const method = document.getElementById("method").value;

  showLoading();
  try {
    const response = await fetch("/api/suggest-api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requirements, method }),
    });

    const data = await response.json();
    const result = document.getElementById("result");
    result.innerHTML = `<pre><code class="language-json">${JSON.stringify(
      data.data.content,
      null,
      2
    )}</code></pre>`;
    hljs.highlightElement(result.querySelector("code"));
    hideLoading();
  } catch (error) {
    console.error("Error:", error);
    hideLoading();
    alert("Failed to generate API suggestion. Please try again.");
  }
};

const handleExplainForm = async (e) => {
  e.preventDefault();
  const code = document.getElementById("code").value;
  const language = document.getElementById("language").value;

  showLoading();
  try {
    const response = await fetch("/api/explain-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });

    const data = await response.json();
    const result = data.data.content;
    const output = document.getElementById("result");

    // Display overview
    output.querySelector(".overview-content").textContent = result.overview;

    // Display line-by-line reviews
    const lineReviewsContent = output.querySelector(".line-reviews-content");
    lineReviewsContent.innerHTML = result.line_reviews
      .map(
        (review) => `
        <div class="review-item ${review.review_type}">
          <span class="line-number">Line ${review.line}:</span>
          <span class="review-text">${review.review}</span>
        </div>
      `
      )
      .join("");

    // Display suggested changes using the new diff renderer
    const udiffContent = output.querySelector(".udiff-content");
    if (result.udiff) {
      renderUnifiedDiff(result.udiff, udiffContent.parentElement);
      udiffContent.parentElement.parentElement.style.display = "block";
    } else {
      udiffContent.parentElement.parentElement.style.display = "none";
    }

    hideLoading();
  } catch (error) {
    console.error("Error:", error);
    hideLoading();
    alert("Failed to explain code. Please try again.");
  }
};

const handleFixForm = async (e) => {
  e.preventDefault();
  const code = document.getElementById("code").value;
  const issue = document.getElementById("issue").value;
  const language = document.getElementById("language").value;
  const output = document.getElementById("result");
  const outputSection = document.querySelector(".output-section");

  showLoading();

  try {
    const response = await fetch("/api/fix-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ code, issue, language }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fix code");
    }

    if (!data.data || !data.data.content) {
      throw new Error("Invalid response format");
    }

    const result = data.data.content;

    // Clear any previous content
    output.innerHTML = `
      <div class="overview">
        <h3>Overview</h3>
        <p class="overview-content"></p>
      </div>
      <div class="line-reviews">
        <h3>Issues Found</h3>
        <div class="line-reviews-content"></div>
      </div>
      <div class="udiff">
        <h3>Fixed Code</h3>
        <pre><code class="udiff-content language-javascript"></code></pre>
      </div>
    `;

    // Display overview
    output.querySelector(".overview-content").textContent = result.overview;

    // Display line reviews (issues found)
    const lineReviewsContent = output.querySelector(".line-reviews-content");
    lineReviewsContent.innerHTML = result.line_reviews
      .map(
        (review) => `
        <div class="review-item ${review.review_type}">
          <span class="line-number">Line ${review.line}:</span>
          <span class="review-text">${review.review}</span>
        </div>
      `
      )
      .join("");

    // Display fixed code using the custom renderer
    const udiffContent = output.querySelector(".udiff-content");
    renderCustomDiff(result.udiff, udiffContent.parentElement);

    // Only show the output section after everything is ready
    hideLoading();
    outputSection.style.display = "block";
  } catch (error) {
    console.error("Error:", error);
    hideLoading();

    // Show user-friendly error message in the UI
    output.innerHTML = `
      <div class="error-message" style="color: var(--error-color); padding: 1rem; border-left: 3px solid var(--error-color);">
        <h3>Error</h3>
        <p>${error.message || "Failed to fix code. Please try again."}</p>
      </div>
    `;

    // Show error in output section
    outputSection.style.display = "block";
  }
};

// History page functionality
const setupHistoryFilters = () => {
  const typeFilter = document.getElementById("type-filter");
  const dateFilter = document.getElementById("date-filter");
  const clearFilters = document.getElementById("clear-filters");

  if (!typeFilter || !dateFilter || !clearFilters) return;

  const filterHistory = () => {
    const type = typeFilter.value;
    const date = dateFilter.value;
    const cards = document.querySelectorAll(".history-card");

    cards.forEach((card) => {
      let show = true;
      if (type !== "all" && card.dataset.type !== type) show = false;
      if (date) {
        const cardDate = new Date(card.querySelector(".timestamp").textContent)
          .toISOString()
          .split("T")[0];
        if (cardDate !== date) show = false;
      }
      card.style.display = show ? "block" : "none";
    });
  };

  typeFilter.addEventListener("change", filterHistory);
  dateFilter.addEventListener("change", filterHistory);
  clearFilters.addEventListener("click", () => {
    typeFilter.value = "all";
    dateFilter.value = "";
    filterHistory();
  });
};

// Copy buttons functionality
const setupCopyButtons = () => {
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const content =
        btn.dataset.content ||
        btn.closest(".history-card").querySelector(".history-content")
          .textContent;
      copyToClipboard(content);
    });
  });
};

// Mobile navigation toggle
const setupMobileNav = () => {
  const navbar = document.querySelector(".navbar");
  const navMenu = document.querySelector(".nav-menu");

  // Create and add toggle button if it doesn't exist
  if (!document.querySelector(".nav-toggle")) {
    const toggle = document.createElement("button");
    toggle.className = "nav-toggle";
    toggle.innerHTML = "☰";
    toggle.setAttribute("aria-label", "Toggle navigation menu");
    navbar.insertBefore(toggle, navMenu);

    toggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      toggle.innerHTML = navMenu.classList.contains("active") ? "✕" : "☰";
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navbar.contains(e.target)) {
        navMenu.classList.remove("active");
        toggle.innerHTML = "☰";
      }
    });
  }
};

// Initialize all functionality
document.addEventListener("DOMContentLoaded", () => {
  // Setup form handlers
  const readmeForm = document.getElementById("readme-form");
  const apiForm = document.getElementById("api-form");
  const explainForm = document.getElementById("explain-form");
  const fixForm = document.getElementById("fix-form");

  if (readmeForm) readmeForm.addEventListener("submit", handleReadmeForm);
  if (apiForm) apiForm.addEventListener("submit", handleApiForm);
  if (explainForm) explainForm.addEventListener("submit", handleExplainForm);
  if (fixForm) fixForm.addEventListener("submit", handleFixForm);

  // Setup copy buttons in output sections
  document.querySelectorAll("#copyBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const content = document.getElementById("result").textContent;
      copyToClipboard(content);
    });
  });

  // Setup history page functionality
  setupHistoryFilters();
  setupCopyButtons();

  // Setup mobile navigation
  setupMobileNav();

  // Close mobile menu when clicking a link
  document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelector(".nav-menu").classList.remove("active");
      document.querySelector(".nav-toggle").innerHTML = "☰";
    });
  });

  // Initialize syntax highlighting
  document.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);
  });
});
