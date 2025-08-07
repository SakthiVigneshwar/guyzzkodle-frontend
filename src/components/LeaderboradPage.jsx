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
    <div className="leaderboard">
      <h1>🏆 Guzz kodle Leaderboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : participants.length === 0 ? (
        <p>No participants yet!</p>
      ) : (
        <table
          border="1"
          style={{
            width: "60%",
            margin: "auto",
            marginTop: "20px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#222", color: "white" }}>
              <th>#</th>
              <th>Name</th>
              <th>Time Taken (s)</th>
              <th>Attempts</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p, index) => (
              <tr key={p.id || index} style={{ textAlign: "center" }}>
                <td>{index + 1}</td>
                <td>{p.name}</td>
                <td>{p.seconds}</td>
                <td>{p.attempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LeaderboardPage;
