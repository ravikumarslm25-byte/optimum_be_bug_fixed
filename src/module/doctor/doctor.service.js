import DoctorModel from "./doctor.model.js";

class DoctorService {
  static async AddDoctor(doctorData) {
    const doctor = new DoctorModel({
      ...doctorData,
    });
    return await doctor.save();
  }

  static async getAllDoctors() {
    return await DoctorModel.find().sort({ createdAt: -1 });
  }
  static async getDoctorById(id) {
    return await DoctorModel.findById(id);
  }
  static async updateDoctor(_id, updateData) {
    return await DoctorModel.findOneAndUpdate(
      { _id },
      { $set: updateData },
      { new: true }
    );
  }
  static async deleteDoctor(id) {
    const doctor = await DoctorModel.findById(id);
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    await DoctorModel.findByIdAndDelete(id);
    return { message: "Doctor deleted successfully" };
  }
}

export default DoctorService;
