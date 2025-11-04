module.exports = (sequelize, DataTypes) => {
  const LiveCourse = sequelize.define("LiveCourse", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    topicToLearn: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    level: {
      type: DataTypes.ENUM("beginner", "intermediate", "advanced"),
      defaultValue: "beginner",
    },
    seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    registeredStudent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    status: {
      type: DataTypes.ENUM("upcoming", "ongoing", "completed", "cancelled"),
      defaultValue: "upcoming",
    },
    meetingLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
      instructorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
  },
  {
      tableName: "LiveCourse", 
    }
);

LiveCourse.associate = (models) => {
  LiveCourse.belongsTo(models.Instructor, {
    foreignKey: 'instructorId'
  });

  LiveCourse.hasMany(models.LiveStudent, {
    foreignKey: 'liveCourseId'
  });
};


  return LiveCourse;
};
