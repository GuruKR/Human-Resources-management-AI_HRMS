// AIVideoInterviewLive.jsx
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

export default function AIVideoInterviewLive() {
  const [role, setRole] = useState("Software Engineer");
  const [started, setStarted] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [connected, setConnected] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Connected:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected");
      setConnected(false);
    });

    socket.on("ai_response", async (data) => {
      // 🧠 Stop listening while AI speaks
      stopSpeechRecognition();

      const delayAI = Math.floor(Math.random() * (8000 - 5000 + 1)) + 5000;
      console.log(`🤖 AI will respond in ${delayAI / 1000}s...`);
      setThinking(true);
      await new Promise((resolve) => setTimeout(resolve, delayAI));

      setThinking(false);
      setAiMessage(data.message);

      // 🗣️ Speak AI message aloud
      const utter = new SpeechSynthesisUtterance(data.message);
      utter.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);

      utter.onend = async () => {
        // ✅ Wait 5–8s after AI finishes before listening again
        const delay = Math.floor(Math.random() * (8000 - 5000 + 1)) + 5000;
        console.log(`🎧 Resuming mic in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        startSpeechRecognition();
      };
    });

    return () => socket.disconnect();
  }, []);

  const startLiveInterview = async () => {
    if (!connected) {
      alert("Connecting to AI server...");
      return;
    }
    setStarted(true);
    socketRef.current.emit("start_interview", { role });
    startCamera();
    startSpeechRecognition();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) {
      console.error("🎙️ Camera/Mic error:", err);
      alert("Camera & Mic required for interview.");
    }
  };

  // 🎤 Start listening
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    if (recognitionRef.current) return; // prevent multiple instances

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);
    recognition.onresult = async (event) => {
      const text = event.results[event.results.length - 1][0].transcript.trim();
      console.log("🗣️ You said:", text);
      setTranscript((prev) => [...prev, text]);
      socketRef.current.emit("speech_text", { text });

      // Stop listening while AI responds
      stopSpeechRecognition();
    };
    recognition.onerror = (e) => console.error("🎤 Error:", e.error);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  // 🛑 Stop listening
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setListening(false);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center justify-center gap-2">🎥 Live AI Video Interview</h1>

      {!started ? (
        <div className="flex flex-col items-center space-y-3">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border p-2 rounded mb-3"
          >
            <option>Software Engineer</option>
            <option>Data Analyst</option>
            <option>HR Recruiter</option>
          </select>
          <button
            onClick={startLiveInterview}
            disabled={!connected}
            className={`px-6 py-2 rounded-lg text-white ${
              connected
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {connected ? "Start Live Interview" : "Connecting..."}
          </button>
        </div>
      ) : (
        <>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="rounded-lg shadow-lg w-96 h-72 mb-4 object-cover"
          />

          <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md text-center">
            {thinking ? (
              <p className="text-gray-600 italic animate-pulse">
                🤖 AI is thinking...
              </p>
            ) : (
              <p className="text-lg">
                <strong>AI:</strong> {aiMessage || "Waiting for first question..."}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {listening ? "🎤 Listening..." : "🧠 Paused..."}
            </p>
          </div>

          <div className="mt-6 bg-white p-4 rounded-lg shadow-md w-full max-w-md text-left">
            <h3 className="font-semibold mb-2">🗣️ Your Responses</h3>
            {transcript.length === 0 ? (
              <p className="text-gray-500 text-sm">No answers yet...</p>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {transcript.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
