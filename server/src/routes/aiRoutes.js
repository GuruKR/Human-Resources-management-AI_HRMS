const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const path = require("path");
const pdfPoppler = require("pdf-poppler");
require("dotenv").config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const APILAYER_KEY = process.env.APILAYER_KEY;

/* 🎯 Role-based keywords */
const ROLE_KEYWORDS = {
  "software engineer": [
    "javascript", "react", "react.js", "node", "node.js", "python", "java",
    "mongodb", "express", "express.js", "api", "docker", "aws", "git", "html", "css"
  ],
  "mern developer": [
    "react", "react.js", "node", "node.js", "express", "express.js", "mongodb",
    "javascript", "redux", "api", "next.js", "git", "html", "css"
  ],
  "data analyst": [
    "excel", "sql", "python", "tableau", "power bi", "data visualization",
    "machine learning", "statistics", "analytics", "reporting"
  ],
  "hr recruiter": [
    "recruitment", "talent acquisition", "screening", "onboarding", "communication",
    "employee engagement", "job description", "sourcing", "interviewing"
  ],
  "sales executive": [
    "sales", "crm", "lead generation", "communication", "negotiation",
    "pipeline", "target", "b2b", "b2c", "presentation", "marketing"
  ],
};

/* 🧠 Skill alias normalization */
const SKILL_ALIASES = {
  "react.js": "react",
  "node.js": "node",
  "express.js": "express",
  "next.js": "next",
  "redux toolkit": "redux",
  "html5": "html",
  "css3": "css",
  "aws cloud": "aws",
};

function normalizeSkill(skill) {
  return SKILL_ALIASES[skill] || skill;
}

/* 🧩 Convert PDF → Images for OCR fallback */
async function convertPDFtoImages(filePath) {
  try {
    const outputDir = path.join(__dirname, "../uploads/images");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const opts = {
      format: "jpeg",
      out_dir: outputDir,
      out_prefix: path.basename(filePath, path.extname(filePath)),
      page: null,
    };

    await pdfPoppler.convert(filePath, opts);
    return fs.readdirSync(outputDir)
      .filter(f => f.startsWith(path.basename(filePath, path.extname(filePath))))
      .map(f => path.join(outputDir, f));
  } catch (err) {
    console.error("❌ PDF to Image conversion failed:", err.message);
    return [];
  }
}

/* 🧠 Extract text using pdf-parse or OCR */
async function extractText(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    if (pdfData.text && pdfData.text.trim().length > 30) {
      console.log("✅ Text extracted using pdf-parse");
      return pdfData.text.toLowerCase();
    }
  } catch (err) {
    console.warn("⚠️ pdf-parse failed, using OCR fallback");
  }

  const images = await convertPDFtoImages(filePath);
  let text = "";
  for (const img of images) {
    console.log(`🔍 OCR processing image: ${img}`);
    const { data } = await Tesseract.recognize(img, "eng");
    text += " " + data.text;
  }

  console.log("✅ OCR extraction complete");
  return text.toLowerCase();
}

/* 🧩 Predict best-fit role based on keywords */
function predictBestRole(text) {
  const scores = {};
  for (const [role, keywords] of Object.entries(ROLE_KEYWORDS)) {
    let score = 0;
    keywords.forEach((kw) => {
      if (text.includes(kw)) score++;
    });
    scores[role] = score;
  }

  const bestRole = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return {
    bestRole: bestRole ? bestRole[0] : "Unknown",
    confidence: bestRole ? Math.round((bestRole[1] / ROLE_KEYWORDS[bestRole[0]].length) * 100) : 0,
  };
}

/* ===========================================================
   🧠 AI Resume Screening + Role Prediction
   =========================================================== */
router.post("/resume-screening", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Resume file is required" });
    const role = req.body.role?.toLowerCase() || null;
    const filePath = req.file.path;
    let parsedSkills = [];

    console.log(`📄 Analyzing resume${role ? ` for role: ${role}` : ""}`);

    try {
      const apiRes = await axios.post(
        "https://api.apilayer.com/resume_parser/upload",
        fs.createReadStream(filePath),
        {
          headers: {
            apikey: APILAYER_KEY,
            "Content-Type": "application/octet-stream",
          },
        }
      );
      parsedSkills = (apiRes.data.skills || []).map((s) => s.toLowerCase());
    } catch {
      console.warn("⚠️ Skipping APILayer (fallback to local parsing)");
    }

    const textContent = await extractText(filePath);

    const keywordSet = [
      "react", "react.js", "node", "node.js", "express", "express.js",
      "mongodb", "sql", "python", "java", "javascript", "html", "css",
      "docker", "aws", "api", "git", "typescript", "redux", "next.js"
    ];

    keywordSet.forEach((kw) => {
      if (textContent.includes(kw) && !parsedSkills.includes(kw)) {
        parsedSkills.push(kw);
      }
    });

    parsedSkills = parsedSkills.map(normalizeSkill);
    console.log("🧾 Final normalized skills:", parsedSkills);

    const { bestRole, confidence } = predictBestRole(textContent);

    let matched = [], missing = [], atsScore = 0, feedback = "";
    if (role && ROLE_KEYWORDS[role]) {
      const expectedSkills = (ROLE_KEYWORDS[role] || []).map(normalizeSkill);
      matched = expectedSkills.filter((s) => parsedSkills.includes(s));
      missing = expectedSkills.filter((s) => !parsedSkills.includes(s));
      atsScore = Math.round((matched.length / expectedSkills.length) * 100);

      feedback =
        atsScore >= 85
          ? "✅ Excellent match! Strong alignment with this role."
          : atsScore >= 65
          ? "🟡 Good match. Candidate has most key skills."
          : atsScore >= 45
          ? "⚠️ Average match. Some key skills missing."
          : "❌ Low match. Candidate needs improvement.";
    }

    res.json({
      selectedRole: role || "Not Provided",
      bestFitRole: bestRole,
      confidence: `${confidence}%`,
      atsScore,
      matchedSkills: [...new Set(matched)],
      missingSkills: [...new Set(missing)],
      feedback,
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Failed to analyze resume" });
  } finally {
    if (req.file) fs.unlink(req.file.path, () => {});
  }
});

