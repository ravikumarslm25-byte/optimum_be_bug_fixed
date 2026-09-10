import { Router } from "express";
import { addHospital, deleteHospital, getAllHospitals, getHospitalById, updateHospital } from "./hospital.controller.js";




const hospitalRoute = Router();

hospitalRoute.post("/add", addHospital);
hospitalRoute.get("/getallhospitals", getAllHospitals);
hospitalRoute.get("/gethospital/:id", getHospitalById);
hospitalRoute.put("/updatehospital/:_id", updateHospital);
hospitalRoute.delete("/deletehospital/:id", deleteHospital);


export default hospitalRoute;