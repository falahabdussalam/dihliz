export function attendanceDates(
  mode: string,
  value: string,
  start: string,
  end: string,
  today = new Date().toISOString().slice(0, 10),
) {
  if (!["daily", "weekly", "monthly"].includes(mode))
    throw new Error("Choose daily, weekly or monthly attendance.");
  const day = new Date(value + "T00:00:00Z");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(day.getTime()) ||
    day.toISOString().slice(0, 10) !== value
  )
    throw new Error("Choose a valid date.");
  if (value < start || value > end || value > today)
    throw new Error("Choose a date in the academic year, no later than today.");
  const first = new Date(day),
    last = new Date(day);
  if (mode === "weekly") {
    first.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
    last.setTime(first.getTime());
    last.setUTCDate(first.getUTCDate() + 6);
  }
  if (mode === "monthly") {
    first.setUTCDate(1);
    last.setUTCMonth(last.getUTCMonth() + 1, 0);
  }
  const dates: string[] = [];
  for (const d = new Date(first); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    if (iso >= start && iso <= end && iso <= today) dates.push(iso);
  }
  return dates;
}
