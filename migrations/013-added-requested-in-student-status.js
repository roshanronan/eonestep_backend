'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add 'requested' to ENUM values in 'status' column
    await queryInterface.changeColumn('Students', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'requested'),
      allowNull: false,
      defaultValue: 'inactive',
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert ENUM back to original values (without 'requested')
    await queryInterface.changeColumn('Students', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'inactive',
    });
  },
};
