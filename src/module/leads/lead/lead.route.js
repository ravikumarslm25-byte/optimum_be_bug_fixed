import { Router } from "express";
import {
  addFollowUp,
  createLead,
  deleteLead,
  getAllLeads,
  getFollowUpsByLead,
  getLeadDocuments,
  transferLeads,
  updateLead,
  uploadLeadDocuments,
  bulkUploadLeads,
  getLeadDashboardStats,
  getLeadByLeadId,
  bulkDeleteLeads,
  deleteLeadDocument,
} from "./lead.controller.js";
import { upload } from "../../../config/multer.js";

const leadRoute = Router();

leadRoute.post("/add", createLead);
leadRoute.post("/bulk-upload", bulkUploadLeads);

// leadRoute.get("/campaign/:campaignId", getLeadsByCampaign);
leadRoute.get("/getallleads", getAllLeads);
// ⚡ Lightweight dashboard aggregation (counts + top performers + latest 5)
leadRoute.get("/dashboard-stats", getLeadDashboardStats);
leadRoute.get("/detail/:leadId", getLeadByLeadId);
leadRoute.put("/updatelead/:id", updateLead);
leadRoute.put("/transferleads", transferLeads);
// ✅ Bulk delete (admin) — must come before "/:id" so it isn't captured as an id
leadRoute.delete("/bulk-delete", bulkDeleteLeads);
leadRoute.delete("/:id", deleteLead);

// ✅ Delete a single document from a lead
leadRoute.delete("/:leadId/documents/:documentId", deleteLeadDocument);

leadRoute.post("/followup/add", addFollowUp);
leadRoute.get("/getfollowup/:leadId", getFollowUpsByLead);

leadRoute.post(
  "/upload-documents",
  upload.array("documents", 5),
  uploadLeadDocuments
);
leadRoute.get("/:leadId/documents", getLeadDocuments);

export default leadRoute;
