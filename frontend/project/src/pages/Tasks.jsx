import React, { useEffect, useState } from "react";
import {
  getTasks,
  addTask,
  completeTask,
  deleteTask,
} from "../services/taskservice";
import "./Tasks.css";

const TaskManager = () => {
  const [taskText, setTaskText] = useState("");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleAddTask = async () => {
    if (!taskText.trim()) return;
    try {
      const newTask = await addTask({ title: taskText }); // ✅ Send as { title: "..." }
      setTasks([...tasks, newTask]);
      setTaskText("");
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const handleComplete = async (id) => {
    try {
      const updated = await completeTask(id);
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? updated : task))
      );
    } catch (err) {
      console.error("Error completing task:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <div className="task-wrapper">
      <h2 className="task-title">Task Manager</h2>

      <div className="task-input-area">
        <input
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Enter your task..."
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="no-tasks">No tasks yet. Add some!</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className={`task-item ${task.completed ? "completed" : ""}`}
            >
              <span>{task.title}</span> {/* ✅ Use title instead of task.task */}
              <div className="task-actions">
                {!task.completed && (
                  <button onClick={() => handleComplete(task._id)}>
                    Complete
                  </button>
                )}
                <button onClick={() => handleDelete(task._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManager;
