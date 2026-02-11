'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add 'newenroll' to ENUM values in 'status' column
    await queryInterface.changeColumn('Students', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'requested', 'newenroll'),
      allowNull: false,
      defaultValue: 'newenroll',
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert ENUM back to previous values (without 'newenroll')
    await queryInterface.changeColumn('Students', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'requested'),
      allowNull: false,
      defaultValue: 'newenroll',
    });
  },
};