import { Router } from "express";
import { addDoctor, deleteDoctor, getAllDoctors, getDoctorById, updateDoctor } from "./doctor.controller.js";



const doctorRoute = Router();

doctorRoute.post("/add", addDoctor);
doctorRoute.get("/getalldoctors", getAllDoctors);
doctorRoute.get("/getdoctor/:id", getDoctorById);
doctorRoute.put("/updatedoctor/:_id", updateDoctor);
doctorRoute.delete("/deletedoctor/:id", deleteDoctor);


export default doctorRoute;