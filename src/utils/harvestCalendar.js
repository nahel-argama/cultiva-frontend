const MONTHS = new Intl.DateTimeFormat('pt-BR', { month: 'long' });
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getMonthBounds(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: toLocalDateString(start), end: toLocalDateString(end) };
}

export function getMonthLabel(date) {
  const month = MONTHS.format(date);
  return `${month.charAt(0).toLocaleUpperCase('pt-BR')}${month.slice(1)} ${date.getFullYear()}`;
}

export function getMonthDays(date, forecasts, selectedDate) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const dayCount = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((offset + dayCount) / 7) * 7;
  const today = toLocalDateString(new Date());
  const eventsByStartDate = new Map();

  for (const forecast of forecasts) {
    const start = parseLocalDate(forecast.start_date);
    const anchor = start < firstDay ? firstDay : start;
    const key = toLocalDateString(anchor);
    const events = eventsByStartDate.get(key) ?? [];
    events.push(forecast);
    eventsByStartDate.set(key, events);
  }

  return Array.from({ length: cellCount }, (_, index) => {
    const day = new Date(year, month, index - offset + 1);
    const dateString = toLocalDateString(day);
    return {
      date: dateString,
      number: day.getDate(),
      inCurrentMonth: day.getMonth() === month,
      isToday: dateString === today,
      isSelected: dateString === selectedDate,
      events: eventsByStartDate.get(dateString) ?? [],
    };
  });
}

export function monthSeasonRange(startMonth, endMonth, fromDate = new Date()) {
  let year = fromDate.getFullYear();
  let start = new Date(year, startMonth - 1, 1);
  let endYear = endMonth < startMonth ? year + 1 : year;
  let end = new Date(endYear, endMonth, 0);

  if (start < fromDate || end < fromDate) {
    year++;
    start = new Date(year, startMonth - 1, 1);
    endYear = endMonth < startMonth ? year + 1 : year;
    end = new Date(endYear, endMonth, 0);
  }

  return { startDate: toLocalDateString(start), endDate: toLocalDateString(end) };
}

export function formatCalendarDate(dateString, options = { day: '2-digit', month: 'short' }) {
  return new Intl.DateTimeFormat('pt-BR', options).format(parseLocalDate(dateString));
}

export function getWeekdayLabels() {
  return WEEKDAYS;
}
