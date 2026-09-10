import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    time: { type: String, required: true },
    commented_by: { type: String, default: "Admin" },
    comment: { type: String, required: true },
    filePath: { type: String }, // ✅ S3 full URL (req.file.location)
    fileName: { type: String }, // ✅ Original filename
    fileSize: { type: Number },
  },
  { _id: false },
);

const taskSchema = new mongoose.Schema(
  {
    task_title: { type: String, unique: true },
    start_date: { type: Date, required: true },
    due_date: { type: Date, required: true },
    assigned_to: [{ type: String }],
    employee_id: { type: String },
    attachments: [
      {
        fileName: String,
        filePath: String,
      },
    ],
    note: { type: String },
    status: {
      type: String,
      enum: ["doing", "completed", "incomplete"],
      default: "doing",
    },

    comments: [CommentSchema],
    created_by: { type: String },
  },

  { timestamps: true },
);

const TaskModel = mongoose.model("Tasks", taskSchema);

export default TaskModel;
