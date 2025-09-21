// migrate_courses.js
const { Sequelize, DataTypes } = require("sequelize");

// -------------------- OLD DB --------------------
const oldDb = new Sequelize("eonestep_old", "root", "root", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

const OldCourse = oldDb.define(
  "courses",
  {
    Course_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Student_ID: DataTypes.STRING, // maps to students.Student_No
    Course_Name: DataTypes.STRING,
    Subjects: DataTypes.STRING,
    Grade: DataTypes.STRING,
    Percentage: DataTypes.STRING,
    course_duration: DataTypes.STRING,
  },
  { tableName: "courses", timestamps: false }
);

// -------------------- NEW DB --------------------
const newDb = new Sequelize("eonestep", "root", "root", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

const NewCourse = newDb.define(
  "course",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    studentId: DataTypes.INTEGER,
    courseName: DataTypes.STRING,
    subjects: DataTypes.STRING,
    grade: DataTypes.STRING,
    percentage: DataTypes.STRING,
    courseDuration: DataTypes.STRING,
  },
  { tableName: "course", timestamps: false }
);

const Student = newDb.define(
  "Students",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    enrollNumber: DataTypes.STRING,
  },
  { tableName: "Students", timestamps: false }
);

// -------------------- MIGRATION --------------------
async function migrateCourses() {
  try {
    await oldDb.authenticate();
    await newDb.authenticate();
    console.log("✅ Connected to both databases");

    const oldCourses = await OldCourse.findAll();
    console.log(`Found ${oldCourses.length} old course records`);

    for (const old of oldCourses) {
      // Student_ID in old DB = Student_No (mapped already in students migration → id in new DB)
      const student = await Student.findOne({
        where: { id: old.Student_ID }, // since we inserted with old.Student_No as id
      });

      if (!student) {
        console.warn(`⚠️ No student found for old Student_ID=${old.Student_ID}, skipping`);
        continue;
      }

      await NewCourse.create({
        id: old.Course_ID,
        studentId: student.id,
        courseName: old.Course_Name,
        subjects: old.Subjects,
        grade: old.Grade,
        percentage: old.Percentage,
        courseDuration: old.course_duration,
      });
    }

    console.log("🎉 Course migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrateCourses();
