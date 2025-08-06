import React, { useEffect } from "react";
import "./confetti.css";

const emojis = ["🥳", "🎉", "😄", "🎊", "😁"];

const Confetti = () => {
  useEffect(() => {
    const container = document.createElement("div");
    container.className = "confetti-container";
    document.body.appendChild(container);

    const createConfetti = () => {
      const confetti = document.createElement("div");
      confetti.className = "confetti-emoji";
      confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      // Random position and animation properties
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.fontSize = `${Math.random() * 15 + 20}px`; // 20px to 35px
      confetti.style.animationDuration = `${Math.random() * 2 + 2}s`; // 2s to 4s
      confetti.style.animationDelay = `${Math.random()}s`;

      container.appendChild(confetti);

      // Remove confetti after animation completes
      setTimeout(() => confetti.remove(), 5000);
    };

    const interval = setInterval(createConfetti, 100);

    return () => {
      clearInterval(interval);
      container.remove();
    };
  }, []);

  return null;
};

export default Confetti;
