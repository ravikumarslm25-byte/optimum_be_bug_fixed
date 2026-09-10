import { generatePassword } from "../../../utils/generatePassword.js";
import { isWithinOffice } from "../../config/VerifyLocation.js";
import IdcodeServices from "../idcode/idcode.service.js";
import RoleModel from "../role/role.model.js";
import TaskModel from "../task/task.model.js";
import EmployeeModel from "./employee.model.js";
import bcrypt from "bcryptjs";

// Attendance configuration
const CUTOFF_HOUR = 10; // 10 AM, change as needed
const GRACE_MINUTES = 15;
const ABSENT_HOUR = 20; // 11 PM, mark absent if not logged in by this hour

function maskEmail(email) {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return "****";
  if (user.length <= 2) return `**@${domain}`;
  const first = user.slice(0, 1);
  return `${first}*****@${domain}`;
}

class EmployeeService {
  // ---------------------- Employee CRUD ----------------------
  static async addEmployee(employeeData) {
    const idname = "EMPLOYEE";
    const idcode = "EMP";
    await IdcodeServices.addIdCode(idname, idcode);
    const employee_id = await IdcodeServices.generateCode(idname);
    if (!employee_id) throw new Error("Failed to generate employee ID");

    const employee = new EmployeeModel({
      employee_id,
      ...employeeData,
      // ✅ Ensure role fields default to null if not provided
      role_id: employeeData.role_id || null,
      role_name: employeeData.role_name || null,
      category: employeeData.category || null,
      password: employeeData.password || null,
    });

    await employee.save();

    return {
      message: "Employee created successfully",
      employee: {
        id: employee._id,
        employee_id: employee.employee_id,
        name: employee.name,
        role_id: employee.role_id,
        role_name: employee.role_name,
      },
    };
  }

  /**
   * ✅ LOGIN EMPLOYEE
   * 
   * Checks:
   * - Employee exists
   * - Role is assigned (role_id exists)
   * - Password is set
   * - Password is correct
   */
  static async loginEmployee(data) {
    const { identifier, password, location } = data;

    const employee = await EmployeeModel.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!employee) throw new Error("Employee not found");
    
    // ✅ CHECK: Role must be assigned
    if (!employee.role_id) {
      throw new Error("Role not assigned yet. Please contact admin.");
    }

    const role = await RoleModel.findOne({ role_id: employee.role_id });
    if (!role) throw new Error("Role data not found");

    // ✅ CHECK: Password must be set
    if (!employee.password) {
      throw new Error("Employee has no password assigned");
    }

    // ✅ Verify password (hashed)
    const isValid = await bcrypt.compare(password, employee.password);
    if (!isValid) throw new Error("Invalid password");

    const previousLogin = employee.lastlogin || null;
    const now = new Date();
    employee.lastlogin = now;

    // ✅ ATTENDANCE TRACKING
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    let todayAttendance = employee.daily_attendance?.find(
      (att) => att.date.toISOString().split("T")[0] === todayStr
    );

    if (!todayAttendance) {
      const cutoffTime = new Date(now);
      cutoffTime.setHours(CUTOFF_HOUR, GRACE_MINUTES, 0, 0);

      const absentTime = new Date(now);
      absentTime.setHours(ABSENT_HOUR, 0, 0, 0);

      if (now <= cutoffTime) {
        todayAttendance = {
          date: now,
          present: true,
          remarks: "Login on time",
        };
      } else if (now > cutoffTime && now < absentTime) {
        todayAttendance = { date: now, present: true, remarks: "Late" };
      } else {
        todayAttendance = { date: now, present: false, remarks: "Absent" };
      }

      if (!employee.daily_attendance) employee.daily_attendance = [];
      employee.daily_attendance.push(todayAttendance);
    }

    await employee.save();

    const empId = employee.employee_id.trim();
    const tasks = await TaskModel.find({
      assigned_to: { $regex: `^${empId}$`, $options: "i" },
    });

    // ✅ OFFICE LOCATION CHECK
    // Location check applies to:
    // - Non-admin employees
    // - Without WFT (Work From Anywhere) permission
    // - Without WFH (Work From Home) approval
    
