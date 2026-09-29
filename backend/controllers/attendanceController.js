const User = require('../models/user');

const AUTO_SIGNOUT_HOURS = 15;

// Helper: aaj ki date "YYYY-MM-DD" format mein
const getToday = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: agar kisi record ko sign in kiye 15 ghante ho gaye ho aur sign out nahi hua,
// to usko automatically sign out kar do (Sign In Time + 15 hours)
const autoSignOutIfExpired = async (user) => {
  let updated = false;
  const limitMs = AUTO_SIGNOUT_HOURS * 60 * 60 * 1000;

  user.attendance.forEach((record) => {
    if (record.signInTime && !record.signOutTime) {
      const elapsedMs = Date.now() - new Date(record.signInTime).getTime();
      if (elapsedMs >= limitMs) {
        record.signOutTime = new Date(new Date(record.signInTime).getTime() + limitMs);
        updated = true;
      }
    }
  });

  if (updated) {
    await user.save();
  }
};

// @desc   Sign In
// @route  POST /api/attendance/signin
const signIn = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Pehle check karo koi purana open record 15 ghante se zyada purana to nahi
    await autoSignOutIfExpired(user);

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
    console.error('SIGNIN ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Sign Out
// @route  POST /api/attendance/signout
const signOut = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    await autoSignOutIfExpired(user);

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

// @desc   Get all employees' attendance for last 30 days (for Manager)
// @route  GET /api/attendance
const getAllAttendance = async (req, res) => {
  try {
    const users = await User.find({ role: 'employee' });

    // Har employee ke liye expired open records auto sign-out karo
    for (const user of users) {
      await autoSignOutIfExpired(user);
    }

    const dates = [];
for (let i = 0; i < 30; i++) {
  const d = new Date();
  d.setDate(d.getDate() - i);
  dates.push(getToday(d));
}

    const result = dates
      .map((date) => {
        const records = users.map((user) => {
          const record = user.attendance.find((a) => a.date === date);

          let totalHours = '-';
          if (record && record.signInTime && record.signOutTime) {
            const diffMs = new Date(record.signOutTime) - new Date(record.signInTime);
            const totalMinutes = Math.floor(diffMs / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            totalHours = `${hours}h ${minutes}m`;
          }

          return {
            _id: user._id,
            name: user.name,
            attendance: record ? record.status : 'A',
            signInTime: record?.signInTime || null,
            signOutTime: record?.signOutTime || null,
            totalHours,
          };
        });

        return { date, records };
      })
      .filter((day) => day.records.some((r) => r.signInTime));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { signIn, signOut, getAllAttendance };