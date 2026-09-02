import { useRef, useState } from "react";
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
  const ohhAudioRef = useRef<HTMLAudioElement | null>(null);

  function entscheide(team1?: string, team2?: string) {
    if (animating) return;

    const firstTeam = team1 ?? option1;
    const secondTeam = team2 ?? option2;

    if (!firstTeam || !secondTeam) {
      alert("Bitte beide Optionen eingeben.");
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

      const randomValue = Math.random();
      const result = randomValue < 0.5 ? firstTeam : secondTeam;

      goalAudioRef.current?.pause();
      if (goalAudioRef.current) goalAudioRef.current.currentTime = 0;
      ohhAudioRef.current?.pause();
      if (ohhAudioRef.current) ohhAudioRef.current.currentTime = 0;

      goalAudioRef.current?.play().catch(() => {});

      setStatus("");
      setAnswer(result);
      setShowBubble(true);
    }, delay * 1000);
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
    ohhAudioRef.current?.pause();
    if (ohhAudioRef.current) ohhAudioRef.current.currentTime = 0;
  }

  return (
    <div className="app">
      <div className="overlay" />

      <div className="card">
        <h1> Gatito Kurt</h1>
        <p className="subtitle">Das Orakel der Entscheidungen</p>
        <p className="section-title">Gib deine Optionen</p>

        <div className="inputs">
          <input
            className="option-control"
            type="text"
            placeholder="Option 1 z.B. Pizza"
            value={option1}
            onChange={(e) => setOption1(e.target.value)}
          />

          <input
            className="option-control"
            type="text"
            placeholder="Option 2 z.B. Sushi"
            value={option2}
            onChange={(e) => setOption2(e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gap: "10px" }}>
          <button
            className="option-control option-control-button"
            onClick={showBubble ? resetApp : () => entscheide()}
            disabled={animating}
          >
            {showBubble ? "Nochmal spielen?" : "Los entscheiden lassen"}
          </button>
        </div>

        <p className="section-title section-title-matches">Heute Spielperiode ist beendet </p>
        <p className="matches-disabled">Danke fürs Mitmachen. Nutze die manuellen Eingaben.</p>

        <div className="status">{status}</div>

        <div className="cat-section">
          <img
            className={`cat ${animating ? "cat-animating" : ""}`}
            src="/el-gatito_kuuurt.png"
            alt="Gatito Kurt"
          />

          {showBubble && (
            <div className="bubble" onAnimationEnd={handleBubbleAnimationEnd}>
              <small> Alea iacta est </small>
              <strong>{answer}</strong>
            </div>
          )}
        </div>

        <audio ref={diceAudioRef} src="/sounds/dice.mp" />
        <audio ref={goalAudioRef} src="/sounds/goal.mp" />
        <audio ref={ohhAudioRef} src="/sounds/ohh.mp" />
      </div>
    </div>
  );
}