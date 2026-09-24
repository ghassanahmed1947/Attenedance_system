const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['P', 'A'],
    default: 'A',
  },
  signInTime: {
    type: Date,
  },
  signOutTime: {
    type: Date,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['employee', 'manager', 'developer'],
      required: true,
    },
    attendance: [attendanceSchema],
  },
  { timestamps: true }
);

// Password hash karne se pehle (save hone se pehle chalega)
// Password hash karne se pehle (save hone se pehle chalega)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Login ke waqt password compare karne ke liye
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);