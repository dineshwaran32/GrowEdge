import axios from "./axios";

// Get all tasks for the logged-in user
export const getTasks = async () => {
  const res = await axios.get("/tasks");
  return res.data;
};

// Add a new task
export const addTask = async (task) => {
  const res = await axios.post("/tasks/add", task); // ✅ No need to wrap in { task: task }
  return res.data;
};

// Mark a task as completed
export const completeTask = async (id) => {
  const res = await axios.put(`/tasks/complete/${id}`);
  return res.data;
};

// Delete a task
export const deleteTask = async (id) => {
  const res = await axios.delete(`/tasks/delete/${id}`);
  return res.data;
};