/* ===========================================================
   🤖 Autonomous HR Copilot (Gemini + Fallback + HuggingFace)
   =========================================================== */
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Performance = require("../models/Performance");

async function getAttendanceData() {
  const total = await Employee.countDocuments();
  const onLeave = await Leave.countDocuments({ date: new Date().toDateString() });
  const attendanceRate = ((total - onLeave) / total) * 100;
  return { total, onLeave, attendanceRate: attendanceRate.toFixed(1) };
}

/* 🧩 Main Chat Route */
router.post("/chat", async (req, res) => {
  const { message } = req.body;
  const HF_API_KEY = process.env.HF_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  try {
    // Attendance or leave summary
    if (message.toLowerCase().includes("leave") || message.toLowerCase().includes("attendance")) {
      const summary = await getAttendanceData();
      return res.json({
        reply: `🧾 Today, ${summary.onLeave} employees are on leave out of ${summary.total}. Attendance rate: ${summary.attendanceRate}%.`,
      });
    }

    // Total employees
    if (message.toLowerCase().includes("how many employees")) {
      const total = await Employee.countDocuments();
      return res.json({ reply: `👥 There are currently ${total} employees in the company.` });
    }

    // ✅ JD Generator (Gemini + Fallback)
    if (message.toLowerCase().includes("generate") && message.toLowerCase().includes("job description")) {
      const role = message.replace(/.*for\s+/i, "").trim();
      const jdPrompt = `Write a detailed, professional job description for a ${role}. Include role overview, responsibilities, skills, and qualifications.`;

      try {
        // 🌟 Correct Gemini endpoint (fixed 404 issue)
        const geminiRes = await axios.post(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
          {
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `Write a detailed, professional job description for ${role}. Include:
                    • Role Overview
                    • Key Responsibilities
                    • Required Skills
                    • Preferred Qualifications
                    • Work Environment.`,
                  },
                ],
              },
            ],
          },
          {
            headers: { "Content-Type": "application/json" },
            params: { key: process.env.GEMINI_API_KEY },
            timeout: 20000,
          }
        );

        let jdText =
          geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          "⚠️ Gemini returned no content.";

        // 🧹 Clean Gemini formatting tokens and unwanted symbols
        jdText = jdText
          .replace(/<s>|<\/s>|<\|im_start\|>|<\|im_end\|>|\[BOS\]|\[EOS\]/gi, "")
          .replace(/\n{2,}/g, "\n\n") // normalize extra newlines
          .trim();

        return res.json({
          reply: `📄 **Job Description for ${role}:**\n\n${jdText}`,
        });
      } catch (geminiErr) {
        console.warn("⚠️ Gemini API failed:", geminiErr.message);


        // Fallback: OpenRouter (Mistral)
        try {
          const fallbackRes = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              model: "mistralai/mistral-7b-instruct",
              messages: [{ role: "user", content: jdPrompt }],
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
              },
              timeout: 20000,
            }
          );

          const fallbackText =
            fallbackRes.data.choices?.[0]?.message?.content ||
            `Here’s a sample JD for ${role}.`;

          return res.json({
            reply: `📄 **Job Description for ${role}:**\n\n${fallbackText}`,
          });
        } catch (fallbackErr) {
          console.error("❌ Both Gemini and Fallback failed:", fallbackErr.message);
          return res.json({
            reply: "⚠️ Both AI services are currently unavailable. Please try again later.",
          });
        }
      }
    }

    // 📊 Performance Summary
    if (message.toLowerCase().includes("performance")) {
      const topPerformers = await Performance.find()
        .sort({ rating: -1 })
        .limit(3)
        .populate("employee", "name department");

      if (!topPerformers.length)
        return res.json({ reply: "📊 No performance records found this month." });

      const summary = topPerformers
        .map(
          (p, i) =>
            `${i + 1}. ${p.employee?.name || "Unknown"} (${p.employee?.department || "N/A"}) – Rating: ${p.rating}/5`
        )
        .join("\n");

      return res.json({ reply: `🏆 **Top Performers This Month:**\n${summary}` });
    }

    // 💬 General fallback: Hugging Face
    const aiRes = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
      { inputs: message },
      { headers: HF_API_KEY ? { Authorization: `Bearer ${HF_API_KEY}` } : {} }
    );

    const reply =
      aiRes.data[0]?.generated_text ||
      "🤖 I’m your AI HR Copilot — ask me about employees, performance, or job descriptions!";
    res.json({ reply });
  } catch (error) {
    console.error("❌ Chat route error:", error.message);
    res.json({
      reply: "⚠️ AI Copilot encountered an error. Please try again later.",
    });
  }
});

/* Attendance Summary API */
router.get("/attendance-summary", async (req, res) => {
  try {
    const data = await getAttendanceData();
    res.json(data);
  } catch (err) {
    console.error("Error fetching attendance summary:", err);
    res.status(500).json({ error: "Failed to fetch attendance data" });
  }
});

module.exports = router;
