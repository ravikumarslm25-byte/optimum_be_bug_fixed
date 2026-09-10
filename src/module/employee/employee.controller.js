// ====================================
// FILE: src/module/employee/employee.controller.js
// UPDATED: Added support for role_id, role_name, category_name, password fields
// ====================================

import Employee from "./employee.model.js";
import EmployeeService from "./employee.service.js";
import bcrypt from "bcryptjs";

/**
 * ✅ LOGIN EMPLOYEE
 * 
 * Authenticates employee and returns role/access details
 */
export const loginEmployee = async (req, res) => {
  try {
    console.log("📥 API Call: POST /employee/login");
    console.log("Login attempt for:", req.body.identifier);

    const { identifier, password, location } = req.body;

    // ✅ VALIDATION
    if (!identifier) {
      return res.status(400).json({
        status: false,
        message: "Email or phone is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        status: false,
        message: "Password is required",
      });
    }

    // ✅ Call service for login logic
    const result = await EmployeeService.loginEmployee({
      identifier,
      password,
      location,
    });

    console.log("✅ Employee login successful:", identifier);

    return res.status(200).json({
      status: true,
      message: result.message,
      data: result.employee,
    });
  } catch (error) {
    console.error("❌ Error during login:", error);
    return res.status(401).json({
      status: false,
      message: error.message || "Login failed",
    });
  }
};

/**
 * ✅ CREATE EMPLOYEE
 * 
 * All role-related fields (role_id, role_name, category_name, password) 
 * are optional and will be set later in User Management
 */
export const createEmployee = async (req, res) => {
  try {
    console.log("📥 API Call: POST /employee/create");
    console.log("Request Body:", req.body);

    const {
      employee_id,
      name,
      fatherName,
      gender,
      dateOfBirth,
      qualification,
      jobTitle,
      dateOfJoining,
      department,
      phone,
      email,
      address,
      aadhaarNumber,
      healthInsurance,
      ctc,
      leaveBalance,
      reportingManager,
      status,
      bankAccountNo,
      // ✅ Extra contact + bank fields from the Add/Edit form
      officialEmail,
      officialPhone,
      personalEmail,
      personalPhone,
      bankName,
      bankAccountName,
      bankAccountNumber,
      bankAccountType,
      bankIFSCCode,
      lastIncrementDate,
      lastIncrementCTC,
      // ✅ NEW FIELDS (Optional)
      role_id,
      role_name,
      category_name,
      password,
    } = req.body;

    // ✅ VALIDATION - Required Fields
    if (!employee_id || !employee_id.toString().trim()) {
      return res.status(400).json({
        status: false,
        message: "Employee ID is required",
      });
    }

    if (!name || !name.toString().trim()) {
      return res.status(400).json({
        status: false,
        message: "Employee name is required",
      });
    }

    if (!email || !email.toString().trim()) {
      return res.status(400).json({
        status: false,
        message: "Employee email is required",
      });
    }

    // Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: false,
        message: "Invalid email format",
      });
    }

    if (!jobTitle || !jobTitle.toString().trim()) {
      return res.status(400).json({
        status: false,
        message: "Job title is required",
      });
    }

    // ✅ CHECK DUPLICATE EMPLOYEE ID
    const existingemployee_id = await Employee.findOne({
      employee_id: employee_id.toString().trim(),
    });

    if (existingemployee_id) {
      return res.status(400).json({
        status: false,
        message: "Employee ID already exists",
      });
    }

    // ✅ CHECK DUPLICATE EMAIL
    const existingEmployee = await Employee.findOne({
      email: email.toString().toLowerCase(),
    });

    if (existingEmployee) {
      return res.status(400).json({
        status: false,
        message: "Employee with this email already exists",
      });
    }

    // ✅ CREATE NEW EMPLOYEE OBJECT
    const newEmployee = new Employee({
      employee_id: employee_id.toString().trim(),
      name: name.toString().trim(),
      fatherName: fatherName ? fatherName.toString().trim() : "",
      gender: gender ? gender.toString() : "",
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      qualification: qualification ? qualification.toString() : "",
      jobTitle: jobTitle.toString().trim(),
      dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : null,
      department: department ? department.toString() : "",
      phone: phone ? phone.toString() : "",
      email: email.toString().toLowerCase(),
      address: address ? address.toString() : "",
      aadhaarNumber: aadhaarNumber ? aadhaarNumber.toString() : "",
      healthInsurance: healthInsurance ? healthInsurance.toString() : "",
      ctc: ctc ? Number(ctc) : 0,
      leaveBalance: leaveBalance ? Number(leaveBalance) : 0,
      reportingManager: reportingManager ? reportingManager.toString() : "",
      status: status ? status.toString() : "Active",
      bankAccountNo: bankAccountNo ? bankAccountNo.toString() : "",
      officialEmail: officialEmail ? officialEmail.toString() : "",
      officialPhone: officialPhone ? officialPhone.toString() : "",
      personalEmail: personalEmail ? personalEmail.toString() : "",
      personalPhone: personalPhone ? personalPhone.toString() : "",
      bankName: bankName ? bankName.toString() : "",
      bankAccountName: bankAccountName ? bankAccountName.toString() : "",
      bankAccountNumber: bankAccountNumber ? bankAccountNumber.toString() : "",
      bankAccountType: bankAccountType ? bankAccountType.toString() : "",
      bankIFSCCode: bankIFSCCode ? bankIFSCCode.toString() : "",
      lastIncrementDate: lastIncrementDate ? new Date(lastIncrementDate) : null,
      lastIncrementCTC: lastIncrementCTC ? Number(lastIncrementCTC) : 0,
      // ✅ NEW FIELDS (Optional - default to null)
      role_id: role_id ? role_id.toString().trim() : null,
      role_name: role_name ? role_name.toString().trim() : null,
      category_name: category_name ? category_name.toString().trim() : null,
      password: password ? password.toString() : null,
    });

    // ✅ SAVE TO DATABASE
    const savedEmployee = await newEmployee.save();

    console.log("✅ Employee created successfully:", savedEmployee._id);
    console.log("   Employee ID:", savedEmployee.employee_id);
    console.log("   Name:", savedEmployee.name);
    console.log("   Email:", savedEmployee.email);

    return res.status(201).json({
      status: true,
      message: "Employee created successfully",
      data: savedEmployee,
    });
  } catch (error) {
    console.error("❌ Error creating employee:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to create employee",
    });
  }
};

