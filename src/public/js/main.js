// Notification System
const showNotification = ({
  title,
  message,
  type = "info",
  details = null,
  duration = 5000,
}) => {
  // Create container if it doesn't exist
  let container = document.querySelector(".notification-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "notification-container";
    document.body.appendChild(container);
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  let icon = "💡";
  switch (type) {
    case "rate-limit":
      icon = "⏳";
      break;
    case "error":
      icon = "❌";
      break;
    case "success":
      icon = "✅";
      break;
  }

  notification.innerHTML = `
    <div class="notification-icon">${icon}</div>
    <div class="notification-content">
      <h4 class="notification-title">${title}</h4>
      <p class="notification-message">${message}</p>
      ${details ? `<div class="notification-details">${details}</div>` : ""}
      <div class="notification-progress">
        <div class="notification-progress-bar"></div>
      </div>
    </div>
    <button class="notification-close">×</button>
  `;

  // Add to container
  container.appendChild(notification);

  // Handle close button
  const closeBtn = notification.querySelector(".notification-close");
  closeBtn.addEventListener("click", () => {
    notification.style.animation = "slideOut 0.3s ease-out forwards";
    setTimeout(() => notification.remove(), 300);
  });

  // Auto remove after duration
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = "slideOut 0.3s ease-out forwards";
      setTimeout(() => notification.remove(), 300);
    }
  }, duration);
};

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

// Add this helper function after the existing utility functions
const safelyUpdateContent = (selector, content) => {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = content;
  } else {
    console.warn(`Element not found: ${selector}`);
  }
};

