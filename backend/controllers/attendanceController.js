const User = require('../models/user');

const AUTO_SIGNOUT_HOURS = 15;

const getToday = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isWeekend = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dow = d.getDay();
  return dow === 0 || dow === 6;
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
    return { text: `${hours}h ${minutes}m`, minutes: totalMinutes };
  }
  return { text: '-', minutes: 0 };
};

const formatTotalHours = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const getDateRange = (start, end) => {
  const dates = [];
  let d = new Date(start);
  const endD = new Date(end);
  while (d <= endD) {
    dates.push(getToday(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
};

const getStatusForDate = (record, dateStr) => {
  if (record) return 'P';
  if (isWeekend(dateStr)) return 'H';
  return 'A';
};

const formatMonthLabel = (dates) => {
  if (dates.length === 0) return '';
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const parse = (d) => {
    const [y, m] = d.split('-').map(Number);
    return { y, m };
  };
  const first = parse(dates[0]);
  const last = parse(dates[dates.length - 1]);
  if (first.y === last.y && first.m === last.m) {
    return `${monthNames[first.m - 1]} ${first.y}`;
  }
  return `${monthNames[first.m - 1]} ${first.y} – ${monthNames[last.m - 1]} ${last.y}`;
};

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

const getRecords = async (req, res) => {
  try {
    const { employeeId, start, end } = req.query;

    if (employeeId) {
      const user = await User.findById(employeeId);
      if (!user) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      await autoSignOutIfExpired(user);

      let dates;
      if (start && end) {
        dates = getDateRange(start, end);
      } else {
        dates = Array.from(new Set(user.attendance.map((a) => a.date))).sort();
      }

      let totalPresent = 0;
      let totalAbsent = 0;
      let totalHolidays = 0;
      let totalMinutes = 0;

      const records = dates.map((date) => {
        const record = user.attendance.find((a) => a.date === date);
        const hours = calculateHours(record);
        const status = getStatusForDate(record, date);

        if (status === 'P') totalPresent += 1;
        else if (status === 'A') totalAbsent += 1;
        else if (status === 'H') totalHolidays += 1;

        totalMinutes += hours.minutes;

        return {
          date,
          attendance: status,
          signInTime: record?.signInTime || null,
          signOutTime: record?.signOutTime || null,
          totalHours: hours.text,
        };
      });

      const totalWorkingDays = totalPresent + totalAbsent;

      return res.status(200).json({
        mode: 'single',
        employee: { id: user._id, name: user.name, role: user.role },
        records,
        summary: {
          totalWorkingDays,
          totalPresent,
          totalAbsent,
          totalHolidays,
          totalHours: formatTotalHours(totalMinutes),
        },
      });
    }

    const users = await User.find({ role: { $in: ['employee', 'manager', 'developer'] } });

    for (const u of users) {
      await autoSignOutIfExpired(u);
    }

    let dates;
    if (start && end) {
      dates = getDateRange(start, end);
    } else {
      dates = [getToday()];
    }

    if (dates.length <= 1) {
      const date = dates[0];
      const records = users
        .map((user) => {
          const record = user.attendance.find((a) => a.date === date);
          const hours = calculateHours(record);
          return {
            _id: user._id,
            name: user.name,
            role: user.role,
            attendance: getStatusForDate(record, date),
            signInTime: record?.signInTime || null,
            signOutTime: record?.signOutTime || null,
            totalHours: hours.text,
          };
        })
        .filter((r) => r.attendance !== 'H' || r.signInTime);

      return res.status(200).json({
        mode: 'all-simple',
        date,
        records,
      });
    }

    const sortedDatesAsc = [...dates].sort((a, b) => a.localeCompare(b));

    const rows = sortedDatesAsc.map((date) => {
      const cells = {};
      users.forEach((user) => {
        const record = user.attendance.find((a) => a.date === date);
        cells[user._id] = getStatusForDate(record, date);
      });
      return { date, cells };
    });

    const totalsByUser = {};
    users.forEach((user) => {
      let totalMinutes = 0;
      dates.forEach((date) => {
        const record = user.attendance.find((a) => a.date === date);
        totalMinutes += calculateHours(record).minutes;
      });
      totalsByUser[user._id] = formatTotalHours(totalMinutes);
    });

    res.status(200).json({
      mode: 'all-matrix',
      monthLabel: formatMonthLabel(sortedDatesAsc),
      employees: users.map((u) => ({ id: u._id, name: u.name, role: u.role })),
      rows,
      totals: totalsByUser,
    });
  } catch (error) {
    console.error('GET RECORDS ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { signIn, signOut, getRecords, getStatus };