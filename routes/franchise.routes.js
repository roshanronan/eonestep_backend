// routes/franchise.routes.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const Franchise = db.Franchise;
const Student = db.Student;
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const User = db.User;
const sendResponse = require('../utils/response');
const sequelize = db.sequelize;
const crypto = require('crypto');






/**
 * @swagger
 * /api/franchise:
 *   get:
 *     summary: Get all  franchise applications
 *     description: Returns a list of franchise applications. Accessible only by admin users.
 *     tags:
 *       - Franchise
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of  franchises
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Franchises:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Franchise'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - only admins can access
 *       500:
 *         description: Server error
 */


// ✅ GET /api/franchise — Admin sees pending requests
router.get('/', auth(['admin']), async (req, res) => {
    try {
      const Franchises = await Franchise.findAll();
      const Students = await Student.findAll();
      let approvedFranchises = Franchises.filter(franchise => franchise.status === 'approved').length;
      let pendingFranchises = Franchises.filter(franchise => franchise.status === 'pending').length;
      let totalFranchises = Franchises.length;
      let totalStudents = Students.length;

      const FranchisesData = { Franchises, approvedFranchises, pendingFranchises, totalFranchises,totalStudents }
      
      // res.json({ Franchises });
      sendResponse(res, { status: 200, data: { FranchisesData } });
    } catch (error) {
      console.error('Fetch all Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

/**
 * @swagger
 * /api/franchise/pending:
 *   get:
 *     summary: Get all pending franchise applications
 *     description: Returns a list of franchise applications that are still in 'pending' status. Accessible only by admin users.
 *     tags:
 *       - Franchise
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of pending franchises
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pendingFranchises:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Franchise'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - only admins can access
 *       500:
 *         description: Server error
 */


// ✅ GET /api/franchise/pending — Admin sees pending requests
router.get('/pending', auth(['admin']), async (req, res) => {
  try {
    const pendingFranchises = await Franchise.findAll({
      where: { status: 'pending' }
    });
    // res.json({ pendingFranchises });
    sendResponse(res, { status: 200, data: { pendingFranchises } });
  } catch (error) {
    console.error('Fetch Pending Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


/**
 * @swagger
 * /api/franchises/{id}/approve:
 *   patch:
 *     summary: Approve a franchise application
 *     description: >
 *       Approves a pending franchise application.  
 *       - Updates the franchise status to **approved**.  
 *       - Generates a temporary password (hashed).  
 *       - Creates a corresponding user account.  
 *       - Sends login credentials to the franchise email.  
 *       
 *       Only admins are allowed to call this endpoint.
 *     tags:
 *       - Franchise
 *     security:
 *       - bearerAuth: []   # assumes JWT auth middleware
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the franchise to approve
 *         schema:
 *           type: integer
 *           example: 42
 *     responses:
 *       200:
 *         description: Franchise approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Franchise approved and login credentials sent via email.
 *       400:
 *         description: Franchise already processed OR user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Franchise already processed
 *       404:
 *         description: Franchise not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Franchise not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Server error
 */

router.patch("/:id/approve", auth(["admin"]), async (req, res) => {
  const franchiseId = req.params.id;
  const t = await sequelize.transaction();

  try {
    const franchise = await Franchise.findByPk(franchiseId, { transaction: t });
    if (!franchise) {
      await t.rollback();
      return sendResponse(res, { status: 404, message: "Franchise not found" });
    }

    if (franchise.status !== "pending") {
      await t.rollback();
      return sendResponse(res, { status: 400, message: "Franchise already processed" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: franchise.email },
      transaction: t,
    });
    if (existingUser) {
      await t.rollback();
      return sendResponse(res, { status: 400, message: "User already exists for this franchise" });
    }

    // Generate secure temp password
    const tempPassword = crypto.randomBytes(6).toString("base64"); // ~8 chars
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update franchise (partial update → PATCH semantics)
    await franchise.update(
      { status: "approved", password: hashedPassword },
      { transaction: t }
    );

    // Create user login
    await User.create(
      {
        email: franchise.email,
        password: hashedPassword,
        role: "franchise",
        franchise_id: franchise.id,
        must_change_password: true,
      },
      { transaction: t }
    );

    // Commit DB changes
    await t.commit();

    // Send email after commit
    const message = `
Hello ${franchise.name},

Your franchise application has been approved!

You can now log in using:

Email: ${franchise.email}
Temporary Password: ${tempPassword}

Please log in and change your password immediately.

Regards,
Admin
    `;

    try {
      await sendEmail(
        franchise.email,
        "Franchise Approved – Your Login Credentials",
        message
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return sendResponse(res, {
        status: 200,
        message: "Franchise approved but failed to send email. Please contact support.",
      });
    }

    return sendResponse(res, {
      status: 200,
      message: "Franchise approved and login credentials sent via email.",
    });
  } catch (error) {
    await t.rollback();
    console.error("Approval Error:", error);
    return sendResponse(res, { status: 500, message: "Server error" });
  }
});

/**
 * @swagger
 * /api/franchise/apply:
 *   post:
 *     summary: Submit a new franchise application
 *     tags: [Franchise]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, instituteName, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               instituteName:
 *                 type: string
 *               pincode:
 *                 type: string
 *               town:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               phone:
 *                 type: string
 *               totalCoverArea:
 *                 type: string
 *               totalComputer:
 *                 type: string
 *               totalStaff:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Franchise application submitted successfully
 *       400:
 *         description: Bad request - missing required fields or email already registered
 *       500:
 *         description: Server error
 */

// ✅ POST /api/franchise/apply — Public franchise application

router.post('/apply', async (req, res) => {
    const {
      name,
      email,
      instituteName,
      pincode,
      town,
      city,
      state,
      country,
      phone,
      totalCoverArea,
      totalComputer,
      totalStaff,
    } = req.body;
  
    if (!name || !email || !instituteName ) {
      return res.status(400).json({ message: 'Name, Institute Name, and Email are required' });
    }
  
    try {
      const existing = await Franchise.findOne({ where: { email } });
      if (existing) {
        // return res.status(400).json({ message: 'Email already registered' });
        sendResponse(res, { status: 400, message: 'Franchise with email already registered' });
      }
  
      // const hashedPassword = await bcrypt.hash(password, 10);
  
      const newFranchise = await Franchise.create({
        name,
        email,
        instituteName,
        pincode,
        town,
        city,
        state,
        country,
        phone,
        totalCoverArea,
        totalComputer,
        totalStaff,
        // password: hashedPassword,
        status: 'pending'
      });
      
      sendResponse(res, { status: 201, message: 'Franchise application submitted', data: { franchise: newFranchise } });
      // res.status(201).json({ message: 'Franchise application submitted', franchise: newFranchise });
    } catch (error) {
      console.error('Application Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;
