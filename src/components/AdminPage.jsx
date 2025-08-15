import React, { useState, useEffect } from "react";

const baseURL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://guyzkodlebackend-production.up.railway.app";

function AdminPage() {
  const emptyClues = ["", "", "", "", ""];
  const [selectedDate, setSelectedDate] = useState(() => {
    const storedDate = localStorage.getItem("selectedDate");
    return storedDate || new Date().toISOString().split("T")[0];
  });

  const [morningClues, setMorningClues] = useState([...emptyClues]);
  const [afternoonClues, setAfternoonClues] = useState([...emptyClues]);
  const [morningAnswer, setMorningAnswer] = useState("");
  const [afternoonAnswer, setAfternoonAnswer] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    fetch(`${baseURL}/clues?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.morning) {
          setMorningClues(data.morning.clues || [...emptyClues]);
          setMorningAnswer(data.morning.answer || "");
        } else {
          setMorningClues([...emptyClues]);
          setMorningAnswer("");
        }
        if (data.afternoon) {
          setAfternoonClues(data.afternoon.clues || [...emptyClues]);
          setAfternoonAnswer(data.afternoon.answer || "");
        } else {
          setAfternoonClues([...emptyClues]);
          setAfternoonAnswer("");
        }
      })
      .catch((err) => console.error("Error fetching clues:", err));
  }, [selectedDate]);

  const handleSave = () => {
    // ✅ Always send local date from localStorage or today's date
    const localDate =
      localStorage.getItem("selectedDate") ||
      new Date().toISOString().split("T")[0];

    const payload = {
      date: localDate,
      morning: {
        clues: morningClues,
        answer: morningAnswer,
      },
      afternoon: {
        clues: afternoonClues,
        answer: afternoonAnswer,
      },
    };

    fetch(`${baseURL}/clues/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.text())
      .then((message) => {
        setSaveMessage(message);
        setTimeout(() => setSaveMessage(""), 2000);
      })
      .catch((err) => console.error("Error saving clues:", err));
  };

  const updateClue = (timeSlot, index, value) => {
    if (timeSlot === "morning") {
      const updated = [...morningClues];
      updated[index] = value;
      setMorningClues(updated);
    } else {
      const updated = [...afternoonClues];
      updated[index] = value;
      setAfternoonClues(updated);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Page</h1>

      <label>
        Select Date:{" "}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            localStorage.setItem("selectedDate", e.target.value);
          }}
        />
      </label>

      <div style={{ display: "flex", gap: 50, marginTop: 20 }}>
        {/* Morning slot */}
        <div>
          <h2>00:00 AM - 11:59 AM</h2>
          {morningClues.map((clue, idx) => (
            <div key={idx}>
              <input
                type="text"
                placeholder={`Clue ${idx + 1}`}
                value={clue}
                onChange={(e) => updateClue("morning", idx, e.target.value)}
              />
            </div>
          ))}
          <input
            type="text"
            placeholder="Answer"
            value={morningAnswer}
            onChange={(e) => setMorningAnswer(e.target.value)}
            style={{ marginTop: 10 }}
          />
        </div>

        {/* Afternoon slot */}
        <div>
          <h2>12:00 PM - 11:59 PM</h2>
          {afternoonClues.map((clue, idx) => (
            <div key={idx}>
              <input
                type="text"
                placeholder={`Clue ${idx + 1}`}
                value={clue}
                onChange={(e) => updateClue("afternoon", idx, e.target.value)}
              />
            </div>
          ))}
          <input
            type="text"
            placeholder="Answer"
            value={afternoonAnswer}
            onChange={(e) => setAfternoonAnswer(e.target.value)}
            style={{ marginTop: 10 }}
          />
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: 20 }}>
        <button onClick={handleSave}>💾 Save Clues</button>
        {saveMessage && <span style={{ marginLeft: 10 }}>{saveMessage}</span>}
      </div>
    </div>
  );
}

export default AdminPage;
