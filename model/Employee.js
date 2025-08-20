import mongoose from "mongoose";

const EmployeesSchema = new mongoose.Schema({

name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  imageUrl: {
    type: String,   // store the URL or file path
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  about: {
    type: String
  },
  department: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Employee = mongoose.model("Users", EmployeesSchema, "Users")

export default Employee

