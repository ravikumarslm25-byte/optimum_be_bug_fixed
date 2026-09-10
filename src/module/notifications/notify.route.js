import {Router} from "express";
import {

  getEmployeeNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notify.controller.js";

const notificationRoute = Router();

notificationRoute.get("/:employee_id", getEmployeeNotifications);
notificationRoute.patch("/readall/:employee_id", markAllNotificationsRead);
notificationRoute.patch("/read/:_id", markNotificationRead);

export default notificationRoute;