    if (employee.department?.toLowerCase() !== "admin") {
      // ✅ If WFT is true, employee can login from anywhere
      if (employee.wft) {
        console.log("✅ WFT enabled - skipping location check");
      }
      // ✅ Else if WFH is approved, employee can login from anywhere
      else if (employee.wfhApproved) {
        console.log("✅ WFH approved - skipping location check");
      }
      // ✅ Otherwise, check office location (20-25 meter radius)
      else {
        if (!location) throw new Error("Location required for office login");
        
        // Check if office location is set in employee record
        if (
          !employee.officeLocation ||
          employee.officeLocation.lat === 0 ||
          employee.officeLocation.lng === 0
        ) {
          throw new Error(
            "Employee office location not configured. Cannot verify office login. Contact admin to set office location."
          );
        }

        const { lat: userLat, lng: userLng } = location;
        const { lat: officeLat, lng: officeLng } = employee.officeLocation;

        // ✅ DETAILED DEBUG LOGGING
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📍 LOCATION VERIFICATION DEBUG");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        console.log("\n🌍 DATABASE - OFFICE LOCATION:");
        console.log(`   Latitude (lat):  ${officeLat}`);
        console.log(`   Longitude (lng): ${officeLng}`);
        console.log(`   Type (lat): ${typeof officeLat}`);
        console.log(`   Type (lng): ${typeof officeLng}`);
        
        console.log("\n📱 BROWSER - CURRENT USER LOCATION:");
        console.log(`   Latitude (lat):  ${userLat}`);
        console.log(`   Longitude (lng): ${userLng}`);
        console.log(`   Type (lat): ${typeof userLat}`);
        console.log(`   Type (lng): ${typeof userLng}`);
        
        console.log("\n🔍 COMPARISON:");
        console.log(`   Database lat === Browser lat: ${officeLat === userLat}`);
        console.log(`   Database lng === Browser lng: ${officeLng === userLng}`);
        
        console.log("\n📏 DIFFERENCE:");
        const latDiff = Math.abs(officeLat - userLat);
        const lngDiff = Math.abs(officeLng - userLng);
        console.log(`   Latitude difference:  ${latDiff}`);
        console.log(`   Longitude difference: ${lngDiff}`);
        
        console.log("\n⚙️ DISTANCE CALCULATION:");
        
        // ✅ UPDATED: Radius changed to 0.1 km (100m)
        // This allows login within 100 meter radius of office location
        const OFFICE_RADIUS_KM = 0.1; // 100 meters in km
        console.log(`   Allowed radius: ${OFFICE_RADIUS_KM} km (${OFFICE_RADIUS_KM * 1000} meters)`);
        
        const allowed = isWithinOffice(
          userLat,
          userLng,
          officeLat,
          officeLng,
          OFFICE_RADIUS_KM
        );
        
        // Calculate actual distance for logging
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(userLat - officeLat);
        const dLng = toRad(userLng - officeLng);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(officeLat)) *
            Math.cos(toRad(userLat)) *
            Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        const distanceMeters = distance * 1000;
        
        console.log(`   Calculated distance: ${distance.toFixed(4)} km (${distanceMeters.toFixed(0)} meters)`);
        
        console.log("\n✅ RESULT:");
        console.log(`   Within 100m radius: ${allowed}`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
        if (!allowed) {
          throw new Error(
            `Login allowed only within office location (100 meter radius). Current distance: ${distanceMeters.toFixed(0)}m. Please move closer to office location or enable WFT/WFH.`
          );
        }
        
        console.log("✅ Location verified - within office radius");
      }
    } else {
      console.log("✅ Admin user - skipping office location check");
    }

