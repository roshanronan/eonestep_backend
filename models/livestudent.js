module.exports = (sequelize, DataTypes) => {
  const LiveStudent = sequelize.define("LiveStudent", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [10, 15], 
      },
    },
    level: {
      type: DataTypes.ENUM("beginner", "intermediate", "advanced"),
      allowNull: false,
      defaultValue: "beginner",
    },
    liveCourseId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
  },
 {
      tableName: "LiveStudent", 
    }
);

  LiveStudent.associate = (models) => {
    LiveStudent.belongsTo(models.LiveCourse, {
      foreignKey: "liveCourseId"
    });
  };

  return LiveStudent;
};
