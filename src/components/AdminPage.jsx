import React, { useState, useEffect } from "react";

// ✅ Change this to match your deployment (Railway backend)
const API_BASE_URL = "https://guyzkodlebackend-production.up.railway.app";

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

  useEffect(() => {
    fetchClues();
    const guessers =
      JSON.parse(localStorage.getItem(`movieGuessers_${selectedDate}`)) || [];
    setGuesserList(guessers);
  }, [selectedDate, selectedSlot]);

  const fetchClues = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/clues/by-date-slot?date=${selectedDate}&slot=${selectedSlot}`
      );
      if (res.ok) {
        const data = await res.json();
        setClues(data.clues || emptyClues);
        setAnswer(data.answer || "");
      } else {
        setClues(emptyClues);
        setAnswer("");
      }
    } catch (err) {
      console.error("Error fetching clues:", err);
      setClues(emptyClues);
      setAnswer("");
    }
  };

  const handleChange = (index, value) => {
    const updated = [...clues];
    updated[index] = value;
    setClues(updated);
  };

  const saveData = async () => {
    if (clues.some((c) => c.trim() === "") || answer.trim() === "") {
      alert("❗ Please fill all 5 clues and the answer.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/clues/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
          slot: selectedSlot, // morning or evening
          clues,
          answer,
        }),
      });

      if (response.ok) {
        alert(`✅ Clues saved for ${selectedDate} (${selectedSlot})`);
      } else {
        alert("❌ Failed to save clues. Check backend logs.");
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("🚫 Error connecting to backend.");
    }
  };

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
        <button onClick={saveData}>💾 Save Clues</button>
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
