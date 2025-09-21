"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Students', 'status', {
      type: Sequelize.STRING,
      allowNull: true
    });
     await queryInterface.addColumn('Students', 'enrollNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
     await queryInterface.addColumn('Students', 'rollNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Students', 'status');
     await queryInterface.removeColumn('Students', 'enrollNumber');
      await queryInterface.removeColumn('Students', 'rollNumber');
  }
};
