// models/student.model.js
module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define('Student', {
      studentName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      courseName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      guardianType: {
        type: DataTypes.STRING,
      },
      gender: {
        type: DataTypes.STRING,
      },
      fatherName: {
        type: DataTypes.STRING,
      },
      dob: {
        type: DataTypes.DATEONLY,
      },
      pinCode: {
        type: DataTypes.STRING,
      },
      town: {
        type: DataTypes.STRING,
      },
      district: {
        type: DataTypes.STRING,
      },
      state: {
        type: DataTypes.STRING,
      },
      idProof: {
        type: DataTypes.STRING,
      },
      idNumber: {
        type: DataTypes.STRING,
      },
      imageUpload: {
        type: DataTypes.STRING, // store file path or URL
      },
      phone: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subjectName: {
        type: DataTypes.STRING,
      },
      selectFromSession: {
        type: DataTypes.DATEONLY,
      },
      selectToSession: {
        type: DataTypes.DATEONLY,
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
    },{
        tableName:'Students'
    });

    Student.associate =(models)=>{
        Student.belongsTo(models.Franchise, { foreignKey: 'franchise_id' });
    }
    return Student;
  };
  