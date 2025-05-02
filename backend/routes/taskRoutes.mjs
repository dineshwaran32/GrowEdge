import express from "express";
import Task from "../models/Task.mjs";
import auth from "../middleware/auth.mjs";

const router = express.Router();

// Add a new task
router.post("/add", auth, async (req, res) => {
  try {
    const { title } = req.body;
    const newTask = new Task({ userId: req.user, title });
    await newTask.save();
    res.json(newTask);
  } catch (error) {
    console.error("Add Task Error:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

// Get all tasks for a user
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Mark task as completed
router.put("/complete/:id", auth, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { completed: true },
      { new: true }
    );
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Delete a task
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});

export default router;
