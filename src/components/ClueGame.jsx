// src/components/ClueGame.jsx
import React, { useState, useEffect, useRef } from "react";
import Confetti from "./Confetti";

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

/* fuzzy similarity check */
function isSimilar(a, b) {
  a = a.trim().toLowerCase();
  b = b.trim().toLowerCase();
  if (!a || !b) return a === b;

  const lenA = a.length,
    lenB = b.length;
  const dp = Array.from({ length: lenA + 1 }, () => Array(lenB + 1).fill(0));

  for (let i = 0; i <= lenA; i++) dp[i][0] = i;
  for (let j = 0; j <= lenB; j++) dp[0][j] = j;

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]);
      }
    }
  }

  const distance = dp[lenA][lenB];
  const similarity = 1 - distance / Math.max(lenA, lenB);
  return similarity >= 0.6; // stricter for fewer false positives
}

/* morning / evening slot helper */
function getSlot() {
  const hour = new Date().getHours();
  return hour < 12 ? "morning" : "evening";
}

export default function ClueGame() {
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
  const [attempts, setAttempts] = useState(0);
  const [lastSubmittedAttempt, setLastSubmittedAttempt] = useState(0);

  const popupTimer = useRef(null);
  const slot = getSlot();
  const date = new Date().toISOString().split("T")[0];

  /* Fetch clues */
  useEffect(() => {
    const abortCtrl = new AbortController();
    setLoading(true);

    fetch(`${baseURL}/api/clues?date=${date}&slot=${slot}`, {
      signal: abortCtrl.signal,
    })
      .then((res) => {
        setLoading(false);
        if (!res.ok) throw new Error("No clues found");
        return res.json();
      })
      .then((data) => {
        setClues(data.clues || []);
        setAnswer(data.answer || "");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.warn("Clues fetch:", err.message);
          alert(`⚠️ No clues found for today (${slot}). Ask admin to set it.`);
          setClues([]);
          setAnswer("");
        }
      });

    const midnightRefresh = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        window.location.reload();
      }
    }, 60_000);

    return () => {
      abortCtrl.abort();
      clearInterval(midnightRefresh);
    };
  }, [date, slot]);

  /* Start */
  const handleStart = () => {
    if (!participant.trim()) {
      alert("Enter your name to start.");
      return;
    }
    if (clues.length < 1) {
      alert("🚫 No clues loaded! Ask admin to set them.");
      return;
    }

    setLoading(true);
    fetch(`${baseURL}/api/participant/check/${encodeURIComponent(participant)}`)
      .then((res) => {
        setLoading(false);
        if (!res.ok) throw new Error("invalid");
        return res.json();
      })
      .then((isValid) => {
        if (isValid === true || isValid?.valid === true) {
          setStartTime(Date.now());
          setSubmitted(true);
          setAttempts(0);
          setLastSubmittedAttempt(0);
        } else {
          alert("❌ Invalid participant name!");
        }
      })
      .catch(() => {
        setLoading(false);
        alert("⚠️ Server error or CORS issue. Please try again later.");
      });
  };

  /* Submit attempt */
  const submitAttempt = async (payload) => {
    try {
      const resp = await fetch(`${baseURL}/api/participant/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        setLastSubmittedAttempt(payload.attempts);
      } else {
        console.error("Submit failed", resp.status);
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  /* Guess */
  const handleGuess = () => {
    if (!startTime) {
      alert("Start the game first.");
      return;
    }

    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const attemptDateTimeIso = new Date().toISOString();
    const correct = isSimilar(guess, answer);

    if (correct) {
      setTimeTaken(totalTime);
      localStorage.setItem("completionTime", totalTime.toString());
      setCompleted(true);

      submitAttempt({
        name: participant,
        seconds: totalTime,
        status: "WIN",
        attempts: newAttempts,
        attemptDateTime: attemptDateTimeIso,
        completedDate: date,
      });
    } else {
      submitAttempt({
        name: participant,
        seconds: totalTime,
        status: "LOSS",
        attempts: newAttempts,
        attemptDateTime: attemptDateTimeIso,
        completedDate: null,
      });

      clearTimeout(popupTimer.current);
      let count = 3;
      setPopup(`❌ Incorrect! Next clue in ${count}...`);
      popupTimer.current = setInterval(() => {
        count--;
        if (count === 0) {
          clearInterval(popupTimer.current);
          setCurrentClueIndex((prev) => prev + 1);
          setGuess("");
          setPopup("");
        } else {
          setPopup(`❌ Incorrect! Next clue in ${count}...`);
        }
      }, 1000);
    }
  };

  /* Out of clues LOSS */
  useEffect(() => {
    if (!submitted || completed || clues.length === 0) return;
    if (currentClueIndex >= clues.length && lastSubmittedAttempt < attempts) {
      const totalTime = startTime
        ? Math.floor((Date.now() - startTime) / 1000)
        : 0;

      submitAttempt({
        name: participant,
        seconds: totalTime,
        status: "LOSS",
        attempts,
        attemptDateTime: new Date().toISOString(),
        completedDate: null,
      });
    }
  }, [
    currentClueIndex,
    clues,
    submitted,
    completed,
    attempts,
    lastSubmittedAttempt,
    startTime,
    participant,
  ]);

  /* UI */
  if (!submitted) {
    return (
      <div className="entry">
        <h1>🎬 Guyzz Kodle</h1>
        <input
          value={participant}
          onChange={(e) => setParticipant(e.target.value)}
          placeholder="Enter your name"
          disabled={loading}
        />
        <button onClick={handleStart} disabled={loading}>
          {loading ? "Checking..." : "Start"}
        </button>

        <div style={{ marginTop: 20 }}>
          <button onClick={() => setShowHowTo(!showHowTo)}>
            ❓ How to Play
          </button>
          {showHowTo && (
            <div
              style={{
                marginTop: 10,
                padding: 12,
                backgroundColor: "#222",
                color: "#fff",
                borderRadius: 6,
              }}
            >
              <p style={{ margin: 0 }}>
                Enter your name, press Start, and guess the movie from the
                clues.
              </p>
              <small>
                We record each attempt (WIN/LOSS) so leaderboard works.
              </small>
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
          Please go to the <a href="/admin">admin page</a> and add clues for{" "}
          {` ${slot}`}.
        </p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="result" style={{ textAlign: "center", marginTop: 40 }}>
        <h2 style={{ color: "#00b894" }}>🎉 Congrats {participant}!</h2>
        <p>You guessed the movie correctly!</p>
        <p style={{ fontWeight: "bold" }}>⏱️ Time Taken: {timeTaken} seconds</p>
        <Confetti />
      </div>
    );
  }

  if (currentClueIndex >= clues.length) {
    return (
      <div className="result" style={{ textAlign: "center", marginTop: 40 }}>
        <h2>🙁 Sorry {participant}, you've run out of clues.</h2>
        <p>
          The correct answer was: <strong>{answer}</strong>
        </p>
        <p>Your attempts: {attempts}</p>
      </div>
    );
  }

  return (
    <div className="game" style={{ textAlign: "center", padding: 24 }}>
      <h2>Hello {participant} 👋</h2>
      {popup ? (
        <div className="popup-card" style={{ marginTop: 12 }}>
          {popup}
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
            style={{ padding: 10, width: "80%", maxWidth: 360 }}
          />
          <div>
            <button
              onClick={handleGuess}
              style={{ marginTop: 12 }}
              disabled={loading || !guess.trim()}
            >
              Submit
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <small>Attempts so far: {attempts}</small>
          </div>
        </>
      )}
    </div>
  );
}
