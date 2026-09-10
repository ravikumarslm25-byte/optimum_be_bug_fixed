import mongoose from "mongoose";
import LeadModel from "./lead.model.js";
import CampaignModel from "../campaign/campaign.model.js";
import IdcodeServices from "../../idcode/idcode.service.js";
import NotificationModel from "../../notifications/notify.model.js";
import EmployeeModel from "../../employee/employee.model.js";
import s3 from "../../../config/S3.service.js";

class LeadService {
  // ===============================
  // CREATE LEAD
  // ===============================
  static async createLead(leadData) {
    const idname = "Leads";
    const idcode = "L";

    await IdcodeServices.addIdCode(idname, idcode);
    const lead_id = await IdcodeServices.generateCode(idname);
    if (!lead_id) throw new Error("Failed to generate lead ID");

    const phone = String(leadData.phone).replace(/\D/g, "");

    const existingLead = await LeadModel.findOne({ phone });
    if (existingLead) {
      // Throw an error or return a special response
      throw new Error("Phone number already exists");
    }

    const campaign = await CampaignModel.findOne({
      campaign_id: leadData.campaign_id,
    });
    if (!campaign) throw new Error("Campaign not found");

    const lead = await LeadModel.create({
      ...leadData,
      lead_id,
      campaign: campaign._id,
      campaign_id: campaign.campaign_id,
    });

    campaign.leads.push(lead._id);
    await campaign.save();

    return lead;
  }

  // ===============================
  // GET LEADS BASED ON ROLE
  // ===============================
  // Roles that can see ALL leads (case-insensitive match on role name).
  // Team Lead is intentionally NOT here — a Team Lead only sees leads in their
  // assigned category (see the category branch below).
  static FULL_ACCESS_ROLES = [
    "admin",
    "ceo",
    "business development manager",
    "campaign manager",
  ];

  // Build the Mongo filter for a user based on role/category.
  //  full access -> {}                  (all leads)
  //  team lead   -> { category: <their category>, case-insensitive }
  //  BD/employee -> { bdname: <their name> }
  static buildLeadScope(role_name, name, department, category_name) {
    const role = (role_name || "").trim().toLowerCase();
    const dept = (department || "").trim().toLowerCase();
    const hasFullAccess =
      LeadService.FULL_ACCESS_ROLES.includes(role) || dept === "admin";
    if (hasFullAccess) return {};
    if (role === "team lead") {
      const cat = (category_name || "").trim();
      if (cat) {
        // case-insensitive exact match so "Cosmetic" === "cosmetic"
        const esc = cat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return { category: new RegExp(`^${esc}$`, "i") };
      }
      // no category assigned -> fall back to their own leads, so they still see something
      return { bdname: name };
    }
    return { bdname: name };
  }

  // ✅ Fetch a single lead by its lead_id string (for the read-only view page,
  //    which is opened in a new tab from the appointments table).
  static async getLeadByLeadId(leadId) {
    const lead = await LeadModel.findOne({ lead_id: leadId })
      .populate("campaign", "channelName")
      .lean();
    if (!lead) throw new Error("Lead not found");
    return lead;
  }

  static async getLeadsByRole(role_name, name, department, category_name) {
    const match = LeadService.buildLeadScope(role_name, name, department, category_name);

    // ⚡ PERFORMANCE
    //  .lean()               -> plain JS objects, skips Mongoose document hydration
    //  populate(..., fields) -> the table only renders campaign.channelName
    //  sort({createdAt:-1})  -> backed by an index on the model
    // ⚡ Exclude the embedded follow_up[] and documents[] arrays (fetched on demand).
    const LIST_EXCLUDE = "-follow_up -documents";

    return await LeadModel.find(match)
      .select(LIST_EXCLUDE)
      .populate("campaign", "channelName")
      .sort({ createdAt: -1 })
      .lean();
  }

