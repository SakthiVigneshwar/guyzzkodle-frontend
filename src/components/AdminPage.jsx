import React, { useState, useEffect } from "react";

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

  const getStorageKey = () => `movieClues_${selectedDate}_${selectedSlot}`;

  useEffect(() => {
    const key = getStorageKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      setClues(parsed.clues || emptyClues);
      setAnswer(parsed.answer || "");
    } else {
      setClues(emptyClues);
      setAnswer("");
    }

    const guessers =
      JSON.parse(localStorage.getItem(`movieGuessers_${selectedDate}`)) || [];
    setGuesserList(guessers);
  }, [selectedDate, selectedSlot]);

  const handleChange = (index, value) => {
    const updated = [...clues];
    updated[index] = value;
    setClues(updated);
  };

  const saveData = () => {
    if (clues.some((c) => c.trim() === "") || answer.trim() === "") {
      alert("❗ Please fill all 5 clues and the answer.");
      return;
    }
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify({ clues, answer }));
    alert("✅ Clues saved for " + selectedDate + " (" + selectedSlot + ")");
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
