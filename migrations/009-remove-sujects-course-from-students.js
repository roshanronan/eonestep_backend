'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove courseName column
    await queryInterface.removeColumn('Students', 'courseName');
    
    // Remove subjectName column
    await queryInterface.removeColumn('Students', 'subjectName');
  },

  async down(queryInterface, Sequelize) {
    // Add back courseName column (rollback)
    await queryInterface.addColumn('Students', 'courseName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    // Add back subjectName column (rollback)
    await queryInterface.addColumn('Students', 'subjectName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};