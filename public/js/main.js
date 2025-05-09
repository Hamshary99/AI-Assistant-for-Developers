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
  const response = await fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw {
      message: response.statusText,
      response: response,
    };
  }

  const responseData = await response.json();
  if (!responseData.success) {
    throw {
      message: responseData.message,
      response: response,
    };
  }

  return responseData;
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
    resultDiv.innerHTML = marked.parse(data.data.content);
    resultDiv.dataset.markdown = data.data.content;

    document.getElementById("downloadBtn").onclick = () => {
      downloadMarkdown(data.data.content);
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
    const content = data.data.content;
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

    const response = await fetch("/api/explain-code", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw {
        message: errorResponse.message,
        response: response,
        details: errorResponse.details,
      };
    }

    const data = await response.json();
    const result = data.data.content;
    const output = document.getElementById("result");

    output.querySelector(".overview-content").textContent = result.overview;

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

    const udiffContent = output.querySelector(".udiff-content");
    if (result.udiff) {
      renderUnifiedDiff(result.udiff, udiffContent.parentElement);
      udiffContent.parentElement.parentElement.style.display = "block";
    } else {
      udiffContent.parentElement.parentElement.style.display = "none";
    }

    hideLoading();

    showNotification({
      title: "Success",
      message: "Code explanation generated successfully",
      type: "success",
      duration: 3000,
    });
  } catch (error) {
    const { html } = await handleFormError(error, error.response);
    document.getElementById("result").innerHTML = html;
    document.querySelector(".output-section").style.display = "block";
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

    // Add all files
    if (fileInput && fileInput.files) {
      Array.from(fileInput.files).forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await fetch("/api/fix-code", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw {
        message: errorResponse.message,
        response: response,
        details: errorResponse.details,
      };
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to fix code");
    }

    const result = data.data.content;
    output.querySelector(".overview-content").textContent = result.overview;

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

    const udiffContent = output.querySelector(".udiff-content");
    renderCustomDiff(result.udiff, udiffContent.parentElement);

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

  showLoading();

  try {
    const formData = new FormData();
    const oldCodeFiles = document.getElementById("oldCodeFile").files;
    const newCodeFiles = document.getElementById("newCodeFile").files;

    // Add text inputs if provided
    formData.append("oldCode", oldCode);
    formData.append("newCode", newCode);

    // Add old code files
    for (let i = 0; i < oldCodeFiles.length; i++) {
      formData.append("files", oldCodeFiles[i]);
    }

    // Add new code files
    for (let i = 0; i < newCodeFiles.length; i++) {
      formData.append("files", newCodeFiles[i]);
    }

    const response = await fetch("/api/compare-code", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw {
        message: errorResponse.message,
        response: response,
        details: errorResponse.details,
      };
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to compare code");
    }

    const result = data.data.content;

    output.querySelector(".overview-content").textContent = result.overview;

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

    const udiffContent = output.querySelector(".udiff-content");
    if (result.udiff) {
      renderUnifiedDiff(result.udiff, udiffContent.parentElement);
      udiffContent.parentElement.parentElement.style.display = "block";
    } else {
      udiffContent.parentElement.parentElement.style.display = "none";
    }

    hideLoading();

    showNotification({
      title: "Success",
      message: "Code comparison completed successfully",
      type: "success",
      duration: 3000,
    });
  } catch (error) {
    const { html } = await handleFormError(error, error.response);
    output.innerHTML = html;
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
