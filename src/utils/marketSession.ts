const KOREA_TIME_ZONE = 'Asia/Seoul';
const KOREA_MARKET_OPEN_MINUTES = 9 * 60;
const KOREA_MARKET_CLOSE_MINUTES = 15 * 60 + 30;

function getKoreaTimeParts(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: KOREA_TIME_ZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);

  return { weekday, hour, minute };
}

export function isKoreanWeekday(date: Date = new Date()): boolean {
  const { weekday } = getKoreaTimeParts(date);
  return weekday !== 'Sat' && weekday !== 'Sun';
}

export function isKoreanMarketOpen(date: Date = new Date()): boolean {
  if (!isKoreanWeekday(date)) {
    return false;
  }

  const { hour, minute } = getKoreaTimeParts(date);
  const minutesSinceMidnight = hour * 60 + minute;
  return (
    minutesSinceMidnight >= KOREA_MARKET_OPEN_MINUTES &&
    minutesSinceMidnight <= KOREA_MARKET_CLOSE_MINUTES
  );
}

export function getKoreanMarketScheduleLabel(): string {
  return '\uC8FC\uC911 09:00~15:30 (KST)';
}
