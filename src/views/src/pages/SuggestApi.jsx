import React, { useState } from "react";
import axios from "axios";

const SuggestApi = () => {
  const [requirements, setRequirements] = useState("");
  const [method, setMethod] = useState("GET");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { requirements, method };
      if (comments) payload.comments = comments;
      const { data } = await axios.post("/api/suggest-api", payload);
      setResponse(data);
    } catch (err) {
      setResponse({ error: err.response?.data || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Suggest API Endpoint</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Requirements</label>
          <textarea
            className="form-control"
            rows="4"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">HTTP Method</label>
          <select
            className="form-select"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
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

export default SuggestApi; 