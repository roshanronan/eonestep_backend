// routes/franchise.routes.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const Franchise = db.Franchise;
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const User = db.User;





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
      res.json({ Franchises });
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
    res.json({ pendingFranchises });
  } catch (error) {
    console.error('Fetch Pending Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/franchise/approve/{id}:
 *   post:
 *     summary: Approve a franchise and send login credentials
 *     tags: [Franchise]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the franchise to approve
 *     responses:
 *       200:
 *         description: Franchise approved and credentials sent via email
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (non-admin)
 *       404:
 *         description: Franchise not found
 *       500:
 *         description: Server error
 */

router.post('/approve/:id', auth(['admin']), async (req, res) => {
  const franchiseId = req.params.id;

  try {
    const franchise = await Franchise.findByPk(franchiseId);
    if (!franchise) {
      return res.status(404).json({ message: 'Franchise not found' });
    }

    // Generate and hash temp password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update franchise
    await franchise.update({
      status: 'approved',
      password: hashedPassword,
    });

    // Create user login
    await User.create({
        email: franchise.email,
        password: hashedPassword,
        role: 'franchise',
        franchise_id: franchise.id,
        must_change_password: true, // ✅ force password change
      });

    // Send email
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

    await sendEmail(franchise.email, 'Franchise Approved – Your Login Credentials', message);

    res.json({ message: 'Franchise approved and login credentials sent via email.' });
  } catch (error) {
    console.error('Approval Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


/**
 * @swagger
 * /api/franchise/apply:
 *   post:
 *     summary: Apply for a franchise 
 *     tags: [Franchise]
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
 *                 email: string
 *               course:
 *                 address: string
 *     responses:
 *       200:
 *         description:Applied for Franchise 
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (non-admin)
 *       404:
 *         description: Franchise not found
 *       500:
 *         description: Server error
 */

// ✅ POST /api/franchise/approve/:id — Approve and create login
// router.post('/approve/:id', auth(['admin']), async (req, res) => {
//   const franchiseId = req.params.id;
//   const { password } = req.body;

//   if (!password) {
//     return res.status(400).json({ message: 'Password is required' });
//   }

//   try {
//     const franchise = await Franchise.findByPk(franchiseId);
//     if (!franchise) {
//       return res.status(404).json({ message: 'Franchise not found' });
//     }

//     // Update franchise status and password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     await franchise.update({
//       status: 'approved',
//       password: hashedPassword,
//     });

//     // Create login in users table
// await User.create({
//     email: franchise.email,
//     password: hashedPassword,
//     role: 'franchise',
//     franchise_id: franchise.id,
//     must_change_password: true, // ✅ force password change
//   });

//     res.json({ message: 'Franchise approved and login created' });
//   } catch (error) {
//     console.error('Approval Error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


// ✅ POST /api/franchise/apply — Public franchise application
router.post('/apply', async (req, res) => {
  const { name, email, address } = req.body;

  if (!name || !email || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existing = await Franchise.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const franchise = await Franchise.create({
      name,
      email,
      address,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Franchise application submitted',
      franchiseId: franchise.id,
    });
  } catch (error) {
    console.error('Franchise Apply Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