/**
 * ✅ GET ALL EMPLOYEES
 */
export const getAllEmployees = async (req, res) => {
  try {
    console.log("📥 API Call: GET /employee/getallemployees");

    const employees = await Employee.find().sort({ createdAt: -1 });

    console.log("✅ Fetched", employees.length, "employees");

    return res.status(200).json({
      status: true,
      message: "Employees fetched successfully",
      data: employees || [],
    });
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch employees",
    });
  }
};

/**
 * ✅ GET EMPLOYEE BY ID
 */
export const getEmployeeById = async (req, res) => {
  try {
    console.log("📥 API Call: GET /employee/:id");
    console.log("Employee ID:", req.params.id);

    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    console.log("✅ Employee found:", id);

    return res.status(200).json({
      status: true,
      message: "Employee fetched successfully",
      data: employee,
    });
  } catch (error) {
    console.error("❌ Error fetching employee:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch employee",
    });
  }
};

export const getEmployeeByEmployeeId = async (req, res) => {
  try {
    console.log("📥 API Call: GET /employee/byemployeeid/:employee_id");
    console.log("Employee ID (String):", req.params.employee_id);

    const { employee_id } = req.params;

    // ✅ Search by employee_id string, not MongoDB _id
    const employee = await Employee.findOne({ employee_id: employee_id });

    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    console.log("✅ Employee found:", employee_id);

    return res.status(200).json({
      status: true,
      message: "Employee fetched successfully",
      data: employee,
    });
  } catch (error) {
    console.error("❌ Error fetching employee:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch employee",
    });
  }
};


/**
 * ✅ UPDATE EMPLOYEE
 */
// ====================================
// VERIFIED updateEmployee Function
// WITH password hashing included
// ====================================

// ====================================
// FIXED updateEmployee Function
// PROPER NULL HANDLING for role_id, role_name, category_name
// ====================================

