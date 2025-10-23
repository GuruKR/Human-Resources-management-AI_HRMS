const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

/* ---------------------------------------------
   📦 GET all tasks assigned to an employee
--------------------------------------------- */
router.get("/:id", async (req, res) => {
  try {
    const tasks = await Task.find({ assigneeId: req.params.id }).sort({ createdAt: -1 });
    if (!tasks.length) {
      return res.json({ total: 0, completed: 0, pending: 0, inProgress: 0, tasks: [] });
    }

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    const pending = tasks.filter(t => t.status === "Pending").length;
    const inProgress = tasks.filter(t => t.status === "In Progress").length;

    res.json({ total, completed, pending, inProgress, tasks });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Server error while fetching tasks" });
  }
});

/* ---------------------------------------------
   📝 POST create a new task (Manager/HR)
--------------------------------------------- */
router.post("/create", async (req, res) => {
  try {
    const { title, description, assigneeId, deadline, priority, createdBy } = req.body;

    if (!title || !assigneeId || !deadline || !createdBy) {
      return res.status(400).json({ error: "Title, assigneeId, deadline, and createdBy are required" });
    }

    const task = new Task({
      title,
      description,
      assigneeId,
      deadline,
      priority,
      createdBy,
      status: "Pending",
    });

    await task.save();
    res.json({ message: "Task created successfully", task });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: "Server error while creating task" });
  }
});

/* ---------------------------------------------
   🔄 PATCH update task status (Employee)
--------------------------------------------- */
router.patch("/update/:taskId", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status },
      { new: true }
    );

    if (!updatedTask) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task status updated successfully", task: updatedTask });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Server error while updating task status" });
  }
});

/* ---------------------------------------------
   🗑️ DELETE remove a task (optional)
--------------------------------------------- */
router.delete("/:taskId", async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.taskId);
    if (!deleted) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Server error while deleting task" });
  }
});

module.exports = router;
