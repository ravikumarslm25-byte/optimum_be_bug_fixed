import IdcodeServices from "../idcode/idcode.service.js";
import CampaignModel from "../leads/campaign/campaign.model.js";
import CampaignService from "../leads/campaign/campaign.service.js";
import LeadModel from "../leads/lead/lead.model.js";
import AppointmentModel from "./appointment.model.js";

class AppointmentService {
  static async addAppointment(appointmentData) {
    // Generate Token ID
    const tokenName = "Token";
    const tokenCode = "Tk";
    await IdcodeServices.addIdCode(tokenName, tokenCode);
    const token_id = await IdcodeServices.generateCode(tokenName);
    if (!token_id) throw new Error("Failed to generate token ID");

    // Generate OPD/IPD numbers if applicable
    let opd_number ;
    let ipd_number ;

    if (appointmentData.patient_type === "OPD") {
      const opdName = "OPD";
      const opdCode = "OPD";
      await IdcodeServices.addIdCode(opdName, opdCode);
      opd_number = await IdcodeServices.generateCode(opdName);
    }

    if (appointmentData.patient_type === "IPD") {
      const ipdName = "IPD";
      const ipdCode = "IPD";
      await IdcodeServices.addIdCode(ipdName, ipdCode);
      ipd_number = await IdcodeServices.generateCode(ipdName);
    }

    const appointment = new AppointmentModel({
      token_id,
      opd_number,
      ipd_number,
      ...appointmentData,
    });

    return await appointment.save();
  }

  static async createAppointment(appointmentData) {
    // Generate Token ID
    const tokenName = "Token";
    const tokenCode = "Tk";
    await IdcodeServices.addIdCode(tokenName, tokenCode);
    const token_id = await IdcodeServices.generateCode(tokenName);
    if (!token_id) throw new Error("Failed to generate Token ID");

    // Generate OPD/IPD numbers
    let opd_number ;
    let ipd_number ;

    if (appointmentData.patient_type === "OPD") {
      const opdName = "OPD";
      const opdCode = "OPD";
      await IdcodeServices.addIdCode(opdName, opdCode);
      opd_number = await IdcodeServices.generateCode(opdName);
    }

    if (appointmentData.patient_type === "IPD") {
      const ipdName = "IPD";
      const ipdCode = "IPD";
      await IdcodeServices.addIdCode(ipdName, ipdCode);
      ipd_number = await IdcodeServices.generateCode(ipdName);
    }

    // Link campaign
    const campaign = await CampaignModel.findOne({
      campaign_id: appointmentData.campaign_id,
    });
    if (!campaign) throw new Error("Campaign not found");

    const newappointment = await AppointmentModel.create({
      ...appointmentData,
      token_id,
      opd_number,
      ipd_number,
      campaign: campaign._id,
      campaign_id: campaign.campaign_id,
    });

    campaign.appointments.push(newappointment._id);
    await campaign.save();

     if (appointmentData.lead_id) {
    await LeadModel.findOneAndUpdate(
      { lead_id: appointmentData.lead_id },
      {
        $set: {
          status: "converted",
          convertedAt: new Date(),
        },
      }
    );
  }

    return newappointment;
  }

  static async getAllAppointments() {
    return await AppointmentModel.find().populate("lead").sort({ createdAt: -1 });
  }

  static async getAppointmentsByCampaign(campaignId) {
    return await AppointmentModel.find({ campaign: campaignId });
  }

  static async updateAppointment(token_id, updateData) {
    return await AppointmentModel.findOneAndUpdate(
      { token_id },
      { $set: updateData },
      { new: true }
    );
  }

  // ✅ Update by MongoDB _id (for frontend) — also syncs the lead when a
  //    lead_id is added/changed (this is how HR links a historical appointment
  //    to its lead after the fact, per requirement).
  static async updateAppointmentById(appointmentId, updateData) {
    const data = { ...updateData };

    // Resolve/att a lead when a lead_id is supplied
    if (data.lead_id) {
      const lead = await LeadModel.findOne({ lead_id: String(data.lead_id).trim() });
      if (lead) {
        data.lead = lead._id;
        data.lead_id = lead.lead_id;
        await LeadModel.updateOne(
          { _id: lead._id },
          { $set: { status: "converted", convertedAt: new Date() } }
        );
      } else {
        // keep the typed id but do not force a broken ref
        data.lead = null;
      }
    } else if (data.lead_id === "" || data.lead_id === null) {
      // explicit unlink
      data.lead = null;
    }

    const result = await AppointmentModel.findByIdAndUpdate(
      appointmentId,
      { $set: data },
      { new: true }
    );
    return result;
  }

