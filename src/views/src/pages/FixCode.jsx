import React, { useState } from "react";
import axios from "axios";

const FixCode = () => {
  const [code, setCode] = useState("");
  const [issue, setIssue] = useState("");
  const [language, setLanguage] = useState("");
  const [files, setFiles] = useState([]);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      if (files.length) files.forEach((f) => formData.append("files", f));
      if (!files.length) formData.append("code", code);
      if (issue) formData.append("issue", issue);
      if (language) formData.append("language", language);
      if (comments) formData.append("comments", comments);

      const { data } = await axios.post("/api/fix-code", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResponse(data);
    } catch (err) {
      setResponse({ error: err.response?.data || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Fix Code</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Issue Description (optional)</label>
          <input
            type="text"
            className="form-control"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Language (optional)</label>
          <input
            type="text"
            className="form-control"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Code</label>
          <textarea
            className="form-control"
            rows="6"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required={!files.length}
          />
          <div className="form-text">Or upload file(s) below.</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Upload Files (optional)</label>
          <input
            type="file"
            multiple
            className="form-control"
            onChange={(e) => setFiles([...e.target.files])}
            accept=".txt,.js,.ts,.jsx,.tsx,.py,.java,.c,.cpp,.cs,.go,.rb,.rs,.php,.html,.css,.json,.md"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Comments (optional)</label>
          <textarea
            className="form-control"
            rows="2"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {response && (
        <div className="mt-4">
          <h4>Response</h4>
          <pre className="bg-light p-3 rounded overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FixCode; 