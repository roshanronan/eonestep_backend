// models/student.model.js
module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define('Student', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      age: {
        type: DataTypes.INTEGER,
      },
      course: {
        type: DataTypes.STRING, // Optional: replace with course_id foreign key
      },
      photo_url: {
        type: DataTypes.STRING,
      },
      franchise_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Franchises',
            key: 'id',
          },
          onDelete: 'SET NULL',
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },{
        tableName:'Students'
    });

    Student.associate =(models)=>{
        Student.belongsTo(models.Franchise, { foreignKey: 'franchise_id' });
    }
    return Student;
  };
  