  // ============================================================
  // ✅ BULK UPLOAD APPOINTMENTS (OPD / IPD historical data)
  //  - OPD/IPD/Token numbers come from the ID Master prefixes.
  //  - If a row supplies an OPD/IPD number it is used as-is; otherwise it is
  //    auto-generated. After the batch the counter is bumped so the next auto
  //    id continues AFTER the largest number provided.
  //  - lead_id is OPTIONAL: given & found -> linked + lead marked converted;
  //    blank or not found -> uploaded WITHOUT a lead link (add it later in Edit).
  //  - campaign_id optional: links the appointment into the campaign so the
  //    campaign report keeps counting correctly.
  //  - Finance / settlement / invoice details are NOT handled here — those live
  //    in the Invoice generation flow.
  // ============================================================
  static async bulkUploadAppointments(type, rows = []) {
    const patientType = String(type || "").toUpperCase();
    if (!["OPD", "IPD"].includes(patientType)) {
      throw new Error("type must be OPD or IPD");
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("No rows to upload");
    }

    // Ensure the counters exist (prefixes are whatever the ID Master holds)
    await IdcodeServices.addIdCode("Token", "Tk");
    await IdcodeServices.addIdCode("OPD", "OHOPD");
    await IdcodeServices.addIdCode("IPD", "OHIPD");

    const numIdName = patientType === "OPD" ? "OPD" : "IPD";
    const numField = patientType === "OPD" ? "opd_number" : "ipd_number";
    const numMaster = await IdcodeServices.getCode(numIdName);

    let uploaded = 0;
    const skipped = [];
    let maxNum = 0;

    const parseDate = (val) => {
      if (val == null) return null;
      if (val instanceof Date) return isNaN(val) ? null : val;
      const str = String(val).trim();
      if (!str) return null;
      // Excel serial date number (e.g. "45871.00011574074") — happens when a
      // date cell is stored as a number and exported that way, not as text.
      if (/^\d+(\.\d+)?$/.test(str)) {
        const n = Number(str);
        if (n > 20000 && n < 80000) {
          const d = new Date(Math.round((n - 25569) * 86400000));
          if (!isNaN(d)) return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
        }
        return null;
      }
      // ISO yyyy-mm-dd
      const iso = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (iso) { const d = new Date(+iso[1], +iso[2] - 1, +iso[3]); return isNaN(d) ? null : d; }
      // Generic d/m/y with / . or - (2- or 4-digit year); disambiguate dd/mm vs mm/dd
      const m = str.match(/^(\d{1,4})[.\/\-](\d{1,4})[.\/\-](\d{1,4})/);
      if (!m) return null;
      let yy, dd, mm;
      const a = +m[1], b = +m[2], c = +m[3];
      if (m[1].length === 4) { yy = a; mm = b; dd = c; }
      else {
        yy = c; if (yy < 100) yy += 2000;
        if (a > 12 && b <= 12) { dd = a; mm = b; }
        else if (b > 12 && a <= 12) { mm = a; dd = b; }
        else { dd = a; mm = b; }
      }
      if (!mm || mm < 1 || mm > 12) return null;
      if (!dd || dd < 1 || dd > 31) return null;
      if (yy < 2000 || yy > 2100) return null;
      const d = new Date(yy, mm - 1, dd);
      return isNaN(d) ? null : d;
    };

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] || {};
      const rowNo = r.__row || i + 2;
      try {
        if (!r.patient_name || !String(r.patient_name).trim()) {
          skipped.push({ row: rowNo, reason: "Missing patient name" });
          continue;
        }

        // ---- OPD/IPD number (provided or auto) ----
        let idNumber = r[numField] && String(r[numField]).trim();
        if (idNumber) {
          const dup = await AppointmentModel.findOne({ [numField]: idNumber });
          if (dup) { skipped.push({ row: rowNo, reason: `Duplicate ${numField} (${idNumber})` }); continue; }
          const n = IdcodeServices.extractNumber(idNumber, numMaster?.idcode);
          if (n) maxNum = Math.max(maxNum, n);
        } else {
          idNumber = await IdcodeServices.generateCode(numIdName);
        }

        // ---- Token ----
        const token_id = await IdcodeServices.generateCode("Token");

        // ---- Optional lead link (given & found only) ----
        let leadRef = null;
        const leadIdStr = r.lead_id ? String(r.lead_id).trim() : "";
        if (leadIdStr) {
          const lead = await LeadModel.findOne({ lead_id: leadIdStr });
          if (lead) {
            leadRef = lead._id;
            await LeadModel.updateOne({ _id: lead._id }, { $set: { status: "converted", convertedAt: new Date() } });
          }
          // not found -> keep typed id, no ref (link later in Edit)
        }

        // ---- Optional campaign link ----
        let campaignRef = null;
        const campaignIdStr = r.campaign_id ? String(r.campaign_id).trim() : "";
        if (campaignIdStr) {
          const camp = await CampaignModel.findOne({ campaign_id: campaignIdStr });
          if (camp) campaignRef = camp._id;
        }

        const dateVal = parseDate(r.date || r.op_date || r.surgery_date);

        // Month now comes from the single date column (derived), so the template
        // no longer needs a separate month column. An explicit month still wins
        // if a raw sheet happens to include one.
        const MONTHS = [
          "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
          "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
        ];
        const derivedMonth = dateVal ? MONTHS[dateVal.getMonth()] : undefined;

        // Store the appointment date in a normalized, display-safe form
        // (YYYY-MM-DD) so the UI's `new Date(op_date)` never yields "Invalid Date".
        const isoDate = dateVal
          ? `${dateVal.getFullYear()}-${String(dateVal.getMonth() + 1).padStart(2, "0")}-${String(dateVal.getDate()).padStart(2, "0")}`
          : undefined;

        const doc = new AppointmentModel({
          token_id,
          patient_type: patientType,
          patient_name: String(r.patient_name).trim(),
          phone: r.phone ? String(r.phone).replace(/\D/g, "") : undefined,
          treatment: r.treatment || undefined,
          city: r.city || undefined,
          surgeon_name: r.doctor || r.surgeon_name || undefined,
          hospital_name: r.hospital || r.hospital_name || undefined,
          payment_mode: r.payment_mode || undefined,
          month: r.month || derivedMonth,
          category: r.category || undefined,
          lead_source: r.lead_source || r.source || undefined,
          bd_name: r.bd_name || undefined,
          ipd_status: r.ipd_status || undefined,
          [numField]: idNumber,
          op_date: patientType === "OPD" ? (isoDate || r.op_date || undefined) : undefined,
          surgery_date: patientType === "IPD" ? (isoDate || r.surgery_date || undefined) : undefined,
          lead: leadRef,
          lead_id: leadIdStr || undefined,
          campaign: campaignRef,
          campaign_id: campaignIdStr || undefined,
          status: "Completed",
        });

        if (dateVal) { doc.createdAt = dateVal; doc.updatedAt = dateVal; await doc.save({ timestamps: false }); }
        else { await doc.save(); }

        if (campaignRef) {
          await CampaignModel.updateOne(
            { _id: campaignRef },
            { $addToSet: { appointments: doc._id } }
          );
        }
        uploaded++;
      } catch (err) {
        skipped.push({ row: rowNo, reason: err.message });
      }
    }

    // ---- Continuation: bump the counter past the largest provided number ----
    if (maxNum > 0) await IdcodeServices.bumpTo(numIdName, maxNum);

    return { uploaded, skippedCount: skipped.length, skipped, total: rows.length };
  }

  // ✅ BULK DELETE appointments (admin) — remove many + unlink from campaigns
  static async bulkDeleteAppointments(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("No appointments selected for deletion");
    }
    const appts = await AppointmentModel.find({ _id: { $in: ids } }).select("_id campaign");
    const byCampaign = {};
    for (const a of appts) {
      if (a.campaign) {
        const key = String(a.campaign);
        (byCampaign[key] ||= []).push(a._id);
      }
    }
    await Promise.all(
      Object.entries(byCampaign).map(([cid, aids]) =>
        CampaignModel.updateOne({ _id: cid }, { $pull: { appointments: { $in: aids } } })
      )
    );
    const result = await AppointmentModel.deleteMany({ _id: { $in: ids } });
    return result.deletedCount;
  }

  static async deleteAppointment(appId) {
    const appointment = await AppointmentModel.findById(appId);
    if (!appointment) throw new Error("Appointment not found");

    // Remove the appointment from the campaign's appointments array
    await CampaignModel.findByIdAndUpdate(
      appointment.campaign,
      { $pull: { appointments: appointment._id } },
      { new: true }
    );

    // Delete the appointment document
    await AppointmentModel.findByIdAndDelete(appId);

    return { message: "Appointment deleted successfully" };
  }
}

export default AppointmentService;
