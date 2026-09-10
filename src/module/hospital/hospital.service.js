import HospitalModel from "./hospital.model.js";

class HospitalService {
  static async AddHospital(hospitalData) {
    const doctor = new HospitalModel({
      ...hospitalData,
    });
    return await doctor.save();
  }

  static async getAllHospitals() {
    return await HospitalModel.find().sort({ createdAt: -1 });
  }
  static async getHospitalById(id) {
    return await HospitalModel.findById(id);
  }
  static async updateHospital(_id, updateData) {
    return await HospitalModel.findOneAndUpdate(
      { _id },
      { $set: updateData },
      { new: true }
    );
  }
  static async deleteHospital(id) {
    const doctor = await HospitalModel.findById(id);
    if (!doctor) {
      throw new Error("Hospital not found");
    }
    await HospitalModel.findByIdAndDelete(id);
    return { message: "Hospital deleted successfully" };
  }
}

export default HospitalService;
