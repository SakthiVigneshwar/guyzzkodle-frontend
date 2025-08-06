import React, { useEffect } from "react";
import "./confetti.css";

const emojis = ["🥳", "🎉", "😄", "🎊", "😁"];

const Confetti = () => {
  useEffect(() => {
    const container = document.createElement("div");
    container.className = "confetti-container";
    document.body.appendChild(container);

    const interval = setInterval(() => {
      const confetti = document.createElement("div");
      confetti.className = "confetti-emoji";
      confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDuration = `${Math.random() * 2 + 2}s`;
      container.appendChild(confetti);

      setTimeout(() => confetti.remove(), 3000);
    }, 50);

    return () => {
      clearInterval(interval);
      container.remove();
    };
  }, []);

  return null;
};

export default Confetti;
