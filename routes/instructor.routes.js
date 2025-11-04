const router = require('express').Router();
const db = require('../models')
const auth = require('../middleware/auth')
const sendResponse = require('../utils/response');
const sequelize = db.sequelize;
const Sequelize = require('sequelize');
const Instructor = db.Instructor



// GET - Fetch all instructors
router.get('/', async (req, res) => {
  try {
    const instructors = await Instructor.findAll({
      order: [['id', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      count: instructors.length,
      data: instructors
    });
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching instructors',
      error: error.message
    });
  }
});

// GET - Fetch single instructor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await Instructor.findByPk(id);
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: instructor
    });
  } catch (error) {
    console.error('Error fetching instructor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching instructor',
      error: error.message
    });
  }
});

// POST - Create new instructor
router.post('/', async (req, res) => {
  try {
    const { fullName, designation, experience, studentsTaught, phone, rating } = req.body;
    
    // Validation
    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }
    
    if (!experience) {
      return res.status(400).json({
        success: false,
        message: 'Experience is required'
      });
    }
    
    // Create instructor
    const instructor = await Instructor.create({
      fullName,
      designation,
      experience,
      studentsTaught: studentsTaught || 0,
      phone,
      rating: rating || 0.0
    });
    
    res.status(201).json({
      success: true,
      message: 'Instructor created successfully',
      data: instructor
    });
  } catch (error) {
    console.error('Error creating instructor:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating instructor',
      error: error.message
    });
  }
});

// PUT - Update instructor by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, designation, experience, studentsTaught, phone, rating } = req.body;

    console.log(req.body);
    
    // Find instructor
    const instructor = await Instructor.findByPk(id);
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }
    
    // Update instructor
    await instructor.update({
      fullName: fullName !== undefined ? fullName : instructor.fullName,
      designation: designation !== undefined ? designation : instructor.designation,
      experience: experience !== undefined ? experience : instructor.experience,
      studentsTaught: studentsTaught !== undefined ? studentsTaught : instructor.studentsTaught,
      phone: phone !== undefined ? phone : instructor.phone,
      rating: rating !== undefined ? rating : instructor.rating
    });
    
    res.status(200).json({
      success: true,
      message: 'Instructor updated successfully',
      data: instructor
    });
  } catch (error) {
    console.error('Error updating instructor:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating instructor',
      error: error.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find teacher
    const instructor = await Instructor.findByPk(id);
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }
    
    // Delete instructor
    await instructor.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Instructor deleted successfully',
      data: { id: parseInt(id) }
    });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting instructor',
      error: error.message
    });
  }
});

module.exports = router;