import { Router } from "express";
import {
  createAppointment,
  createAppointmentbyCamp,
  deleteAppointment,
  getAllAppointments,
  updateAppointment,
  updateAppointmentById,
  bulkUploadAppointments,
  bulkDeleteAppointments,
} from "./appointment.controller.js";

const appointmentRoute = Router();

appointmentRoute.post("/add", createAppointment);
appointmentRoute.post("/create", createAppointmentbyCamp);

appointmentRoute.get("/getallappointments", getAllAppointments);

// ✅ Bulk upload historical OPD/IPD appointments
appointmentRoute.post("/bulk-upload", bulkUploadAppointments);

appointmentRoute.put("/updateappointment/:token_id", updateAppointment);
// ✅ NEW: Update by MongoDB _id
appointmentRoute.put("/update/:id", updateAppointmentById);

// ✅ Bulk delete (admin) — before "/:id" so it isn't captured as an id
appointmentRoute.delete("/bulk-delete", bulkDeleteAppointments);
appointmentRoute.delete("/:id", deleteAppointment);

export default appointmentRoute;
