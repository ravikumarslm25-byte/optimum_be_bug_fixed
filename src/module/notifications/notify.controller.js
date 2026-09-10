import NotificationService from "./notify.service.js";

// Get notifications for employee
export const getEmployeeNotifications = async (req, res) => {
  try {
    const { employee_id } = req.params; // e.g., /notifications/:employee_id
    const notifications = await NotificationService.getNotificationsByEmployee(employee_id);
    res.status(200).json({ status: true, data: notifications });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Create a notification
export const createNotificationController = async (req, res) => {
  try {
    const { employee_id, title, message } = req.body;
    const notification = await NotificationService.createNotification(employee_id, title, message);
    res.status(201).json({ status: true, data: notification });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
export const markNotificationRead = async (req, res) => {
  try {
    const { _id } = req.params; // e.g., /notifications/read/:notificationId
    const notification = await NotificationService.markAsRead(_id);
    res.status(200).json({ status: true, data: notification });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
export const markAllNotificationsRead = async (req, res) => {
  try {
    const { employee_id } = req.params; // e.g., /notifications/read-all/:employee_id
    const result = await NotificationService.markAllAsRead(employee_id);
    res.status(200).json({ status: true, data: result });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


