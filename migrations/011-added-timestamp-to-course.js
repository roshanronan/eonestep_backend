'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('course', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('NOW')
    });

    await queryInterface.addColumn('course', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('NOW')
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('course', 'createdAt');
    await queryInterface.removeColumn('course', 'updatedAt');
  }
};
