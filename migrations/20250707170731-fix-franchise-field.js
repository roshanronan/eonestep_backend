'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeColumn('Franchises','isApproved');

    await queryInterface.addColumn('Franchises','password',{
      type:Sequelize.STRING
    });

    await queryInterface.addColumn('Franchises','status',{
      type:Sequelize.ENUM('pending','approved','rejected')
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn('Franchises','status');
    await queryInterface.removeColumn('Franchises','password')

    await queryInterface.addColumn('Franchises','isApproved',{
      type:Sequelize.BOOLEAN,
      defaultValue:false
    })
  }
};
