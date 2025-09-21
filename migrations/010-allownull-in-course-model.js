

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Change grade column to allow NULL
    await queryInterface.changeColumn('course', 'grade', {
      type: Sequelize.STRING(5),
      allowNull: true,
    });
    
    // Change percentage column to allow NULL
    await queryInterface.changeColumn('course', 'percentage', {
      type: Sequelize.STRING(5),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback: Make fields required again (NOT NULL)
    // First update any NULL values that might have been created
    await queryInterface.sequelize.query(`
      UPDATE Students 
      SET grade = '' 
      WHERE grade IS NULL;
    `);
    
    await queryInterface.sequelize.query(`
      UPDATE Students 
      SET percentage = '' 
      WHERE percentage IS NULL;
    `);
    
    await queryInterface.changeColumn('course', 'grade', {
      type: Sequelize.STRING(5),
      allowNull: false,
    });
    
    await queryInterface.changeColumn('course', 'percentage', {
      type: Sequelize.STRING(5),
      allowNull: false,
    });
  }
};