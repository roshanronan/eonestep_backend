"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove unique constraint from email column
    await queryInterface.removeConstraint('Students', 'email'); // Adjust constraint name if needed
    // Optionally, alter column to allow nulls if required
    await queryInterface.changeColumn('Students', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });
      // Also allow nulls for password and courseName
      await queryInterface.changeColumn('Students', 'password', {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface.changeColumn('Students', 'courseName', {
        type: Sequelize.STRING,
        allowNull: true
      });
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add unique constraint and not null
    await queryInterface.changeColumn('Students', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
    await queryInterface.addConstraint('Students', {
      fields: ['email'],
      type: 'unique',
      name: 'email'
    });
      // Revert password and courseName to not null
      await queryInterface.changeColumn('Students', 'password', {
        type: Sequelize.STRING,
        allowNull: false
      });
      await queryInterface.changeColumn('Students', 'courseName', {
        type: Sequelize.STRING,
        allowNull: false
      });
  }
};
