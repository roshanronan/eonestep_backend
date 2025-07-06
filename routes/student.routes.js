// routes/student.routes.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const auth = require('../middleware/auth');

const Student = db.Student;

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Enroll a new student (franchise only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               course:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created
 */


// ✅ POST /api/students — Enroll new student
router.post('/', auth(['franchise']), async (req, res) => {
  const { name, age, course, photo_url, course_id } = req.body;

  if (!name || !req.user.franchiseId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const student = await Student.create({
      name,
      age,
      course,
      photo_url,
      franchise_id: req.user.franchiseId,
      course_id,
    });

    res.status(201).json({ message: 'Student enrolled', student });
  } catch (error) {
    console.error('Enroll Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET /api/students — Get students of logged-in franchise
router.get('/', auth(['franchise']), async (req, res) => {
    try {
      const students = await Student.findAll({
        where: {
          franchise_id: req.user.franchiseId
        },
        include: db.Course // optional: include course details if using course_id
      });
  
      res.json({ students });
    } catch (error) {
      console.error('Fetch Students Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ✅ Admin view: all students (optional)
router.get('/all', auth(['admin']), async (req, res) => {
    try {
      const students = await Student.findAll({
        include: [
          { model: db.Franchise, attributes: ['id', 'name', 'email'] },
          { model: db.Course }
        ]
      });
      res.json({ students });
    } catch (error) {
      console.error('Admin Fetch Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  

module.exports = router;
