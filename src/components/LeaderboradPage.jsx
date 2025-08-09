import React, { useEffect, useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function LeaderboardPage() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/participant/all`)
      .then((res) => res.json())
      .then((data) => {
        setParticipants(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch participants", err);
        setLoading(false);
      });
  }, []);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        textAlign: "center",
        background: "linear-gradient(to bottom, #f0f4ff, #d6e0ff)",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "#333" }}>🏆 Guzz Kodle Leaderboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : participants.length === 0 ? (
        <p>No participants yet!</p>
      ) : (
        <table
          style={{
            width: "90%",
            margin: "auto",
            marginTop: "20px",
            borderCollapse: "collapse",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
            backgroundColor: "white",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#4a4a8c", color: "white" }}>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Attempts</th>
              <th style={thStyle}>Attempt Number</th>
              <th style={thStyle}>Seconds</th>
              <th style={thStyle}>Attempt Date/Time</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Completed Date</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p, index) => (
              <tr key={p.id || index} style={{ textAlign: "center" }}>
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>{p.name}</td>
                <td style={tdStyle}>{p.attempts}</td>
                <td style={tdStyle}>{p.attemptNumber}</td>
                <td style={tdStyle}>{p.seconds}</td>
                <td style={tdStyle}>
                  {p.attemptDateTime
                    ? new Date(p.attemptDateTime).toLocaleString()
                    : ""}
                </td>
                <td style={tdStyle}>{p.status}</td>
                <td style={tdStyle}>
                  {p.completedDate
                    ? new Date(p.completedDate).toLocaleDateString()
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  fontWeight: "bold",
};

const tdStyle = {
  padding: "8px",
  border: "1px solid #ccc",
};

export default LeaderboardPage;
