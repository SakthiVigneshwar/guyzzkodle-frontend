import React, { useState, useEffect } from "react";
import Confetti from "./Confetti";

const baseURL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://guyzkodlebackend-production.up.railway.app"; // ✅ backend base

// ✅ fuzzy string match (same as before)
function isSimilar(a, b) {
  a = a.trim().toLowerCase();
  b = b.trim().toLowerCase();
  if (!a || !b) return false;

  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  const distance = dp[a.length][b.length];
  const similarity = 1 - distance / Math.max(a.length, b.length);
  return similarity >= 0.5;
}

// ✅ detect slot (morning / afternoon)
function getSlot() {
  const hour = new Date().getHours();
  return hour < 12 ? "morning" : "afternoon";
}

function getISTDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 3600000);
  return ist.toISOString().split("T")[0];
}

function ClueGame() {
  const [participant, setParticipant] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [clues, setClues] = useState([]);
  const [answer, setAnswer] = useState("");
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [popup, setPopup] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [showHowTo, setShowHowTo] = useState(false);
  const [loading, setLoading] = useState(false);

  const slot = getSlot();
  const date = getISTDate();

  // 🔹 Fetch Clues properly
  useEffect(() => {
    fetch(`${baseURL}/clues?date=${date}`)
      .then((res) => {
        if (!res.ok) throw new Error("No clues found");
        return res.json();
      })
      .then((data) => {
        const slotData = data[slot];
        if (slotData) {
          setClues(slotData.clues || []);
          setAnswer(slotData.answer || "");
        } else {
          alert(`⚠️ No ${slot} clues found for today.`);
        }
      })
      .catch(() => {
        alert(`⚠️ No clues found for today (${slot}). Ask admin to set it.`);
      });
  }, [date, slot]);

  const handleStart = () => {
    if (!participant.trim()) {
      alert("❗ Please enter your name.");
      return;
    }
    if (clues.length === 0) {
      alert("🚫 No clues loaded! Ask admin to set the clues.");
      return;
    }

    setLoading(true);
    fetch(`${baseURL}/participant/check/${participant}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((isValid) => {
        setLoading(false);
        if (isValid === true || isValid?.valid === true) {
          setStartTime(Date.now());
          setSubmitted(true);
        } else {
          alert("❌ Invalid participant name!");
        }
      })
      .catch(() => {
        setLoading(false);
        alert("⚠️ Server error. Please try again later.");
      });
  };

  const handleGuess = () => {
    const totalTime = Math.floor((Date.now() - startTime) / 1000);

    if (isSimilar(guess, answer)) {
      setTimeTaken(totalTime);
      setCompleted(true);

      fetch(`${baseURL}/participant/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: participant,
          seconds: totalTime,
          status: "WIN",
          date,
          slot,
        }),
      });
    } else {
      fetch(`${baseURL}/participant/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: participant,
          seconds: totalTime,
          status: "LOSS",
          date,
          slot,
        }),
      });

      let count = 3;
      setPopup(`❌ Incorrect! Next clue in ${count}...`);
      const interval = setInterval(() => {
        count--;
        if (count === 0) {
          clearInterval(interval);
          setCurrentClueIndex((prev) => prev + 1);
          setGuess("");
          setPopup("");
        } else {
          setPopup(`❌ Incorrect! Next clue in ${count}...`);
        }
      }, 1000);
    }
  };

  // 🔹 UI (same as before)
  if (!submitted) {
    return (
      <div className="entry">
        <h1>🎬 Guyz Kodle</h1>
        <input
          value={participant}
          onChange={(e) => setParticipant(e.target.value)}
          placeholder="Enter your name"
          disabled={loading}
        />
        <button onClick={handleStart} disabled={loading}>
          {loading ? "Checking..." : "Start"}
        </button>
        <div style={{ marginTop: "20px" }}>
          <button onClick={() => setShowHowTo(!showHowTo)}>
            ❓ How to Play
          </button>
          {showHowTo && (
            <div className="howto-box">
              <p>
                Guess the movie based on clues. Clues change every morning &
                evening (IST). Be fast, your time is recorded ⏱️
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (clues.length === 0) {
    return (
      <div className="game">
        <h2>No clues available 😢</h2>
        <p>
          Please go to the <a href="/admin">admin page</a> and add clues.
        </p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="result">
        <h2 className="success-text">🎉 Congrats {participant}!</h2>
        <p>You guessed the movie correctly!</p>
        <p className="bold-text">⏱️ Time Taken: {timeTaken} seconds</p>
        <Confetti />
      </div>
    );
  }

  if (currentClueIndex >= clues.length) {
    return (
      <div className="result">
        <h2>🙁 Sorry {participant}, you've run out of clues.</h2>
        <p>The correct answer was: {answer}</p>
      </div>
    );
  }

  return (
    <div className="game">
      <h2>Hello {participant} 👋</h2>
      {popup ? (
        <div className="popup-card">
          <p>{popup}</p>
        </div>
      ) : (
        <>
          <p>
            <strong>Clue {currentClueIndex + 1}:</strong>{" "}
            {clues[currentClueIndex]}
          </p>
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess"
          />
          <button onClick={handleGuess}>Submit</button>
        </>
      )}
    </div>
  );
}

export default ClueGame;
