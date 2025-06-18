import React, { useState } from "react";
import axios from "axios";

const CompareCode = () => {
  const [oldCode, setOldCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { oldCode, newCode };
      if (comments) payload.comments = comments;
      const { data } = await axios.post("/api/compare-code", payload);
      setResponse(data);
    } catch (err) {
      setResponse({ error: err.response?.data || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Compare Code</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Old Code</label>
          <textarea
            className="form-control"
            rows="6"
            value={oldCode}
            onChange={(e) => setOldCode(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">New Code</label>
          <textarea
            className="form-control"
            rows="6"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            required
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

export default CompareCode; 