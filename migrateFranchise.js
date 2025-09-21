const { Sequelize, DataTypes } = require("sequelize");



// -------------------- OLD DB --------------------
const oldDb = new Sequelize("eonestep_old", "root", "root", {
  host: "localhost",
  dialect: "mysql", // or 'postgres', 'mssql'
  logging: false,
});

const CenterData = oldDb.define(
  "centerdata",
  {
    s_no: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Center_Code: DataTypes.STRING,
    Center_Name: DataTypes.STRING,
    Center_UserName: DataTypes.STRING,
    Email: DataTypes.STRING,
    Number: DataTypes.STRING,
    Password: DataTypes.STRING,
  },
  {
    tableName: "centerdata",
    timestamps: false,
    freezeTableName: true,
  }
);

// -------------------- NEW DB --------------------
const newDb =  new Sequelize("eonestep", "root", "root", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

const Franchise = newDb.define(
  "Franchises",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: DataTypes.STRING,
    name: DataTypes.STRING,
    instituteName: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
  },
  {
    tableName: "Franchises",
    timestamps: false,
    freezeTableName: true,
  }
);

// -------------------- MIGRATION --------------------
async function migrate() {
  try {
    await oldDb.authenticate();
    await newDb.authenticate();

    console.log("✅ Connected to both databases");

    // 1. Get old data
    const oldCenters = await CenterData.findAll();
    console.log(`Found ${oldCenters.length} rows in old DB`);

    // 2. Insert into new DB with mapping
    for (const old of oldCenters) {
      await Franchise.create({
        id: old.s_no, // map old PK → new id
        code: old.Center_Code,
        name: old.Center_UserName,
        instituteName: old.Center_Name,
        email: old.Email,
        phone: old.Number,
        password: old.Password,
      });
    }

    console.log("🎉 Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
