function getLeaveDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;

  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

function getLeaveBalance(user, leaveType) {
  // Maximum days per leave type per year
  const limits = {
    sick: 12,
    personal: 10,
    casual: 5,
    urgent: 3,
  };

  return limits[leaveType] || 0;
}

module.exports = {
  getLeaveDays,
  getLeaveBalance,
};
