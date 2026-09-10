// ====================================
// FILE: src/module/reports/report.controller.js
// COMPLETE REPORTS CONTROLLER
// ====================================

import Campaign from "../leads/campaign/campaign.model.js";
import Lead from "../leads/lead/lead.model.js";
import Doctor from "../doctor/doctor.model.js";
import Hospital from "../hospital/hospital.model.js";
import Employee from "../employee/employee.model.js";
import Appointment from "../appointment/appointment.model.js";

// ✅ 1. CAMPAIGN REPORT
export const getCampaignReport = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/reports/campaign");

    const campaigns = await Campaign.find()
      .populate("leads")
      .populate("appointments");

    const campaignReport = await Promise.all(
      campaigns.map(async (campaign) => {
        const totalLeads = campaign.leads ? campaign.leads.length : 0;
        const totalAppointments = campaign.appointments
          ? campaign.appointments.length
          : 0;
        const conversionRate =
          totalLeads > 0 ? ((totalAppointments / totalLeads) * 100).toFixed(2) : 0;
        const costPerLead = totalLeads > 0 ? (campaign.budget / totalLeads).toFixed(2) : 0;

        return {
          campaign_id: campaign.campaign_id || campaign._id,
          channelName: campaign.channelName,
          channel: campaign.channel,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          budget: campaign.budget || 0,
          totalLeads,
          totalAppointments,
          conversionRate: `${conversionRate}%`,
          costPerLead,
          createdAt: campaign.createdAt,
          updatedAt: campaign.updatedAt,
        };
      })
    );

    const totalBudget = campaignReport.reduce((sum, c) => sum + c.budget, 0);
    const totalLeads = campaignReport.reduce((sum, c) => sum + c.totalLeads, 0);
    const totalAppointments = campaignReport.reduce(
      (sum, c) => sum + c.totalAppointments,
      0
    );

    console.log("✅ Campaign report generated");

    return res.status(200).json({
      status: true,
      message: "Campaign report fetched successfully",
      summary: {
        totalCampaigns: campaignReport.length,
        totalBudget,
        totalLeads,
        totalAppointments,
        overallConversionRate:
          totalLeads > 0 ? ((totalAppointments / totalLeads) * 100).toFixed(2) : 0,
      },
      data: campaignReport,
    });
  } catch (error) {
    console.error("❌ Error fetching campaign report:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch campaign report",
    });
  }
};

// ✅ 2. LEADS REPORT
export const getLeadsReport = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/reports/leads");

    const leads = await Lead.find().populate("campaign");

    const leadsReport = leads.map((lead) => ({
      lead_id: lead.lead_id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      gender: lead.gender || "N/A",
      age: lead.age || "N/A",
      source: lead.source || "Direct",
      status: lead.status || "new",
      treatment: lead.treatment || "N/A",
      campaignName: lead.campaign?.channelName || "Direct",
      followUpCount: lead.follow_up ? lead.follow_up.length : 0,
      lastFollowUp: lead.follow_up && lead.follow_up.length > 0
        ? lead.follow_up[lead.follow_up.length - 1].follow_up_date
        : null,
      documentCount: lead.documents ? lead.documents.length : 0,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    }));

    const statusSummary = {
      new: leadsReport.filter((l) => l.status === "new").length,
      contacted: leadsReport.filter((l) => l.status === "contacted").length,
      converted: leadsReport.filter((l) => l.status === "converted").length,
      lost: leadsReport.filter((l) => l.status === "lost").length,
    };

    const sourceSummary = {};
    leadsReport.forEach((lead) => {
      sourceSummary[lead.source] = (sourceSummary[lead.source] || 0) + 1;
    });

    console.log("✅ Leads report generated");

    return res.status(200).json({
      status: true,
      message: "Leads report fetched successfully",
      summary: {
        totalLeads: leadsReport.length,
        statusSummary,
        sourceSummary,
      },
      data: leadsReport,
    });
  } catch (error) {
    console.error("❌ Error fetching leads report:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch leads report",
    });
  }
};

