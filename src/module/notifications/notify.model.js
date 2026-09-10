import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    employee_id: { type: String, ref: "Employee" }, // who gets this notification
    read: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // who created it
    actions: [
      {
        type: String,
        enum: ["APPROVED", "DECLINED"],
      },
    ], // optional buttons for approval-type notifications
    relatedId: { type:String},
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
