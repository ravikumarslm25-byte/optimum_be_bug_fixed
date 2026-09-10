import HospitalService from "./hospital.service.js";

export const addHospital = async (req, res) => {
  try {
    const data = await HospitalService.AddHospital(req.body);
    res.status(201).json({ status: true, message: "hospital created", data });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

export const getAllHospitals = async (req, res) => {
  try {
    const data = await HospitalService.getAllHospitals();
    res.status(200).json({ status: true, data });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export const getHospitalById = async (req, res) => {
  try {
    const doctor = await HospitalService.getHospitalById(req.params.id);
    if (!doctor)
      return res
        .status(404)
        .json({ status: false, message: "hospital not found" });
    res.status(200).json({ status: true, data: doctor });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export const updateHospital = async (req, res) => {
  try {
    const data = await HospitalService.updateHospital(req.params._id, req.body);
    if (!data)
      return res
        .status(404)
        .json({ status: false, message: "hospital not found" });
    res.status(200).json({ status: true, message: "hospital updated", data });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
export const deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await HospitalService.deleteHospital(id);
    res.status(200).json(result);
  } catch (err) {
    console.error("Delete hospital error:", err);
    res
      .status(400)
      .json({ message: err.message || "Failed to delete hospital" });
  }
};
