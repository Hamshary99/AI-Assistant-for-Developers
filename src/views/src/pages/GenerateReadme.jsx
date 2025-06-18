import React, { useState } from "react";
import axios from "axios";

const GenerateReadme = () => {
  const [projectDescription, setProjectDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      if (files.length) {
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
      }
      formData.append("projectDescription", projectDescription);
      if (comments) formData.append("comments", comments);

      const { data } = await axios.post("/api/generate-readme", formData, {
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
      <h2>Generate README</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Project Description</label>
          <textarea
            className="form-control"
            rows="4"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            required={!files.length}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Upload Project Files (optional)</label>
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
          {loading ? "Generating..." : "Submit"}
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

export default GenerateReadme; 