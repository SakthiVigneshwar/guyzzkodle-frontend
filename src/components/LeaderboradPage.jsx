import React, { useEffect, useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function LeaderboardPage() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // yyyy-mm-dd
  });
  const [slot, setSlot] = useState("AM");

  useEffect(() => {
    if (!selectedDate || !slot) return;

    setLoading(true);
    fetch(
      `${API_BASE_URL}/api/participant/filter?date=${selectedDate}&slot=${slot}`
    )
      .then((res) => res.json())
      .then((data) => {
        // Sorting by seconds ascending (fastest first)
        const sorted = data.sort((a, b) => a.seconds - b.seconds);
        setParticipants(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch participants", err);
        setLoading(false);
      });
  }, [selectedDate, slot]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>🏆 Guyzz kodle Leaderboard</h1>

      {/* Filters */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <select
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
          style={{ padding: "5px" }}
        >
          <option value="AM">AM Slot (00:00–11:59)</option>
          <option value="PM">PM Slot (12:00–23:59)</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : participants.length === 0 ? (
        <p>No participants yet!</p>
      ) : (
        <div style={{ overflowX: "auto", padding: "10px" }}>
          <table
            style={{
              width: "100%",
              maxWidth: "600px",
              margin: "0 auto",
              borderCollapse: "collapse",
              fontSize: "16px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#222",
                  color: "white",
                  textAlign: "center",
                }}
              >
                <th>#</th>
                <th>Name</th>
                <th>Time Taken (s)</th>
                <th>Attempts</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p, index) => (
                <tr
                  key={p.id || index}
                  style={{
                    textAlign: "center",
                    borderBottom: "1px solid #ccc",
                  }}
                >
                  <td>{index + 1}</td>
                  <td>{p.name}</td>
                  <td>{p.seconds}</td>
                  <td>{p.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Responsive table styles */}
      <style>
        {`
          @media (max-width: 600px) {
            table, thead, tbody, th, td, tr {
              display: block;
              width: 100%;
            }
            thead { display: none; }
            tr {
              margin-bottom: 15px;
              background: #111;
              border: 1px solid #444;
              border-radius: 8px;
              padding: 10px;
            }
            td {
              text-align: left;
              padding-left: 50%;
              position: relative;
              padding-top: 10px;
              padding-bottom: 10px;
              color: #fff;
            }
            td::before {
              position: absolute;
              top: 10px;
              left: 10px;
              width: 45%;
              white-space: nowrap;
              font-weight: bold;
              color: #aaa;
            }
            td:nth-of-type(1)::before { content: "#"; }
            td:nth-of-type(2)::before { content: "Name"; }
            td:nth-of-type(3)::before { content: "Time Taken (s)"; }
            td:nth-of-type(4)::before { content: "Attempts"; }
          }
        `}
      </style>
    </div>
  );
}

export default LeaderboardPage;