    return {
      message: "Login successful",
      employee: {
        id: employee._id,
        employee_id: employee.employee_id,
        name: employee.name,
        email: maskEmail(employee.email),
        role: {
          role_id: role.role_id,
          role_name: role.role_name,
          accessLevels: role.accessLevels,
          department_name: role.department_name,
          category_name: role.category_name,
        },
        department: employee.department,
        wfhApproved: employee.wfhApproved,
        wft: employee.wft,
        officeLocation: employee.officeLocation,
        status: employee.status,
        tasks,
        lastlogin: previousLogin,
      },
    };
  }

  // ---------------------- Get Methods ----------------------
  static async getAllEmployees() {
    return await EmployeeModel.find().sort({ createdAt: -1 });
  }

  static async getEmployeeById(employee_id) {
    return await EmployeeModel.findOne({ employee_id });
  }

  static async getActiveEmployees() {
    return await EmployeeModel.find({ status: "Active" });
  }

  /**
   * ✅ UPDATE EMPLOYEE
   * 
   * Used for:
   * - Basic employee info (job title, department, etc.)
   * - User Management: Assigning role and password
   * 
   * When role_name is set:
   * - Auto-generate password if not already set
   * - Hash password before storing
   */
  static async updateEmployee(employee_id, updateData) {
    const employee = await EmployeeModel.findOne({ employee_id });
    if (!employee) throw new Error("Employee not found");

    let plainPassword = null;
    let hashedPassword = null;

    // ✅ If role_name is being assigned and password not yet set
    if (updateData.role_name && !employee.password) {
      plainPassword = generatePassword(employee.name, employee_id);
      hashedPassword = await bcrypt.hash(plainPassword, 10);
      updateData.password = hashedPassword;
    }

    // ✅ If password is provided in update
    if (updateData.password && typeof updateData.password === "string") {
      // Check if already hashed (bcrypt hashes start with $2)
      if (!updateData.password.startsWith("$2")) {
        // Hash if not already hashed
        hashedPassword = await bcrypt.hash(updateData.password, 10);
        updateData.password = hashedPassword;
      }
    }

    const updatedEmployee = await EmployeeModel.findOneAndUpdate(
      { employee_id },
      { $set: updateData },
      { new: true }
    );

    return {
      employee: updatedEmployee,
      ...(plainPassword && { generatedPassword: plainPassword }),
    };
  }

  static async deleteEmployee(employee_id) {
    return await EmployeeModel.findOneAndDelete({ employee_id });
  }

  static async searchEmployees(keyword) {
    return await EmployeeModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
        { employee_id: { $regex: keyword, $options: "i" } },
      ],
    });
  }

  static async getEmployeesPaginated(page, limit, search, fromdate, todate) {
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { employee_id: { $regex: search, $options: "i" } },
      ];
    }

    if (fromdate || todate) {
      query.createdAt = {};
      if (fromdate) query.createdAt.$gte = new Date(fromdate);
      if (todate) {
        const endOfDay = new Date(todate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        query.createdAt.$lte = endOfDay;
      }
    }

    const total = await EmployeeModel.countDocuments(query);
    const employees = await EmployeeModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return { total, employees };
  }

  // ---------------------- Attendance ----------------------
  static async markAttendance(employee_id, date, present, remarks) {
    const formattedDate = new Date(date).toISOString().split("T")[0];
    return await EmployeeModel.updateOne(
      { employee_id, "daily_attendance.date": { $ne: formattedDate } },
      { $push: { daily_attendance: { date: formattedDate, present, remarks } } }
    );
  }

  static async updateAttendance(employee_id, date, present, remarks) {
    const formattedDate = new Date(date).toISOString().split("T")[0];
    return await EmployeeModel.updateOne(
      { employee_id, "daily_attendance.date": formattedDate },
      {
        $set: {
          "daily_attendance.$.present": present,
          "daily_attendance.$.remarks": remarks,
        },
      }
    );
  }

  static async getAttendanceByEmployee(employee_id, month, year) {
    const employee = await EmployeeModel.findOne({ employee_id });
    if (!employee) return null;
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return employee.daily_attendance?.filter(
      (att) => att.date >= start && att.date <= end
    ) || [];
  }

  static async getAttendanceForAllEmployees(month, year) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    const employees = await EmployeeModel.find(
      {},
      { name: 1, employee_id: 1, daily_attendance: 1 }
    );

    return employees.map((emp) => ({
      employee_id: emp.employee_id,
      name: emp.name,
      attendance: emp.daily_attendance?.filter(
        (att) => att.date >= start && att.date <= end
      ) || [],
    }));
  }

  // ---------------------- Auto Absent ----------------------
  static async autoMarkAbsent() {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (now.getHours() >= ABSENT_HOUR) {
      const employees = await EmployeeModel.find();

      for (const emp of employees) {
        const alreadyMarked = emp.daily_attendance?.some(
          (att) => att.date.toISOString().split("T")[0] === todayStr
        );
        if (!alreadyMarked) {
          if (!emp.daily_attendance) emp.daily_attendance = [];
          emp.daily_attendance.push({
            date: now,
            present: false,
            remarks: "Absent",
          });
          await emp.save();
        }
      }
    }
  }

  // ---------------------- Password Management ----------------------
  static async changePassword(employee_id, oldPassword, newPassword) {
    const employee = await EmployeeModel.findOne({ employee_id });
    if (!employee) throw new Error("Employee not found");

    if (!employee.password) {
      throw new Error("Employee has no password set. Contact admin.");
    }

    const isMatch = await bcrypt.compare(oldPassword, employee.password);
    if (!isMatch) throw new Error("Old password is incorrect");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedEmployee = await EmployeeModel.findOneAndUpdate(
      { employee_id },
      { password: hashedPassword },
      { new: true }
    );

    return {
      message: "Password changed successfully",
      employee: updatedEmployee,
    };
  }

  /**
   * ✅ REMOVE EMPLOYEE ROLE
   * 
   * Removes role assignment from employee
   * Clears role_id, role_name, category_name and password
   * Used to revoke access
   */
  static async removeEmployeeRoleService(employee_id) {
    const employee = await EmployeeModel.findOne({ employee_id });
    if (!employee) throw new Error("Employee not found");

    employee.role_id = null;
    employee.role_name = null;
    employee.category_name = null;
    employee.password = null;

    await employee.save();

    console.log("✅ Employee role removed successfully:");
    console.log("   Employee ID:", employee.employee_id);
    console.log("   role_id cleared");
    console.log("   role_name cleared");
    console.log("   category_name cleared");
    console.log("   password cleared");

    return { 
      message: "Role removed successfully", 
      employee 
    };
  }

  /**
   * ✅ ASSIGN ROLE TO EMPLOYEE
   * 
   * Called from User Management when giving login access
   * Assigns role_id, role_name, category_name and generates password
   * 
   * IMPORTANT: This function now updates BOTH:
   * - role_name: Role name from the selected role
   * - category_name: Category name from the selected category
   * 
   * This ensures employee data is synchronized with the role assignment
   * and category_name is available for leads assignment
   */
  static async assignRoleToEmployee(employee_id, roleData) {
    const employee = await EmployeeModel.findOne({ employee_id });
    if (!employee) throw new Error("Employee not found");

    const { role_id, role_name, category_name } = roleData;

    // ✅ Validate role data
    if (!role_id || !role_name) {
      throw new Error("role_id and role_name are required");
    }

    // ✅ Generate password if not already set
    let plainPassword = null;
    let hashedPassword = employee.password;

    if (!employee.password) {
      plainPassword = generatePassword(employee.name, employee_id);
      hashedPassword = await bcrypt.hash(plainPassword, 10);
    }

    // ✅ Update employee with role details AND category_name
    employee.role_id = role_id;
    employee.role_name = role_name;           // ✅ Store role_name in employee
    employee.category_name = category_name || null;  // ✅ Store category_name in employee
    employee.password = hashedPassword;

    await employee.save();

    console.log("✅ Employee role assigned successfully:");
    console.log("   Employee ID:", employee.employee_id);
    console.log("   Role ID:", employee.role_id);
    console.log("   Role Name:", employee.role_name);
    console.log("   Category Name:", employee.category_name);

    return {
      message: "Role assigned successfully",
      employee: {
        id: employee._id,
        employee_id: employee.employee_id,
        name: employee.name,
        role_id: employee.role_id,
        role_name: employee.role_name,
        category_name: employee.category_name,
      },
      ...(plainPassword && { generatedPassword: plainPassword }),
    };
  }
}

export default EmployeeService;

/**
 * ============================================
 * KEY CHANGES:
 * ============================================
 * 
 * ✅ NEW FIELDS SUPPORT:
 *    - role_id (assigned in User Management)
 *    - role_name (assigned in User Management)
 *    - category (assigned in User Management)
 *    - password (auto-generated or provided)
 * 
 * ✅ NEW METHOD: assignRoleToEmployee()
 *    - Called from User Management
 *    - Assigns role and generates password
 *    - Employee can then login
 * 
 * ✅ LOGIN VALIDATION:
 *    - Employee must have role_id
 *    - Employee must have password
 * 
 * ✅ PASSWORD HANDLING:
 *    - Auto-generated when role assigned
 *    - Hashed before storing
 *    - Compared with bcrypt during login
 */
