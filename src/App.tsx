import { useState, useRef } from "react";
import "./App.css";

export default function App() {
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [status, setStatus] = useState("");
  const [answer, setAnswer] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [animating, setAnimating] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const diceAudioRef = useRef<HTMLAudioElement | null>(null);
  const goalAudioRef = useRef<HTMLAudioElement | null>(null);

  function entscheide(team1?: string, team2?: string) {
    if (animating) return;

    const firstTeam = team1 ?? option1;
    const secondTeam = team2 ?? option2;

    if (!firstTeam || !secondTeam) {
      alert("Bitte beide Teams eingeben.");
      return;
    }

    setAnimating(true);
    setShowBubble(false);

    diceAudioRef.current?.pause();
    if (diceAudioRef.current) {
      diceAudioRef.current.currentTime = 0;
      diceAudioRef.current.loop = true;
      diceAudioRef.current.play().catch(() => {});
    }

    let dots = 0;

    intervalRef.current = window.setInterval(() => {
      dots = (dots + 1) % 4;
      setStatus("Gatito Kuuuurt" + ".".repeat(dots));
    }, 500);

    const delay = Math.random() * 2 + 4;

    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      diceAudioRef.current?.pause();
      if (diceAudioRef.current) diceAudioRef.current.currentTime = 0;

      const result = Math.random() < 0.5 ? firstTeam : secondTeam;

      goalAudioRef.current?.pause();
      if (goalAudioRef.current) {
        goalAudioRef.current.currentTime = 0;
        goalAudioRef.current.play().catch(() => {});
      }

      setStatus("");
      setAnswer(result);
      setShowBubble(true);
    }, delay * 1000);
  }

  function spielHeute() {
    if (animating) return;

    setOption1("Deutschland");
    setOption2("USA");

    entscheide("Deutschland", "USA");
  }
  function handleBubbleAnimationEnd() {
    setAnimating(false);
  }

  function resetApp() {
    setOption1("");
    setOption2("");
    setStatus("");
    setAnswer("");
    setShowBubble(false);
    setAnimating(false);
    diceAudioRef.current?.pause();
    if (diceAudioRef.current) diceAudioRef.current.currentTime = 0;
    goalAudioRef.current?.pause();
    if (goalAudioRef.current) goalAudioRef.current.currentTime = 0;
  }

  return (
    <div className="app">
      <div className="overlay" />

      <div className="card">
        <h1>⚽ Gatito Kurt</h1>
        <p className="subtitle">Das Orakel der Meisterschaften</p>

        <div className="inputs">
          <input
            type="text"
            placeholder="Team 1"
            value={option1}
            onChange={(e) => setOption1(e.target.value)}
          />

          <input
            type="text"
            placeholder="Team 2"
            value={option2}
            onChange={(e) => setOption2(e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gap: "10px" }}>
          <button onClick={showBubble ? resetApp : () => entscheide()} disabled={animating}>
            {showBubble ? "Nochmal spielen?" : "Alea iacta est"}
          </button>

          <button onClick={spielHeute} disabled={animating}>
            📅 Spiel heute
          </button>
        </div>

        <div className="status">{status}</div>

        <div className="cat-section">
          <img
            className={`cat ${animating ? "cat-animating" : ""}`}
            src="/el-gatito_kuuurt.png"
            alt="Gatito Kurt"
          />

          {showBubble && (
            <div className="bubble" onAnimationEnd={handleBubbleAnimationEnd}>
              <small>⚽ Meisterschafts-Tipp</small>
              <strong>{answer}</strong>
            </div>
          )}
        </div>

        <audio ref={diceAudioRef} src="/sounds/dice.mp3" />
        <audio ref={goalAudioRef} src="/sounds/goal.mp3" />
      </div>
    </div>
  );
}