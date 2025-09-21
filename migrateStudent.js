// migrate_students.js
const { Sequelize, DataTypes } = require("sequelize");

// -------------------- OLD DB --------------------
const oldDb = new Sequelize("eonestep_old", "root", "root", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

const EoneChampion = oldDb.define(
  "eonechampion",
  {
    Student_No: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Enroll_No: DataTypes.STRING,
    Roll_No: DataTypes.STRING,
    Center_Code: DataTypes.STRING,
    Student_Username: DataTypes.STRING,
    Password: DataTypes.STRING,
    Student_Name: DataTypes.STRING,
    Category: DataTypes.STRING,
    Gender: DataTypes.STRING,
    Session: DataTypes.STRING,
    Father_Name: DataTypes.STRING,
    Guardian_Type: DataTypes.STRING,
    DOB: DataTypes.STRING,
    Address: DataTypes.STRING,
    ID_Proof: DataTypes.STRING,
    ID_Number: DataTypes.STRING,
    Phone: DataTypes.INTEGER,
    Email: DataTypes.STRING,
    Image: DataTypes.STRING,
    status: DataTypes.STRING,
  },
  { tableName: "eonechampion", timestamps: false }
);

// -------------------- NEW DB --------------------
const newDb = new Sequelize("eonestep", "root", "root", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

const Student = newDb.define(
  "Students",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    studentName: DataTypes.STRING,
    courseName: DataTypes.STRING,
    guardianType: DataTypes.STRING,
    gender: DataTypes.STRING,
    fatherName: DataTypes.STRING,
    dob: DataTypes.DATE,
    town: DataTypes.STRING,
    idProof: DataTypes.STRING,
    idNumber: DataTypes.STRING,
    imageUpload: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    subjectName: DataTypes.STRING,
    selectFromSession: DataTypes.DATE,
    selectToSession: DataTypes.DATE,
    franchise_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    enrollNumber: DataTypes.STRING,
    rollNumber: DataTypes.STRING,
  },
  { tableName: "Students", timestamps: false }
);

const Franchise = newDb.define(
  "Franchises",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: DataTypes.STRING,
  },
  { tableName: "Franchises", timestamps: false }
);

// -------------------- MIGRATION --------------------
async function migrateStudents() {
  try {
    await oldDb.authenticate();
    await newDb.authenticate();
    console.log("✅ Connected to both databases");

    const oldStudents = await EoneChampion.findAll();
    console.log(`Found ${oldStudents.length} rows`);

    for (const old of oldStudents) {
      // Lookup franchise_id from Center_Code
      let franchise = await Franchise.findOne({ where: { code: old.Center_Code } });
      let franchiseId = franchise ? franchise.id : null;

      // Convert DOB string → date (safe fallback)
      let dob = null;
      if (old.DOB && old.DOB.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dob = old.DOB;
      }

      // Convert Session → selectFromSession
      let sessionDate = null;
      if (old.Session && old.Session.match(/^\d{4}-\d{2}-\d{2}$/)) {
        sessionDate = old.Session;
      }

      await Student.create({
        id: old.Student_No,
        studentName: old.Student_Name,
        courseName: old.Category,
        guardianType: old.Guardian_Type,
        gender: old.Gender,
        fatherName: old.Father_Name,
        dob,
        town: old.Address,
        idProof: old.ID_Proof,
        idNumber: old.ID_Number,
        imageUpload: old.Image,
        phone: String(old.Phone),
        email: old.Email,
        password: old.Password,
        selectFromSession: sessionDate,
        selectToSession: null,
        franchise_id: franchiseId,
        status: 'active',
        enrollNumber: old.Enroll_No,
        rollNumber: old.Roll_No,
      });
    }

    console.log("🎉 Student migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrateStudents();
