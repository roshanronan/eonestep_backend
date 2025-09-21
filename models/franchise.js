// models/franchise.model.js
module.exports = (sequelize, DataTypes) => {
    const Franchise = sequelize.define('Franchise', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      instituteName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
       pincode: {
        type: DataTypes.STRING
      },
       town: {
        type: DataTypes.STRING
      },
       city: {
        type: DataTypes.STRING
      },
       state: {
        type: DataTypes.STRING
      },
       country: {
        type: DataTypes.STRING
      },
       phone: {
        type: DataTypes.STRING
      },
       totalCoverArea: {
        type: DataTypes.STRING
      },
       totalComputer: {
        type: DataTypes.STRING
      },
       totalStaff: {
        type: DataTypes.STRING
      },
      password: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      code: {
        type: DataTypes.STRING,
        unique: true
      },
       secretarySign: {
        type: DataTypes.STRING, // store file path or URL
      },
       invigilatorSign: {
        type: DataTypes.STRING, // store file path or URL
      },
       examinerSign: {
        type: DataTypes.STRING, // store file path or URL
      },
    },{
      tableName:'Franchises'
    });

    Franchise.associate = (models) => {
      Franchise.hasOne(models.User, { foreignKey: 'franchise_id' });
      Franchise.hasMany(models.Student, { foreignKey: 'franchise_id' });
    };

    // Set code after creation
    Franchise.afterCreate(async (franchise, options) => {
      if(franchise.id < 10){   
        franchise.code = `ESA100${franchise.id}`;
      }else if(franchise.id < 100){
        franchise.code = `ESA10${franchise.id}`;
      }else{
        franchise.code = `ESA1${franchise.id}`;
      }
      
      await franchise.save({ transaction: options.transaction });
    });

    return Franchise;
  };