  // ===============================
  // ⚡ DASHBOARD STATS (server-side aggregation)
  // The dashboard previously downloaded EVERY lead just to count them and
  // group by BD. With 4000+ leads that was the slowest request on the page.
  // Mongo now does the counting and returns a few hundred bytes instead.
  // ===============================
  static async getDashboardStats(role_name, name, department, category_name) {
    const match = LeadService.buildLeadScope(role_name, name, department, category_name);

    const [totalLeads, grouped, latestLeads] = await Promise.all([
      LeadModel.countDocuments(match),

      LeadModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              $cond: [{ $in: ["$bdname", [null, ""]] }, "Unknown", "$bdname"],
            },
            total: { $sum: 1 },
            converted: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      { $toLower: { $ifNull: ["$status", ""] } },
                      "converted",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $project: { _id: 0, name: "$_id", total: 1, converted: 1 } },
      ]),

      LeadModel.find(match)
        .select("-follow_up -documents")
        .populate("campaign", "channelName")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Same rating formula the dashboard used client-side
    const performers = grouped
      .map((g) => ({
        name: g.name,
        dept: "",
        total: g.total,
        converted: g.converted,
        rating:
          g.total > 0
            ? parseFloat(((g.converted / g.total) * 5).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    return { totalLeads, performers, latestLeads };
  }

  // ===============================
  // TRANSFER LEADS
  // ===============================
  static async transferLeads(leadIds, bdname) {
    if (!leadIds?.length) {
      throw new Error("No leads selected");
    }
    if (!bdname) {
      throw new Error("BD name is required");
    }

    // 🔍 FIND BD USING NAME
    const bd = await EmployeeModel.findOne({
      name: bdname,
    });

    console.log(bd);

    if (!bd) {
      throw new Error("BD not found for given name");
    }

    // 1️⃣ Update leads
    await LeadModel.updateMany(
      { lead_id: { $in: leadIds } },
      {
        $set: {
          bdname,
        },
      }
    );

    // 2️⃣ Create notification
    await NotificationModel.create({
      title: "New Leads Assigned",
      message: `You have been assigned ${leadIds.length} new lead(s).`,
      employee_id: bd.employee_id,
    });

    return true;
  }
  // ===============================
  // DELETE LEAD
  // ===============================
  // ===============================
  // ✅ BULK DELETE LEADS (admin) — delete many by _id
  // ===============================
  static async bulkDeleteLeads(leadIds = []) {
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      throw new Error("No leads selected for deletion");
    }

    const leads = await LeadModel.find({ _id: { $in: leadIds } }).select(
      "_id campaign"
    );

    // Remove the deleted leads from their campaigns' lead arrays
    const byCampaign = {};
    for (const l of leads) {
      if (l.campaign) {
        const key = String(l.campaign);
        (byCampaign[key] ||= []).push(l._id);
      }
    }
    await Promise.all(
      Object.entries(byCampaign).map(([campaignId, ids]) =>
        CampaignModel.findByIdAndUpdate(campaignId, {
          $pull: { leads: { $in: ids } },
        })
      )
    );

    const result = await LeadModel.deleteMany({ _id: { $in: leadIds } });
    return result.deletedCount;
  }

  // ===============================
  // ✅ DELETE A SINGLE DOCUMENT from a lead
  // ===============================
  static async deleteDocument(leadId, documentId) {
    const lead = await LeadModel.findOne({ lead_id: leadId });
    if (!lead) throw new Error("Lead not found");

    const doc = lead.documents.id(documentId);
    if (!doc) throw new Error("Document not found");

    // Best-effort S3 cleanup — never block the DB removal on it.
    // The document sub-schema does not persist the S3 key, so derive it
    // from the stored fileUrl when possible.
    if (doc.fileUrl && process.env.AWS_S3_BUCKET) {
      try {
        const url = new URL(doc.fileUrl);
        // Key is the path after the leading slash (handles both
        // bucket.s3.region.amazonaws.com/key and s3/.../bucket/key forms)
        let key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
        if (key.startsWith(`${process.env.AWS_S3_BUCKET}/`)) {
          key = key.slice(process.env.AWS_S3_BUCKET.length + 1);
        }
        if (key) {
          await s3
            .deleteObject({ Bucket: process.env.AWS_S3_BUCKET, Key: key })
            .promise();
        }
      } catch (err) {
        console.error("S3 delete (non-fatal):", err.message);
      }
    }

    lead.documents.pull(documentId);
    await lead.save();
    return lead.documents;
  }

  static async deleteLead(leadId) {
    const lead = await LeadModel.findById(leadId);
    if (!lead) throw new Error("Lead not found");

    await CampaignModel.findByIdAndUpdate(lead.campaign, {
      $pull: { leads: lead._id },
    });

    await LeadModel.findByIdAndDelete(leadId);

    return { message: "Lead deleted successfully" };
  }

  static async addFollowUp({ lead_id, follow_up_date, notes, createdBy }) {
    const lead = await LeadModel.findOne({ lead_id });

    if (!lead) throw new Error("Lead not found");

    await LeadModel.updateOne(
      { lead_id },
      {
        $push: {
          follow_up: {
            follow_up_date,
            notes,
            createdBy,
          },
        },
        $set: { status: "follow-up" },
      }
    );

    return lead.follow_up.at(-1);
  }

  static async getFollowUpsByLead(leadId) {
    const lead = await LeadModel.findOne(
      { lead_id: leadId },
      { follow_up: 1, _id: 0 }
    );

    if (!lead) throw new Error("Lead not found");

    return lead.follow_up.sort(
      (a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date)
    );
  }

  static async uploadDocuments(leadId, files) {
    const documents = files.map((file) => ({
      fileName: file.originalname,
      fileType: file.mimetype,
      fileKey: file.key, // S3 key
      fileUrl: file.location, // S3 public URL
    }));

    return LeadModel.findOneAndUpdate(
      { lead_id: leadId },
      { $push: { documents: { $each: documents } } },
      { new: true }
    );
  }

  static async getDocumentsByLead(leadId) {
    const lead = await LeadModel.findOne({ lead_id: leadId }).select(
      "documents"
    );

    if (!lead) {
      throw new Error("Lead not found");
    }

    return lead.documents || [];
  }

  static async updateLeadById(leadId, updateData) {
    const updatedLead = await LeadModel.findByIdAndUpdate(leadId, updateData, {
      new: true,
      runValidators: true,
    });

    return updatedLead;
  }

  // ===============================
  // ✅ BULK UPLOAD LEADS
  // ===============================
  static async bulkUploadLeads(campaignId, leadsData, allowDuplicates = false) {
    try {
      const campaign = await CampaignModel.findById(campaignId);
      if (!campaign) throw new Error("Campaign not found");

      const idname = "Leads";
      const idcode = "L";
      await IdcodeServices.addIdCode(idname, idcode);
      const leadMaster = await IdcodeServices.getCode(idname);

      const skipped = [];

      // Date parser (shared for all rows)
      // Robust date parser for messy historical sheets. Handles:
      //  - separators "/", "-" and "." (e.g. 15/03/25, 15-03-25, 31.01.25)
      //  - 2- or 4-digit years (25 -> 2025)
      //  - ISO yyyy-mm-dd
      //  - both dd/mm and American mm/dd, disambiguated by which part is > 12
      //    (ambiguous cases default to dd/mm, the dominant convention here).
      //  Components are validated before building the Date, so an out-of-range
      //  "month" can never overflow into a future year (the old cause of 2027s).
      //  Genuinely unparseable values return null (row keeps its upload date).
      const parseCreatedDate = (val) => {
        if (val == null) return null;
        if (val instanceof Date) return isNaN(val) ? null : val;
        const str = String(val).trim();
        if (!str) return null;

        // Excel serial date number (e.g. "45871.00011574074") — a date cell
        // stored as a number and exported that way rather than as text.
        if (/^\d+(\.\d+)?$/.test(str)) {
          const n = Number(str);
          if (n > 20000 && n < 80000) {
            const d = new Date(Math.round((n - 25569) * 86400000));
            if (!isNaN(d)) return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
          }
          return null;
        }

        // ISO: yyyy-mm-dd (optionally followed by time)
        const iso = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (iso) {
          const d = new Date(+iso[1], +iso[2] - 1, +iso[3]);
          return isNaN(d) ? null : d;
        }

        // Generic d/m/y with / . or - (take the leading date token)
        const m = str.match(/^(\d{1,4})[.\/\-](\d{1,4})[.\/\-](\d{1,4})/);
        if (!m) return null;

        let yy, dd, mm;
        const a = +m[1], b = +m[2], c = +m[3];
        if (m[1].length === 4) {
          yy = a; mm = b; dd = c; // yyyy/mm/dd
        } else {
          yy = c;
          if (yy < 100) yy += 2000;
          if (a > 12 && b <= 12) { dd = a; mm = b; }        // first part must be the day
          else if (b > 12 && a <= 12) { mm = a; dd = b; }   // second part must be the day (mm/dd)
          else { dd = a; mm = b; }                          // ambiguous -> dd/mm
        }
        if (!mm || mm < 1 || mm > 12) return null;
        if (!dd || dd < 1 || dd > 31) return null;
        if (yy < 2000 || yy > 2100) return null; // reject garbage years
        const d = new Date(yy, mm - 1, dd);
        return isNaN(d) ? null : d;
      };

      // Only persist real schema fields (native insert has no strict mode)
      const allowed = new Set(Object.keys(LeadModel.schema.paths));

      // ---- 1. Validate + gather phones / provided ids (in-memory) ----
      const candidates = [];
      const uploadPhones = new Set();
      const providedIds = [];
      const seenPhones = new Set();

      for (let i = 0; i < leadsData.length; i++) {
        const leadData = leadsData[i];
        const row = leadData.__row || i + 1;
        if (!leadData.name || !leadData.phone) {
          skipped.push({ row, name: leadData.name || "", phone: leadData.phone || "", reason: "Missing name or phone" });
          continue;
        }
        const phone = String(leadData.phone).replace(/\D/g, "");
        if (!phone) { skipped.push({ row, name: leadData.name, phone: "", reason: "Invalid phone" }); continue; }
        if (seenPhones.has(phone)) { skipped.push({ row, name: leadData.name, phone, reason: "Duplicate phone in file" }); continue; }
        seenPhones.add(phone);
        uploadPhones.add(phone);
        const provided = leadData.lead_id && String(leadData.lead_id).trim();
        if (provided) providedIds.push(provided);
        candidates.push({ leadData, row, phone, providedLeadId: provided || null });
      }

      // ---- 2. Bulk existence checks — 2 queries instead of one-per-row ----
      const [existingPhones, existingIds] = await Promise.all([
        uploadPhones.size ? LeadModel.find({ phone: { $in: [...uploadPhones] } }, { phone: 1 }).lean() : [],
        providedIds.length ? LeadModel.find({ lead_id: { $in: providedIds } }, { lead_id: 1 }).lean() : [],
      ]);
      const existingPhoneSet = new Set(existingPhones.map((l) => l.phone));
      const existingIdSet = new Set(existingIds.map((l) => l.lead_id));

      // ---- 3. Decide final rows; count auto ids needed ----
      const finalRows = [];
      const seenIds = new Set();
      let autoNeeded = 0;
      let maxLeadNum = 0;
      for (const c of candidates) {
        if (!allowDuplicates && existingPhoneSet.has(c.phone)) {
          skipped.push({ row: c.row, name: c.leadData.name, phone: c.phone, reason: "Duplicate phone (already exists)" });
          continue;
        }
        if (c.providedLeadId) {
          if (existingIdSet.has(c.providedLeadId) || seenIds.has(c.providedLeadId)) {
            skipped.push({ row: c.row, name: c.leadData.name, phone: c.phone, reason: `Duplicate lead_id (${c.providedLeadId})` });
            continue;
          }
          seenIds.add(c.providedLeadId);
          const n = IdcodeServices.extractNumber(c.providedLeadId, leadMaster?.idcode);
          if (n) maxLeadNum = Math.max(maxLeadNum, n);
        } else {
          autoNeeded++;
        }
        finalRows.push(c);
      }

      // ---- 4. Reserve a block of auto ids in ONE atomic increment ----
      // First lift the counter past the largest PROVIDED id so auto ids can
      // never collide with a provided one, then reserve the block.
      if (maxLeadNum > 0) await IdcodeServices.bumpTo(idname, maxLeadNum);

      let nextAuto = 0;
      let prefix = leadMaster?.idcode || idcode;
      let pad = leadMaster?.pad || 3;
      if (autoNeeded > 0) {
        const block = await IdcodeServices.reserveCodes(idname, autoNeeded);
        nextAuto = block.start;
        prefix = block.prefix;
        pad = block.pad;
      }

      // ---- 5. Build raw docs (with pre-generated _ids so we can link campaign) ----
      const now = new Date();
      const rawDocs = [];
      for (const c of finalRows) {
        let lead_id = c.providedLeadId;
        if (!lead_id) {
          lead_id = `${prefix}${String(nextAuto).padStart(Math.max(pad, 1), "0")}`;
          nextAuto++;
        }
        const createdAt = parseCreatedDate(c.leadData.created_date) || now;

        const doc = { _id: new mongoose.Types.ObjectId() };
        for (const [k, v] of Object.entries(c.leadData)) {
          if (allowed.has(k) && k !== "created_date") doc[k] = v;
        }
        doc.lead_id = lead_id;
        doc.name = c.leadData.name;
        doc.phone = c.phone;
        doc.campaign = campaign._id;
        doc.campaign_id = campaign.campaign_id;
        doc.status = c.leadData.status || "new";
        doc.follow_up = [];
        doc.documents = [];
        doc.createdAt = createdAt;
        doc.updatedAt = createdAt;
        doc.__v = 0;
        rawDocs.push({ doc, row: c.row });
      }

      // ---- 6. Insert in batches via the native driver (preserves createdAt) ----
      let uploadedCount = 0;
      const insertedIds = [];
      const BATCH = 1000;
      for (let i = 0; i < rawDocs.length; i += BATCH) {
        const slice = rawDocs.slice(i, i + BATCH);
        const docs = slice.map((r) => r.doc);
        try {
          const res = await LeadModel.collection.insertMany(docs, { ordered: false });
          uploadedCount += res.insertedCount;
          insertedIds.push(...docs.map((d) => d._id));
        } catch (err) {
          // ordered:false → partial success. Mark failed rows; keep the rest.
          const failedIdx = new Set((err.writeErrors || []).map((we) => we.index));
          docs.forEach((d, idx) => {
            if (failedIdx.has(idx)) {
              const r = slice[idx];
              skipped.push({ row: r.row, name: d.name, phone: d.phone, reason: "Duplicate or invalid (insert)" });
            } else {
              insertedIds.push(d._id);
              uploadedCount++;
            }
          });
        }
      }

      // ---- 7. Link inserted leads to the campaign (ONE update) ----
      if (insertedIds.length) {
        await CampaignModel.updateOne(
          { _id: campaign._id },
          { $addToSet: { leads: { $each: insertedIds } } }
        );
      }

      console.log(`✅ Bulk upload complete: ${uploadedCount} uploaded, ${skipped.length} skipped`);

      return {
        uploadedCount,
        skippedCount: skipped.length,
        totalAttempted: leadsData.length,
        skippedRows: skipped.slice(0, 1000),
        errors: skipped.slice(0, 10).map((sk) => ({ row: sk.row, error: sk.reason })),
      };
    } catch (error) {
      console.error("❌ Bulk upload service error:", error);
      throw error;
    }
  }
}

export default LeadService;
