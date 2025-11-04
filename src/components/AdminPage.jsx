import React, { useState, useEffect } from "react";

// ✅ Add /api suffix to match your Spring Boot controller routes
const baseURL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://guyzkodlebackend-production.up.railway.app/api";

function AdminPage() {
  const emptyClues = ["", "", "", "", ""];

  const [selectedDate, setSelectedDate] = useState(() => {
    const stored = localStorage.getItem("selectedDate");
    return stored || new Date().toISOString().split("T")[0];
  });

  const [morningClues, setMorningClues] = useState([...emptyClues]);
  const [afternoonClues, setAfternoonClues] = useState([...emptyClues]);
  const [morningAnswer, setMorningAnswer] = useState("");
  const [afternoonAnswer, setAfternoonAnswer] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const fetchClues = async () => {
      try {
        const res = await fetch(`${baseURL}/clues?date=${selectedDate}`);

        if (!res.ok) {
          console.error(`HTTP ${res.status} while fetching clues`);
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log("Fetched data:", data);

        setMorningClues(data.morning?.clues || [...emptyClues]);
        setMorningAnswer(data.morning?.answer || "");
        setAfternoonClues(data.afternoon?.clues || [...emptyClues]);
        setAfternoonAnswer(data.afternoon?.answer || "");
      } catch (err) {
        console.error("Error fetching clues:", err);
        setMorningClues([...emptyClues]);
        setAfternoonClues([...emptyClues]);
        setMorningAnswer("");
        setAfternoonAnswer("");
      }
    };

    fetchClues();
  }, [selectedDate]);

  const handleSave = async () => {
    try {
      const payload = {
        date: selectedDate,
        morning: { clues: morningClues, answer: morningAnswer },
        afternoon: { clues: afternoonClues, answer: afternoonAnswer },
      };

      const res = await fetch(`${baseURL}/clues/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const message = await res.text();
      setSaveMessage(message || "Clues saved successfully!");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch (err) {
      console.error("Error saving clues:", err);
      setSaveMessage("Failed to save!");
    }
  };

  const updateClue = (slot, index, value) => {
    const setter = slot === "morning" ? setMorningClues : setAfternoonClues;
    const current =
      slot === "morning" ? [...morningClues] : [...afternoonClues];
    current[index] = value;
    setter(current);
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
        {/* Morning Slot */}
        <div>
          <h2>00:00 AM - 11:59 AM</h2>
          {morningClues.map((clue, i) => (
            <div key={i}>
              <input
                type="text"
                placeholder={`Clue ${i + 1}`}
                value={clue}
                onChange={(e) => updateClue("morning", i, e.target.value)}
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

        {/* Afternoon Slot */}
        <div>
          <h2>12:00 PM - 11:59 PM</h2>
          {afternoonClues.map((clue, i) => (
            <div key={i}>
              <input
                type="text"
                placeholder={`Clue ${i + 1}`}
                value={clue}
                onChange={(e) => updateClue("afternoon", i, e.target.value)}
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
        {saveMessage && (
          <span style={{ marginLeft: 10, color: "green" }}>{saveMessage}</span>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
