/**
 * Seed Script — Creates the initial admin user.
 * Run once: node src/scripts/seedAdmin.js
 *
 * Uses ADMIN_EMAIL and ADMIN_PASSWORD from .env,
 * or falls back to defaults for development.
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const User = require('../modules/user/user.model');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@taskflow.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.ADMIN_NAME || 'Admin';

    // Check if admin already exists
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`ℹ️  Admin already exists: ${adminEmail}`);
      } else {
        // Promote existing user to admin
        existing.role = 'admin';
        await existing.save({ validateBeforeSave: false });
        console.log(`✅ Promoted existing user to admin: ${adminEmail}`);
      }
    } else {
      // Create new admin user
      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`✅ Admin user created!`);
      console.log(`   Email:    ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   ⚠️  Change the password after first login!`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
