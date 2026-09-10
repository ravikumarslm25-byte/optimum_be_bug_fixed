import { Router } from "express";
import { listIdCodes, updateIdCode } from "./idcode.controller.js";

const idcodeRoute = Router();

idcodeRoute.get("/", listIdCodes);
idcodeRoute.put("/:idname", updateIdCode);

export default idcodeRoute;
