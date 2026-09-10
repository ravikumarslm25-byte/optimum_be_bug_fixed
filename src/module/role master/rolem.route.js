import express from "express";
import { createRole, deleteRole, getAllRoles, getRolesByCategory } from "./rolem.controller.js";


const masterroleRoute = express.Router();

masterroleRoute.get("/by-category/:categoryId", getRolesByCategory);
masterroleRoute.get("/getallroles", getAllRoles);
masterroleRoute.post("/create", createRole);
masterroleRoute.delete("/delete/:id", deleteRole);

export default masterroleRoute;