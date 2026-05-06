import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('Admin already exists!');
      process.exit();
    }

    const adminUser = new User({
      name: 'Super Admin',
      email: 'admin@evoting.com',
      password: 'admin123', // Will be hashed by pre-save middleware
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
