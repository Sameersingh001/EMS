import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  noticeDate: {
    type: Date,
    default: Date.now
  },
});

const notice = mongoose.model("Notice", NoticeSchema);

export default notice
