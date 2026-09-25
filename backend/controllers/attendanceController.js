const User = require('../models/user');


const getToday = () => {
  return new Date().toISOString().split('T')[0];
};


// @route  POST /api/attendance/signin
const signIn = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const today = getToday();

    let todayRecord = user.attendance.find((a) => a.date === today);

    if (todayRecord) {
      return res.status(400).json({ message: 'Already signed in today' });
    }

    user.attendance.push({
      date: today,
      status: 'P',
      signInTime: new Date(),
    });

    await user.save();

    res.status(200).json({ message: 'Signed in successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Sign Out
// @route  POST /api/attendance/signout
const signOut = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const today = getToday();

    let todayRecord = user.attendance.find((a) => a.date === today);

    if (!todayRecord) {
      return res.status(400).json({ message: 'You have not signed in today' });
    }

    if (todayRecord.signOutTime) {
      return res.status(400).json({ message: 'Already signed out today' });
    }

    todayRecord.signOutTime = new Date();

    await user.save();

    res.status(200).json({ message: 'Signed out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get all employees' attendance (for Manager)
// @route  GET /api/attendance
const getAllAttendance = async (req, res) => {
  try {
    const today = getToday();
    const users = await User.find({ role: 'employee' }).select('-password');

    const data = users.map((user) => {
      const todayRecord = user.attendance.find((a) => a.date === today);

      let totalHours = '-';
if (todayRecord && todayRecord.signInTime && todayRecord.signOutTime) {
  const diffMs = new Date(todayRecord.signOutTime) - new Date(todayRecord.signInTime);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  totalHours = `${hours}h ${minutes}m`;
}


      return {
        _id: user._id,
        name: user.name,
        attendance: todayRecord ? todayRecord.status : 'A',
        signInTime: todayRecord?.signInTime || null,
        signOutTime: todayRecord?.signOutTime || null,
        totalHours,
      };
    });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { signIn, signOut, getAllAttendance };