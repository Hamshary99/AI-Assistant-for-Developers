import React, { useState, useEffect } from "react";
import axios from "axios";

const History = () => {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get("/api/history?limit=20");
        setHistory(data);
      } catch (err) {
        setError(err.response?.data || err.message);
      }
    };
    fetchHistory();
  }, []);

  if (error) {
    return (
      <div>
        <h2>History</h2>
        <p className="text-danger">Failed to load history. {String(error)}</p>
      </div>
    );
  }

  if (!history) {
    return (
      <div>
        <h2>History</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (Array.isArray(history)) {
    return (
      <div>
        <h2>History</h2>
        {history.length === 0 ? (
          <p>No historical records found.</p>
        ) : (
          <ul className="list-group">
            {history.map((item, idx) => (
              <li key={idx} className="list-group-item">
                <strong>{item.requestType}</strong> - {new Date(item.timeStamp).toLocaleString()}
                <pre className="bg-light p-2 mt-2 overflow-auto">
                  {JSON.stringify(item.content || item.responseRaw, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>History</h2>
      <pre className="bg-light p-3">
        {typeof history === "object"
          ? JSON.stringify(history, null, 2)
          : String(history)}
      </pre>
    </div>
  );
};

export default History; 