export const updateEmployee = async (req, res) => {
  try {
    console.log("📥 API Call: PUT /employee/:id");
    console.log("Employee ID:", req.params.id);
    console.log("Update Data:", req.body);

    const { id } = req.params;
    const {
      employee_id,
      name,
      fatherName,
      gender,
      dateOfBirth,
      qualification,
      jobTitle,
      dateOfJoining,
      department,
      phone,
      email,
      officialEmail,
      officialPhone,
      personalEmail,
      personalPhone,
      address,
      aadhaarNumber,
      healthInsurance,
      bankAccountName,
      bankAccountNumber,
      bankAccountType,
      bankIFSCCode,
      bankName,
      ctc,
      reportingManager,
      status,
      bankAccountNo,
      leaveBalance,
      lastIncrementDate,
      lastIncrementCTC,
      role_id,
      role_name,
      category_name,
      password,
    } = req.body;

    // ✅ CHECK IF EMPLOYEE EXISTS
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    // ✅ CHECK EMPLOYEE ID UNIQUENESS IF CHANGED
    if (employee_id && employee_id !== employee.employee_id) {
      const existingemployee_id = await Employee.findOne({
        employee_id: employee_id.toString().trim(),
        _id: { $ne: id },
      });

      if (existingemployee_id) {
        return res.status(400).json({
          status: false,
          message: "Employee ID already exists",
        });
      }
    }

    // ✅ CHECK EMAIL UNIQUENESS (Check both email and officialEmail)
    const emailToCheck = officialEmail || email;
    if (emailToCheck && emailToCheck.toString().toLowerCase() !== employee.email?.toLowerCase()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailToCheck)) {
        return res.status(400).json({
          status: false,
          message: "Invalid email format",
        });
      }

      const existingEmployee = await Employee.findOne({
        $or: [
          { email: emailToCheck.toString().toLowerCase() },
          { officialEmail: emailToCheck.toString().toLowerCase() },
        ],
        _id: { $ne: id },
      });

      if (existingEmployee) {
        return res.status(400).json({
          status: false,
          message: "Employee with this email already exists",
        });
      }
    }

    // ✅ UPDATE BASIC FIELDS
    if (employee_id) employee.employee_id = employee_id.toString().trim();
    if (name) employee.name = name.toString().trim();
    if (fatherName) employee.fatherName = fatherName.toString();
    if (gender) employee.gender = gender.toString();
    if (dateOfBirth) employee.dateOfBirth = new Date(dateOfBirth);
    if (qualification) employee.qualification = qualification.toString();
    if (jobTitle) employee.jobTitle = jobTitle.toString().trim();
    if (dateOfJoining) employee.dateOfJoining = new Date(dateOfJoining);
    if (department) employee.department = department.toString();
    
    // ✅ UPDATE CONTACT FIELDS (OLD & NEW)
    if (phone) employee.phone = phone.toString();
    if (email) employee.email = email.toString().toLowerCase();
    if (officialEmail) employee.officialEmail = officialEmail.toString().toLowerCase();
    if (officialPhone) employee.officialPhone = officialPhone.toString();
    
    // ✅ UPDATE PERSONAL CONTACT FIELDS (NEW - OPTIONAL)
    if (personalEmail !== undefined && personalEmail !== null) {
      employee.personalEmail = personalEmail ? personalEmail.toString().toLowerCase() : null;
    }
    if (personalPhone !== undefined && personalPhone !== null) {
      employee.personalPhone = personalPhone ? personalPhone.toString() : null;
    }
    
    // ✅ UPDATE ADDRESS & DOCUMENTS
    if (address) employee.address = address.toString();
    if (aadhaarNumber) employee.aadhaarNumber = aadhaarNumber.toString();
    if (healthInsurance) employee.healthInsurance = healthInsurance.toString();

    // ✅ UPDATE BANK DETAILS (NEW - ALL OPTIONAL)
    if (bankAccountName !== undefined && bankAccountName !== null) {
      employee.bankAccountName = bankAccountName ? bankAccountName.toString() : null;
    }
    if (bankAccountNumber !== undefined && bankAccountNumber !== null) {
      employee.bankAccountNumber = bankAccountNumber ? bankAccountNumber.toString() : null;
    }
    if (bankAccountType !== undefined && bankAccountType !== null) {
      employee.bankAccountType = bankAccountType ? bankAccountType.toString() : null;
    }
    if (bankIFSCCode !== undefined && bankIFSCCode !== null) {
      employee.bankIFSCCode = bankIFSCCode ? bankIFSCCode.toString() : null;
    }
    if (bankName !== undefined && bankName !== null) {
      employee.bankName = bankName ? bankName.toString() : null;
    }

    // ✅ UPDATE OLD BANK FIELD FOR BACKWARD COMPATIBILITY
    if (bankAccountNo) {
      employee.bankAccountNo = bankAccountNo.toString();
    }

    // ✅ UPDATE SALARY FIELDS
    if (ctc !== undefined && ctc !== null) employee.ctc = Number(ctc);
    if (leaveBalance !== undefined && leaveBalance !== null) employee.leaveBalance = Number(leaveBalance);

    // ✅ UPDATE JOB RELATED FIELDS
    if (reportingManager) employee.reportingManager = reportingManager.toString();
    if (status) employee.status = status.toString();

    // ✅ UPDATE OPTIONAL FIELDS
    if (lastIncrementDate) employee.lastIncrementDate = new Date(lastIncrementDate);
    if (lastIncrementCTC) employee.lastIncrementCTC = Number(lastIncrementCTC);
    
    // 🔐 ✅ ROLE & ACCESS HANDLING - PROPER NULL HANDLING
    console.log("🔐 Updating role/access fields...");
    console.log("   role_id:", role_id);
    console.log("   role_name:", role_name);
    console.log("   category_name:", category_name);

    // ✅ Handle role_id (can be string or null)
    if (role_id !== undefined) {
      if (role_id === null || role_id === "" || role_id === "null") {
        employee.role_id = null;
        console.log("✅ role_id set to null");
      } else {
        employee.role_id = role_id.toString().trim();
        console.log("✅ role_id set to:", employee.role_id);
      }
    }

    // ✅ Handle role_name (can be string or null)
    if (role_name !== undefined) {
      if (role_name === null || role_name === "" || role_name === "null") {
        employee.role_name = null;
        console.log("✅ role_name set to null");
      } else {
        employee.role_name = role_name.toString().trim();
        console.log("✅ role_name set to:", employee.role_name);
      }
    }

    // ✅ Handle category_name (can be string or null)
    if (category_name !== undefined) {
      if (category_name === null || category_name === "" || category_name === "null") {
        employee.category_name = null;
        console.log("✅ category_name set to null");
      } else {
        employee.category_name = category_name.toString().trim();
        console.log("✅ category_name set to:", employee.category_name);
      }
    }

    // 🔐 ✅ PASSWORD HANDLING - HASH IF PROVIDED
    if (password !== undefined && password !== null) {
      if (password && password.toString().trim()) {
        try {
          console.log("🔐 Hashing password...");
          const hashedPassword = await bcrypt.hash(password.toString(), 10);
          employee.password = hashedPassword;
          console.log("✅ Password hashed successfully");
        } catch (hashError) {
          console.error("❌ Error hashing password:", hashError);
          return res.status(500).json({
            status: false,
            message: "Error processing password",
          });
        }
      } else {
        employee.password = null;
        console.log("✅ password set to null");
      }
    }

    // ✅ SAVE UPDATED EMPLOYEE
    const updatedEmployee = await employee.save();

    console.log("✅ Employee updated successfully:", id);
    console.log("   Updated fields:", {
      role_id: updatedEmployee.role_id,
      role_name: updatedEmployee.role_name,
      category_name: updatedEmployee.category_name,
      password: updatedEmployee.password ? "HASHED" : "NOT SET",
    });

    return res.status(200).json({
      status: true,
      message: "✅ Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("❌ Error updating employee:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Error updating employee",
    });
  }
};

