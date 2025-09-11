
// routes/student.routes.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');
const sendResponse = require('../utils/response');

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
        // include: db.Course // optional: include course details if using course_id
      });
  
      // res.json({ students });
      sendResponse(res, { status: 200, data: { students } });
    } catch (error) {
      console.error('Fetch Students Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });



/**
 * @swagger
 * /api/students/{studentId}:
 *   get:
 *     summary: Get specific student by ID (franchise/admin)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The student ID
 *     responses:
 *       200:
 *         description: Student details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 student:
 *                   $ref: '#/components/schemas/Student'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
  // ✅ GET /api/students/:studentId — Get specific student (franchise/admin) 
  
router.get('/:studentId', auth(['franchise', 'admin']), async (req, res) => {
    const { studentId } = req.params;
    try {
      const student = await Student.findByPk(studentId, {
        where: {
          ...(req.user.role === 'franchise' && { franchise_id: req.user.franchiseId })
        },
        // include: db.Course // optional: include course details if using course_id
      });
      if (!student) {
        return sendResponse(res, { status: 404, message: 'Student not found' });
      }
      // If franchise, ensure they own the student
      if (req.user.role === 'franchise' && student.franchise_id !== req.user.franchiseId) {
        return sendResponse(res, { status: 403, message: 'Access denied' });
      }
     sendResponse(res, { status: 200, data: { student } });
    } catch (error) {
      console.error('Fetch Student Error:', error);
      sendResponse(res, { status: 500, message: 'Server error' });
    }
  });

  // ✅ Admin view: all students (optional)
router.get('/all', auth(['admin']), async (req, res) => {
    try {
      const students = await Student.findAll({
        include: [
          { model: db.Franchise, attributes: ['id', 'name', 'email'] },
          // { model: db.Course }
        ]
      });
      res.json({ students });
    } catch (error) {
      console.error('Admin Fetch Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  /**
 * @swagger
 * /api/students/register:
 *   post:
 *     summary: Submit a new student application
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               studentName:
 *                 type: string
 *               courseName:
 *                 type: string
 *               guardianType:
 *                 type: string
 *               gender:
 *                 type: string
 *               fatherName:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               pinCode:
 *                 type: string
 *               town:
 *                 type: string
 *               district:
 *                 type: string
 *               state:
 *                 type: string
 *               idProof:
 *                 type: string
 *               idNumber:
 *                 type: string
 *               imageUpload:
 *                 type: string
 *                 format: binary
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               subjectName:
 *                 type: string
 *               selectFromSession:
 *                 type: string
 *                 format: date
 *               selectToSession:
 *                 type: string
 *                 format: date
 *               franchise_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Student application submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 student:
 *                   $ref: '#/components/schemas/Student'
 */
  router.post('/register',auth(['franchise']),upload.single('imageUpload'), async (req, res) => {
  try {
    const {
      studentName,
      courseName,
      guardianType,
      gender,
      fatherName,
      dob,
      pinCode,
      town,
      district,
      state,
      idProof,
      idNumber,
      phone,
      email,
      password,
      subjectName,
      selectFromSession,
      selectToSession,
      franchise_id // optional, if you want to associate with a franchise
    } = req.body;

    const studentExist = await Student.findOne({ where: { email } });
    if (studentExist) {
      return sendResponse(res, { status: 409, message: 'Student with this Email already in use' });
    }

    const imageUpload = req.file ? req.file.filename   : null;

     console.log("Image Path post:", imageUpload,req);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = await Student.create({
      studentName,
      courseName,
      guardianType,
      gender,
      fatherName,
      dob,
      pinCode,
      town,
      district,
      state,
      idProof, 
      idNumber,
      imageUpload,
      phone,
      email,
      password:hashedPassword, // or hashedPassword
      subjectName,
      selectFromSession,
      selectToSession,
      franchise_id
    });

    res.status(201).json({ message: 'Student application submitted', student: newStudent });
  } catch (error) {
    console.error('Apply Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


/**
 * @swagger
 * /api/students/register/{studentId}:
 *   put:
 *     summary: Update a student application (franchise only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The student ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:  
 *            type: object
 *            properties:
 *               studentName:
 *                 type: string
 *               courseName:
 *                 type: string
 *               guardianType:
 *                 type: string
 *               gender:
 *                 type: string
 *               fatherName:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               pinCode:
 *                 type: string
 *               town:
 *                 type: string
 *               district:
 *                 type: string
 *               state:
 *                 type: string
 *               idProof:
 *                 type: string
 *               idNumber:
 *                 type: string
 *               imageUpload:
 *                 type: string
 *                 format: binary
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               subjectName:
 *                 type: string
 *               selectFromSession:
 *                 type: string
 *                 format: date
 *               selectToSession:
 *                 type: string
 *                 format: date
 *               franchise_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Student application submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 student:
 *                   $ref: '#/components/schemas/Student'
 */

// ✅ Update student application (franchise only)
router.put('/register/:studentId', auth(['franchise']), upload.single('imageUpload'), async (req, res) => {
  const { studentId } = req.params;
  try {
    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Ensure the franchise owns the student
    if (student.franchise_id !== req.user.franchiseId) {
      return res.status(403).json({ message: 'Access denied' });
    }

     const {
      studentName,
      courseName,
      guardianType,
      gender,
      fatherName,
      dob,
      pinCode,
      town,
      district,
      state,
      idProof,
      idNumber,
      phone,
      email,
      password,
      subjectName,
      selectFromSession,
      selectToSession,
      franchise_id // optional, if you want to associate with a franchise
    } = req.body;
    const imageUpload = req.file ? req.file.filename  : student.imageUpload;
    console.log("Image Path:", imageUpload,req.filePath);
    // You may want to hash the password before saving
    const hashedPassword = password ? await bcrypt.hash(password, 10) : student.password;

    await student.update({
      studentName: studentName || student.studentName,
      courseName: courseName || student.courseName,
      guardianType: guardianType || student.guardianType,  
      gender:gender || student.gender,
      fatherName:fatherName || student.fatherName,
      dob:dob || student.dob,
      pinCode:pinCode || student.pinCode,
      town:town || student.town,
      district:district || student.district,
      state:state || student.state,
      idProof:idProof || student.idProof, 
      idNumber:idNumber || student.idNumber,
      imageUpload:imageUpload,
      phone:phone || student.phone,
      email:email || student.email,
      password:hashedPassword, // or hashedPassword
      subjectName:subjectName || student.subjectName,
      selectFromSession:selectFromSession || student.selectFromSession,
      selectToSession:selectToSession || student.selectToSession,
      franchise_id:franchise_id || student.franchise_id
    });

    res.json({ message: 'Student application updated', student });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}); 

      
  
  

module.exports = router;
