const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user');

dotenv.config();

const createManager = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = 'manager@test.com';
    const existing = await User.findOne({ email });

    if (existing) {
      console.log('Manager already exists!');
      process.exit();
    }

    await User.create({
      name: 'Manager',
      email,
      password: '123456',
      role: 'manager',
    });

    console.log('Manager created successfully!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createManager();