/**
 * ✅ DELETE EMPLOYEE
 */
export const deleteEmployee = async (req, res) => {
  try {
    console.log("📥 API Call: DELETE /employee/:id");
    console.log("Employee ID:", req.params.id);

    const { id } = req.params;

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    console.log("✅ Employee deleted:", id);

    return res.status(200).json({
      status: true,
      message: "Employee deleted successfully",
      data: employee,
    });
  } catch (error) {
    console.error("❌ Error deleting employee:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to delete employee",
    });
  }
};

/**
 * ✅ GET EMPLOYEES BY STATUS
 */
export const getEmployeesByStatus = async (req, res) => {
  try {
    console.log("📥 API Call: GET /employee/status/:status");
    console.log("Status:", req.params.status);

    const { status } = req.params;

    const employees = await Employee.find({ status }).sort({ createdAt: -1 });

    console.log("✅ Found", employees.length, "employees with status:", status);

    return res.status(200).json({
      status: true,
      message: "Employees fetched successfully",
      data: employees,
    });
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch employees",
    });
  }
};

/**
 * ✅ GET EMPLOYEES BY DEPARTMENT
 */
export const getEmployeesByDepartment = async (req, res) => {
  try {
    console.log("📥 API Call: GET /employee/department/:department");
    console.log("Department:", req.params.department);

    const { department } = req.params;

    const employees = await Employee.find({
      department: { $regex: department, $options: "i" },
    }).sort({ createdAt: -1 });

    console.log("✅ Found", employees.length, "employees in department");

    return res.status(200).json({
      status: true,
      message: "Employees fetched successfully",
      data: employees,
    });
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch employees",
    });
  }
};

