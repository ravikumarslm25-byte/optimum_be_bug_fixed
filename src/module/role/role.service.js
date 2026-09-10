import RoleModel from "./role.model.js";
import logger from "../../config/logger.js";
import EmployeeModel from "../employee/employee.model.js";

class RoleService {
  static async addRole(roleData) {
    try {
      const newRole = new RoleModel(roleData);
      return await newRole.save();
    } catch (error) {
      logger.error("Error adding role: " + error);
      throw error;
    }
  }

  static async getRolesById(roleId) {
    try {
      return await RoleModel.findOne({ role_id: roleId });
    } catch (error) {
      logger.error("Error getting role by ID: " + error);
      throw error;
    }
  }

  static async getAllRoles(filters = {}) {
    try {
      return await RoleModel.find(filters).sort({ createdAt: -1 });
    } catch (error) {
      logger.error("Error getting all roles: " + error);
      throw error;
    }
  }

  static async getRolesByDeptCat(department_id, category_id) {
    try {
      return await RoleModel.find({
        department_id,
        category_id,
        status: "ACTIVE",
      });
    } catch (error) {
      logger.error("Error getting roles by dept & category: " + error);
      throw error;
    }
  }

  static async updateRole(role_id, updatedData) {
    try {
      return await RoleModel.findOneAndUpdate({ role_id }, { $set: updatedData }, { new: true });
    } catch (error) {
      logger.error("Error updating role: " + error);
      throw error;
    }
  }

  static async deleteRole(role_id) {
    try {
      const deletedRole = await RoleModel.findOneAndDelete({ role_id });
      if (!deletedRole) throw new Error("Role not found");

      // Unassign role from employees
      await EmployeeModel.updateMany(
        { role_id },
        { $unset: { role_id: "", role_name: "" } }
      );

      return deletedRole;
    } catch (error) {
      logger.error("Error deleting role: " + error);
      throw error;
    }
  }
}

export default RoleService;
