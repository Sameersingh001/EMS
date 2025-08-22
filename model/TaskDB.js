import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true }, // link task to employee
  deadline: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model("Task", TaskSchema);
export default Task;