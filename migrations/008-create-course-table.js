"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('course', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      studentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Students',
          key: 'id'
        }           
      },
      courseName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      subjects: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      grade: {
        type: Sequelize.STRING(5),
        allowNull: false
      },
      percentage: {
        type: Sequelize.STRING(5),
        allowNull: false
      },
      courseDuration: {
        type: Sequelize.STRING(255),
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('course');
  }
};
