import React, { useEffect, useRef, useState } from "react";
import CircularMala from "./CircularMala";

function App() {
  const [rounds, setRounds] = useState(1);
  const [totalChants, setTotalChants] = useState(0);
  const [currentChant, setCurrentChant] = useState(0);
  const [status, setStatus] = useState("idle"); // idle, chanting, done
  const [rate, setRate] = useState(1);
  const [gapMs, setGapMs] = useState(600);
  const cancelRef = useRef(false);
  const voiceRef = useRef(null);
  const audioRef = useRef(null);

  const BEADS_PER_ROUND = 128;

  const mantra =
    "Hare Krishna Hare Krishna Krishna Krishna Hare Hare, Hare Ram Hare Ram Ram Ram Hare Hare.";

  useEffect(() => {
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer Indian English if present, else any English, else first.
      const preferred =
        voices.find(v => v.lang?.toLowerCase().includes("en-in")) ||
        voices.find(v => v.lang?.toLowerCase().startsWith("en-")) ||
        voices[0];
      voiceRef.current = preferred || null;
    };

    pickVoice();
    if (typeof window !== "undefined") {
      window.speechSynthesis.onvoiceschanged = pickVoice;
    }
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      cancelRef.current = true;
    };
  }, []);

  const speakOnce = () =>
    new Promise((resolve, reject) => {
      const u = new SpeechSynthesisUtterance(mantra);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.lang = voiceRef.current?.lang || "en-IN";
      u.rate = rate;
      u.pitch = 0.1;
      u.volume = 0.2;  // gentle volume
      u.onend = () => resolve();
      u.onerror = (e) => reject(e.error || e);
      window.speechSynthesis.speak(u);
    });

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const startChanting = async () => {
    const total = Math.max(1, Number(rounds)) * BEADS_PER_ROUND;
    setTotalChants(total);
    setCurrentChant(0);
    setStatus("chanting");
    cancelRef.current = false;

    // Play devotional background audio
    if (audioRef.current && audioRef.current.readyState >= 2) {
  audioRef.current.play().catch(err => console.error("Playback error:", err));
    }
  

    try {
      for (let i = 0; i < total; i++) {
        if (cancelRef.current) break;
        await speakOnce();
        setCurrentChant((prev) => prev + 1);
        if (i < total - 1 && gapMs > 0) await sleep(gapMs);
      }
      if (!cancelRef.current) setStatus("done");
      if (audioRef.current) audioRef.current.pause();
    } catch {
      if (!cancelRef.current) setStatus("idle");
      if (audioRef.current) audioRef.current.pause();
    }
  };

  const stopChanting = () => {
    cancelRef.current = true;
    window.speechSynthesis.cancel();
    setStatus("idle");
    if (audioRef.current) audioRef.current.pause();
  };

  const reset = () => {
    stopChanting();
    setCurrentChant(0);
    setTotalChants(0);
    setStatus("idle");
  };

  const currentBeadIndex = totalChants > 0 ? currentChant % BEADS_PER_ROUND : 0;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, textAlign: "center", fontFamily: "system-ui, serif" }}>
      <h1>🕉️ Hare Krishna Japa App</h1>

      {status === "idle" && (
        <div>
          <label>Rounds: </label>
          <input
            type="number"
            min="1"
            value={rounds}
            onChange={(e) => setRounds(e.target.value)}
            style={{ width: 90, padding: 6 }}
          />
          <button onClick={startChanting} style={{ marginLeft: 12, padding: "8px 16px" }}>Start Chanting</button>
        </div>
      )}

      {status === "chanting" && (
        <>
          <h2 style={{ lineHeight: 1.5 }}>
            Hare Krishna Hare Krishna Krishna Krishna Hare<br />
            Hare Ram Hare Ram Ram Ram Hare Hare.
          </h2>
          <h3>Chant {currentChant} / {totalChants}</h3>

          <CircularMala totalBeads={BEADS_PER_ROUND} currentBeadIndex={currentBeadIndex} size={320} />

          <button onClick={stopChanting} style={{ marginTop: 20, padding: "8px 16px" }}>Stop</button>
        </>
      )}

      {status === "done" && (
        <div style={{ marginTop: 16 }}>
          <h2>🎉 Haribol! You completed {rounds} round{Number(rounds) > 1 ? "s" : ""}! 🙌</h2>
          <button onClick={reset} style={{ marginTop: 8, padding: "8px 16px" }}>Start Again</button>
        </div>
      )}

      {/* Background audio */}
      <audio ref={audioRef} loop src="./background-music.mp3" preload="auto" />
    </div>
  );
}

export default App;
