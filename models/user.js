// models/user.model.js
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin', 'franchise'),
        defaultValue: 'franchise',
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
      must_change_password: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },{
      tableName:'Users'
    });

    User.associate = (models) => {
      User.belongsTo(models.Franchise, { foreignKey: 'franchise_id' });
    };
  
    return User;
  };
  