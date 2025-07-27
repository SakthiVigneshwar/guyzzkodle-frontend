import React, { useState, useEffect } from "react";

function AdminPage() {
  const emptyClues = ["", "", "", "", ""];
  const [todayClues, setTodayClues] = useState(emptyClues);
  const [todayAnswer, setTodayAnswer] = useState("");
  const [nextClues, setNextClues] = useState(emptyClues);
  const [nextAnswer, setNextAnswer] = useState("");
  const [timeTaken, setTimeTaken] = useState(null);
  const [guesserList, setGuesserList] = useState([]);

  // Get today's date in yyyy-mm-dd
  const getTodayKey = () => new Date().toISOString().split("T")[0];

  useEffect(() => {
    const todayKey = getTodayKey();

    // Load today's clues
    const todayData = JSON.parse(
      localStorage.getItem("movieClues_" + todayKey)
    );
    if (todayData) {
      setTodayClues(todayData.clues || emptyClues);
      setTodayAnswer(todayData.answer || "");
    } else {
      const nextData = JSON.parse(localStorage.getItem("movieClues_next"));
      if (nextData) {
        localStorage.setItem(
          "movieClues_" + todayKey,
          JSON.stringify(nextData)
        );
        setTodayClues(nextData.clues || emptyClues);
        setTodayAnswer(nextData.answer || "");
        localStorage.removeItem("movieClues_next");
      }
    }

    // Load participant time
    const storedTime = localStorage.getItem("completionTime");
    if (storedTime) {
      setTimeTaken(storedTime);
    }

    // Load today's guessers
    const guessers =
      JSON.parse(localStorage.getItem("movieGuessers_" + todayKey)) || [];
    setGuesserList(guessers);

    // Midnight refresh
    const interval = setInterval(() => {
      const nowKey = getTodayKey();
      if (nowKey !== todayKey) {
        // Clear old guessers
        localStorage.removeItem("movieGuessers_" + todayKey);
        window.location.reload();
      }
    }, 60 * 1000); // Every 1 min

    return () => clearInterval(interval);
  }, []);

  const handleChange = (index, value, type) => {
    const updater = type === "today" ? [...todayClues] : [...nextClues];
    updater[index] = value;
    type === "today" ? setTodayClues(updater) : setNextClues(updater);
  };

  const saveData = (type) => {
    const clues = type === "today" ? todayClues : nextClues;
    const answer = type === "today" ? todayAnswer : nextAnswer;

    if (clues.some((c) => c.trim() === "") || answer.trim() === "") {
      alert("Please fill all 5 clues and the answer.");
      return;
    }

    const data = { clues, answer };
    if (type === "today") {
      const todayKey = getTodayKey();
      localStorage.setItem("movieClues_" + todayKey, JSON.stringify(data));
      alert("✅ Today's clues saved!");
    } else {
      localStorage.setItem("movieClues_next", JSON.stringify(data));
      alert("✅ Tomorrow's clues saved!");
    }
  };

  return (
    <div className="admin">
      <h2>🔐 Admin Panel - Movie Clues Setup</h2>

      <div className="clue-section">
        <h3>🎯 Today’s Clues</h3>
        {todayClues.map((clue, index) => (
          <input
            key={"t" + index}
            placeholder={`Clue ${index + 1}`}
            value={clue}
            onChange={(e) => handleChange(index, e.target.value, "today")}
          />
        ))}
        <input
          placeholder="Enter Movie Answer"
          value={todayAnswer}
          onChange={(e) => setTodayAnswer(e.target.value)}
        />
        <button onClick={() => saveData("today")}>💾 Save Today's Clues</button>
      </div>

      <div className="clue-section">
        <h3>⏳ Tomorrow’s Clues (Active at 00:00 AM)</h3>
        {nextClues.map((clue, index) => (
          <input
            key={"n" + index}
            placeholder={`Clue ${index + 1}`}
            value={clue}
            onChange={(e) => handleChange(index, e.target.value, "next")}
          />
        ))}
        <input
          placeholder="Enter Movie Answer"
          value={nextAnswer}
          onChange={(e) => setNextAnswer(e.target.value)}
        />
        <button onClick={() => saveData("next")}>
          💾 Save Tomorrow's Clues
        </button>
      </div>

      {timeTaken && (
        <div className="timing-info">
          <h4>⏱ Last Participant Completion Time:</h4>
          <p>{timeTaken} seconds</p>
        </div>
      )}

      {guesserList.length > 0 && (
        <div className="guesser-table">
          <h4>🧑‍🎓 Today's Participants:</h4>
          <table border="1">
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
