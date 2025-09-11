// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth')
const sendResponse = require('../utils/response');
const User = db.User;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const sendEmail = require('../utils/sendEmail');


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login as admin or franchise
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns a JWT and user info
 *       401:
 *         description: Invalid credentials
 */

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: { email },
      include: db.Franchise,
    });

    if (!user) {
      // return res.status(404).json({ message: 'User not found' });
      return sendResponse(res, { status: 404, message: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // return res.status(401).json({ message: 'Invalid credentials' });
      return sendResponse(res, { status: 401, message: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      role: user.role,
      franchiseId: user.franchise_id || null,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' });

    // res.json({
    //     token,
    //     user: {
    //       id: user.id,
    //       email: user.email,
    //       role: user.role,
    //       franchiseId: user.franchise_id,
    //       franchiseName: user.Franchise?.name || null,
    //       mustChangePassword: user.must_change_password // ✅ frontend can redirect
    //     },
    //   });
      
    sendResponse(res, { status: 200, message: 'Login successful', data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          franchiseId: user.franchise_id,
          franchiseName: user.Franchise?.name || null,
          mustChangePassword: user.must_change_password // ✅ frontend can redirect
        },
      } }); 
  } catch (error) {
    console.error('Login Error:', error);
    // res.status(500).json({ message: 'Server error' });
    sendResponse(res, { status: 500, message: 'Server error' });
  }
});

/** * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (admin or franchise)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, role]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, franchise]
 *               franchise_id:
 *                 type: integer
 *                 description: Required if role is franchise
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Email already in use
 */

// POST /api/auth/register  

router.post('/register', async (req, res) => {
    const { email, password, role, franchise_id } = req.body;
  
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already in use' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await User.create({
        email,
        password: hashedPassword,
        role,
        franchise_id: franchise_id || null,
        must_change_password: true, // ✅ force password change on first login
      });
  
      res.status(201).json({ message: 'User registered', userId: newUser.id });
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change Password as admin or franchise
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password is incorrect
 *       404:
 *         description: User not found
 */

// POST /api/auth/change-password
router.post('/change-password', auth(['franchise', 'admin']), async (req, res) => {
    const { currentPassword, newPassword } = req.body;
  
    try {
      const user = await User.findByPk(req.user.id);
  
      if (!user) return sendResponse(res, { status: 404, message: 'User not found' });
  
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return sendResponse(res, { status: 401, message: 'Current password is incorrect' });
      }
  
      const hashedNew = await bcrypt.hash(newPassword, 10);
      await user.update({
        password: hashedNew,
        must_change_password: false, // ✅ reset flag
      });
      sendResponse(res, { status: 200, message: 'Password updated successfully' });
      // res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change Password Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      // Generate a reset token (in a real app, use a secure random token)
      const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: "20m",
      });
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 1200000; // 20 minutes from now
      await user.save();
      // Send email with reset link (simulated here)
      const resetLink = `http://localhost:3000/eonestep/reset-password?token=${resetToken}`;

      const message = `
Hello ${user.name},

Your password has been reset by the admin.

You can now reset your password using:
Reset Link: ${resetLink}

Please note that this link will expire in 20 minutes.
If you did not request this change, please contact support immediately.


Regards,
Admin
    `;
      await sendEmail(email, "Password Reset", message);
    }

    sendResponse(res, {
      status: 200,
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/reset-password", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({
      where: {
        id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpires: { [db.Sequelize.Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return sendResponse(res, { status: 400, message: "Invalid or expired token" });
    }

    sendResponse(res, { status: 200, message: "Token is valid", data: { email: user.email } });
  } catch (error) {
    console.error("Reset Password Token Error:", error);
    if (error.name === "TokenExpiredError") {
      return sendResponse(res, { status: 400, message: "Token has expired" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({
      where: {
        id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpires: { [db.Sequelize.Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return sendResponse(res, { status: 400, message: "Invalid or expired token" });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    user.password = hashedNew;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.must_change_password = false; // ✅ reset flag
    await user.save();

    sendResponse(res, { status: 200, message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    if (error.name === "TokenExpiredError") {
      return sendResponse(res, { status: 400, message: "Token has expired" });
    }
    res.status(500).json({ message: "Server error" });
  }
});
  

module.exports = router;
