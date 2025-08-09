import React, { useEffect, useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function LeaderboardPage() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/participant/all`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        return res.json();
      })
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
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>🏆 Guyzz Kodle Leaderboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : participants.length === 0 ? (
        <p>No participants yet!</p>
      ) : (
        <div style={{ overflowX: "auto", padding: "10px" }}>
          <table
            style={{
              width: "100%",
              maxWidth: "900px",
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
                <th>Completed Date</th>
                <th>Attempt Time</th>
                <th>Seconds</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p, index) =>
                p.attempts.map((attempt, aIndex) => (
                  <tr
                    key={`${p._id}-${aIndex}`}
                    style={{
                      textAlign: "center",
                      borderBottom: "1px solid #ccc",
                    }}
                  >
                    {aIndex === 0 && (
                      <>
                        <td rowSpan={p.attempts.length}>{index + 1}</td>
                        <td rowSpan={p.attempts.length}>{p.name}</td>
                        <td rowSpan={p.attempts.length}>{p.completedDate}</td>
                      </>
                    )}
                    <td>
                      {new Date(attempt.attemptDateTime).toLocaleString()}
                    </td>
                    <td>{attempt.seconds}</td>
                    <td
                      style={{
                        color:
                          attempt.status === "WIN" ? "limegreen" : "crimson",
                        fontWeight: "bold",
                      }}
                    >
                      {attempt.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile responsive styles */}
      <style>
        {`
          @media (max-width: 600px) {
            table, thead, tbody, th, td, tr {
              display: block;
              width: 100%;
            }

            thead {
              display: none;
            }

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

            td:nth-of-type(1)::before { content: "Rank"; }
            td:nth-of-type(2)::before { content: "Name"; }
            td:nth-of-type(3)::before { content: "Completed Date"; }
            td:nth-of-type(4)::before { content: "Attempt Time"; }
            td:nth-of-type(5)::before { content: "Seconds"; }
            td:nth-of-type(6)::before { content: "Status"; }
          }
        `}
      </style>
    </div>
  );
}

export default LeaderboardPage;