// File handling functions
const updateFileList = (fileInput) => {
  const fileList = fileInput.closest("form").querySelector(".file-list");
  if (!fileList) return;

  fileList.innerHTML = "";
  Array.from(fileInput.files).forEach((file, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="file-name">${file.name}</span>
      <button type="button" class="remove-file" data-index="${index}">×</button>
    `;
    fileList.appendChild(li);
  });
};

const handleFileInput = () => {
  const forms = document.querySelectorAll(".ai-form");
  forms.forEach((form) => {
    const fileInput = form.querySelector('input[type="file"]');
    if (!fileInput) return;

    // Handle file selection
    fileInput.addEventListener("change", () => {
      updateFileList(fileInput);
    });

    // Handle file removal
    const fileList = form.querySelector(".file-list");
    if (fileList) {
      fileList.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-file")) {
          const index = parseInt(e.target.dataset.index);
          const dt = new DataTransfer();
          const files = fileInput.files;

          for (let i = 0; i < files.length; i++) {
            if (i !== index) {
              dt.items.add(files[i]);
            }
          }

          fileInput.files = dt.files;
          updateFileList(fileInput);
        }
      });
    }
  });
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
    container.innerHTML = "<p>No differences found</p>";
    return container;
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

  let lineNumber = 1;
  let outputContent = "";

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.startsWith("@@")) continue;

    const lineContent = line.substring(1).trimEnd(); // Remove the first character and trailing spaces
    const prefix = line[0]; // Get the first character (-, +, or space)
    const classes = 
      prefix === '-' ? 'removed' :
      prefix === '+' ? 'added' : 
      'unchanged';

    outputContent += `<div class="code-line ${classes}">
      <span class="code-line-number">${prefix === ' ' ? lineNumber++ : prefix}</span>
      <code>${escapeHtml(lineContent)}</code>
    </div>`;
  }

  diffContainer.innerHTML = outputContent;
  container.appendChild(diffContainer);
  return container;
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

// Form handlers with improved error handling
const handleFormError = async (error, response) => {
  console.error("Error:", error);
  hideLoading();

  try {
    // If we have a response object, try to parse it
    const errorData = response ? await response.json() : null;

    if (response?.status === 429) {
      showNotification({
        title: "Taking a Quick Break",
        message:
          errorData?.message || "Rate limit reached. Please wait a moment.",
        type: "rate-limit",
        details: errorData?.details
          ? `
          <div class="rate-limit-info">
            <div class="usage-stats">
              <p>Requests: ${errorData.details.currentRequests}/${errorData.details.maxRequests}</p>
              <div class="usage-bar">
                <div class="fill" style="width: ${errorData.details.usagePercent}%"></div>
              </div>
            </div>
            <p>Next attempt available at: ${errorData.details.resetTime}</p>
            <p class="suggestion">${errorData.details.suggestedAction}</p>
          </div>
        `
          : null,
        duration: 10000,
      });

      return {
        html: `
          <div class="rate-limit-info">
            <h3>🕒 Taking a Quick Break</h3>
            <p>${
              errorData?.message || "Rate limit reached. Please wait a moment."
            }</p>
            <div class="timer-info">
              <div class="usage-stats">
                <span>Requests: ${errorData?.details?.currentRequests || "0"}/${
          errorData?.details?.maxRequests || "5"
        }</span>
                <div class="usage-bar">
                  <div class="fill" style="width: ${
                    errorData?.details?.usagePercent || 0
                  }%"></div>
                </div>
              </div>
              <p class="reset-time">Next attempt available at ${
                errorData?.details?.resetTime || "shortly"
              }</p>
            </div>
          </div>
        `,
        isError: true,
      };
    }

    // For other API errors
    showNotification({
      title: "Error",
      message: errorData?.message || error.message || "Something went wrong",
      type: "error",
      duration: 5000,
    });

    return {
      html: `
        <div class="error-message" style="color: var(--error-color); padding: 1rem; border-left: 3px solid var(--error-color);">
          <h3>Error</h3>
          <p>${
            errorData?.message ||
            error.message ||
            "An unexpected error occurred. Please try again."
          }</p>
          ${
            errorData?.details
              ? `<div class="error-details">${JSON.stringify(
                  errorData.details
                )}</div>`
              : ""
          }
        </div>
      `,
      isError: true,
    };
  } catch (parseError) {
    // If we can't parse the error response, show a generic error
    showNotification({
      title: "Error",
      message: error.message || "Something went wrong",
      type: "error",
      duration: 5000,
    });

    return {
      html: `
        <div class="error-message" style="color: var(--error-color); padding: 1rem; border-left: 3px solid var(--error-color);">
          <h3>Error</h3>
          <p>${
            error.message || "An unexpected error occurred. Please try again."
          }</p>
        </div>
      `,
      isError: true,
    };
  }
};

const handleApiRequest = async (url, method, data) => {
  const isFormData = data instanceof FormData;

  try {
    const response = await fetch(url, {
      method: method,
      credentials: "same-origin",
      headers: isFormData
        ? {
            Accept: "application/json",
          }
        : {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
      body: isFormData ? data : JSON.stringify(data),
    });

    let responseData;
    const contentType = response.headers.get("content-type");

    try {
      responseData =
        contentType && contentType.includes("application/json")
          ? await response.json()
          : { success: false, message: await response.text() };
    } catch (parseError) {
      console.error("Failed to parse response:", parseError);
      throw {
        message: "Invalid response from server",
        response: response,
      };
    }

    if (!response.ok || response.status !== 200) {
      throw {
        message: responseData.message || response.statusText,
        response: response,
      };
    }

    return responseData;
  } catch (error) {
    // If it's already formatted as we want, throw it as is
    if (error.response) throw error;

    // Otherwise, format it properly
    throw {
      message: error.message || "Unknown error occurred",
      response: null,
    };
  }
};

const handleReadmeForm = async (e) => {
  e.preventDefault();
  const description = document.getElementById("projectDescription").value;
  const resultDiv = document.getElementById("result");

  showLoading();
  try {
    const data = await handleApiRequest("/api/generate-readme", "POST", {
      projectDescription: description,
    });
    // console.log("Received data:", data);

    // Extract the markdown content from the correct path in the response
    const markdownContent = data.content.result;

    if (!markdownContent) {
      throw new Error("No content received from server");
    }

    // Wrap the markdown content in a styled container
    resultDiv.innerHTML = `<div class="markdown-body">${marked.parse(
      markdownContent
    )}</div>`;
    resultDiv.dataset.markdown = markdownContent;

    document.getElementById("downloadBtn").onclick = () => {
      downloadMarkdown(markdownContent);
    };

    hideLoading();

    showNotification({
      title: "Success",
      message: "README generated successfully",
      type: "success",
      duration: 3000,
    });
  } catch (error) {
    const { html } = await handleFormError(error, error.response);
    resultDiv.innerHTML = html;
    resultDiv.style.display = "block";
  }
};

const handleApiForm = async (e) => {
  e.preventDefault();
  const requirements = document.getElementById("requirements").value;
  const method = document.getElementById("method").value;
  const result = document.getElementById("result");

  showLoading();
  try {
    const data = await handleApiRequest("/api/suggest-api", "POST", {
      requirements,
      method,
    });

    // Parse the API response content
    const content = data.content;
    const sections = parseApiContent(content);

    // Generate the formatted HTML
    result.innerHTML = generateApiResponseHtml(sections);
    hideLoading();

    showNotification({
      title: "Success",
      message: "API endpoint generated successfully",
      type: "success",
      duration: 3000,
    });
  } catch (error) {
    const { html } = await handleFormError(error, error.response);
    result.innerHTML = html;
    result.style.display = "block";
  }
};

const handleExplainForm = async (e) => {
  e.preventDefault();
  const code = document.getElementById("code").value;
  const language = document.getElementById("language").value;
  const fileInput = document.getElementById("codeFile");
  const output = document.getElementById("result");
  if (!output) {
    console.error("Result element not found");
    return;
  }

  showLoading();
  try {
    const formData = new FormData();
    formData.append("code", code);
    formData.append("language", language);

    if (fileInput && fileInput.files) {
      Array.from(fileInput.files).forEach((file) => {
        formData.append("files", file);
      });
    }

    const data = await handleApiRequest("/api/explain-code", "POST", formData);

    const result = data.content;

    // Update UI with results
    output.innerHTML = `
      <div class="explanation-section">
        <h3>Overview</h3>
        <div class="overview-content">${marked.parse(result.overview)}</div>
        
        <h3>Line-by-Line Review</h3>
        <div class="line-reviews-content">
          ${result.line_reviews
            .map(
              (review) => `
            <div class="review-item ${review.review_type}">
              <span class="line-number">Line ${review.line}:</span>
              <span class="review-text">${marked.parse(review.review)}</span>
            </div>
          `
            )
            .join("")}
        </div>
        ${
          result.udiff
            ? `
          <h3>Changes</h3>
          <div class="udiff-section">
            <div class="udiff-content"></div>
          </div>
        `
            : ""
        }
      </div>
    `;

    // If there's a udiff, render it
    if (result.udiff) {
      const udiffContent = output.querySelector(".udiff-content");
      renderCustomDiff(result.udiff, udiffContent.parentElement);
    }

    hideLoading();
    output.style.display = "block";

    showNotification({
      title: "Success",
      message: "Code explained successfully",
      type: "success",
      duration: 3000,
    });
  } catch (error) {
    const { html } = await handleFormError(error, error.response);
    output.innerHTML = html;
    output.style.display = "block";
  }
};

const handleFixForm = async (e) => {
  e.preventDefault();
  const code = document.getElementById("code").value;
  const issue = document.getElementById("issue").value;
  const language = document.getElementById("language").value;
  const fileInput = document.getElementById("codeFile");
  const output = document.getElementById("result");
  const outputSection = document.querySelector(".output-section");

  showLoading();

  try {
    const formData = new FormData();
    formData.append("code", code);
    formData.append("issue", issue);
    formData.append("language", language);

    if (fileInput && fileInput.files) {
      Array.from(fileInput.files).forEach((file) => {
        formData.append("files", file);
      });
    }

    const data = await handleApiRequest("/api/fix-code", "POST", formData);

    const result = data.content;

    // Update UI with results
    output.innerHTML = `
      <div class="fixing-section">
        <h3>Overview</h3>
        <div class="overview-content">${marked.parse(result.overview)}</div>

        <h3>Line-by-Line Fix</h3>
        <div class="line-reviews-content">
          ${result.line_reviews
            .map(
              (review) => `
            <div class="review-item ${review.review_type}">
              <span class="line-number">Line ${review.line}:</span>
              <span class="review-text">${marked.parse(review.review)}</span>
            </div>
          `
            )
            .join("")}
        </div>
        ${
          result.udiff
            ? `
          <h3>Changes</h3>
          <div class="udiff-section">
            <div class="udiff-content"></div>
          </div>
        `
            : ""
        }
      </div>
    `;

    // If there's a udiff, render it
    if (result.udiff) {
      const udiffContent = output.querySelector(".udiff-content");
      renderCustomDiff(result.udiff, udiffContent.parentElement);
    }

    hideLoading();
    outputSection.style.display = "block";

    showNotification({
      title: "Success",
      message: "Code fixed successfully",
      type: "success",
      duration: 3000,
    });
  } catch (error) {
    const { html } = await handleFormError(error, error.response);
    output.innerHTML = html;
    outputSection.style.display = "block";
  }
};

const handleCompareForm = async (e) => {
  e.preventDefault();

  const oldCode = document.getElementById("oldCode").value;
  const newCode = document.getElementById("newCode").value;
  const output = document.getElementById("result");
  const outputSection = document.querySelector(".output-section");

  if (!output) {
    console.error("Result element not found");
    return;
  }

  if (!oldCode.trim() || !newCode.trim()) {
    showNotification({
      title: "Error",
      message: "Please provide both versions of code to compare",
      type: "error",
      duration: 3000,
    });
    return;
  }

  showLoading();

  try {
    // Make API request to get analysis
    const data = await handleApiRequest("/api/compare-code", "POST", {
      oldCode,
      newCode,
    });

    const result = data.content;
    
    // Update UI with side-by-side comparison
    output.innerHTML = `
      <div class="code-comparison">
        <div class="code-panel">
          <h3>Original Version</h3>
          <div class="code-content original"></div>
        </div>
        <div class="code-panel">
          <h3>New Version</h3>
          <div class="code-content modified"></div>
        </div>
        ${result.overview ? `
          <div class="analysis-section">
            <h3>Overview</h3>
            <div class="analysis-content">${marked.parse(result.overview)}</div>
          </div>
        ` : ""}
      </div>
    `;

    // Render the code in both panels with line numbers
    const originalPanel = output.querySelector(".code-content.original");
    const modifiedPanel = output.querySelector(".code-content.modified");

    // Split code into lines
    const originalLines = oldCode.split("\n");
    const modifiedLines = newCode.split("\n");

    originalPanel.innerHTML = originalLines.map((line, index) => `
      <div class="code-line unchanged">
        <span class="code-line-number">${index + 1}</span>
        <code>${escapeHtml(line)}</code>
      </div>
    `).join("");

    modifiedPanel.innerHTML = modifiedLines.map((line, index) => `
      <div class="code-line unchanged">
        <span class="code-line-number">${index + 1}</span>
        <code>${escapeHtml(line)}</code>
      </div>
    `).join("");

    // Highlight differences
    highlightDifferences(originalPanel, modifiedPanel, result.udiff);

    hideLoading();
    outputSection.style.display = "block";

    showNotification({
      title: "Success", 
      message: "Code comparison complete",
      type: "success",
      duration: 3000,
    });
  } catch (error) {
    const { html } = await handleFormError(error);
    output.innerHTML = html;
    outputSection.style.display = "block";
  }
};

const highlightDifferences = (originalPanel, modifiedPanel, udiff) => {
  if (!udiff) return;

  const lines = udiff.split("\n");

  // Skip file headers and hunks
  const startIndex = lines.findIndex(line => 
    !line.startsWith("---") && 
    !line.startsWith("+++") && 
    !line.startsWith("@@")
  );

  let originalLineNum = 1;
  let modifiedLineNum = 1;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.startsWith("@@")) continue;

    const prefix = line[0]; // Get the first character (-, +, or space)

    if (prefix === "-") {
      const originalLine = originalPanel.querySelector(`.code-line:nth-child(${originalLineNum})`);
      if (originalLine) {
        originalLine.className = "code-line removed";
      }
      originalLineNum++;
    } else if (prefix === "+") {
      const modifiedLine = modifiedPanel.querySelector(`.code-line:nth-child(${modifiedLineNum})`);
      if (modifiedLine) {
        modifiedLine.className = "code-line added";
      }
      modifiedLineNum++;
    } else {
      originalLineNum++;
      modifiedLineNum++;
    }
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
  // Configure marked.js for simple text rendering
  marked.setOptions({
    headerPrefix: "", // Don't add IDs to headers
    mangle: false, // Don't add IDs to headings
    headerIds: false, // Don't add IDs to headers
    gfm: true,
    breaks: true,
  });

  // Setup form handlers
  const readmeForm = document.getElementById("readme-form");
  const apiForm = document.getElementById("api-form");
  const explainForm = document.getElementById("explain-form");
  const fixForm = document.getElementById("fix-form");
  const compareForm = document.getElementById("compare-form");

  if (readmeForm) readmeForm.addEventListener("submit", handleReadmeForm);
  if (apiForm) apiForm.addEventListener("submit", handleApiForm);
  if (explainForm) explainForm.addEventListener("submit", handleExplainForm);
  if (fixForm) fixForm.addEventListener("submit", handleFixForm);
  if (compareForm) compareForm.addEventListener("submit", handleCompareForm);

  // Initialize file handling
  handleFileInput();

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