// ✅ APPOINTMENTS REPORT (OPD / IPD, incl. bulk-uploaded historical data)
export const getAppointmentsReport = async (req, res) => {
  try {
    const { type, from, to, doctor, bd, hospital } = req.query;

    const match = {};
    if (type && ["OPD", "IPD"].includes(type.toUpperCase())) match.patient_type = type.toUpperCase();
    if (doctor) match.surgeon_name = doctor;
    if (bd) match.bd_name = bd;
    if (hospital) match.hospital_name = hospital;
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(`${from}T00:00:00`);
      if (to) match.createdAt.$lte = new Date(`${to}T23:59:59.999`);
    }

    const appointments = await Appointment.find(match).sort({ createdAt: -1 }).lean();

    const rows = appointments.map((a) => ({
      token_id: a.token_id,
      type: a.patient_type,
      number: a.patient_type === "IPD" ? a.ipd_number : a.opd_number,
      date: a.createdAt,
      month: a.month || "",
      patient_name: a.patient_name,
      phone: a.phone || "",
      city: a.city || "",
      treatment: a.treatment || "",
      category: a.category || "",
      doctor: a.surgeon_name || "",
      hospital: a.hospital_name || "",
      lead_source: a.lead_source || "",
      bd_name: a.bd_name || "",
      payment_mode: a.payment_mode || "",
      ipd_status: a.ipd_status || "",
      lead_id: a.lead_id || "",
      linked_lead: a.lead ? "Yes" : "No",
    }));

    const opd = rows.filter((r) => r.type === "OPD");
    const ipd = rows.filter((r) => r.type === "IPD");

    return res.status(200).json({
      status: true,
      message: "Appointments report fetched successfully",
      summary: {
        total: rows.length,
        opdCount: opd.length,
        ipdCount: ipd.length,
      },
      data: rows,
    });
  } catch (error) {
    console.error("❌ Error fetching appointments report:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// ✅ 3. HR REPORT
export const getHRReport = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/reports/hr");

    const employees = await Employee.find();

    const hrReport = employees.map((emp) => ({
      employee_id: emp.employee_id,
      name: emp.name,
      email: emp.email,
      jobTitle: emp.jobTitle,
      department: emp.department,
      status: emp.status || "Active",
      role_name: emp.role_name || "Not Assigned",
      category_name: emp.category_name || "Not Assigned",
      wfhApproved: emp.wfhApproved || false,
      ctc: emp.ctc || 0,
      leaveBalance: emp.leaveBalance || 0,
      lastlogin: emp.lastlogin,
      createdAt: emp.createdAt,
    }));

    const departmentSummary = {};
    hrReport.forEach((emp) => {
      departmentSummary[emp.department || "Unassigned"] =
        (departmentSummary[emp.department || "Unassigned"] || 0) + 1;
    });

    const statusSummary = {
      active: hrReport.filter((e) => e.status === "Active").length,
      inactive: hrReport.filter((e) => e.status === "Inactive").length,
      onLeave: hrReport.filter((e) => e.status === "On Leave").length,
    };

    const wfhApprovedCount = hrReport.filter((e) => e.wfhApproved).length;
    const totalCTC = hrReport.reduce((sum, e) => sum + e.ctc, 0);

    console.log("✅ HR report generated");

    return res.status(200).json({
      status: true,
      message: "HR report fetched successfully",
      summary: {
        totalEmployees: hrReport.length,
        statusSummary,
        departmentSummary,
        wfhApprovedCount,
        totalCTC,
        averageCTC: (totalCTC / hrReport.length).toFixed(2),
      },
      data: hrReport,
    });
  } catch (error) {
    console.error("❌ Error fetching HR report:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch HR report",
    });
  }
};

