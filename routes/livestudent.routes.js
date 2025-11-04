const express = require("express");
const router = express.Router();
const { LiveStudent } = require("../models"); 

// POST - Create a new student
router.post("/", async (req, res) => {
  try {
    const { fullName, email, phoneNumber, level, liveCourseId } = req.body;

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !liveCourseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: ["fullName", "email", "phoneNumber", "liveCourseId"],
      });
    }

    // Create student
    const student = await LiveStudent.create({
      fullName,
      email,
      phoneNumber,
      level: level || "beginner",
      liveCourseId,
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    // Handle unique constraint error
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
        error: error.errors[0].message,
      });
    }

    // Handle validation errors
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }

    // Handle foreign key constraint error
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Invalid liveCourseId - course does not exist",
      });
    }

    console.error("Error creating student:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// GET - Get all students (with optional filters)
router.get("/", async (req, res) => {
  try {
    const { level, liveCourseId, page = 1, limit = 10 } = req.query;

    // Build where clause
    const where = {};
    if (level) where.level = level;
    if (liveCourseId) where.liveCourseId = liveCourseId;

    // Pagination
    const offset = (page - 1) * limit;

    const { count, rows: students } = await LiveStudent.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      // Uncomment to include course data
      // include: [{
      //   model: LiveCourse,
      //   as: "course",
      //   attributes: ["id", "name", "description"]
      // }]
    });

    return res.status(200).json({
      success: true,
      data: students,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// GET - Get student by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const student = await LiveStudent.findByPk(id, {
      // Uncomment to include course data
      // include: [{
      //   model: LiveCourse,
      //   as: "course"
      // }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// PUT - Update student
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phoneNumber, level, liveCourseId } = req.body;

    const student = await LiveStudent.findByPk(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await student.update({
      fullName: fullName || student.fullName,
      email: email || student.email,
      phoneNumber: phoneNumber || student.phoneNumber,
      level: level || student.level,
      liveCourseId: liveCourseId || student.liveCourseId,
    });

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }

    console.error("Error updating student:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// DELETE - Delete student
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const student = await LiveStudent.findByPk(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await student.destroy();

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;