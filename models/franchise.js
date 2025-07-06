// models/franchise.model.js
module.exports = (sequelize, DataTypes) => {
    const Franchise = sequelize.define('Franchise', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      address: {
        type: DataTypes.TEXT
      },
      password: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      }
    },{
      tableName:'Franchises'
    });

    Franchise.associate = (models) => {
      Franchise.hasOne(models.User, { foreignKey: 'franchise_id' });
      Franchise.hasMany(models.Student, { foreignKey: 'franchise_id' });
    };
  
    
  
    return Franchise;
  };
  