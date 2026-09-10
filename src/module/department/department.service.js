import DepartmentModel from "./department.model.js";
import logger from "../../config/logger.js";

class DepartmentService {
  static async addDepartment(data) {
    return await DepartmentModel.create(data);
  }

  static async getAll() {
    return await DepartmentModel.find().sort({ createdAt: -1 });
  }
  static async deleteById(id) {
  return await DepartmentModel.findByIdAndDelete(id);
}
}

export default DepartmentService;
