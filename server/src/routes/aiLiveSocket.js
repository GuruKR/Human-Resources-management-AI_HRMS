const { Server } = require("socket.io");
const { OpenAI } = require("openai");

// ✅ Initialize OpenAI safely
let openai = null;
try {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠️ No OPENAI_API_KEY found — AI dynamic question generation disabled.");
  } else {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (err) {
  console.error("❌ OpenAI initialization failed:", err.message);
}

const QUESTION_BANK = {
  "software engineer": [
    "Tell me about your experience with JavaScript frameworks like React or Node.js.",
    "How do you ensure code scalability in large applications?",
    "Describe a project where you solved a difficult technical problem.",
    "How do you test and deploy your code?",
    "What is your approach to working in a team environment?",
  ],
  "data analyst": [
    "Which tools do you use for data visualization?",
    "How do you handle missing data?",
    "Can you explain a time you used SQL for analysis?",
    "What is your experience with Python or R?",
    "Describe how you present insights to stakeholders.",
  ],
  "hr recruiter": [
    "How do you source candidates for niche roles?",
    "What tools do you use for tracking applicants?",
    "How do you ensure diversity in hiring?",
    "Describe a time you resolved a hiring challenge.",
    "How do you assess cultural fit?",
  ],
};

function createInterviewSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // ✅ Only allow your frontend
      methods: ["GET", "POST"],
    },
  });

  const activeSessions = {};

  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    socket.emit("ai_response", {
      message: "Welcome! Please select your role and start the live AI interview.",
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
      delete activeSessions[socket.id];
    });

    /* ======================================================
       🚀 START INTERVIEW
    ======================================================= */
    socket.on("start_interview", (data) => {
      const { role } = data;
      const questions = QUESTION_BANK[role?.toLowerCase()];
      if (!questions) {
        socket.emit("ai_response", {
          message: "No questions found for this role. Please choose a valid one.",
        });
        return;
      }

      activeSessions[socket.id] = {
        role,
        currentIndex: 0,
        score: 0,
        answers: [],
      };

      console.log(`🎤 Started ${role} interview (${socket.id})`);
      socket.emit("ai_response", { message: questions[0] });
    });

    /* ======================================================
       🧠 HANDLE SPEECH TEXT INPUT
    ======================================================= */
    socket.on("speech_text", async (data) => {
      try {
        const { text } = data;
        const session = activeSessions[socket.id];
        if (!session || !text?.trim()) return;

        const role = session.role;
        const questions = QUESTION_BANK[role.toLowerCase()];
        const currentQuestion = questions[session.currentIndex];
        session.answers.push(text);

        // ✅ Keyword-based scoring
        const keywords = currentQuestion
          .split(" ")
          .filter((w) => w.length > 4)
          .map((w) => w.toLowerCase());
        const lowerAnswer = text.toLowerCase();

        let matchCount = 0;
        keywords.forEach((k) => {
          if (lowerAnswer.includes(k)) matchCount++;
        });

        const relevance = (matchCount / keywords.length) * 100;
        const score = Math.min(10, Math.round(relevance / 10) + 4);
        session.score += score;
        session.currentIndex++;

        // ✅ End of interview check
        if (session.currentIndex >= questions.length) {
          const totalScore = Math.round(
            (session.score / (questions.length * 10)) * 100
          );
          let finalFeedback;
          if (totalScore >= 85)
            finalFeedback =
              "🏆 Excellent candidate with strong communication & technical skills.";
          else if (totalScore >= 70)
            finalFeedback =
              "👍 Good candidate — solid understanding but can elaborate more.";
          else if (totalScore >= 50)
            finalFeedback =
              "⚠️ Average performance — needs improvement in clarity and detail.";
          else
            finalFeedback =
              "❌ Needs improvement — revise fundamentals before next interview.";

          socket.emit("ai_response", {
            message: `Interview completed. Score: ${totalScore}/100. Feedback: ${finalFeedback}`,
          });
          delete activeSessions[socket.id];
          return;
        }

        // ✅ Generate next question dynamically using OpenAI
        let nextQuestion = null;

        if (openai) {
          const nextQuestionPrompt = `
            You are an AI interviewer conducting a ${role} interview.
            Given the candidate's last answer: "${text}",
            generate the next logical interview question (1 short sentence).
          `;
          try {
            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a professional interviewer that asks concise, relevant follow-up questions.",
                },
                { role: "user", content: nextQuestionPrompt },
              ],
            });

            nextQuestion = completion.choices[0].message.content.trim();
          } catch (openaiError) {
            console.error("⚠️ OpenAI error:", openaiError.message);
          }
        }

        // ✅ Fallback if OpenAI fails
        if (!nextQuestion) {
          const backupQuestions = questions;
          nextQuestion =
            backupQuestions[session.currentIndex] ||
            "Can you elaborate on that?";
        }

        socket.emit("ai_response", { message: nextQuestion });
      } catch (err) {
        console.error("❌ Error handling speech_text:", err);
        socket.emit("ai_response", {
          message: "Error processing your response. Please try again.",
        });
      }
    });
  });
}

module.exports = createInterviewSocket;
