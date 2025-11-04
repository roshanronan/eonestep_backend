const express = require('express');
const router = express.Router();
const db = require('../models')
const LiveCourse = db.LiveCourse;
const {upload,uploadToFTP  } = require('../middleware/upload');

// GET all live courses with optional filtering
router.get('/live-courses', async (req, res) => {
  try {
    const { status, level, instructorId } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (level) where.level = level;
    if (instructorId) where.instructorId = instructorId;

    const courses = await LiveCourse.findAll({ where });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching live courses',
      error: error.message
    });
  }
});

// GET single live course by ID
router.get('/live-courses/:id', async (req, res) => {
  try {
    const course = await LiveCourse.findByPk(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Live course not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching live course',
      error: error.message
    });
  }
});

// POST create new live course
router.post('/live-courses',  upload.single('thumbnail'),async (req, res) => {
    // return
  try {
    const {
      title,
      subtitle,
      description,
      topicToLearn,
      startTime,
      endTime,
      level,
      seats,
      price,
      meetingLink,
      instructorId
    } = req.body;

    // Validation
    if (!title || !startTime || !endTime || !instructorId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required fields: title, startTime, endTime, instructorId'
      });
    }
let thumbnail=null;
          if (req.file) {
        const file =  req.file;
        thumbnail = await uploadToFTP(file.path, file.filename);
      }
    // Validate dates
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const course = await LiveCourse.create({
      title,
      subtitle,
      description,
      topicToLearn,
      startTime,
      endTime,
      level,
      seats,
      price,
      meetingLink,
      thumbnail,
      instructorId
    });

    res.status(201).json({
      success: true,
      message: 'Live course created successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating live course',
      error: error.message
    });
  }
});

// PUT update live course
router.put('/live-courses/:id',upload.single('thumbnail'), async (req, res) => {
  try {
    const course = await LiveCourse.findByPk(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Live course not found'
      });
    }

    const {
      title,
      subtitle,
      description,
      topicToLearn,
      startTime,
      endTime,
      level,
      seats,
      registeredStudent,
      price,
      status,
      meetingLink,
      instructorId
    } = req.body;

    let thumbnail=null;
          if (req.file) {
        const file =  req.file;
        thumbnail = await uploadToFTP(file.path, file.filename);
      }
    // Validate dates if provided
    const newStartTime = startTime || course.startTime;
    const newEndTime = endTime || course.endTime;
    
    if (new Date(newStartTime) >= new Date(newEndTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Validate registered students don't exceed seats
    if (seats && registeredStudent && registeredStudent > seats) {
      return res.status(400).json({
        success: false,
        message: 'Registered students cannot exceed available seats'
      });
    }

    await course.update({
      title,
      subtitle,
      description,
      topicToLearn,
      startTime,
      endTime,
      level,
      seats,
      registeredStudent,
      price,
      status,
      meetingLink,
      thumbnail:thumbnail || course.thumbnail,
      instructorId
    });

    res.status(200).json({
      success: true,
      message: 'Live course updated successfully',
      data: course
    });
  } catch (error) {
    console.log("error",error)
    res.status(500).json({
      success: false,
      message: 'Error updating live course',
      error: error.message
    });
  }
});

// DELETE live course
router.delete('/live-courses/:id', async (req, res) => {
  try {
    const course = await LiveCourse.findByPk(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Live course not found'
      });
    }

    // Optional: Prevent deletion if students are registered
    if (course.registeredStudent > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with registered students'
      });
    }

    await course.destroy();

    res.status(200).json({
      success: true,
      message: 'Live course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting live course',
      error: error.message
    });
  }
});

module.exports = router;