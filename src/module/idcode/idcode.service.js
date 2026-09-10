import logger from "../../config/logger.js";
import IdcodeModel from "./idcode.mode.js";

// ============================================================
// ID MASTER — central sequence generator for all system IDs
// (Lead, Campaign, IPD No, OPD No, Invoice No, Employee, Token…)
// A record is { idname, idcode (prefix), codes (current number), pad }.
// generateCode() is ATOMIC ($inc) so concurrent/bulk inserts can't collide.
// ============================================================

// Standard masters seeded on first read of the ID Master screen.
// (Existing records are never overwritten — only missing ones are created.)
export const STANDARD_IDS = [
  { idname: "Leads", idcode: "L", label: "Lead ID" },
  { idname: "Campaign", idcode: "CAMP", label: "Campaign ID" },
  { idname: "IPD", idcode: "IPD", label: "IPD No" },
  { idname: "OPD", idcode: "OPD", label: "OPD No" },
  { idname: "Invoice", idcode: "INV", label: "Invoice No" },
  { idname: "EMPLOYEE", idcode: "EMP", label: "Employee ID" },
  { idname: "Token", idcode: "Tk", label: "Token ID" },
];

class IdcodeServices {
  // Format a number into "<prefix><zero-padded number>"
  static format(idcode, codes, pad = 3) {
    const width = Math.max(Number(pad) || 3, 1);
    return `${idcode}${String(codes).padStart(width, "0")}`;
  }

  static async getCode(idname) {
    try {
      return await IdcodeModel.findOne({ idname });
    } catch (error) {
      logger.error("error while get a code" + error);
    }
  }

  static async updateCode(idname, codes) {
    try {
      return await IdcodeModel.updateOne({ idname }, { $set: { codes } });
    } catch (error) {
      logger.error("error while updating a code" + error);
    }
  }

  // ✅ ATOMIC generate — increment then format
  static async generateCode(idname) {
    try {
      const doc = await IdcodeModel.findOneAndUpdate(
        { idname },
        { $inc: { codes: 1 } },
        { new: true }
      );
      if (!doc) {
        logger.error(`generateCode: no counter named "${idname}"`);
        return null;
      }
      const id = this.format(doc.idcode, doc.codes, doc.pad);
      return id;
    } catch (error) {
      logger.error("error while generating a code" + error);
      return null;
    }
  }

  // ✅ Preview the NEXT id without consuming it
  // ✅ Reserve a block of `count` sequential numbers in ONE atomic increment.
  //    Returns { start, prefix, pad } — ids run from start .. start+count-1.
  //    Used by bulk upload so we don't hit the DB once per row.
  static async reserveCodes(idname, count) {
    if (!count || count < 1) return null;
    const doc = await IdcodeModel.findOneAndUpdate(
      { idname },
      { $inc: { codes: count } },
      { new: true }
    );
    if (!doc) throw new Error(`No counter named "${idname}"`);
    return {
      start: doc.codes - count + 1, // first reserved number
      prefix: doc.idcode,
      pad: doc.pad || 3,
    };
  }

  static async peekNext(idname) {
    const doc = await IdcodeModel.findOne({ idname });
    if (!doc) return null;
    return this.format(doc.idcode, (doc.codes || 0) + 1, doc.pad);
  }

  static async addIdCode(idname, idcode) {
    try {
      const existingCode = await IdcodeModel.findOne({ idname });
      if (existingCode) return existingCode;
      const newIdCode = new IdcodeModel({ idname, idcode, codes: 0 });
      return await newIdCode.save();
    } catch (error) {
      logger.error("error while adding a new id code" + error);
    }
  }

  // ✅ Extract the trailing number from an id like "OHIPD1884" -> 1884
  static extractNumber(id, idcode) {
    if (id == null) return null;
    const s = String(id).trim();
    if (!s) return null;
    // strip the known prefix if present, then take the trailing digits
    let rest = s;
    if (idcode && rest.toUpperCase().startsWith(String(idcode).toUpperCase())) {
      rest = rest.slice(String(idcode).length);
    }
    const m = rest.match(/(\d+)\s*$/);
    return m ? parseInt(m[1], 10) : null;
  }

  // ✅ CONTINUATION — after a bulk upload that contained explicit ids, make sure
  // the counter is at least as high as the biggest number seen, so the next
  // auto-generated id continues AFTER the largest one provided.
  static async bumpTo(idname, minCodes) {
    if (!minCodes || minCodes < 1) return;
    const doc = await IdcodeModel.findOne({ idname });
    if (!doc) return;
    if ((doc.codes || 0) < minCodes) {
      await IdcodeModel.updateOne({ idname }, { $set: { codes: minCodes } });
    }
  }

  // ---- ID MASTER admin surface ----------------------------------

  // List every counter, seeding the standard set on first use.
  static async listCodes() {
    for (const std of STANDARD_IDS) {
      await this.addIdCode(std.idname, std.idcode);
    }
    const docs = await IdcodeModel.find().lean();
    const labelMap = Object.fromEntries(
      STANDARD_IDS.map((s) => [s.idname, s.label])
    );
    return docs.map((d) => ({
      _id: d._id,
      idname: d.idname,
      label: labelMap[d.idname] || d.idname,
      idcode: d.idcode,
      codes: d.codes || 0,
      pad: d.pad || 3,
      current: d.codes ? this.format(d.idcode, d.codes, d.pad) : "—",
      next: this.format(d.idcode, (d.codes || 0) + 1, d.pad),
    }));
  }

  // Update prefix / current number / padding for a counter.
  static async updateConfig(idname, { idcode, codes, pad }) {
    const set = {};
    if (idcode != null && String(idcode).trim()) set.idcode = String(idcode).trim();
    if (codes != null && !isNaN(Number(codes))) set.codes = Math.max(0, Math.floor(Number(codes)));
    if (pad != null && !isNaN(Number(pad))) set.pad = Math.max(1, Math.min(10, Math.floor(Number(pad))));
    if (Object.keys(set).length === 0) throw new Error("Nothing to update");
    const doc = await IdcodeModel.findOneAndUpdate({ idname }, { $set: set }, { new: true });
    if (!doc) throw new Error(`Counter "${idname}" not found`);
    return {
      idname: doc.idname,
      idcode: doc.idcode,
      codes: doc.codes,
      pad: doc.pad || 3,
      next: this.format(doc.idcode, (doc.codes || 0) + 1, doc.pad),
    };
  }
}

export default IdcodeServices;
