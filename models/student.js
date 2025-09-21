// models/student.model.js
module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define('Student', {
      studentName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // courseName: {
      //   type: DataTypes.STRING,
      // },
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
    type: DataTypes.STRING
      },  
      password: {
        type: DataTypes.STRING,
      },
      // subjectName: {
      //   type: DataTypes.STRING,
      // },
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
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
      },  
      enrollNumber: {
        type: DataTypes.STRING,
        unique: true, 
      },
      rollNumber: {
        type: DataTypes.STRING,
        unique: true,     
      }
    },{
        tableName:'Students'
    });

    Student.associate =(models)=>{
        Student.belongsTo(models.Franchise, { foreignKey: 'franchise_id' });
        Student.hasMany(models.Course, { foreignKey: "studentId" });
    }
    

      Student.afterCreate(async (student, options) => {
      if(student.id < 10){   
        stidemt.enrollNumber = `ES2021ESA000${student.id}`;
        student.rollNumber = `ESA000${student.id}`;
      }else if(student.id < 100){
        student.enrollNumber = `ES2021ESA00${student.id}`;
        student.rollNumber = `ESA00${student.id}`;
      }else if(student.id < 1000){
        student.enrollNumber = `ES2021ESA0${student.id}`;
        student.rollNumber = `ESA0${student.id}`;
      }else{
        student.enrollNumber = `ES2021ESA${student.id}`;
        student.rollNumber = `ESA${student.id}`;
      }
      
      await student.save({ transaction: options.transaction });
    });

    return Student;
  };
  