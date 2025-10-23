import axios from "axios";
import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";

export const chatWithAICopilot = async (req, res) => {
  const { message } = req.body;

  try {
    // Check for HR-related intents
    if (message.toLowerCase().includes("leave") || message.toLowerCase().includes("attendance")) {
      const summary = await getAttendanceData();
      return res.json({
        reply: `Today, ${summary.onLeave} employees are on leave, attendance rate is ${summary.attendanceRate}%.`
      });
    }

    // General AI conversation using free Hugging Face API
    const hfResponse = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
      { inputs: message }
    );

    const reply = hfResponse.data[0]?.generated_text || "I’m here to help with HR tasks.";
    res.json({ reply });

  } catch (err) {
    console.error("AI Copilot Error:", err.message);
    res.status(500).json({ reply: "I’m facing some issues right now. Please try again later." });
  }
};

// Helper for attendance summary
const getAttendanceData = async () => {
  const total = await Employee.countDocuments();
  const onLeave = await Leave.countDocuments({ date: new Date().toDateString() });
  const attendanceRate = ((total - onLeave) / total * 100).toFixed(1);
  return { total, onLeave, attendanceRate };
};

export const getAttendanceSummary = async (req, res) => {
  const data = await getAttendanceData();
  res.json(data);
};
