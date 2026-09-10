import Role from "./role.model.js";

class RoleService {
  static async getRolesByCategory(categoryId) {
    return await Role.find({
      category_id: categoryId,
    }).sort({ role_name: 1 });
  }

  static async createRole(data) {
    return await Role.create(data);
  }

    static async getAllRoles() {
    return await Role.find().sort({ createdAt: -1 });
  }

static async getByDeptCategoryRole(department_id, category_id, role_id) {
  return RoleModel.findOne({
    department_id,
    category_id,
     role_id, // Mongo _id
  });
}

static async deleteRoleById(id) {
  return await Role.findByIdAndDelete(id);
}

}



export default RoleService;
