import { useEffect, useRef, useState } from "react";
import "./App.css";

type Match = {
  date: string;
  time?: string;
  team1: string;
  team2: string;
};

function formatCETDate(dateValue: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dateValue);
}

function formatCETTime(dateValue: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dateValue);
}

function parseMatchToCETDateTime(match: Match): Date | null {
  if (!match.time) return null;

  const timeMatch = match.time.match(/(\d{1,2}):(\d{2})\s+UTC([+-])(\d{1,2})/i);
  if (!timeMatch) return null;

  const [, rawHours, rawMinutes, sign, offsetHours] = timeMatch;
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  const offset = Number(offsetHours);
  const offsetString = `${sign}${String(Math.abs(offset)).padStart(2, "0")}:00`;
  const isoString = `${match.date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00${offsetString}`;
  const parsedDate = new Date(isoString);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export default function App() {
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [status, setStatus] = useState("");
  const [answer, setAnswer] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [animating, setAnimating] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const diceAudioRef = useRef<HTMLAudioElement | null>(null);
  const goalAudioRef = useRef<HTMLAudioElement | null>(null);
  const ohhAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function loadMatches() {
      const response = await fetch("/data/WM.json");
      const data = await response.json();

      const today = formatCETDate(new Date());

      const matches = data.matches.filter((m: Match) => {
        const matchDateTime = parseMatchToCETDateTime(m);
        if (!matchDateTime) return false;
        return formatCETDate(matchDateTime) === today;
      });

      setTodayMatches(matches);
    }

    loadMatches();
  }, []);

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
        <h1>⚽ Gatito Kurt</h1>
        <p className="subtitle">Das Orakel der Meisterschaften</p>
        <p className="section-title">Deine Optionen</p>

        <div className="inputs">
          <input
            className="option-control"
            type="text"
            placeholder="Team 1"
            value={option1}
            onChange={(e) => setOption1(e.target.value)}
          />

          <input
            className="option-control"
            type="text"
            placeholder="Team 2"
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
            {showBubble ? "Nochmal spielen?" : "Alea iacta est"}
          </button>
        </div>

        <p className="section-title section-title-matches">Heute Spiel</p>

        <div className="today-matches">
          {todayMatches.slice(0, 4).map((match, index) => {
            const cetTime = parseMatchToCETDateTime(match);
            const displayTime = cetTime ? `${formatCETTime(cetTime)} CET` : "";

            return (
              <button
                className="today-match-button"
                key={index}
                onClick={() => {
                  setOption1(match.team1);
                  setOption2(match.team2);
                }}
              >
                <span>{match.team1} - {match.team2}</span>
                {displayTime ? <small>{displayTime}</small> : null}
              </button>
            );
          })}
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
        <audio ref={ohhAudioRef} src="/sounds/ohh.mp3" />
      </div>
    </div>
  );
}