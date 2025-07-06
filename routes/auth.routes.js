// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth')

const User = db.User;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';


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
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      role: user.role,
      franchiseId: user.franchise_id || null,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

    res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          franchiseId: user.franchise_id,
          franchiseName: user.Franchise?.name || null,
          mustChangePassword: user.must_change_password // ✅ frontend can redirect
        },
      });
      
  } catch (error) {
    console.error('Login Error:', error);
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
  
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
  
      const hashedNew = await bcrypt.hash(newPassword, 10);
      await user.update({
        password: hashedNew,
        must_change_password: false, // ✅ reset flag
      });
  
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change Password Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

module.exports = router;