// ✅ 4. HOSPITAL REPORT
export const getHospitalReport = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/reports/hospital");

    const hospitals = await Hospital.find();

    const hospitalReport = hospitals.map((hospital) => ({
      _id: hospital._id,
      hospital_name: hospital.hospital_name,
      city: hospital.city,
      address: hospital.address,
      specialization: hospital.specialization,
      contact: hospital.contact,
      status: hospital.status,
      overdue: hospital.overdue || 0,
      age: hospital.age || "N/A",
      weight: hospital.weight || "N/A",
      circle: hospital.circle || "N/A",
      notes: hospital.notes || "",
      createdAt: hospital.createdAt,
      updatedAt: hospital.updatedAt,
    }));

    const statusSummary = {
      active: hospitalReport.filter((h) => h.status === "active").length,
      inactive: hospitalReport.filter((h) => h.status === "inactive").length,
    };

    const citySummary = {};
    hospitalReport.forEach((h) => {
      citySummary[h.city] = (citySummary[h.city] || 0) + 1;
    });

    const specializationSummary = {};
    hospitalReport.forEach((h) => {
      specializationSummary[h.specialization] =
        (specializationSummary[h.specialization] || 0) + 1;
    });

    const totalOverdue = hospitalReport.reduce((sum, h) => sum + h.overdue, 0);

    console.log("✅ Hospital report generated");

    return res.status(200).json({
      status: true,
      message: "Hospital report fetched successfully",
      summary: {
        totalHospitals: hospitalReport.length,
        statusSummary,
        citySummary,
        specializationSummary,
        totalOverdue,
      },
      data: hospitalReport,
    });
  } catch (error) {
    console.error("❌ Error fetching hospital report:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch hospital report",
    });
  }
};

// ✅ 5. DOCTOR REPORT
export const getDoctorReport = async (req, res) => {
  try {
    console.log("📥 API Call: GET /api/reports/doctor");

    const doctors = await Doctor.find();

    const doctorReport = doctors.map((doctor) => ({
      _id: doctor._id,
      doctor_name: doctor.doctor_name,
      city: doctor.city,
      experience: doctor.experience,
      specialization: doctor.specialization,
      contact: doctor.contact,
      status: doctor.status,
      pending_payment: doctor.pending_payment || 0,
      age: doctor.age || "N/A",
      weight: doctor.weight || "N/A",
      circle: doctor.circle || "N/A",
      notes: doctor.notes || "",
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    }));

    const statusSummary = {
      active: doctorReport.filter((d) => d.status === "active").length,
      inactive: doctorReport.filter((d) => d.status === "inactive").length,
      onLeave: doctorReport.filter((d) => d.status === "on_leave").length,
    };

    const citySummary = {};
    doctorReport.forEach((d) => {
      citySummary[d.city] = (citySummary[d.city] || 0) + 1;
    });

    const specializationSummary = {};
    doctorReport.forEach((d) => {
      specializationSummary[d.specialization] =
        (specializationSummary[d.specialization] || 0) + 1;
    });

    const totalPendingPayment = doctorReport.reduce(
      (sum, d) => sum + d.pending_payment,
      0
    );

    const averageExperience = (
      doctorReport.reduce((sum, d) => sum + d.experience, 0) / doctorReport.length
    ).toFixed(1);

    console.log("✅ Doctor report generated");

    return res.status(200).json({
      status: true,
      message: "Doctor report fetched successfully",
      summary: {
        totalDoctors: doctorReport.length,
        statusSummary,
        citySummary,
        specializationSummary,
        totalPendingPayment,
        averageExperience,
      },
      data: doctorReport,
    });
  } catch (error) {
    console.error("❌ Error fetching doctor report:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch doctor report",
    });
  }
};

// ✅ EXPORT ALL FUNCTIONS
export default {
  getCampaignReport,
  getLeadsReport,
  getHRReport,
  getHospitalReport,
  getDoctorReport,
};
