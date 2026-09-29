const User = require('../models/user');

const AUTO_SIGNOUT_HOURS = 15;

const getToday = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

const calculateHours = (record) => {
  if (record && record.signInTime && record.signOutTime) {
    const diffMs = new Date(record.signOutTime) - new Date(record.signInTime);
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
  return '-';
};

// @desc   Sign In
// @route  POST /api/attendance/signin
const signIn = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await autoSignOutIfExpired(user);

    const today = getToday();
    let todayRecord = user.attendance.find((a) => a.date === today);

    if (todayRecord) {
      return res.status(400).json({ message: 'Already signed in today' });
    }

    user.attendance.push({ date: today, status: 'P', signInTime: new Date() });
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
    console.error('SIGNOUT ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get attendance records with optional name/date filters (for Manager)
// @route  GET /api/attendance/records?name=&start=&end=
const getRecords = async (req, res) => {
  try {
    let { name, start, end } = req.query;

    const userQuery = { role: { $in: ['employee', 'manager'] } };
    if (name) {
      userQuery.name = { $regex: name, $options: 'i' };
    }

    const users = await User.find(userQuery);

    for (const user of users) {
      await autoSignOutIfExpired(user);
    }

    // Sirf start diya ho to usko single-date query maan lo
    if (start && !end) end = start;

    let dates = [];

    if (start && end) {
      let d = new Date(start);
      const endD = new Date(end);
      while (d <= endD) {
        dates.push(getToday(d));
        d.setDate(d.getDate() + 1);
      }
      dates.reverse();
    } else if (name) {
      const dateSet = new Set();
      users.forEach((u) => u.attendance.forEach((a) => dateSet.add(a.date)));
      dates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
    } else {
      dates = [getToday()];
    }

    const result = dates
      .map((date) => {
        const records = users.map((user) => {
          const record = user.attendance.find((a) => a.date === date);
          return {
            _id: user._id,
            name: user.name,
            attendance: record ? record.status : 'A',
            signInTime: record?.signInTime || null,
            signOutTime: record?.signOutTime || null,
            totalHours: calculateHours(record),
          };
        });
        return { date, records };
      })
      .filter((day) => day.records.some((r) => r.signInTime));

    res.status(200).json(result);
  } catch (error) {
    console.error('GET RECORDS ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get today's sign-in/out status for logged-in user
// @route  GET /api/attendance/status
const getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await autoSignOutIfExpired(user);

    const today = getToday();
    const todayRecord = user.attendance.find((a) => a.date === today);

    res.status(200).json({
      signInTime: todayRecord?.signInTime || null,
      signOutTime: todayRecord?.signOutTime || null,
    });
  } catch (error) {
    console.error('GET STATUS ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { signIn, signOut, getRecords , getStatus };