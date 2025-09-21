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
const franchiseApproveTemplate = require('../helper/franchiseApproveTemplate');
const Sequelize = require('sequelize');
const {upload , uploadToFTP} = require('../middleware/upload')







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
      const Franchises =await sequelize.query(`
  SELECT 
    f.*,
    COUNT(s.id) as studentCount
  FROM franchises f
  LEFT JOIN students s ON f.id = s.franchise_id
  GROUP BY f.id
`, {
  type: Sequelize.QueryTypes.SELECT
});
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

router.get('/:id',auth(['admin','franchise']), async(req,res)=>{

  const {id} = req.params

  try{
    const franchise = await Franchise.findByPk(id);
    if (!franchise) {
      return sendResponse(res, { status: 404, message: "Franchise not found" });
    }
   sendResponse(res, { status: 200, data: { franchise } })
  }catch(error){
    console.error('Fetch Student Error:', error);
    sendResponse(res, { status: 500, message: 'Server error' });
  }

})

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
    console.log('temp password',tempPassword)

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

    const { text, html } = franchiseApproveTemplate(franchise, tempPassword);
    // Send email after commit

    try {
      await sendEmail(
        franchise.email,
        "Franchise Approved – Your Login Credentials",
        text,
        html
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

router.post('/apply',    upload.fields([
      { name: 'secretarySign', maxCount: 1 },
      { name: 'invigilatorSign', maxCount: 1 },
      { name: 'examinerSign', maxCount: 1 }
    ]), 
     async (req, res) => {
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
  
      const hashedPassword = await bcrypt.hash('8dfhskg@#%$234', 10);

      let secretarySignUrl = null;
      let invigilatorSignUrl = null;
      let examinerSignUrl = null;

      if (req.files["secretarySign"]) {
        const file = req.files["secretarySign"][0];
        secretarySignUrl = await uploadToFTP(file.path, file.filename);
      }

      if (req.files["invigilatorSign"]) {
        const file = req.files["invigilatorSign"][0];
        invigilatorSignUrl = await uploadToFTP(file.path, file.filename);
      }

      if (req.files["examinerSign"]) {
        const file = req.files["examinerSign"][0];
        examinerSignUrl = await uploadToFTP(file.path, file.filename);
      }
  
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
        password: hashedPassword,
        status: 'pending',
        secretarySign: secretarySignUrl, 
        invigilatorSign: invigilatorSignUrl,
        examinerSign: examinerSignUrl,

      });
      
      sendResponse(res, { status: 201, message: 'Franchise application submitted', data: { franchise: newFranchise } });
      // res.status(201).json({ message: 'Franchise application submitted', franchise: newFranchise });
    } catch (error) {
      console.error('Application Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

// router.put('/:id/edit',auth(['admin','franchise']),upload.single('secretarySign'),upload.single('invigilatorSign'),upload.single('examinerSign'),async(req,res)=>{
//   const {id} = req.params
//     try {
//   const franchise = await Franchise.findByPk(id)
//   if(!franchise){
//     return sendResponse(res, { status: 400, message: 'Franchise not found.' });
//   }
//   if (franchise.id !== req.user.franchiseId) {
//       return res.status(403).json({ message: 'Access denied' });
//     }
//    const {
//       name,
//       email,
//       instituteName,
//       pincode,
//       town,
//       city,
//       state,
//       country,
//       phone,
//       totalCoverArea,
//       totalComputer,
//       totalStaff,
//     } = req.body;
//     const secretarySign =  req.file ? req.file.filename : franchise.secretarySign;
//     const invigilatorSign =  req.file ? req.file.filename : franchise.invigilatorSign;
//     const examinerSign =  req.file ? req.file.filename : franchise.examinerSign;
  
//     if (!name || !email || !instituteName ) {
//       return res.status(400).json({ message: 'Name, Institute Name, and Email are required' });
//     }
//       await franchise.update({
//       name:name || franchise.name,
//       email :email || franchise.email,
//       instituteName:instituteName || franchise.instituteName,
//       pincode:pincode || franchise.pincode,
//       town : town || franchise.town,
//       city : city || franchise.city,
//       state : state || franchise.state,
//       country : country || franchise.country,
//       phone : country || franchise.phone,
//       totalCoverArea : totalCoverArea || franchise.totalCoverArea,
//       totalComputer : totalComputer || franchise.totalComputer,
//       totalStaff : totalStaff || franchise.totalStaff,
//       secretarySign : secretarySign || franchise.secretarySign,
//       invigilatorSign : invigilatorSign || franchise.invigilatorSign,
//       examinerSign : examinerSign || franchise.examinerSign
//         })
//   sendResponse(res, { status: 200, data: { franchise } })
//     }catch(error){
//      console.error('Fetch Student Error:', error);
//     sendResponse(res, { status: 500, message: 'Server error' });
//     }

// })

router.put('/:id/edit', 
    auth(['admin','franchise']), 
    upload.fields([
      { name: 'secretarySign', maxCount: 1 },
      { name: 'invigilatorSign', maxCount: 1 },
      { name: 'examinerSign', maxCount: 1 }
    ]), 
    async (req, res) => {
        const { id } = req.params;

        try {
            const franchise = await Franchise.findByPk(id);

            if (!franchise) {
                return sendResponse(res, { status: 400, message: 'Franchise not found.' });
            }

            // Note: If you need to restrict access based on user's franchiseId,
            // this check is fine, but consider if it's already handled by auth middleware.
            if (req.user.role === 'franchise' && franchise.id !== req.user.franchiseId) {
                return res.status(403).json({ message: 'Access denied' });
            }
            
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

            // Use req.files to access multiple files
                  let secretarySignUrl = null;
      let invigilatorSignUrl = null;
      let examinerSignUrl = null;

      if (req.files["secretarySign"]) {
        const file = req.files["secretarySign"][0];
        secretarySignUrl = await uploadToFTP(file.path, file.filename);
      }

      if (req.files["invigilatorSign"]) {
        const file = req.files["invigilatorSign"][0];
        invigilatorSignUrl = await uploadToFTP(file.path, file.filename);
      }

      if (req.files["examinerSign"]) {
        const file = req.files["examinerSign"][0];
        examinerSignUrl = await uploadToFTP(file.path, file.filename);
      }
            if (!name || !email || !instituteName) {
                return res.status(400).json({ message: 'Name, Institute Name, and Email are required' });
            }

            await franchise.update({
                name: name || franchise.name,
                email: email || franchise.email,
                instituteName: instituteName || franchise.instituteName,
                pincode: pincode || franchise.pincode,
                town: town || franchise.town,
                city: city || franchise.city,
                state: state || franchise.state,
                country: country || franchise.country,
                phone: phone || franchise.phone, // Corrected typo
                totalCoverArea: totalCoverArea || franchise.totalCoverArea,
                totalComputer: totalComputer || franchise.totalComputer,
                totalStaff: totalStaff || franchise.totalStaff,
                secretarySign : secretarySignUrl || franchise.secretarySign,
                invigilatorSign : invigilatorSignUrl || franchise.invigilatorSign,
                examinerSign :examinerSignUrl || franchise.examinerSign,
            });

            sendResponse(res, { status: 200, data: { franchise } });

        } catch (error) { // Fixed catch block
            console.error('Update Franchise Error:', error);
            sendResponse(res, { status: 500, message: 'Server error' });
        }
    });

router.patch("/:id/hard-password-reset", auth(["admin"]), async (req, res)=>{
  const franchiseId = req.params.id
  const password = req.body.password
  const t = await sequelize.transaction()

  try{

    const franchise = await Franchise.findByPk(franchiseId,{transaction:t}) 
    if(!franchise){
     await t.rollback();
      return sendResponse(res, { status: 404, message: "Franchise not found" });
    }

    const user = await User.findOne({where : {email:franchise.email}})


    const hashedPassword = await bcrypt.hash(password, 10);

    await franchise.update(
      { password: hashedPassword },
      { transaction: t }
    );
    await user.update(
       { password: hashedPassword },
      { transaction: t }
    )

   await t.commit()

    return sendResponse(res, {
      status: 200,
      message: "Franchise passoword reseted.",
    });
  } catch (error) {
    await t.rollback();
    console.error("Reset Error:", error);
    return sendResponse(res, { status: 500, message: "Server error" });
  }
})

router.patch("/:id/suspend", auth(["admin"]), async (req, res) => {
  const franchiseId = req.params.id
  const t = await sequelize.transaction()

  try {

    const franchise = await Franchise.findByPk(franchiseId, { transaction: t })
    if (!franchise) {
      await t.rollback();
      return sendResponse(res, { status: 404, message: "Franchise not found" });
    }

    if (franchise.status == 'approved') {
      await franchise.update(
        { status: 'rejected' },
        { transaction: t }
      );
      await t.commit()

      return sendResponse(res, {
        status: 200,
        message: "Franchise suspended.",
      });
    } else if (franchise.status == 'rejected') {
      await franchise.update(
        { status: 'approved' },
        { transaction: t }
      );
      await t.commit()

      return sendResponse(res, {
        status: 200,
        message: "Franchise Activated.",
      });
    } else {
      await t.rollback();
      return sendResponse(res, {
        status: 200,
        message: "Franchise approval is pending.",
      });
    }
  } catch (error) {
    await t.rollback();
    console.error("Suspened Error:", error);
    return sendResponse(res, { status: 500, message: "Server error" });
  }
})

module.exports = router;
