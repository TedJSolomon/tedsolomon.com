const WORK_HOURS_PER_YEAR = 2080;

export function costPerMinute(attendees) {
  const totalAnnual = attendees.reduce((sum, a) => sum + a.annual_salary, 0);
  return totalAnnual / WORK_HOURS_PER_YEAR / 60;
}

export function meetingCost(attendees, durationMinutes) {
  return costPerMinute(attendees) * durationMinutes;
}

const OCCURRENCES = {
  one_time:  1,
  daily:     260,
  weekly:    52,
  biweekly:  26,
  monthly:   12,
};

export function annualizedCost(costPerMeeting, meetingType) {
  return costPerMeeting * (OCCURRENCES[meetingType] ?? 1);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value < 10 ? 2 : 0,
    maximumFractionDigits: value < 10 ? 2 : 0,
  }).format(value);
}

export function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
