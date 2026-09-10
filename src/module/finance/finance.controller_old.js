// File: src/module/finance/finance.controller.js
import Invoice from "./invoice.model.js";
import Payment from "./payment.model.js";
import DoctorPayout from "./doctorPayout.model.js";
import HospitalRevenueShare from "../hospital/hospitalRevenue.model.js";
import DoctorRevenueShare from "../doctor/doctorRevenue.model.js";
import Appointment from "../appointment/appointment.model.js";
import HospitalModel from "../hospital/hospital.model.js";
import DoctorModel from "../doctor/doctor.model.js";

// ========================================
// NEW API: CALCULATE REVENUE BREAKUP
// (Before creating invoice)
// ========================================

export const calculateRevenueBreakup = async (req, res) => {
  try {
    const {
      appointment_id,
      total_amount,
    } = req.body;

    console.log("🔄 Calculating revenue breakup for:");
    console.log("   Appointment ID:", appointment_id);
    console.log("   Total Amount:", total_amount);

    // Fetch appointment
    const appointment = await Appointment.findById(appointment_id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: "Appointment not found" 
      });
    }

    console.log("✅ Appointment found");
    console.log("   Hospital Name:", appointment.hospital_name);
    console.log("   Doctor Name:", appointment.surgeon_name);

    // ==========================================
    // LOOKUP HOSPITAL BY NAME
    // ==========================================
    const hospital = await HospitalModel.findOne({
      hospital_name: { $regex: appointment.hospital_name, $options: "i" }
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: `Hospital "${appointment.hospital_name}" not found in system. Please add it first.`,
        type: "HOSPITAL_NOT_FOUND",
      });
    }

    console.log("✅ Hospital found:", hospital._id, "-", hospital.hospital_name);

    // ==========================================
    // GET HOSPITAL REVENUE CONFIG
    // ==========================================
    const hospitalRevenue = await HospitalRevenueShare.findOne({
      hospital_id: hospital._id,
    });

    if (!hospitalRevenue) {
      return res.status(400).json({
        success: false,
        message: `Hospital revenue share not configured for "${hospital.hospital_name}". Please configure it first.`,
        type: "HOSPITAL_CONFIG_MISSING",
        hospital_id: hospital._id,
      });
    }

    console.log("✅ Hospital revenue config found");

    // ==========================================
    // LOOKUP DOCTOR BY NAME
    // ==========================================
    const doctor = await DoctorModel.findOne({
      doctor_name: { $regex: appointment.surgeon_name, $options: "i" }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `Doctor "${appointment.surgeon_name}" not found in system. Please add it first.`,
        type: "DOCTOR_NOT_FOUND",
      });
    }

    console.log("✅ Doctor found:", doctor._id, "-", doctor.doctor_name);

    // ==========================================
    // GET DOCTOR REVENUE CONFIG
    // ==========================================
    const doctorRevenue = await DoctorRevenueShare.findOne({
      doctor_id: doctor._id,
    });

    if (!doctorRevenue) {
      return res.status(400).json({
        success: false,
        message: `Doctor revenue share not configured for "${doctor.doctor_name}". Please configure it first.`,
        type: "DOCTOR_CONFIG_MISSING",
        doctor_id: doctor._id,
      });
    }

    console.log("✅ Doctor revenue config found");

    // ==========================================
    // CALCULATE REVENUE BREAKUP
    // ==========================================
    const hospitalShare = {
      percentage: hospitalRevenue.hospital_share_percentage,
      amount: (total_amount * hospitalRevenue.hospital_share_percentage) / 100,
    };

    const doctorShareGross = (total_amount * hospitalRevenue.doctor_share_percentage) / 100;
    const doctorTDS = (doctorShareGross * doctorRevenue.tds_percentage) / 100;
    const doctorShareNet = doctorShareGross - doctorTDS;

    const doctorShare = {
      percentage: hospitalRevenue.doctor_share_percentage,
      gross_amount: doctorShareGross,
      tds_percentage: doctorRevenue.tds_percentage,
      tds_amount: doctorTDS,
      net_amount: doctorShareNet,
    };

    const optimumShare = {
      percentage: hospitalRevenue.optimum_share_percentage,
      amount: (total_amount * hospitalRevenue.optimum_share_percentage) / 100,
    };

    console.log("✅ Revenue calculation complete");

    res.status(200).json({
      success: true,
      message: "Revenue breakup calculated successfully",
      data: {
        total_amount,
        hospital_id: hospital._id,
        hospital_name: hospital.hospital_name,
        doctor_id: doctor._id,
        doctor_name: doctor.doctor_name,
        hospital_share: hospitalShare,
        doctor_share: doctorShare,
        optimum_share: optimumShare,
        verification: {
          total_distributed: 
            hospitalShare.amount + doctorShareNet + optimumShare.amount,
          total_original: total_amount,
          matches: 
            Math.abs((hospitalShare.amount + doctorShareNet + optimumShare.amount) - total_amount) < 0.01,
        }
      },
    });
  } catch (error) {
    console.error("❌ Error calculating revenue:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// 1. CREATE INVOICE (After Appointment Completion)
// ========================================

export const createInvoice = async (req, res) => {
  try {
    const {
      appointment_id,
      total_amount,
      description,
      notes,
    } = req.body;

    // Fetch appointment details
    const appointment = await Appointment.findById(appointment_id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // ==========================================
    // LOOKUP HOSPITAL BY NAME
    // ==========================================
    const hospital = await HospitalModel.findOne({
      hospital_name: { $regex: appointment.hospital_name, $options: "i" }
    });

    if (!hospital) {
      return res.status(404).json({
        message: `Hospital "${appointment.hospital_name}" not found`,
      });
    }

    // Fetch hospital revenue share config
    const hospitalRevenue = await HospitalRevenueShare.findOne({
      hospital_id: hospital._id,
    });

    if (!hospitalRevenue) {
      return res.status(400).json({
        message: "Hospital revenue share not configured. Please set it up first.",
      });
    }

    // ==========================================
    // LOOKUP DOCTOR BY NAME
    // ==========================================
    const doctor = await DoctorModel.findOne({
      doctor_name: { $regex: appointment.surgeon_name, $options: "i" }
    });

    if (!doctor) {
      return res.status(404).json({
        message: `Doctor "${appointment.surgeon_name}" not found`,
      });
    }

    // Fetch doctor revenue share config
    const doctorRevenue = await DoctorRevenueShare.findOne({
      doctor_id: doctor._id,
    });

    if (!doctorRevenue) {
      return res.status(400).json({
        message: "Doctor revenue share not configured. Please set it up first.",
      });
    }

    // Calculate revenue shares
    const hospitalShare = {
      percentage: hospitalRevenue.hospital_share_percentage,
      amount: (total_amount * hospitalRevenue.hospital_share_percentage) / 100,
    };

    const doctorShareGross = (total_amount * hospitalRevenue.doctor_share_percentage) / 100;
    const doctorTDS = (doctorShareGross * doctorRevenue.tds_percentage) / 100;
    const doctorShareNet = doctorShareGross - doctorTDS;

    const doctorShare = {
      percentage: hospitalRevenue.doctor_share_percentage,
      gross_amount: doctorShareGross,
      tds_percentage: doctorRevenue.tds_percentage,
      tds_amount: doctorTDS,
      net_amount: doctorShareNet,
    };

    const optimumShare = {
      percentage: hospitalRevenue.optimum_share_percentage,
      amount: (total_amount * hospitalRevenue.optimum_share_percentage) / 100,
    };

    // Generate invoice number (INV-YYYYMM-0001)
    const currentDate = new Date();
    const yearMonth = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    const lastInvoice = await Invoice.findOne({
      invoice_number: new RegExp(`^INV-${yearMonth}`),
    }).sort({ invoice_number: -1 });

    const invoiceCount = lastInvoice
      ? parseInt(lastInvoice.invoice_number.split("-")[2]) + 1
      : 1;
    const invoiceNumber = `INV-${yearMonth}-${String(invoiceCount).padStart(4, "0")}`;

    // Create invoice
    const invoice = new Invoice({
      invoice_number: invoiceNumber,
      appointment_id,
      appointment_type: appointment.patient_type,
      patient_name: appointment.patient_name,
      patient_id: appointment.opd_number || appointment.ipd_number,
      hospital_id: hospital._id,
      hospital_name: appointment.hospital_name,
      doctor_id: doctor._id,
      doctor_name: appointment.surgeon_name,
      treatment: appointment.treatment,
      total_amount,
      hospital_share: hospitalShare,
      doctor_share: doctorShare,
      optimum_share: optimumShare,
      description,
      notes,
      createdBy: req.user?._id,
    });

    await invoice.save();

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// 2. GET ALL INVOICES (Finance Dashboard)
// ========================================

// ✅ FIXED: Improved getAllInvoices with better error handling
export const getAllInvoices = async (req, res) => {
  try {
    const { status, hospital_id, doctor_id, start_date, end_date } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (hospital_id) filter.hospital_id = hospital_id;
    if (doctor_id) filter.doctor_id = doctor_id;

    if (start_date || end_date) {
      filter.invoice_date = {};
      if (start_date) filter.invoice_date.$gte = new Date(start_date);
      if (end_date) filter.invoice_date.$lte = new Date(end_date);
    }

    console.log("📋 Fetching invoices with filter:", filter);

    // ✅ SIMPLIFIED: Don't populate - invoice already has all needed data
    // Invoice schema stores: hospital_name, doctor_name, patient_name directly
    // No need to populate references
    const invoices = await Invoice.find(filter)
      .sort({ invoice_date: -1 })
      .lean(); // Use lean for faster queries

    console.log("✅ Invoices fetched:", invoices.length);

    res.status(200).json({
      success: true,
      message: "Invoices retrieved successfully",
      data: invoices,
      total: invoices.length,
    });
  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ========================================
// 3. GET INVOICE DETAILS
// ========================================

export const getInvoiceDetails = async (req, res) => {
  try {
    const { invoice_id } = req.params;

    // ✅ FIXED: Don't populate - invoice already has all needed data
    const invoice = await Invoice.findById(invoice_id).lean();

    if (!invoice) {
      return res.status(404).json({ 
        success: false,
        message: "Invoice not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice details retrieved",
      data: invoice,
    });
  } catch (error) {
    console.error("Error fetching invoice details:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ========================================
// 4. RECORD PAYMENT (Hospital Pays Optimum)
// ========================================

export const recordPayment = async (req, res) => {
  try {
    const {
      invoice_id,
      amount_received,
      payment_method,
      reference_number,
      notes,
    } = req.body;

    const invoice = await Invoice.findById(invoice_id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Create payment record
    const payment = new Payment({
      invoice_id,
      amount_received,
      payment_method,
      reference_number,
      notes,
      received_date: new Date(),
      received_by: req.user?._id,
    });

    await payment.save();

    // Update invoice status to RECEIVED
    invoice.status = "RECEIVED";
    await invoice.save();

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// 5. GET PAYMENTS
// ========================================

export const getPayments = async (req, res) => {
  try {
    const { invoice_id, start_date, end_date } = req.query;

    let filter = {};
    if (invoice_id) filter.invoice_id = invoice_id;

    if (start_date || end_date) {
      filter.received_date = {};
      if (start_date) filter.received_date.$gte = new Date(start_date);
      if (end_date) filter.received_date.$lte = new Date(end_date);
    }

    const payments = await Payment.find(filter)
      .populate("invoice_id")
      .sort({ received_date: -1 });

    res.status(200).json({
      success: true,
      message: "Payments retrieved successfully",
      data: payments,
      total: payments.length,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// 6. CREATE DOCTOR PAYOUT
// ========================================

export const createDoctorPayout = async (req, res) => {
  try {
    const {
      doctor_id,
      invoices,
      gross_amount,
      tds_amount,
      net_amount,
      payment_method,
      notes,
    } = req.body;

    const payout = new DoctorPayout({
      doctor_id,
      invoices,
      gross_amount,
      tds_amount,
      net_amount,
      payment_method,
      notes,
      payout_date: new Date(),
      status: "PENDING",
      processed_by: req.user?._id,
    });

    await payout.save();

    res.status(201).json({
      success: true,
      message: "Doctor payout created successfully",
      data: payout,
    });
  } catch (error) {
    console.error("Error creating payout:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// 7. GET DOCTOR PAYOUTS
// ========================================

export const getDoctorPayouts = async (req, res) => {
  try {
    const { doctor_id, status } = req.query;

    let filter = {};
    if (doctor_id) filter.doctor_id = doctor_id;
    if (status) filter.status = status;

    const payouts = await DoctorPayout.find(filter)
      .populate("doctor_id")
      .populate("invoices")
      .sort({ payout_date: -1 });

    res.status(200).json({
      success: true,
      message: "Payouts retrieved successfully",
      data: payouts,
      total: payouts.length,
    });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// 8. UPDATE PAYOUT STATUS
// ========================================

export const updatePayoutStatus = async (req, res) => {
  try {
    const { payout_id } = req.params;
    const { status } = req.body;

    const payout = await DoctorPayout.findByIdAndUpdate(
      payout_id,
      { status },
      { new: true }
    );

    if (!payout) {
      return res.status(404).json({ message: "Payout not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payout status updated",
      data: payout,
    });
  } catch (error) {
    console.error("Error updating payout:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========================================
// 9. GET FINANCE SUMMARY (Dashboard)
// ========================================

export const getFinanceSummary = async (req, res) => {
  try {
    const totalInvoices = await Invoice.countDocuments();
    const totalAmount = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$total_amount" },
        },
      },
    ]);

    const receivedPayments = await Payment.countDocuments();
    const receivedAmount = await Payment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount_received" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Finance summary retrieved",
      data: {
        total_invoices: totalInvoices,
        total_invoice_amount: totalAmount[0]?.total || 0,
        total_payments_received: receivedPayments,
        total_amount_received: receivedAmount[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ message: error.message });
  }
};
