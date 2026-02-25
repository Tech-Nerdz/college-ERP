import dotenv from 'dotenv';
dotenv.config();

import initModels, { models } from '../models/index.js';
import { sequelize } from '../config/db.js';
import { Op } from 'sequelize';

initModels();

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    const email = 'drmathalai.raj@nscet.org';
    const name = 'Dr Mathalai Raj';
    const password = 'admin123';

    const { User, Role } = models;

    let roleRecord = await Role.findOne({ where: { role_name: { [Op.like]: '%department%' } } });
    let roleId = roleRecord ? roleRecord.role_id : 7;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log('User already exists:', existing.email);
      process.exit(0);
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role_id: roleId,
      isActive: true
    });

    console.log('Created department-admin user:', newUser.email);
    process.exit(0);
  } catch (err) {
    console.error('Error creating user:', err.message || err);
    process.exit(1);
  }
}

run();
