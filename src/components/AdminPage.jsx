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

  // 🔹 Fetch Clues from Backend
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
      console.warn("⚠️ No clues found for this slot.");
      setClues(emptyClues);
      setAnswer("");
    }
  };

  // 🔹 Save Clues to Backend
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

  // 🔹 Fetch Guessers from Backend
  const fetchGuessersFromBackend = async () => {
    try {
      const response = await fetch(
        `${baseURL}/api/participants?date=${selectedDate}&slot=${selectedSlot}`
      );
      if (!response.ok) throw new Error("Failed to fetch participants");
      const data = await response.json();
      setGuesserList(data || []);
    } catch (err) {
      console.warn("⚠️ No participants found for this slot.");
      setGuesserList([]);
    }
  };

  // 🔹 Handle Clue Input Change
  const handleChange = (index, value) => {
    const updated = [...clues];
    updated[index] = value;
    setClues(updated);
  };

  // 🔹 Fetch when date/slot changes
  useEffect(() => {
    fetchCluesFromBackend();
    fetchGuessersFromBackend();
  }, [selectedDate, selectedSlot]);

  return (
    <div className="admin-container">
      <h2 className="admin-heading">🔐 Admin Panel - Movie Clues Setup</h2>

      {/* Config Section */}
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

      {/* Clues Section */}
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

      {/* Participants Table */}
      {guesserList.length > 0 && (
        <div className="guesser-table">
          <h4>
            🧑‍🎓 Participants for {selectedDate} ({selectedSlot}) :
          </h4>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Time Taken (s)</th>
                <th>Status</th>
                <th>Total Attempts</th>
                <th>Current Attempt</th>
              </tr>
            </thead>
            <tbody>
              {guesserList.map((g, i) => (
                <tr key={i}>
                  <td>{g.name}</td>
                  <td>{g.seconds}</td>
                  <td>{g.status}</td>
                  <td>{g.totalAttempts}</td>
                  <td>{g.currentAttempt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {guesserList.length === 0 && (
        <p className="no-data">⚠️ No participants yet for this slot.</p>
      )}
    </div>
  );
}

export default AdminPage;
