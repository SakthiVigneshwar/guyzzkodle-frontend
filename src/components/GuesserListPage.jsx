import React, { useEffect, useState } from "react";

function GuesserListPage() {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/participant/all") // change if different port
      .then((res) => res.json())
      .then((data) => {
        setParticipants(data);
      })
      .catch((err) => {
        console.error("Failed to fetch participants:", err);
      });
  }, []);

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#fff3f3",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ marginBottom: "30px" }}>📊 Participants & Time Taken</h2>

      {participants.length === 0 ? (
        <p>No participants yet today 😔</p>
      ) : (
        <table
          border="1"
          style={{
            borderCollapse: "collapse",
            width: "90%",
            maxWidth: "500px",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ padding: "12px" }}>👤 Name</th>
              <th style={{ padding: "12px" }}>⏱ Time (sec)</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p, i) => (
              <tr key={i}>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {p.name}
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {p.seconds}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GuesserListPage;
