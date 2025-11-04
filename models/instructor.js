module.exports = (sequelize, DataTypes) => {
  const Instructor = sequelize.define("Instructor", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    experience: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 0,
    },
    studentsTaught: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    phone: {
        type: DataTypes.STRING,
      },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
        max: 5,
      },
    },
  },
  {
    tableName: "instructor", 
    }
);


  Instructor.associate = (models) => {
    Instructor.hasMany(models.LiveCourse, {
      foreignKey: "instructorId",
      as: "courses",
      onDelete: "CASCADE",
    });
  };

  return Instructor;
};