/**
 * ✅ SEARCH EMPLOYEES
 */
export const searchEmployees = async (req, res) => {
  try {
    console.log("📥 API Call: GET /employee/search");
    console.log("Query:", req.query.q);

    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        status: false,
        message: "Search query is required",
      });
    }

    const employees = await Employee.find({
      $or: [
        { employee_id: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { jobTitle: { $regex: q, $options: "i" } },
        { department: { $regex: q, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    console.log("✅ Found", employees.length, "matching employees");

    return res.status(200).json({
      status: true,
      message: "Employees fetched successfully",
      data: employees,
    });
  } catch (error) {
    console.error("❌ Error searching employees:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to search employees",
    });
  }
};

/**
 * ✅ GET EMPLOYEE COUNT
 */
export const getEmployeeCount = async (req, res) => {
  try {
    console.log("📥 API Call: GET /employee/count");

    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({
      status: "Active",
    });
    const inactiveEmployees = await Employee.countDocuments({
      status: "Inactive",
    });
    const onLeaveEmployees = await Employee.countDocuments({
      status: "On Leave",
    });

    console.log("✅ Employee counts fetched");

    return res.status(200).json({
      status: true,
      message: "Employee count fetched successfully",
      data: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees,
        onLeave: onLeaveEmployees,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching employee count:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch employee count",
    });
  }
};

/**
 * ✅ UPDATE EMPLOYEE STATUS
 */
export const updateEmployeeStatus = async (req, res) => {
  try {
    console.log("📥 API Call: PUT /employee/:id/status");
    console.log("Employee ID:", req.params.id);
    console.log("New Status:", req.body.status);

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["Active", "Inactive", "On Leave"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid status. Valid options: Active, Inactive, On Leave",
      });
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    console.log("✅ Employee status updated:", id);

    return res.status(200).json({
      status: true,
      message: "Employee status updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("❌ Error updating employee status:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to update employee status",
    });
  }
};

/**
 * ✅ GET EMPLOYEE STATISTICS
 */
export const getEmployeeStatistics = async (req, res) => {
  try {
    console.log("📥 API Call: GET /employee/statistics");

    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({
      status: "Active",
    });
    const inactiveEmployees = await Employee.countDocuments({
      status: "Inactive",
    });
    const onLeaveEmployees = await Employee.countDocuments({
      status: "On Leave",
    });

    // Calculate salary statistics
    const salaryStats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          averageCTC: { $avg: "$ctc" },
          totalCTC: { $sum: "$ctc" },
          maxCTC: { $max: "$ctc" },
          minCTC: { $min: "$ctc" },
        },
      },
    ]);

    // Get employees by department
    const departmentStats = await Employee.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    console.log("✅ Employee statistics fetched");

    return res.status(200).json({
      status: true,
      message: "Employee statistics fetched successfully",
      data: {
        counts: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
          onLeave: onLeaveEmployees,
        },
        salary: salaryStats[0] || {
          averageCTC: 0,
          totalCTC: 0,
          maxCTC: 0,
          minCTC: 0,
        },
        departments: departmentStats,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching statistics:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch statistics",
    });
  }
};

// ============================================
// ✅ PROFILE SECTION - NEW APIs (FOR LOGGED-IN USER ONLY)
// ============================================

/**
 * ✅ EDIT PROFILE - FOR LOGGED-IN EMPLOYEE
 * PUT /api/employee/profile/edit/:employee_id
 * 
 * Used by: Profile section only
 * Only the logged-in user can edit their own profile
 * Cannot edit: role, password, status (use separate endpoints)
 */
