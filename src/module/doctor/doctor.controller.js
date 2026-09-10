import DoctorService from "./doctor.service.js";


export const addDoctor = async (req, res) => {
  try {
    const data = await DoctorService.AddDoctor(req.body);
    res.status(201).json({ status: true, message: "Doctor created", data });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const data = await DoctorService.getAllDoctors();
    res.status(200).json({ status: true, data });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await DoctorService.getDoctorById(req.params.id);
    if (!doctor) return res.status(404).json({ status: false, message: "Doctor not found" });
    res.status(200).json({ status: true, data: doctor });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const data = await DoctorService.updateDoctor(req.params._id, req.body);
    if (!data) return res.status(404).json({ status: false, message: "Doctor not found" });
    res.status(200).json({ status: true, message: "Doctor updated", data });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
export const deleteDoctor= async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DoctorService.deleteDoctor(id);
    res.status(200).json(result);
  } catch (err) {
    console.error("Delete doctor error:", err);
    res.status(400).json({ message: err.message || "Failed to delete doctor" });
  }
};
