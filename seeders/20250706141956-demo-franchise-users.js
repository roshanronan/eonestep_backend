'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface, Sequelize) {
    // Hash a default password
    const hashedPassword = await bcrypt.hash('Password@123', 10);

    // Insert franchises
    await queryInterface.bulkInsert('Franchises', [
      {
        id: 1,
        name: 'Tech Computer Academy',
        email: 'techacademy@example.com',
        address: '123 Main Street',
        password: hashedPassword,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Global IT Institute',
        email: 'globalit@example.com',
        address: '456 Tech Avenue',
        password: hashedPassword,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Insert users for those franchises
    await queryInterface.bulkInsert('Users', [
      {
        email: 'techuser@example.com',
        password: hashedPassword,
        role: 'franchise',
        franchise_id: 1,
        must_change_password: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'globaluser@example.com',
        password: hashedPassword,
        role: 'franchise',
        franchise_id: 2,
        must_change_password: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'roshansingh@example.com',
        password: hashedPassword,
        role: 'admin',
        franchise_id: null,
        must_change_password: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      email: ['techuser@example.com', 'globaluser@example.com','roshansingh@example.com']
    });

    await queryInterface.bulkDelete('Franchises', {
      email: ['techacademy@example.com', 'globalit@example.com','roshansingh@example.com']
    });
  }
};
