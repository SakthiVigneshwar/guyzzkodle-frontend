import React, { useState, useEffect } from "react";

const baseURL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://guyzkodlebackend-production.up.railway.app";

function AdminPage() {
  const emptyClues = ["", "", "", "", ""];
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // yyyy-mm-dd
  });
  const [selectedSlot, setSelectedSlot] = useState("morning");
  const [clues, setClues] = useState(emptyClues);
  const [answer, setAnswer] = useState("");
  const [guesserList, setGuesserList] = useState([]);

  // Reset button state
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const fetchCluesFromBackend = async () => {
    try {
      const response = await fetch(
        `${baseURL}/api/clues?date=${selectedDate}&slot=${selectedSlot}`
      );
      if (!response.ok) throw new Error("Failed to fetch clues");
      const data = await response.json();
      setClues(data.clues || emptyClues);
      setAnswer(data.answer || "");
    } catch (err) {
      console.warn("No clues found for this slot. You can add new ones.");
      setClues(emptyClues);
      setAnswer("");
    }
  };

  const saveDataToBackend = async () => {
    if (clues.some((c) => c.trim() === "") || answer.trim() === "") {
      alert("❗ Please fill all 5 clues and the answer.");
      return;
    }

    const payload = {
      date: selectedDate,
      slot: selectedSlot,
      clues,
      answer,
    };

    try {
      const res = await fetch(`${baseURL}/api/clues/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save clues");
      alert(`✅ Clues saved for ${selectedDate} (${selectedSlot})`);
    } catch (err) {
      alert("❌ Failed to save clues.");
      console.error(err);
    }
  };

  const handleChange = (index, value) => {
    const updated = [...clues];
    updated[index] = value;
    setClues(updated);
  };

  const handleResetAll = async () => {
    const confirmReset = window.confirm(
      "⚠️ Are you sure you want to reset attempts/seconds/status for ALL participants?"
    );
    if (!confirmReset) return;

    try {
      setResetLoading(true);
      setResetMessage("");
      const res = await fetch(`${baseURL}/api/participant/reset`, {
        method: "POST",
      });
      const text = await res.text();
      setResetLoading(false);
      if (res.ok) {
        setResetMessage(text || "✅ All participants reset successfully.");
      } else {
        setResetMessage(text || "❌ Reset failed. Check server logs.");
      }
    } catch (err) {
      setResetLoading(false);
      setResetMessage("❌ Reset request failed. Please try again.");
      console.error("Reset error:", err);
    }

    // Auto-clear message after 4s
    setTimeout(() => setResetMessage(""), 4000);
  };

  useEffect(() => {
    fetchCluesFromBackend();

    // Load participant data (still from localStorage)
    const guessers =
      JSON.parse(localStorage.getItem(`movieGuessers_${selectedDate}`)) || [];
    setGuesserList(guessers);
  }, [selectedDate, selectedSlot]);

  return (
    <div className="admin-container">
      <h2 className="admin-heading">🔐 Admin Panel - Movie Clues Setup</h2>

      <div className="config-section">
        <label>
          📅 Select Date:
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>

        <label>
          ⏰ Time Slot:
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
          >
            <option value="morning">00:00 – 11:59 AM</option>
            <option value="evening">12:00 PM – 11:59 PM</option>
          </select>
        </label>
      </div>

      <div className="clue-section">
        <h3>
          📝 Clues for {selectedDate} ({selectedSlot})
        </h3>
        {clues.map((clue, index) => (
          <input
            key={`clue-${index}`}
            placeholder={`Clue ${index + 1}`}
            value={clue}
            onChange={(e) => handleChange(index, e.target.value)}
          />
        ))}
        <input
          placeholder="Enter Movie Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <button onClick={saveDataToBackend}>💾 Save Clues</button>
      </div>

      {/* Reset all participants section */}
      <div style={{ marginTop: 20 }}>
        <button
          onClick={handleResetAll}
          disabled={resetLoading}
          style={{
            backgroundColor: "#e74c3c",
            color: "white",
            padding: "8px 12px",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {resetLoading ? "Resetting..." : "🔄 Reset All Participants"}
        </button>
        {resetMessage && (
          <span style={{ marginLeft: 10, fontWeight: "bold" }}>
            {resetMessage}
          </span>
        )}
      </div>

      {guesserList.length > 0 && (
        <div className="guesser-table">
          <h4>🧑‍🎓 Today's Participants ({selectedDate}):</h4>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Time Taken (s)</th>
              </tr>
            </thead>
            <tbody>
              {guesserList.map((g, i) => (
                <tr key={i}>
                  <td>{g.name}</td>
                  <td>{g.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
