const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user');

dotenv.config();

const createDeveloper = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email: 'developer@test.com' });
    if (existing) {
      console.log('Developer already exists!');
      process.exit();
    }

    await User.create({
      name: 'Ghassan',
      email: 'developer@test.com',
      password: '123456',
      role: 'developer',
    });

    console.log('Developer user created successfully!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createDeveloper();