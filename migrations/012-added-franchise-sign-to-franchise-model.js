'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Franchises', 'secretarySign', {
       type: Sequelize.STRING,
    });

    await queryInterface.addColumn('Franchises', 'invigilatorSign', {
    type: Sequelize.STRING,
    });
     await queryInterface.addColumn('Franchises', 'examinerSign', {
    type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Franchises', 'secretarySign');
    await queryInterface.removeColumn('Franchises', 'invigilatorSign');
    await queryInterface.removeColumn('Franchises', 'examinerSign');
  }
};
