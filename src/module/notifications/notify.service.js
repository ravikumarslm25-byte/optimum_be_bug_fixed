import NotificationModel from "./notify.model.js";

class NotificationService {
  static async createNotification({ title, message, employee_id, createdBy,actions,relatedId }) {
    const notification = new NotificationModel({
      title,
      message,
      employee_id,
      createdBy,
      actions,relatedId
    });

    await notification.save();
    return notification;
  }

    static async markNotificationClosed(wfhId) {
    return NotificationModel.updateMany(
      { relatedId: wfhId },
      { $set: { read: true, actions: [] } }
    );
  }

  static async getNotificationsByEmployee(employee_id) {
    return NotificationModel.find({ employee_id }).sort({ createdAt: -1 });
  }

  static async markAsRead(_id) {
    return NotificationModel.findByIdAndUpdate(_id, { read: true }, { new: true });
  }

  // Optional: mark all notifications for employee as read
  static async markAllAsRead(employee_id) {
    return await NotificationModel.updateMany(
      { employee_id },
      { read: true }
    );
  }
  
}

export default NotificationService;