export const editProfileByEmployeeId = async (req, res) => {
  try {
    console.log("📥 API Call: PUT /api/employee/profile/edit/:employee_id");
    console.log("Employee ID:", req.params.employee_id);
    console.log("Update data:", req.body);

    const { employee_id } = req.params;

    // ✅ VALIDATION
    if (!employee_id || !employee_id.trim()) {
      return res.status(400).json({
        status: false,
        message: "Employee ID is required",
      });
    }

    // ✅ FIND EMPLOYEE BY employee_id STRING
    const employee = await Employee.findOne({ employee_id: employee_id.trim() });

    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    // ✅ EXTRACT ALLOWED FIELDS (Cannot change role, password, status)
    const allowedFields = [
      "name",
      "phone",
      "email",
      "address",
      "dateOfBirth",
      "gender",
      "fatherName",
      "qualification",
      "language",
      "profile_picture",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // ✅ UPDATE EMPLOYEE
    const updatedEmployee = await Employee.findOneAndUpdate(
      { employee_id: employee_id.trim() },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log("✅ Profile updated successfully for:", employee_id);

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      data: {
        _id: updatedEmployee._id,
        employee_id: updatedEmployee.employee_id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone,
        address: updatedEmployee.address,
        dateOfBirth: updatedEmployee.dateOfBirth,
        gender: updatedEmployee.gender,
        profile_picture: updatedEmployee.profile_picture,
      },
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to update profile",
    });
  }
};

/**
 * ✅ CHANGE PASSWORD - FOR LOGGED-IN EMPLOYEE
 * PUT /api/employee/profile/change-password/:employee_id
 * 
 * Used by: Profile section only
 * Only the logged-in user can change their own password
 * Requires current password verification
 */
export const changePasswordByEmployeeId = async (req, res) => {
  try {
    console.log("📥 API Call: PUT /api/employee/profile/change-password/:employee_id");
    console.log("Employee ID:", req.params.employee_id);

    const { employee_id } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // ✅ VALIDATION
    if (!employee_id || !employee_id.trim()) {
      return res.status(400).json({
        status: false,
        message: "Employee ID is required",
      });
    }

    if (!currentPassword) {
      return res.status(400).json({
        status: false,
        message: "Current password is required",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        status: false,
        message: "New password is required",
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        status: false,
        message: "Confirm password is required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: false,
        message: "New passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: false,
        message: "New password must be at least 6 characters",
      });
    }

    // ✅ FIND EMPLOYEE BY employee_id STRING
    const employee = await Employee.findOne({ employee_id: employee_id.trim() });

    if (!employee) {
      return res.status(404).json({
        status: false,
        message: "Employee not found",
      });
    }

    // ✅ VERIFY CURRENT PASSWORD
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      employee.password || ""
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        message: "Current password is incorrect",
      });
    }

    // ✅ HASH NEW PASSWORD
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ UPDATE PASSWORD
    const updatedEmployee = await Employee.findOneAndUpdate(
      { employee_id: employee_id.trim() },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    console.log("✅ Password changed successfully for:", employee_id);

    return res.status(200).json({
      status: true,
      message: "Password changed successfully",
      data: {
        employee_id: updatedEmployee.employee_id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
      },
    });
  } catch (error) {
    console.error("❌ Error changing password:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Failed to change password",
    });
  }
};

export default {
  loginEmployee,
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeesByStatus,
  getEmployeesByDepartment,
  searchEmployees,
  getEmployeeCount,
  updateEmployeeStatus,
  getEmployeeStatistics,
  getEmployeeByEmployeeId,
  editProfileByEmployeeId,
  changePasswordByEmployeeId,
};

/**
 * ============================================
 * KEY CHANGES:
 * ============================================
 * 
 * ✅ NEW OPTIONAL FIELDS ADDED:
 *    - role_id: String (optional)
 *    - role_name: String (optional)
 *    - category_name: String (optional)
 *    - password: String (hashed, optional)
 * 
 * ✅ CREATE EMPLOYEE:
 *    - All role fields default to null
 *    - No validation required for role fields
 * 
 * ✅ UPDATE EMPLOYEE:
 *    - Can update role fields in User Management
 *    - Password is hashed before storing
 *    - Can set fields to null
 * 
 * ✅ USE CASE:
 *    1. Employee created WITHOUT role/password
 *    2. Later in User Management: role, password assigned
 *    3. Employee can now login
 */
